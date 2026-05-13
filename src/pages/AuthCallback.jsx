import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getApiUrl } from '../utils/authUtils';
import logger from '../utils/logger';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = getApiUrl();

/**
 * AuthCallback — Production-safe OAuth landing page.
 *
 * Design principles:
 *  1. NEVER depend on AuthContext.loading — it races with this component.
 *  2. Wait for the Supabase session directly via onAuthStateChange.
 *  3. Call /api/auth/sync-oauth ourselves (not through AuthContext) to avoid
 *     the syncInProgress mutex that causes refreshProfile() to return undefined.
 *  4. Routing decision is based ONLY on whether a profile + role exist in the DB.
 *     - profile exists & has role → existing user → go to dashboard
 *     - profile missing or no role → new user → go to /signup (role selection)
 *  5. oauth_mode flag set by Login.jsx / Signup.jsx is a secondary hint only;
 *     the DB truth always wins.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const hasProcessed = useRef(false);

    useEffect(() => {
        let unsubscribe = null;

        const handleSession = async (session) => {
            // Guard against double-execution (StrictMode + listener fire)
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            try {
                logger.log('[AuthCallback] Session received, starting sync...', {
                    userId: session?.user?.id,
                    email: session?.user?.email,
                });

                // ── Persist token immediately so App.jsx guards don't block ──
                if (session?.access_token) {
                    localStorage.setItem('token', session.access_token);
                    sessionStorage.setItem('token', session.access_token);
                }

                // ── Read the oauth_mode hint set by Login.jsx / Signup.jsx ──
                const oauthMode = localStorage.getItem('oauth_mode'); // 'login' | 'signup' | null
                const intendedRole = localStorage.getItem('oauth_intended_role'); // 'CLIENT' | 'FREELANCER' | null
                localStorage.removeItem('oauth_mode');

                logger.log(`[AuthCallback] oauth_mode="${oauthMode}", intendedRole="${intendedRole}"`);

                // ── Call sync-oauth directly — bypasses AuthContext syncInProgress ──
                let syncedRole = null;
                let syncedProfile = null;
                let profileExists = false;

                try {
                    const response = await axios.post(
                        `${API_URL}/api/auth/sync-oauth`,
                        { role: intendedRole || undefined },
                        { headers: { Authorization: `Bearer ${session.access_token}` } }
                    );

                    if (response.data?.success) {
                        syncedRole = response.data.data?.role || null;
                        syncedProfile = response.data.data?.profile || null;
                        profileExists = !!(syncedRole && syncedProfile);

                        // Persist into localStorage so AuthContext picks it up
                        if (syncedRole) localStorage.setItem('user_role', syncedRole);
                        if (syncedProfile) localStorage.setItem('user_profile', JSON.stringify(syncedProfile));

                        logger.log('[AuthCallback] Sync success', {
                            profileExists,
                            role: syncedRole,
                            profileCompleted: syncedProfile?.profile_completed,
                        });
                    }
                } catch (syncErr) {
                    logger.error('[AuthCallback] Sync-oauth call failed:', syncErr?.response?.status, syncErr?.message);
                    // Even if sync failed, a 200 session means we can still attempt navigation.
                    // We'll fall through to the fallback logic below.
                }

                // ── Console debug (temporary, safe to remove after confirmed stable) ──
                logger.log('[AuthCallback] SESSION USER:', session.user);
                logger.log('[AuthCallback] SYNCED PROFILE:', syncedProfile);
                logger.log('[AuthCallback] PROFILE EXISTS:', profileExists);

                // ── CORE ROUTING DECISION ─────────────────────────────────────────
                // Rule 1: If we know a profile with a role exists in DB → existing user
                // Rule 2: If profile was just created but has no role yet → new user
                // Rule 3: If sync failed entirely → fall back to existing localStorage role
                let destination;

                if (profileExists) {
                    // ── EXISTING USER PATH ────────────────────────────────────────
                    // Profile confirmed in DB. Send to dashboard.
                    // getDashboardRoute will handle profile-wizard if onboarding is incomplete.
                    const isProfileComplete =
                        syncedProfile?.profile_completed === true ||
                        syncedProfile?.profile_completion_percentage >= 100 ||
                        syncedProfile?.is_client_profile_complete === true;

                    if (syncedRole === 'FREELANCER' && !isProfileComplete) {
                        destination = '/profile-wizard';
                    } else if (syncedRole === 'CLIENT' && !syncedProfile?.is_client_profile_complete) {
                        destination = '/client/dashboard'; // Clients can access dashboard even if incomplete
                    } else if (syncedRole === 'CLIENT') {
                        destination = '/client/dashboard';
                    } else if (syncedRole === 'FREELANCER') {
                        destination = '/freelancer/dashboard';
                    } else if (['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN'].includes(syncedRole)) {
                        destination = '/admin/dashboard';
                    } else {
                        destination = '/dashboard';
                    }

                    logger.log(`[AuthCallback] EXISTING USER → ${destination}`);

                } else {
                    // ── NEW USER / SYNC FAILURE FALLBACK ─────────────────────────
                    // Check if localStorage already has role data (e.g., from a concurrent
                    // AuthContext.syncUserRole that succeeded before us)
                    const cachedRole = localStorage.getItem('user_role');
                    const cachedProfileStr = localStorage.getItem('user_profile');

                    if (cachedRole && cachedProfileStr) {
                        try {
                            const cachedProfile = JSON.parse(cachedProfileStr);
                            const cachedComplete =
                                cachedProfile?.profile_completed === true ||
                                cachedProfile?.profile_completion_percentage >= 100;

                            logger.log('[AuthCallback] Falling back to localStorage role:', cachedRole);

                            if (cachedRole === 'CLIENT') destination = '/client/dashboard';
                            else if (cachedRole === 'FREELANCER') destination = cachedComplete ? '/freelancer/dashboard' : '/profile-wizard';
                            else if (['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN'].includes(cachedRole)) destination = '/admin/dashboard';
                            else destination = '/dashboard';

                            logger.log(`[AuthCallback] CACHED ROLE FALLBACK → ${destination}`);
                        } catch {
                            destination = '/signup';
                        }
                    } else {
                        // Genuinely new user — no profile, no cache
                        destination = '/signup';
                        logger.log('[AuthCallback] NEW USER → /signup (role selection)');
                    }
                }

                // ── Check for a saved deep-link redirect (e.g. user was on /jobs before login) ──
                const savedPath = localStorage.getItem('oauth_redirect_path');
                if (savedPath && savedPath !== '/' && profileExists) {
                    localStorage.removeItem('oauth_redirect_path');
                    destination = savedPath;
                    logger.log(`[AuthCallback] Deep-link redirect override → ${destination}`);
                }

                // ── Clean up remaining OAuth flags ────────────────────────────────
                localStorage.removeItem('oauth_intended_role');

                // Small delay to allow React state flush from AuthContext before navigation
                setTimeout(() => {
                    navigate(destination, { replace: true });
                }, 100);

            } catch (err) {
                logger.error('[AuthCallback] Fatal error during callback:', err);
                toast.error('Authentication failed. Please try again.');
                hasProcessed.current = false; // Allow retry
                navigate('/login', { replace: true });
            }
        };

        // ── Strategy: Use onAuthStateChange to wait for the PKCE session exchange ──
        // This fires reliably even if the session is already available, making it
        // race-condition-safe unlike reading AuthContext.loading.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logger.log(`[AuthCallback] onAuthStateChange event: ${event}`);

            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                handleSession(session);
            } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
                // No session arrived — send to login
                if (!hasProcessed.current) {
                    hasProcessed.current = true;
                    logger.warn('[AuthCallback] No session on INITIAL_SESSION, redirecting to login');
                    navigate('/login', { replace: true });
                }
            }
        });

        unsubscribe = subscription;

        // ── Fallback: Also check immediately if session already exists ─────────
        // Handles the case where onAuthStateChange fires before our listener attaches
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (!hasProcessed.current && !error && session) {
                logger.log('[AuthCallback] getSession fallback triggered');
                handleSession(session);
            } else if (!hasProcessed.current && !session) {
                // Give onAuthStateChange 3 seconds to fire before giving up
                setTimeout(() => {
                    if (!hasProcessed.current) {
                        logger.error('[AuthCallback] Timeout: No session received after 3s');
                        hasProcessed.current = true;
                        navigate('/login', { replace: true });
                    }
                }, 3000);
            }
        });

        return () => {
            unsubscribe?.unsubscribe();
        };
    }, [navigate]); // Stable: navigate never changes

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--color-primary, #0a0a0f)',
            gap: '16px'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid var(--color-accent, #6c63ff)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{
                color: 'var(--color-accent, #6c63ff)',
                fontWeight: 500,
                fontSize: '15px',
                letterSpacing: '0.01em',
                animation: 'pulse 1.5s ease-in-out infinite'
            }}>
                Securing your session...
            </p>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}
