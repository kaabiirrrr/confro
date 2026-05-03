import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Megaphone, Clock, AlertCircle, Mail, Briefcase,
    CheckCircle, X, DollarSign, MessageSquare, Shield,
    TrendingUp, Star, UserCheck, Zap, ArrowRight, Video
} from 'lucide-react';
import { fetchUnifiedNotifications, markUnifiedAsRead, getUnifiedUnreadCount, dismissUnifiedItem } from '../../../services/notificationService';
import { useNotification } from '../../../hooks/useNotification';
import InfinityLoader from '../../../components/common/InfinityLoader';

/* ─── helpers ──────────────────────────────────────────────────── */
const getTimeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 20) return 'Just now';
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CATEGORIES = {
    JOB: { icon: Briefcase, label: 'Job', cls: 'ndc-job' },
    MESSAGE: { icon: MessageSquare, label: 'Message', cls: 'ndc-message' },
    PAYMENT: { icon: DollarSign, label: 'Payment', cls: 'ndc-payment' },
    SYSTEM: { icon: Shield, label: 'System', cls: 'ndc-system' },
    CONTRACT: { icon: UserCheck, label: 'Contract', cls: 'ndc-contract' },
    REVIEW: { icon: () => <img src="/Icons/icons8-review-100.png" alt="Review" style={{ width: '15px', height: '15px' }} />, label: 'Review', cls: 'ndc-review' },
    PROPOSAL: { icon: TrendingUp, label: 'Proposal', cls: 'ndc-proposal' },
    ANNOUNCEMENT: { icon: Megaphone, label: 'Platform', cls: 'ndc-announce' },
    DEFAULT: { icon: Bell, label: 'Activity', cls: 'ndc-default' },
};

const getCat = (item) => {
    if (item.type === 'ANNOUNCEMENT') return CATEGORIES.ANNOUNCEMENT;
    return CATEGORIES[item.category] || CATEGORIES.DEFAULT;
};

const isItemUnread = (item) => item.type === 'ANNOUNCEMENT'
    ? !JSON.parse(localStorage.getItem('read_announcements') || '[]').includes(item.id)
    : !item.is_read;

