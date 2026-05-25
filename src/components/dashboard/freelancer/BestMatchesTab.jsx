import React, { useEffect, useState, useCallback } from 'react';
import { Info, X } from 'lucide-react';
import JobMatchCard from './JobMatchCard';
import AIProfileScoreWidget from './AIProfileScoreWidget';
import { getRecommendations } from '../../../services/recommendationApi';
import './BestMatchesTab.css';

/**
 * BestMatchesTab — AI-powered personalized job feed.
 * Replaces the old "Recent Jobs as Best Matches" fallback.
 */
const BestMatchesTab = ({ filters = {}, searchQuery = '' }) => {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isColdStart, setIsColdStart] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const LIMIT = 12;

    const fetchRecs = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const res = await getRecommendations({ limit: LIMIT, offset: pageNum * LIMIT });
            if (res?.success) {
                if (pageNum === 0) setRecs(res.data || []);
                else setRecs(prev => [...prev, ...(res.data || [])]);
                setTotal(res.total || 0);
                setIsColdStart(res.is_cold_start || false);
            }
        } catch (_) {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRecs(0); }, [fetchRecs]);

    // Cold-start polling — check back after 6 seconds
    useEffect(() => {
        if (!isColdStart) return;
        const timer = setTimeout(() => fetchRecs(0), 6000);
        return () => clearTimeout(timer);
    }, [isColdStart, fetchRecs]);

    const handleDismiss = (jobId) => {
        setRecs(prev => prev.filter(j => j.id !== jobId));
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRecs(nextPage);
    };

    // ── Apply client-side filters & search ───────────────────
    const filteredRecs = recs.filter(job => {
        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                (job.title || '').toLowerCase().includes(q) ||
                (job.description || '').toLowerCase().includes(q) ||
                (job.skills || []).some(s => s.toLowerCase().includes(q)) ||
                (job.category || '').toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }

        // Experience level
        if (filters.experience_level?.length > 0) {
            const jobExp = (job.experience_level || '').toLowerCase();
            const matches = filters.experience_level.some(fl => jobExp.includes(fl) || fl.includes(jobExp));
            if (!matches) return false;
        }

        // Budget type / job type
        if (filters.budget_type?.length > 0) {
            const jobType = (job.budget_type || '').toLowerCase();
            const matches = filters.budget_type.some(fl => jobType.includes(fl) || fl.includes(jobType));
            if (!matches) return false;
        }

        // Budget range
        if (filters.budget_min && job.budget !== null && job.budget !== undefined) {
            if (Number(job.budget) < Number(filters.budget_min)) return false;
        }
        if (filters.budget_max && job.budget !== null && job.budget !== undefined) {
            if (Number(job.budget) > Number(filters.budget_max)) return false;
        }

        return true;
    });

    // ── Cold start state ──────────────────────────────────────
    if (isColdStart) {
        return (
            <div className="bmt-root">
                <div className="bmt-cold-start">
                    <div className="bmt-ai-pulse">⚡</div>
                    <h3 className="bmt-cold-title">Computing your matches…</h3>
                    <p className="bmt-cold-sub">Our AI is analyzing your profile and scoring open jobs. This takes just a moment.</p>
                    <div className="bmt-spinner" />
                </div>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────
    if (!loading && recs.length === 0) {
        return (
            <div className="bmt-root w-full flex flex-col items-center justify-center">
                <div className="bmt-empty">
                    <span className="bmt-empty-icon">🎯</span>
                    <h3 className="bmt-empty-title">No matches yet</h3>
                    <p className="bmt-empty-sub">
                        Complete your profile with skills, hourly rate, and category to unlock personalized job recommendations.
                    </p>
                    <div className="bmt-empty-widget">
                        <AIProfileScoreWidget />
                    </div>
                </div>
            </div>
        );
    }

    // ── Filtered empty state ──────────────────────────────────
    if (!loading && recs.length > 0 && filteredRecs.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center text-center">
                <img
                    src="/ChatGPT Image May 24, 2026, 04_29_37 PM.png"
                    alt="No matches"
                    className="w-60 h-60 object-contain"
                />
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">No matches for these filters</h3>
                <p className="text-slate-400 dark:text-white/30 text-sm font-medium max-w-xs">Try adjusting or clearing your filters to see more results.</p>
            </div>
        );
    }

    return (
        <div className="bmt-root">
            {/* Feed */}
            <div className="bmt-feed w-full">
                {/* Header */}
                <div className="bmt-feed-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div className="w-full sm:w-auto">
                        <div className="bmt-feed-meta flex justify-between sm:justify-start w-full">
                            <span className="bmt-ai-label flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-400/25 text-indigo-700 dark:text-indigo-300">
                                <img src="/Icons/AI-Connect.png" alt="Connect AI" className="w-3 h-3 object-contain dark:hidden" />
                                <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="w-3 h-3 object-contain hidden dark:block" />
                                CONNECT AI POWERED
                            </span>
                            <span className="bmt-count text-slate-800 dark:text-slate-200">{total} personalized matches</span>
                        </div>
                        <p className="bmt-feed-desc text-slate-500 dark:text-slate-400">Jobs scored for your skills, experience, budget, and trust profile</p>
                    </div>
                    <button
                        onClick={() => setShowHowItWorks(true)}
                        className="w-full sm:w-auto text-slate-600 dark:text-white/40 hover:text-accent dark:hover:text-accent transition-colors flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-2 sm:py-1.5 rounded-full self-end sm:self-auto shrink-0"
                    >
                        <Info size={14} /> How it works
                    </button>
                </div>

                {/* Job cards */}
                <div className="bmt-jobs-grid">
                    {filteredRecs.map((job) => (
                        <JobMatchCard
                            key={job.id}
                            job={job}
                            onDismiss={handleDismiss}
                        />
                    ))}

                    {/* Loading skeletons */}
                    {loading && Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-transparent border border-border rounded-2xl h-44" />
                    ))}
                </div>

                {/* Load more */}
                {!loading && recs.length < total && (
                    <button className="bmt-load-more" onClick={handleLoadMore}>
                        Load more matches
                    </button>
                )}

                {!loading && recs.length >= total && total > 0 && (
                    <p className="bmt-end-note">✓ All {total} matches shown</p>
                )}
            </div>

            {/* How matching works modal */}
            {showHowItWorks && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-black/60 backdrop-blur-sm" onClick={() => setShowHowItWorks(false)}>
                    <div className="bg-white dark:bg-secondary border border-slate-200 dark:border-white/10 rounded-xl w-[92vw] max-w-sm p-5 sm:p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 text-slate-400 dark:text-light-text/40 hover:text-accent dark:hover:text-accent transition-colors" onClick={() => setShowHowItWorks(false)}>
                            <X size={20} />
                        </button>
                        <div className="flex flex-col gap-2 mb-5 pr-6">
                            <div className="flex items-center gap-1.5">
                                <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="w-4 h-4 object-contain opacity-80 brightness-0 dark:brightness-100" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-light-text/40">Connect AI</span>
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-white m-0">How matching works</h4>
                        </div>
                        <ul className="flex flex-col gap-3">
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">🛠</span> Skills alignment <span className="ml-auto font-medium">30%</span></li>
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">🛡</span> Trust & reliability <span className="ml-auto font-medium">22%</span></li>
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">📂</span> Category expertise <span className="ml-auto font-medium">18%</span></li>
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">💰</span> Budget compatibility <span className="ml-auto font-medium">12%</span></li>
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">📈</span> Experience level <span className="ml-auto font-medium">10%</span></li>
                            <li className="flex items-center gap-3 text-[13.5px] text-slate-600 dark:text-light-text/60"><span className="text-lg">⭐</span> Client quality <span className="ml-auto font-medium">8%</span></li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BestMatchesTab;
