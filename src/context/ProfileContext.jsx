import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { profileApi } from '../services/profileApi';
import { connectsApi } from '../services/connectsApi';

const ProfileContext = createContext(null);

const PROFILE_CACHE_TTL = 30 * 1000; // 30 seconds cache TTL

export function ProfileProvider({ children }) {
    const { user, role: authRole } = useAuth();
    const [status, setStatus] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const lastFetchedAt = useRef(null);
    const isFetching = useRef(false);

    const fetchProfile = useCallback(async (force = false) => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        // Debounce: skip if already fetching
        if (isFetching.current) return;

        // Cache: skip if data is fresh (unless forced)
        const now = Date.now();
        if (!force && lastFetchedAt.current && (now - lastFetchedAt.current) < PROFILE_CACHE_TTL) return;

        isFetching.current = true;
        try {
            setLoading(true);
            setError(null);

            // Parallel fetch: profile status + connects balance
            const isFreelancer = authRole === 'FREELANCER';
            const [profileRes, balanceRes] = await Promise.all([
                profileApi.getStatus().catch(e => ({ success: false, error: e.message })),
                isFreelancer
                    ? connectsApi.getBalance().catch(() => ({ success: false }))
                    : Promise.resolve({ success: false }),
            ]);

            if (profileRes.success) {
                setStatus(profileRes.data);
            } else {
                setError(profileRes.message || 'Failed to load profile');
            }

            if (balanceRes.success) {
                setBalance(balanceRes.data?.balance ?? 0);
            }

            lastFetchedAt.current = Date.now();
        } catch (err) {
            setError(err.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [user, authRole]);

    // Initial fetch once on mount
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const value = React.useMemo(() => ({
        status,
        balance,
        loading,
        error,
        refetch: () => fetchProfile(true)
    }), [status, balance, loading, error, fetchProfile]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
    return ctx;
}