/* ─── component ────────────────────────────────────────────────── */
const NotificationDropdown = ({ role }) => {
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const { notify } = useNotification();
    const navigate = useNavigate();

    const handleItemClick = (item) => {
        // Meeting invite — navigate to meeting room
        const meta = item.metadata || item.data || {};
        const meetingId = meta.meetingId || meta.meeting_id;
        if (meetingId) {
            navigate(`/meeting/${meetingId}`);
            return;
        }
        // Other deep-links based on category
        const dashPath = role === 'CLIENT' ? '/client' : '/freelancer';
        if (item.category === 'MESSAGE') navigate(`${dashPath}/messages`);
        else if (item.category === 'JOB') navigate(`${dashPath}/find-work`);
        else if (item.category === 'PROPOSAL') navigate(`${dashPath}/proposals`);
        else if (item.category === 'CONTRACT') navigate(`${dashPath}/contracts`);
        else if (item.category === 'PAYMENT') navigate(`${dashPath}/earnings`);
    };

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchUnifiedNotifications(role);
            setItems(data);
            setUnreadCount(getUnifiedUnreadCount(data));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    useEffect(() => {
        if (items.length > 0) {
            markUnifiedAsRead(items);
            setUnreadCount(0);
        }
    }, [items.length]); // eslint-disable-line

    const handleDismiss = async (e, item) => {
        e.stopPropagation();
        const ok = await dismissUnifiedItem(item);
        if (ok) setItems(prev => prev.filter(i => i.id !== item.id));
    };

    const dashPath = role === 'CLIENT' ? '/client' : role === 'FREELANCER' ? '/freelancer' : '/admin';
    const displayed = activeTab === 'unread' ? items.filter(isItemUnread) : items;

    return (
        <>
            {/* ── Scoped CSS using site variables ── */}
            <style>{`
                @keyframes nd-slideIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes nd-itemFade {
                    from { opacity: 0; transform: translateX(6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes nd-spin {
                    to { transform: rotate(360deg); }
                }

                /* ── Wrapper ── */
                .nd-wrap {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 12px);
                    width: min(420px, calc(100vw - 16px));
                    background: var(--color-dropdown-bg);
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                    border: 1px solid var(--color-dropdown-border);
                    border-radius: 20px;
                    overflow: hidden;
                    z-index: 9999;
                    animation: nd-slideIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
                    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.15);
                    padding: 4px 0 0 0;
                }
                .dark .nd-wrap {
                    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7);
                }
                @media (max-width: 767px) {
                    .nd-wrap {
                        position: fixed;
                        top: 56px;
                        right: 8px;
                        left: 8px;
                        width: auto;
                        max-height: 80vh;
                        overflow-y: auto;
                    }
                    .nd-scroll {
                        max-height: 55vh;
                    }
                }
                .nd-inner {
                    width: 100%;
                }

                /* ── Top accent gradient ── */

                /* ── Header ── */
                .nd-header {
                    padding: 12px 16px 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .nd-header__top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .nd-header__left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .nd-header__icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-accent);
                }
                .nd-header__title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--color-light-text);
                    letter-spacing: -0.01em;
                }
                .nd-count-badge {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--color-accent);
                    margin-left: 6px;
                }

                /* ── Tabs ── */
                .nd-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border);
                    margin: 0 16px;
                    gap: 20px;
                    padding-bottom: 0;
                }
                .nd-tab {
                    padding: 10px 0;
                    border: none;
                    background: transparent;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--color-text-muted);
                    border-bottom: 2px solid transparent;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .nd-tab:hover:not(.nd-tab--active) {
                    color: var(--color-light-text);
                }
                .nd-tab--active {
                    color: var(--color-accent);
                    border-bottom: 2px solid var(--color-accent);
                }
                .nd-tab__count {
                    font-size: 9px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: transparent;
                    color: var(--color-accent);
                }
                .nd-tab:not(.nd-tab--active) .nd-tab__count {
                    background: transparent;
                    color: var(--color-text-muted);
                }

                /* ── Scroll area ── */
                .nd-scroll {
                    max-height: 380px;
                    overflow-y: auto;
                    margin-top: 8px;
                }
                .nd-scroll::-webkit-scrollbar { width: 3px; }
                .nd-scroll::-webkit-scrollbar-thumb {
                    background: var(--color-border);
                    border-radius: 3px;
                }

                /* ── Loading ── */
                .nd-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    gap: 8px;
                }
                .nd-spinner {
                    width: 32px; height: 32px;
                    border: 2px solid var(--color-border);
                    border-top-color: var(--color-accent);
                    border-radius: 50%;
                    animation: nd-spin 0.7s linear infinite;
                }
                .nd-loading span {
                    font-size: 12px;
                    color: var(--color-text-muted);
                    font-weight: 500;
                }

                /* ── Empty state ── */
                .nd-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 44px 24px;
                    gap: 10px;
                }
                .nd-empty__icon {
                    width: 52px; height: 52px;
                    background: transparent;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-accent);
                    margin-bottom: 4px;
                }
                .nd-empty h4 {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--color-light-text);
                }
                .nd-empty p {
                    margin: 0;
                    font-size: 11px;
                    color: var(--color-text-muted);
                    line-height: 1.5;
                }

                .nd-item {
                    position: relative;
                    display: flex;
                    gap: 12px;
                    padding: 14px;
                    margin: 8px 12px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: nd-itemFade 0.25s ease both;
                    background: var(--color-hover);
                    border: 1px solid var(--color-border);
                }
                .nd-item:hover { 
                    background: var(--color-secondary);
                    border-color: var(--color-accent);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .dark .nd-item:hover {
                    background: rgba(255, 255, 255, 0.09);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: none;
                }
                .nd-item--unread {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.2);
                }
                .dark .nd-item--unread {
                    background: rgba(56, 189, 248, 0.12);
                    border-color: rgba(56, 189, 248, 0.3);
                }
                .nd-item:hover .nd-x { opacity: 1 !important; }

                /* ── Item icon ── */
                .nd-item__icon {
                    flex-shrink: 0;
                    width: 24px; height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s;
                    background: transparent;
                }
                .nd-item__icon--glow {
                    box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
                }
                /* Category colours — custom types */
                .ndc-job      { color: #3b82f6; }
                .ndc-message  { color: var(--color-accent); }
                .ndc-payment  { color: #10b981; }
                .ndc-system   { color: var(--color-light-text); }
                .ndc-contract { color: #8b5cf6; }
                .ndc-review   { color: #f59e0b; }
                .ndc-proposal { color: var(--color-accent); }
                .ndc-announce { color: var(--color-light-text); }
                .ndc-default  { color: var(--color-light-text); }

                /* ── Item text ── */
                .nd-item__body { flex: 1; min-width: 0; }
                .nd-item__meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 4px;
                }
                .nd-cat-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: var(--color-text-muted) !important;
                }
                .nd-new-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
                    display: inline-block;
                }
                .nd-item__time {
                    margin-left: auto;
                    font-size: 10px;
                    color: var(--color-text-muted);
                    font-weight: 500;
                    white-space: nowrap;
                }
                .nd-item__title {
                    margin: 0 0 2px;
                    font-size: 12.5px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    line-height: 1.4;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding-right: 24px;
                }
                .nd-item__title--unread {
                    font-weight: 700;
                    color: var(--color-light-text);
                }
                .nd-item__msg {
                    margin: 0;
                    font-size: 11px;
                    color: var(--color-text-muted);
                    line-height: 1.45;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    padding-right: 20px;
                }

                /* ── Dismiss X ── */
                .nd-x {
                    position: absolute;
                    top: 12px; right: 12px;
                    width: 22px; height: 22px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.15s;
                }
                .nd-x:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                /* ── Footer ── */
                .nd-footer {
                    padding: 12px 14px;
                    text-align: center;
                    background: transparent;
                }
                .nd-footer__btn {
                    width: 100%;
                    padding: 0;
                    border: none;
                    background: transparent !important;
                    color: var(--color-accent);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .nd-footer__btn:hover {
                    text-decoration: underline;
                }

                /* ── Overflow text ── */
                .nd-overflow {
                    padding: 8px 16px;
                    text-align: center;
                    font-size: 11px;
                    color: var(--color-text-muted);
                }
            `}</style>

            <div className="nd-wrap">
                <div className="nd-inner">
                    {/* ── Header ── */}
                    <div className="nd-header">
                        <div className="nd-header__top">
                            <div className="nd-header__left">
                                <div className="nd-header__icon">
                                    <Bell size={20} />
                                </div>
                                <span className="nd-header__title">
                                    Activity
                                    {unreadCount > 0 && (
                                        <span className="nd-count-badge">{unreadCount}</span>
                                    )}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {unreadCount > 0 && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--color-accent)',
                                        background: 'rgba(56,189,248,0.1)',
                                        border: '1px solid rgba(56,189,248,0.2)',
                                        padding: '2px 7px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <Zap size={10} /> {unreadCount} new
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="nd-tabs">
                            {[
                                { id: 'all', label: 'All', count: items.length },
                                { id: 'unread', label: 'Unread', count: items.filter(isItemUnread).length },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    className={`nd-tab ${activeTab === t.id ? 'nd-tab--active' : ''}`}
                                    onClick={() => setActiveTab(t.id)}
                                >
                                    {t.label}
                                    {t.count > 0 && (
                                        <span className="nd-tab__count">{t.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── List ── */}
                    <div className="nd-scroll">
                        {loading ? (
                            <div className="nd-loading">
                                <InfinityLoader size="sm" fullScreen={false} text="" />
                                <span>Loading activity…</span>
                            </div>
                        ) : displayed.length === 0 ? (
                            <div className="nd-empty">
                                <div className="nd-empty__icon">
                                    <CheckCircle size={26} />
                                </div>
                                <h4>{activeTab === 'unread' ? 'No unread notifications' : "You're all caught up!"}</h4>
                                <p>New alerts will appear here</p>
                            </div>
                        ) : (
                            <div>
                                {displayed.slice(0, showAll ? displayed.length : 8).map((item, idx) => {
                                    const cat = getCat(item);
                                    const Icon = cat.icon;
                                    const unread = isItemUnread(item);

                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className={`nd-item ${unread ? 'nd-item--unread' : ''}`}
                                            style={{ animationDelay: `${idx * 25}ms` }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className={`nd-item__icon ${cat.cls} ${unread ? 'nd-item__icon--glow' : ''}`}>
                                                {(item.metadata?.meetingId || item.data?.meetingId || item.title?.toLowerCase().includes('meeting'))
                                                    ? <Video size={15} />
                                                    : <Icon size={15} />
                                                }
                                            </div>

                                            <div className="nd-item__body">
                                                <div className="nd-item__meta">
                                                    <span className="nd-cat-label">{cat.label}</span>
                                                    {unread && <span className="nd-new-dot" />}
                                                    <span className="nd-item__time">{getTimeAgo(item.created_at)}</span>
                                                </div>
                                                <p className={`nd-item__title ${unread ? 'nd-item__title--unread' : ''}`}>
                                                    {item.title}
                                                </p>
                                                <p className="nd-item__msg">
                                                    {item.message || item.content}
                                                </p>
                                            </div>

                                            <button className="nd-x" title="Dismiss" onClick={e => handleDismiss(e, item)}>
                                                <X size={13} />
                                            </button>
                                        </div>
                                    );
                                })}
                                {!showAll && displayed.length > 8 && (
                                    <div className="nd-overflow">
                                        +{displayed.length - 8} more — view all below
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {displayed.length > 8 && (
                        <div className="nd-footer">
                            <button
                                className="nd-footer__btn"
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? 'Show Less' : 'View All Notifications \u2192'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
