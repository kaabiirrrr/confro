import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, IndianRupee, Bookmark, ThumbsDown } from 'lucide-react';
import WhyMatchModal from './WhyMatchModal';
import { trackRecommendationEvent } from '../../../services/recommendationApi';
import { toggleSaveJob } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import './JobMatchCard.css';

/**
 * Premium AI-powered job card for the Best Matches feed.
 * Shows match %, skills overlap, explanation, connect discount, dismiss menu.
 */
const JobMatchCard = ({ job, onDismiss }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [undoVisible, setUndoVisible] = useState(false);
    const [dismissAction, setDismissAction] = useState(null);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const menuRef = useRef(null);
    const undoTimer = useRef(null);

    const rec = job.recommendation || {};
    const matchScore = rec.match_score || 0;
    const skillsMatched = rec.skills_matched || [];
    const skillsMissing = rec.skills_missing || [];
    const matchReason = rec.match_reason || '';

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getMatchConfig = (score) => {
        if (score >= 85) return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', label: 'Excellent Match', icon: '🟢' };
        if (score >= 70) return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', label: 'Good Match', icon: '🔵' };
        if (score >= 55) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Partial Match', icon: '🟡' };
        return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)', label: 'Weak Match', icon: '🟠' };
    };

    const getConnectDiscount = (score) => {
        if (score >= 85) return { saves: 4, label: 'Saves 4 Connects — Excellent Match Discount' };
        if (score >= 70) return { saves: 2, label: 'Saves 2 Connects — High Match Discount' };
        return null;
    };

    const matchConfig = getMatchConfig(matchScore);
    const connectDiscount = getConnectDiscount(matchScore);

    const formatBudget = (job) => {
        if (!job.budget_amount) return 'Budget not set';
        const fmt = `₹${Number(job.budget_amount).toLocaleString('en-IN')}`;
        return job.budget_type === 'hourly' ? `${fmt}/hr` : `${fmt} Fixed`;
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (days > 0) return `${days}d ago`;
        if (hrs > 0) return `${hrs}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    };

    const handleView = () => {
        trackRecommendationEvent(job.id, 'click', { source_tab: 'best_matches' });
        navigate(`/freelancer/jobs/${job.id}`);
    };

    const handleDismiss = (eventType) => {
        setShowMenu(false);
        setDismissAction(eventType);
        setDismissed(true);
        setUndoVisible(true);
        trackRecommendationEvent(job.id, eventType, { source_tab: 'best_matches' });

        undoTimer.current = setTimeout(() => {
            setUndoVisible(false);
            onDismiss?.(job.id);
        }, 4000);
    };

    const handleUndo = () => {
        clearTimeout(undoTimer.current);
        setDismissed(false);
        setUndoVisible(false);
        setDismissAction(null);
    };

    const handleToggleSave = async (e) => {
        e.stopPropagation();
        if (saving) return;
        const next = !saved;
        setSaved(next);
        setSaving(true);
        try {
            const res = await toggleSaveJob(job.id);
            setSaved(res.saved);
            toast.success(res.saved ? 'Job saved' : 'Job unsaved');
        } catch {
            setSaved(!next);
            toast.error('Could not save job');
        } finally {
            setSaving(false);
        }
    };

    const handleDislike = (e) => {
        e.stopPropagation();
        handleDismiss('not_relevant');
    };

    const DISMISS_LABELS = {
        hide_job: 'Job hidden',
        not_relevant: 'Marked not relevant',
        dont_show_similar: 'Similar jobs blocked',
    };

    if (dismissed && !undoVisible) return null;

    if (dismissed && undoVisible) {
        return (
            <div className="jmc-undo-toast">
                <span>{DISMISS_LABELS[dismissAction] || 'Job removed'}</span>
                <button onClick={handleUndo} className="jmc-undo-btn">Undo</button>
            </div>
        );
    }

    return (
        <>
            <div 
              onClick={handleView}
              className="group relative p-4 sm:p-5 border border-white/10 rounded-2xl hover:border-accent transition-all cursor-pointer bg-transparent"
            >
                {/* Top row: match badge + Posted time + Dismiss menu */}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0"
                            style={{ background: matchConfig.bg, border: `1px solid ${matchConfig.border}`, color: matchConfig.color }}
                        >
                            <span className="text-[11px]">{matchConfig.icon}</span>
                            <span>{matchScore}% Match</span>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-4 items-center shrink-0">
                        <button
                            className="text-[10px] font-bold uppercase tracking-widest text-light-text/30 hover:text-accent transition-colors border border-white/10 hover:border-accent/30 rounded-full px-2 py-0.5 shrink-0"
                            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                            title="Why was this recommended?"
                        >
                            Why this?
                        </button>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 hidden sm:block shrink-0">
                            Posted {formatTimeAgo(job.created_at || new Date().toISOString())}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 block sm:hidden shrink-0">
                            {formatTimeAgo(job.created_at || new Date().toISOString()).replace(' ago', '')}
                        </p>

                        {/* Dislike — same style as JobCard */}
                        <button
                            onClick={handleDislike}
                            title="Not relevant"
                            className="text-light-text/10 hover:text-red-400 transition-colors transform hover:scale-110 active:scale-95"
                        >
                            <ThumbsDown size={15} />
                        </button>

                        {/* Save — same style as JobCard */}
                        <button
                            onClick={handleToggleSave}
                            disabled={saving}
                            title={saved ? 'Unsave job' : 'Save job'}
                            className={`transition-all transform hover:scale-110 active:scale-95 ${saved ? 'text-accent' : 'text-light-text/20 hover:text-accent'} ${saving ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <Bookmark size={15} className={`transition-all ${saved ? 'fill-accent' : ''}`} />
                        </button>
                        
                        {/* Dismiss kebab menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                className="text-light-text/20 hover:text-white transition-colors text-lg font-bold pb-1"
                                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-6 w-48 bg-secondary border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col">
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2" onClick={(e) => { e.stopPropagation(); handleDismiss('hide_job'); }}>👁 Hide this job</button>
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2" onClick={(e) => { e.stopPropagation(); handleDismiss('not_relevant'); }}>🚫 Not relevant</button>
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2" onClick={(e) => { e.stopPropagation(); handleDismiss('dont_show_similar'); }}>✕ Don't show similar</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-2 sm:mb-3">
                    {job.title}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-5 text-[11px] sm:text-[12px] mb-3 sm:mb-5">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-5">
                        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
                            <IndianRupee size={12} className="text-accent/60" /> {formatBudget(job)}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
                            <Clock size={12} className="text-accent/60" /> {job.experience_level || "Intermediate"}
                        </span>
                    </div>
                    {job.duration && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mt-0.5 sm:mt-0">
                            Est. Time: {job.duration}
                        </span>
                    )}
                </div>

                {matchReason && (
                    <p className="text-xs font-medium italic text-accent/70 mb-3">"{matchReason}"</p>
                )}

                <p className="text-xs sm:text-[13.5px] text-light-text/50 mb-4 sm:mb-6 line-clamp-2 leading-relaxed font-normal">
                    {job.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {(job.skills || []).map((skill, i) => {
                        const isMatched = skillsMatched.includes(skill);
                        return (
                            <span key={i} className={`text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors ${
                                isMatched 
                                ? "bg-accent/10 border border-accent/20 text-accent" 
                                : "bg-white/5 border border-white/5 text-light-text/30 group-hover:text-light-text/50"
                            }`}>
                                {isMatched && "✓ "} {skill}
                            </span>
                        );
                    })}
                </div>

                {/* Client Info */}
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                        {job.client?.avatar_url ? (
                            <img src={job.client.avatar_url} alt="Client" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-[11px] text-accent font-bold ring-1 ring-accent/20">
                                {(job.client?.name?.[0] || job.client?.company_name?.[0] || "C").toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-[11px] text-light-text/50 font-semibold leading-tight">
                                {job.client?.name || job.client?.company_name || "Client"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {(job.client?.rating && job.client.rating > 0) ? (
                                    <>
                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-bold text-yellow-400/90">{Number(job.client.rating).toFixed(1)}</span>
                                        <span className="text-[9px] text-light-text/25 font-medium">({job.client.reviews_count || 0})</span>
                                    </>
                                ) : (
                                    <span className="text-[9px] text-light-text/20 font-medium italic">New client</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-light-text/20 break-words text-right max-w-[150px] sm:max-w-none">
                            {job.client?.location || job.client?.country || "INTL"}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-accent/40 font-extrabold uppercase tracking-widest whitespace-nowrap">
                            Proposals: <span className="text-light-text/40">{job.proposal_count ?? job.proposals?.length ?? 0}</span>
                        </span>
                    </div>
                </div>
            </div>

            <WhyMatchModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                job={job}
                recommendation={rec}
            />
        </>
    );
};

export default JobMatchCard;
