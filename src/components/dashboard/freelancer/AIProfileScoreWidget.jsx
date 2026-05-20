import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAIProfileScore } from '../../../services/recommendationApi';
import './AIProfileScoreWidget.css';

/**
 * AI Profile Readiness Score Widget
 * Shows freelancers how optimized their profile is for AI matching,
 * with actionable improvement tips.
 */
const AIProfileScoreWidget = ({ compact = false }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getAIProfileScore();
                if (res?.success) setData(res.data);
            } catch (_) {}
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className={`apsw-card apsw-loading ${compact ? 'apsw-compact' : ''}`}>
                <div className="apsw-skeleton apsw-skeleton--title" />
                <div className="apsw-skeleton apsw-skeleton--bar" />
                <div className="apsw-skeleton apsw-skeleton--line" />
                <div className="apsw-skeleton apsw-skeleton--line apsw-skeleton--short" />
            </div>
        );
    }

    if (!data) return null;

    const { ai_readiness_score, label, recommendations, breakdown } = data;

    const getScoreColor = (score) => {
        if (score >= 85) return '#22c55e';
        if (score >= 70) return '#818cf8';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const color = getScoreColor(ai_readiness_score);

    const breakdownItems = Object.entries(breakdown || {})
        .sort(([, a], [, b]) => b.score - a.score);

    return (
        <div className={`apsw-card ${compact ? 'apsw-compact' : ''}`}>
            {/* Header */}
            <div className="apsw-header">
                <span className="apsw-robot">🤖</span>
                <div>
                    <h3 className="apsw-title">AI Matching Readiness</h3>
                    {!compact && <p className="apsw-subtitle">How well your profile attracts matched jobs</p>}
                </div>
            </div>

            {/* Score ring + bar */}
            <div className="apsw-score-row">
                <div className="apsw-score-ring" style={{ '--color': color }}>
                    <svg viewBox="0 0 56 56" fill="none" className="apsw-ring-svg">
                        <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle
                            cx="28" cy="28" r="24"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(ai_readiness_score / 100) * 150.8} 150.8`}
                            strokeDashoffset="37.7"
                            transform="rotate(-90 28 28)"
                        />
                    </svg>
                    <span className="apsw-ring-score" style={{ color }}>{ai_readiness_score}%</span>
                </div>

                <div className="apsw-score-info">
                    <div className="apsw-label" style={{ color }}>{label}</div>
                    <div className="apsw-bar-track">
                        <div
                            className="apsw-bar-fill"
                            style={{ width: `${ai_readiness_score}%`, background: color }}
                        />
                    </div>

                    {!compact && (
                        <div className="apsw-dims">
                            {breakdownItems.slice(0, 3).map(([key, item]) => (
                                <div key={key} className="apsw-dim">
                                    <span className="apsw-dim-name">{key.replace('_', ' ')}</span>
                                    <div className="apsw-dim-bar">
                                        <div
                                            style={{
                                                width: `${item.score}%`,
                                                background: getScoreColor(item.score),
                                                height: '100%',
                                                borderRadius: '99px',
                                                transition: 'width 0.6s ease'
                                            }}
                                        />
                                    </div>
                                    <span className="apsw-dim-val" style={{ color: getScoreColor(item.score) }}>{item.score}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <div className="apsw-recs">
                    <p className="apsw-recs-title">
                        {ai_readiness_score >= 85 ? '✨ Great profile!' : 'To reach the next level:'}
                    </p>
                    {recommendations.slice(0, compact ? 2 : 3).map((rec, i) => (
                        <p key={i} className="apsw-rec-item">→ {rec}</p>
                    ))}
                </div>
            )}

            {/* CTA */}
            <button
                className="apsw-cta"
                onClick={() => navigate('/freelancer/profile')}
                aria-label="Complete your profile"
            >
                Complete Profile
                <span className="apsw-cta-arrow">→</span>
            </button>
        </div>
    );
};

export default AIProfileScoreWidget;
