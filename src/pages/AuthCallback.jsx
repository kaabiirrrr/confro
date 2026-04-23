import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { refreshProfile, getDashboardRoute, loading } = useAuth();
    const hasSynced = useRef(false);

    useEffect(() => {
        if (hasSynced.current) return;
        if (loading) return;

        const processAuth = async () => {
            hasSynced.current = true;
            try {
                // 1. Verify Supabase Session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error || !session) {
                    logger.error('[AuthCallback] No session found:', error);
                    navigate('/login');
                    return;
                }

                logger.log('[AuthCallback] Session confirmed, syncing profile...');

                // 2. Authoritative Sync with Backend
                // This creates the profile if it doesn't exist and assigns the role
                const syncResult = await refreshProfile();

                // Failsafe: Ensure token is in storage before any navigation
                // This satisfies the App.jsx unauthenticated check
                if (session.access_token) {
                    localStorage.setItem('token', session.access_token);
                    sessionStorage.setItem('token', session.access_token);
                }

                if (!syncResult) {
                  // If sync fails but we have a session, it might be a new user 
                  // or temporary network issue. We'll wait a bit then try dashboard.
                  logger.warn('[AuthCallback] Sync did not return data, attempting dashboard redirect...');
                }

                // 3. Resolve Final Destination
                // getDashboardRoute handles the ProfileWizard vs Dashboard logic
                let { role: syncedRole, profile: syncedProfile } = syncResult || {};

                // FALLBACK: For brand-new Google sign-ups, the sync might not return a role
                // if the backend is still creating the profile. Use the intended role
                // stored before the OAuth redirect as a fallback.
                if (!syncedRole) {
                    const intendedRole = localStorage.getItem('oauth_intended_role');
                    if (intendedRole) {
                        logger.log(`[AuthCallback] No role from sync. Using intended role as fallback: ${intendedRole}`);
                        syncedRole = intendedRole;
                        // Also clean up the key immediately
                        localStorage.removeItem('oauth_intended_role');
                    }
                }

                const target = getDashboardRoute(syncedRole, syncedProfile);
                logger.log(`[AuthCallback] Sync complete. Destination determined: ${target}`);

                // Stability Hack: Small delay to ensure AuthContext state has flushed
                // to App.jsx before we trigger the router change.
                setTimeout(() => {
                    const savedPath = localStorage.getItem('oauth_redirect_path');
                    if (savedPath && savedPath !== '/') {
                        localStorage.removeItem('oauth_redirect_path');
                        navigate(savedPath, { replace: true });
                    } else {
                        navigate(target, { replace: true });
                    }
                }, 150);


            } catch (err) {
                logger.error('[AuthCallback] Fatal error during callback:', err);
                toast.error('Authentication failed. Please try again.');
                navigate('/login');
            }
        };

        processAuth();
    }, [loading, refreshProfile, getDashboardRoute, navigate]);

    return (
        <div className="flex flex-col bg-primary min-h-screen items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-accent font-medium animate-pulse">
                Securing your session...
            </div>
        </div>
    );
}
