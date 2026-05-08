import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ROLES, ADMIN_ROLES } from '../utils/roles';
import { logger } from '../utils/logger';
import { cleanImageUrl } from '../utils/imageUrl';
import { checkProfileCompletion, getApiUrl } from '../utils/authUtils';
import { getDeviceId } from '../utils/fingerprint';

const AuthContext = createContext();

const API_URL = getApiUrl();

export function AuthProvider({ children }) {
    // ── Pre-Hydrate State from Storage (Flicker Prevention) ───────────
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [role, setRole] = useState(() => localStorage.getItem('user_role'));
    const [profile, setProfile] = useState(() => {
        try {
            const stored = localStorage.getItem('user_profile');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        const storedRole = localStorage.getItem('user_role');
        return !!(storedRole && ADMIN_ROLES.includes(storedRole));
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [wallet, setWallet] = useState(() => {
        try {
            const stored = localStorage.getItem('user_wallet');
            return stored ? JSON.parse(stored) : { balance: 0, pending_balance: 0 };
        } catch { return { balance: 0, pending_balance: 0 }; }
    });
    const [membership, setMembership] = useState(() => {
        try {
            const stored = localStorage.getItem('user_membership');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    const syncInProgress = useRef(false);
    const skipSync = useRef(false);
    const isLoggingOut = useRef(false);
    const hasHydrated = useRef(false);

    /**
     * ── Safety Failsafe ──────────────────────────────────────────────────
     * Ensures the application always unblocks, even if network calls hang.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                logger.warn('[AuthContext] Loading failsafe triggered after 3s');
                setLoading(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [loading]);

    /**
     * Helper to determine dashboard route based on role
     */
    const getDashboardRoute = useCallback((userRole, userProfile) => {
        if (!userRole) {
            logger.log('[getDashboardRoute] No role found. Redirecting to signup for role selection.');
            return '/signup';
        }

        if (ADMIN_ROLES.includes(userRole)) return '/admin/dashboard';

        // Unified profile completion check
        const isProfileCompleted = checkProfileCompletion(null, userRole, userProfile);

        if (!isProfileCompleted) {
            logger.log('[getDashboardRoute] Profile incomplete. Redirecting to wizard.', { role: userRole });
            return '/profile-wizard';
        }

        if (userRole === 'CLIENT') return '/client/dashboard';
        if (userRole === 'FREELANCER') return '/freelancer/dashboard';

        return '/dashboard';
    }, []);


    /**
     * Sync user role and profile with backend
     */
    const syncUserRole = useCallback(async (session, intendedRole = null, force = false) => {
        if (syncInProgress.current || !session) return;

        // Don't overwrite role from a direct login with OAuth sync, UNLESS forced (e.g. from refreshProfile)
        if (!force && localStorage.getItem('login_source') === 'direct') {
            logger.log('[AuthContext] Skipping sync — direct login role is authoritative');
            return;
        }
        syncInProgress.current = true;

        try {
            const roleToSync = intendedRole || localStorage.getItem('oauth_intended_role');

            const response = await axios.post(`${API_URL}/api/auth/sync-oauth`,
                { role: roleToSync || undefined },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );

                if (response.data.success) {
                    const { role: fetchedRole, profile: fetchedProfile } = response.data.data;
                    const fetchedMembership = response.data.data.membership || fetchedProfile?.membership || null;

                    // Ensure profile has completion flags even if nested
                    const normalizedProfile = {
                        ...fetchedProfile,
                        is_profile_complete: fetchedProfile?.is_profile_complete || fetchedProfile?.profile?.is_profile_complete || false,
                        is_client_profile_complete: fetchedProfile?.is_client_profile_complete || fetchedProfile?.profile?.is_client_profile_complete || false
                    };

                    setRole(fetchedRole);
                    setProfile(normalizedProfile);
                    setMembership(fetchedMembership);
                    setIsAdmin(ADMIN_ROLES.includes(fetchedRole));
                    setIsAuthenticated(true);
                    
                    // Critical: Ensure session token is persisted to satisfy App.jsx guards 
                    // during immediate post-sync navigation
                    if (session.access_token) {
                        localStorage.setItem('token', session.access_token);
                    }

                    // Update the master user object to reflect the synced role/profile
                    setUser(prev => prev ? { 
                        ...prev, 
                        role: fetchedRole, 
                        is_profile_complete: normalizedProfile.is_profile_complete,
                        profile: normalizedProfile 
                    } : null);

                    // Persist state
                    localStorage.setItem('user_role', fetchedRole);
                    localStorage.setItem('user_profile', JSON.stringify(normalizedProfile));
                    if (fetchedMembership) {
                        localStorage.setItem('user_membership', JSON.stringify(fetchedMembership));
                    } else {
                        localStorage.removeItem('user_membership');
                    }

                    if (roleToSync) localStorage.removeItem('oauth_intended_role');
                    
                    logger.log('[AuthContext] Sync success', { role: fetchedRole });
                    return { role: fetchedRole, profile: normalizedProfile, membership: fetchedMembership };
                }
        } catch (error) {
            logger.error('[AuthContext] Role sync failed:', error);
            // Don't logout on 401 during OAuth sync — new users won't have a backend profile yet
            if (error.response?.status === 401 && localStorage.getItem('login_source') === 'direct') {
                logout();
            }
        } finally {
            syncInProgress.current = false;
        }
    }, []);

    const login = async (email, password) => {
        try {
            const deviceId = await getDeviceId();
            // ── Always clear any stale session before logging in ──────────
            // This prevents a CLIENT session from persisting when a FREELANCER
            // logs in, or vice versa (the core cause of the role mismatch bug).
            try {
                await supabase.auth.signOut();
            } catch { /* ignore signout errors */ }
            localStorage.setItem('device_id', deviceId);
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('user_wallet');
            localStorage.removeItem('user_membership');
            localStorage.removeItem('user');
            // Cleanup existing tokens
            sessionStorage.removeItem('token');
            localStorage.removeItem('login_source');


            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password, deviceId });

            if (response.data.success) {
                const data = response.data.data;
                const { user: userData, session, role: userRole, membership: membershipData } = data;
                const profileData = userData?.profile || {};
                const resolvedRole = userRole || userData?.role || 'CLIENT';
                const resolvedMembership = membershipData || profileData?.membership || null;

                // ── Update Global State IMMEDIATELY ─────────────────
                const normalizedProfile = {
                    ...profileData,
                    is_profile_complete: profileData?.is_profile_complete || data.profileCompleted || false
                };

                const normalizedUser = {
                    ...userData,
                    role: resolvedRole,
                    is_profile_complete: userData.is_profile_complete || normalizedProfile.is_profile_complete || false
                };

                setUser(normalizedUser);
                setRole(resolvedRole);
                setProfile(normalizedProfile);
                setMembership(resolvedMembership);
                setIsAdmin(data.isAdmin || resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN');
                setIsAuthenticated(true);

                localStorage.setItem('user_role', resolvedRole);
                localStorage.setItem('user_profile', JSON.stringify(normalizedProfile));
                localStorage.setItem('user', JSON.stringify(normalizedUser));
                localStorage.setItem('token', session.access_token);
                if (resolvedMembership) {
                    localStorage.setItem('user_membership', JSON.stringify(resolvedMembership));
                }
                sessionStorage.setItem('token', session.access_token);

                // Mark that we just did a direct login — block ALL syncs for this session
                localStorage.setItem('login_source', 'direct');


                return response.data;
            }
        } catch (error) {
            let message = error.response?.data?.message || 'Login failed';
            
            // Critical Network Detection
            if (error.response?.status === 503 && error.response.data?.isNetworkError) {
                message = "Network Error: Security server unreachable. Please check your internet or VPN.";
            } else if (error.code === 'ERR_NETWORK') {
                message = "Unable to connect to service. Please check your internet connection.";
            }
            
            toast.error(message);
            throw new Error(message);
        }
    };

    const updateUserRole = async (newRole) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session');

            const response = await axios.put(`${API_URL}/api/auth/update-role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );

            if (response.data.success) {
                const synchronizedProfile = response.data.data.profile;
                const sanitizedProfile = {
                    ...synchronizedProfile,
                    avatar_url: cleanImageUrl(synchronizedProfile.avatar_url, synchronizedProfile.name),
                    photo_url: cleanImageUrl(synchronizedProfile.photo_url, synchronizedProfile.name)
                };

                setRole(response.data.data.role);
                setProfile(sanitizedProfile);
                setIsAdmin(ADMIN_ROLES.includes(response.data.data.role));

                // Update user object locally
                const updatedUser = user ? { ...user, role: response.data.data.role } : { id: session.user.id, email: session.user.email, role: response.data.data.role };
                setUser(updatedUser);

                localStorage.setItem('user_role', response.data.data.role);
                localStorage.setItem('user_profile', JSON.stringify(sanitizedProfile));
                localStorage.setItem('user', JSON.stringify(updatedUser));
                localStorage.setItem('token', session.access_token);

                toast.success(`Account set up as ${response.data.data.role}`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('[AuthContext] Update role failed:', error);
            const message = error.response?.data?.message || 'Failed to update role';
            toast.error(message);
            return false;
        }
    };

    const logout = async () => {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;

        try {
            await supabase.auth.signOut();
        } catch (err) {
            logger.error('[AuthContext] SignOut error:', err);
        } finally {
            setUser(null);
            setRole(null);
            setProfile(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('oauth_intended_role');
            localStorage.removeItem('user_wallet');
            localStorage.removeItem('user_membership');
            localStorage.removeItem('login_source');
            sessionStorage.removeItem('token');
            isLoggingOut.current = false;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    logger.warn('[AuthContext] Session fetch error:', error.message);
                    if (error.message.includes('Invalid Refresh Token')) {
                        await logout();
                    }
                    setLoading(false);
                    return;
                }

                const session = data?.session;

                // Track if we successfully hydrated from localStorage
                let hydrated = false;

                if (session) {
                    // Force refresh token in storage for API interceptor
                    localStorage.setItem('token', session.access_token);
                    
                    // Initial hydration from localStorage
                    const storedRole = localStorage.getItem('user_role');
                    const storedProfile = localStorage.getItem('user_profile');
                    const storedUser = localStorage.getItem('user');

                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setUser(parsedUser);
                        } catch (e) {
                            setUser(session.user);
                        }
                    } else {
                        setUser(session.user);
                    }

                    if (storedRole) {
                        setRole(storedRole);
                        setIsAdmin(ADMIN_ROLES.includes(storedRole));
                    }

                    if (storedProfile) {
                        try {
                            setProfile(JSON.parse(storedProfile));
                        } catch (e) {
                            logger.error('[AuthContext] Profile parse error:', e);
                        }
                    }

                    setIsAuthenticated(true);

                    // ── OPTIMISTIC HYDRATION ──────────────────────────────────────────
                    // Immediately show UI if we have any cached data
                    if (storedRole && storedProfile) {
                        setLoading(false);
                        hydrated = true;
                        hasHydrated.current = true;
                        logger.log('[AuthContext] Optimistic hydration success');
                    }

                    // ── Authoritative Session Verification (Gap #1 Anti-Spoofing) ──
                    try {
                        const verifyRes = await axios.get(`${API_URL}/api/auth/verify-session`, {
                            headers: { Authorization: `Bearer ${session.access_token}` }
                        });

                        if (verifyRes.data.success) {
                            const { role: backendRole, profile: backendProfile, user: backendUser, membership: backendMembership } = verifyRes.data.data;

                            // If local state is out of sync with backend authority, force-update
                            const localRole = localStorage.getItem('user_role');
                            const localUser = JSON.parse(localStorage.getItem('user') || '{}');

                            const localMembership = JSON.parse(localStorage.getItem('user_membership') || 'null');

                            const hasMembershipChanged = 
                                (backendMembership?.plan_id !== localMembership?.plan_id) || 
                                (backendMembership?.status !== localMembership?.status);

                            if (backendRole !== localRole || 
                                backendUser?.is_profile_complete !== localUser?.is_profile_complete ||
                                backendUser?.is_client_profile_complete !== localUser?.is_client_profile_complete ||
                                hasMembershipChanged) {
                                logger.warn('[AuthContext] Session desync detected! Auto-correcting...', { backend: backendRole });
                                setRole(backendRole);
                                setProfile(backendProfile);
                                setMembership(backendMembership);
                                setIsAdmin(ADMIN_ROLES.includes(backendRole));
                                setUser(prev => ({ ...prev, ...backendUser }));

                                localStorage.setItem('user_role', backendRole);
                                localStorage.setItem('user_profile', JSON.stringify(backendProfile));
                                localStorage.setItem('user', JSON.stringify(backendUser));
                                if (backendMembership) {
                                    localStorage.setItem('user_membership', JSON.stringify(backendMembership));
                                } else {
                                    localStorage.removeItem('user_membership');
                                }
                            } else {
                                // Even if role matches, ensure membership is up to date
                                setMembership(backendMembership);
                                if (backendMembership) {
                                    localStorage.setItem('user_membership', JSON.stringify(backendMembership));
                                } else {
                                    localStorage.removeItem('user_membership');
                                }
                            }
                        }
                    } catch (err) {
                        logger.error('[AuthContext] Authoritative verification failed:', err.response?.status);
                        // Only force-logout on 401 for direct login sessions.
                        // For OAuth (new Google users), 401 means profile not created yet — let them proceed to select-role.
                        if (err.response?.status === 401 || err.response?.status === 404) {
                            const isDirectLogin = localStorage.getItem('login_source') === 'direct';
                            if (isDirectLogin) {
                                logger.warn('[AuthContext] Session invalid or user deleted. Logging out...');
                                await logout();
                                return;
                            }
                            // OAuth new user — backend profile doesn't exist yet, that's OK
                            logger.log('[AuthContext] OAuth new user — no backend profile yet, continuing...');
                        }
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                logger.error('[AuthContext] Initialization failed:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            logger.log(`[AuthContext] Auth event: ${event}`);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const isDirectLogin = localStorage.getItem('login_source') === 'direct';

                if (session) {
                    setUser(session.user);
                    setIsAuthenticated(true);

                    if (session.access_token) {
                        localStorage.setItem('token', session.access_token);
                        sessionStorage.setItem('token', session.access_token);
                    }

                    if (skipSync.current || isDirectLogin) {
                        logger.log('[AuthContext] Skipping redundant sync');
                        skipSync.current = false;
                    } else if (event === 'TOKEN_REFRESHED') {
                        // All set - token already updated above
                    } else {
                        await syncUserRole(session);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                setProfile(null);
                setIsAdmin(false);
                setIsAuthenticated(false);
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_profile');
                localStorage.removeItem('user_wallet');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            } else if (event === 'USER_UPDATED') {
                // Restore email verification sync
                setUser(session?.user || null);
                if (session?.user?.email_confirmed_at) {
                    logger.log('[AuthContext] Email verification detected. Notifying backend...');
                    try {
                        axios.post(`${API_URL}/api/auth/mark-email-verified`, {}, {
                            headers: { Authorization: `Bearer ${session.access_token}` }
                        }).then(res => {
                            if (res.data.success) {
                                setProfile(prev => prev ? { ...prev, is_email_verified: true, email_verified: true } : null);
                            }
                        });
                    } catch (err) {
                        logger.error('[AuthContext] Verification sync failed:', err);
                    }
                }
            }

            // Background status sync — non-blocking
            setLoading(false);
        });

        return () => authListener.subscription.unsubscribe();
    }, [syncUserRole]);

    /**
     * ── Global Session Expiry Listener (Production Hardening) ──────────
     * Listens for 401 Unauthorized events from api.service.js
     */
    useEffect(() => {
        const handleUnauthorized = () => {
            logger.warn('[AuthContext] Global 401 detected. Terminating session...');
            // toast.error('Session expired. Please log in again.'); // Removed as requested by user
            logout();
        };

        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, [logout]);

    // Use OUR profile definition, not Supabase's immediate stamp
    const isEmailVerified = !!(profile?.is_email_verified || profile?.email_verified);

    const refreshProfile = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            return await syncUserRole(session, null, true); // force=true to bypass direct-login sync block
        }
    }, [syncUserRole]);

    const refreshWallet = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/fake-escrow/balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setWallet(res.data.data);
                localStorage.setItem('user_wallet', JSON.stringify(res.data.data));
                return res.data.data;
            }
        } catch (err) {
            logger.error('[AuthContext] Refresh wallet failed:', err);
        }
    }, [isAuthenticated]);

    const isProfileComplete = React.useMemo(() => {
        return checkProfileCompletion(user, role, profile);
    }, [user, role, profile]);

    const value = React.useMemo(() => ({
        user,
        role,
        profile,
        wallet,
        membership,
        loading,
        isAdmin,
        isAuthenticated,
        isEmailVerified,
        isProfileComplete,
        login,
        logout,
        refreshProfile,
        refreshWallet,
        setMembership,
        updateUserRole,
        getDashboardRoute
    }), [
        user,
        role,
        profile,
        wallet,
        membership,
        loading,
        isAdmin,
        isAuthenticated,
        isEmailVerified,
        isProfileComplete,
        login,
        logout,
        refreshProfile,
        refreshWallet,
        setMembership,
        updateUserRole,
        getDashboardRoute
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

