import React, { useEffect, useRef } from 'react';
import './WhyMatchModal.css';

/**
 * "Why This Job?" Modal
 * Shows a transparent breakdown of why a job was recommended.
 * Triggered by the ℹ button on JobMatchCard.
 */
const WhyMatchModal = ({ isOpen, onClose, job, recommendation }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen || !recommendation) return null;

    const {
        match_score = 0,
        skills_score = 0,
        trust_score = 0,
        budget_score = 0,
        category_score = 0,
        experience_score = 0,
        client_quality_score = 0,
        skills_matched = [],
        skills_missing = [],
        match_reason = '',
    } = recommendation;

    const getScoreColor = (score) => {
        if (score >= 85) return '#22c55e';
        if (score >= 70) return '#3b82f6';
        if (score >= 55) return '#f59e0b';
        return '#ef4444';
    };

    const getMatchLabel = (score) => {
        if (score >= 85) return { text: 'Excellent Match', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' };
        if (score >= 70) return { text: 'Good Match', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
        if (score >= 55) return { text: 'Partial Match', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
        return { text: 'Weak Match', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
    };

    const label = getMatchLabel(match_score);

    const scoreDimensions = [
        { name: 'Skills', score: skills_score, icon: '🛠', weight: '30%' },
        { name: 'Trust Score', score: trust_score, icon: '🛡', weight: '22%' },
        { name: 'Category Fit', score: category_score, icon: '📂', weight: '18%' },
        { name: 'Budget Fit', score: budget_score, icon: '💰', weight: '12%' },
        { name: 'Experience', score: experience_score, icon: '📈', weight: '10%' },
        { name: 'Client Quality', score: client_quality_score, icon: '⭐', weight: '8%' },
    ];

    // Generate bullet points for why this job
    const reasons = [];
    if (skills_matched.length > 0) {
        reasons.push(`You have ${skills_matched.length} of ${skills_matched.length + skills_missing.length} required skills`);
    }
    if (trust_score >= 80) reasons.push('Your trust score is above average');
    if (budget_score >= 70) reasons.push('Budget aligns with your rate profile');
    if (category_score === 100) reasons.push(`${job?.category || 'This category'} is your specialty`);
    if (client_quality_score >= 75) reasons.push('Client has a strong hiring history');

    // Generate improvement tips
    const tips = [];
    if (skills_missing.length > 0) tips.push(`Add "${skills_missing[0]}" to your skills`);
    if (budget_score < 55) tips.push('Adjust your hourly rate to better match this budget range');
    if (trust_score < 70) tips.push('Complete more contracts to improve your trust score');

    return (
        <div className="wmm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Why this job was recommended">
            <div className="wmm-modal bg-secondary rounded-xl" ref={modalRef}>
                {/* Header */}
                <div className="wmm-header">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="w-4 h-4 object-contain opacity-80 brightness-0 dark:brightness-100" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/40">Connect AI</span>
                        </div>
                        <div>
                            <h2 className="wmm-title">Why we recommended this job</h2>
                            <p className="wmm-subtitle">{job?.title || 'Job'}</p>
                        </div>
                    </div>
                    <button className="text-light-text/40 hover:text-accent transition-colors text-lg" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Match score badge */}
                <div className="wmm-score-badge" style={{ background: label.bg, border: `1px solid ${label.color}30` }}>
                    <span className="wmm-score-number" style={{ color: label.color }}>{match_score}%</span>
                    <span className="wmm-score-label" style={{ color: label.color }}>{label.text}</span>
                </div>

                {/* Reason bullets */}
                {reasons.length > 0 && (
                    <div className="wmm-section">
                        <h3 className="wmm-section-title">Why it matched</h3>
                        <ul className="wmm-reasons">
                            {reasons.map((r, i) => (
                                <li key={i} className="wmm-reason-item">
                                    <span className="wmm-reason-dot">✓</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Score breakdown bars */}
                <div className="wmm-section">
                    <h3 className="wmm-section-title">Score breakdown</h3>
                    <div className="wmm-bars">
                        {scoreDimensions.map((dim) => (
                            <div key={dim.name} className="wmm-bar-row">
                                <div className="wmm-bar-meta">
                                    <span className="wmm-bar-icon">{dim.icon}</span>
                                    <span className="wmm-bar-name">{dim.name}</span>
                                    <span className="wmm-bar-weight">({dim.weight})</span>
                                </div>
                                <div className="wmm-bar-track">
                                    <div
                                        className="wmm-bar-fill"
                                        style={{
                                            width: `${dim.score}%`,
                                            background: getScoreColor(dim.score),
                                        }}
                                    />
                                </div>
                                <span className="wmm-bar-value" style={{ color: getScoreColor(dim.score) }}>{dim.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                {(skills_matched.length > 0 || skills_missing.length > 0) && (
                    <div className="wmm-section">
                        <h3 className="wmm-section-title">Skills</h3>
                        <div className="wmm-skills-grid">
                            {skills_matched.map((s) => (
                                <span key={s} className="wmm-skill wmm-skill--matched">✓ {s}</span>
                            ))}
                            {skills_missing.map((s) => (
                                <span key={s} className="wmm-skill wmm-skill--missing">✕ {s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Improvement tips */}
                {tips.length > 0 && (
                    <div className="wmm-tips">
                        <h3 className="wmm-section-title" style={{ color: '#f59e0b' }}>💡 Improve your match</h3>
                        {tips.map((tip, i) => (
                            <p key={i} className="wmm-tip-item">→ {tip}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhyMatchModal;
