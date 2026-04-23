import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const DashboardCacheContext = createContext(null);

const CACHE_TTL = 1 * 60 * 1000; // 1 minute

export function DashboardCacheProvider({ children }) {
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState({
        "BEST MATCHES": [],
        "MOST RECENT": [],
        "SAVED JOBS": []
    });
    const [proposals, setProposals] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [lastUpdated, setLastUpdated] = useState({});

    const isFresh = useCallback((key) => {
        const timestamp = lastUpdated[key];
        if (!timestamp) return false;
        return (Date.now() - timestamp) < CACHE_TTL;
    }, [lastUpdated]);

    const updateStats = useCallback((newStats) => {
        setStats(newStats);
        setLastUpdated(prev => ({ ...prev, stats: Date.now() }));
    }, []);

    const updateJobs = useCallback((tab, newJobs) => {
        setJobs(prev => ({ ...prev, [tab]: newJobs }));
        setLastUpdated(prev => ({ ...prev, [`jobs_${tab}`]: Date.now() }));
    }, []);

    const updateProposals = useCallback((newProposals) => {
        setProposals(newProposals);
        setLastUpdated(prev => ({ ...prev, proposals: Date.now() }));
    }, []);

    const clearCache = useCallback(() => {
        setStats(null);
        setJobs({ "BEST MATCHES": [], "MOST RECENT": [], "SAVED JOBS": [] });
        setProposals([]);
        setLastUpdated({});
    }, []);

    const value = React.useMemo(() => ({
        stats,
        jobs,
        proposals,
        savedJobIds,
        setSavedJobIds,
        updateStats,
        updateJobs,
        updateProposals,
        isFresh,
        clearCache
    }), [
        stats,
        jobs,
        proposals,
        savedJobIds,
        updateStats,
        updateJobs,
        updateProposals,
        isFresh,
        clearCache
    ]);

    return (
        <DashboardCacheContext.Provider value={value}>
            {children}
        </DashboardCacheContext.Provider>
    );
}

export function useDashboardCache() {
    const context = useContext(DashboardCacheContext);
    if (!context) {
        throw new Error('useDashboardCache must be used within a DashboardCacheProvider');
    }
    return context;
}
