import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/profileApi';

export function useProfileCompletion() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileApi.getStatus();
            if (response.success) {
                setStatus(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch profile status');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return {
        status,           // Contains percentage, boolean flags, profile_completed
        loading,
        error,
        refetch: fetchStatus
    };
}
