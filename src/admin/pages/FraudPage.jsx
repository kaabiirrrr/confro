import { useState, useEffect, useCallback } from 'react';
import {
    UserSearch, AlertTriangle, ShieldCheck, ShieldAlert, Clock, Mail,
    Users, TrendingUp, Link2, Zap, Filter, ChevronDown, ChevronUp,
    Eye, Flag, Lock, Ban, RefreshCcw, X, Activity, FileWarning,
    ShieldX, AlertCircle, CheckCircle2, Timer, MapPin, Loader2
} from 'lucide-react';
import {
    fetchSuspiciousUsers, fetchUserFraudTimeline,
    markUserAsFraud, freezeUserAccount, clearFraudFlag, toggleUserStatus
} from '../../services/adminService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';

// ─── Risk Colour Helpers ───────────────────────────────────────────────────
const riskConfig = {
    HIGH: { border: 'border-rose-500/30', glow: 'shadow-rose-500/10', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-500', label: '🔴 High Risk' },
    MEDIUM: { border: 'border-amber-500/30', glow: 'shadow-amber-500/10', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-500', label: '🟡 Medium Risk' },
    LOW: { border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500', label: '🟢 Low Risk' },
};

const timelineIconMap = {
    bypass: { icon: ShieldX, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    violation: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    report: { icon: Flag, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    contract: { icon: FileWarning, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    activity: { icon: Activity, color: 'text-white/40', bg: 'bg-white/5' },
};

function timeAgo(ts) {
    if (!ts) return 'Unknown';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

// ─── Summary Card ──────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-transparent border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-white/10 transition-all">
            <Icon size={20} className={`shrink-0 ${color}`} />
            <div>
                <div className="text-xl font-black text-white">{value ?? '—'}</div>
                <div className="text-[10px] text-white/40 font-medium leading-tight">{label}</div>
                {sub && <div className="text-[9px] text-white/25 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

// ─── Activity Timeline Modal ────────────────────────────────────────────────
function TimelineModal({ user, onClose }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserFraudTimeline(user.id)
            .then(res => setEvents(res.data || []))
            .catch(() => toast.error('Failed to load timeline'))
            .finally(() => setLoading(false));
    }, [user.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-20" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div
                className="relative bg-secondary rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-base font-bold text-white">{user.name} — activity timeline</h3>
                        <p className="text-[12px] text-white/30">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-accent transition-all">
                        <X size={18} />
                    </button>
                </div>
                {/* Body */}
                <div className="overflow-y-auto p-4 space-y-4 flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <InfinityLoader fullScreen={false} size="sm" text="Loading timeline..." />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 text-white/30 text-sm">No events found</div>
                    ) : events.map((evt, i) => {
                        const cfg = timelineIconMap[evt.type] || timelineIconMap.activity;
                        const Icon = cfg.icon;
                        return (
                            <div key={i} className="flex gap-3.5 items-start">
                                <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon size={15} className={cfg.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[13px] font-semibold text-white/80 capitalize">{evt.action}</span>
                                        <span className="text-[11px] text-white/25 shrink-0">{timeAgo(evt.timestamp)}</span>
                                    </div>
                                    <p className="text-[12px] text-white/40 mt-1 truncate">{evt.detail}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Fraud User Card ────────────────────────────────────────────────────────
function FraudUserCard({ user, onAction, onViewTimeline }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = riskConfig[user.riskLevel] || riskConfig.LOW;

    const scoreColor =
        user.riskScore >= 70 ? 'text-rose-400' :
            user.riskScore >= 35 ? 'text-amber-400' : 'text-emerald-400';

    const warningColor =
        user.riskLevel === 'HIGH' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
            user.riskLevel === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    return (
        <div className={`border ${cfg.border} rounded-2xl transition-all duration-300 group hover:shadow-lg bg-transparent overflow-hidden`}>
            {/* ── Main clickable area ── */}
            <div
                className="p-4 sm:p-5 cursor-pointer select-none space-y-3"
                onClick={() => setExpanded(v => !v)}
            >
                {/* Row 1: Avatar + info + risk score */}
                <div className="flex items-start justify-between gap-3">
                    {/* Left: avatar + name block */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                />
                            ) : (
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${cfg.border} ${scoreColor} bg-white/5`}>
                                    {(user.name || 'A')[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name + warning + email - justify between on mobile */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-white/90 leading-none">{user.name}</h3>
                                <div className="flex items-center gap-2">
                                    {user.warning_count > 0 && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${warningColor}`}>
                                            <AlertTriangle size={10} />
                                            {user.warning_count} warning{user.warning_count > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {user.reportCount > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border text-orange-400 bg-orange-500/10 border-orange-500/20">
                                            <Flag size={10} />
                                            {user.reportCount} {user.reportCount > 1 ? 'Reports' : 'Report'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <p className="text-white/30 text-[12px] flex items-center gap-1.5 mt-1 font-medium">
                                <Mail size={11} className="opacity-50 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </p>

                            {/* Location + Last activity - justify between on mobile */}
                            <div className="flex items-center justify-between sm:justify-start gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-[13px] text-white/40">
                                    <MapPin size={12} />
                                    {user.location || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[13px] text-white/40">
                                    <Timer size={12} />
                                    {timeAgo(user.lastActivity)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: risk score + badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-right">
                            <div className={`text-xl font-black ${scoreColor} leading-none`}>
                                {user.riskScore}<span className="text-[12px] text-white/30 font-normal">/100</span>
                            </div>
                            <div className="text-[10px] text-white/25">risk score</div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                        {/* Expand hint on desktop */}
                        <div className="text-white/20 mt-1">
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </div>
                </div>

                {/* Row 2: Fraud reason tags - align right on mobile */}
                {user.flags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:justify-start justify-end">
                        {user.flags.slice(0, 5).map((flag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/[0.03] rounded-md text-[11px] text-white/40 border border-white/8 font-semibold capitalize">
                                {flag}
                            </span>
                        ))}
                        {user.flags.length > 5 && (
                            <span className="px-2 py-0.5 bg-white/[0.03] rounded-md text-[11px] text-white/30 border border-white/8">
                                +{user.flags.length - 5} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Action bar: Mobile-optimized row groups ── */}
            <div
                className="border-t border-white/5 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between sm:justify-start gap-1">
                    <button
                        onClick={() => onViewTimeline(user)}
                        className="px-2.5 py-1.5 text-[12px] font-bold text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                    >
                        <Eye size={13} /> View
                    </button>
                    <button
                        onClick={() => onAction(user.id, 'FREEZE')}
                        className="px-2.5 py-1.5 text-[12px] font-bold text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                    >
                        <Lock size={13} /> Freeze
                    </button>
                    <button
                        onClick={() => onAction(user.id, 'MARK_FRAUD')}
                        className="px-2.5 py-1.5 text-[12px] font-bold text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                    >
                        <Flag size={13} /> Flag
                    </button>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onAction(user.id, 'SAFE')}
                        className="px-2.5 py-1.5 text-[12px] font-bold text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                    >
                        <CheckCircle2 size={13} /> Mark safe
                    </button>
                    <button
                        onClick={() => onAction(user.id, 'SUSPEND')}
                        className="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all text-[12px] font-black flex items-center gap-1.5 border border-rose-500/20 hover:border-rose-600 active:scale-95 whitespace-nowrap"
                    >
                        <Ban size={13} /> Suspend
                    </button>
                </div>
            </div>

            {/* ── Expanded stats ── */}
            {expanded && (
                <div className="border-t border-white/5 px-4 sm:px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCell label="Warnings" value={user.warning_count || 0} icon={AlertTriangle} color="text-amber-400" />
                    <StatCell label="Cancellations" value={user.cancelledContracts || 0} icon={X} color="text-rose-400" />
                    <StatCell label="Reports" value={user.reportCount || 0} icon={Flag} color="text-orange-400" />
                    <StatCell label="Bypass attempts" value={user.bypassAttempts || 0} icon={ShieldX} color="text-purple-400" />
                    <StatCell label="Account health" value={`${user.account_health_score ?? 100}%`} icon={Activity} color="text-blue-400" />
                    <StatCell label="Reliability" value={`${user.reliability_score ?? 100}%`} icon={TrendingUp} color="text-teal-400" />
                    <StatCell label="Violations" value={user.violationCount || 0} icon={FileWarning} color="text-rose-400" />
                    <StatCell label="Status" value={user.is_banned ? 'Banned' : user.is_restricted ? 'Frozen' : user.fraud_flag ? 'Fraud' : 'Active'} icon={ShieldAlert} color={user.is_banned || user.fraud_flag ? 'text-rose-400' : 'text-emerald-400'} />
                </div>
            )}
        </div>
    );
}


function StatCell({ label, value, icon: Icon, color }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <Icon size={16} className={`${color} shrink-0`} />
            <div>
                <div className="text-[13px] font-bold text-white/80">{value}</div>
                <div className="text-[11px] text-white/30 font-medium">{label}</div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const FraudPage = () => {
    const [suspiciousUsers, setSuspiciousUsers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');
    const [timelineUser, setTimelineUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const loadSuspicious = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchSuspiciousUsers();
            setSuspiciousUsers(response.data || []);
            setSummary(response.summary || null);
        } catch {
            toast.error('Failed to load fraud data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSuspicious(); }, [loadSuspicious]);

    const handleAction = async (userId, action) => {
        setActionLoading(userId + action);
        try {
            if (action === 'SUSPEND') {
                await toggleUserStatus(userId, true);
                toast.success('User suspended');
            } else if (action === 'FREEZE') {
                await freezeUserAccount(userId);
                toast.success('Account frozen');
            } else if (action === 'MARK_FRAUD') {
                await markUserAsFraud(userId);
                toast.success('User marked as fraud');
            } else if (action === 'SAFE') {
                await clearFraudFlag(userId);
                toast.success('User marked as safe');
            }
            await loadSuspicious();
        } catch {
            toast.error('Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = suspiciousUsers.filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchSearch = name.includes(search) || email.includes(search);
        const matchRisk = riskFilter === 'ALL' || u.riskLevel === riskFilter;
        return matchSearch && matchRisk;
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-fraud-80.png" alt="Fraud" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Fraud detection
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Intelligent risk scoring · {summary?.totalFlagged ?? 0} flagged users
                    </p>
                </div>

                {/* Search + filters */}
                <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-2xl flex-wrap">
                    <div className="relative flex-1 min-w-[160px]">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50 transition-all"
                        />
                    </div>

                    {/* Risk filter */}
                    <div className="relative">
                        <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        <select
                            value={riskFilter}
                            onChange={e => setRiskFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-white/70 text-[11px] focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All risks</option>
                            <option value="HIGH">High risk</option>
                            <option value="MEDIUM">Medium risk</option>
                            <option value="LOW">Low risk</option>
                        </select>
                    </div>

                    <button
                        onClick={loadSuspicious}
                        disabled={loading}
                        title="Refresh"
                        className="p-2 text-white/40 hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <SummaryCard
                        icon={Users} label="Total flagged users" value={summary.totalFlagged}
                        color="text-white/50"
                    />
                    <SummaryCard
                        icon={ShieldAlert} label="High risk users" value={summary.highRisk}
                        color="text-rose-400"
                        sub={`${summary.mediumRisk} medium risk`}
                    />
                    <SummaryCard
                        icon={Link2} label="Linked clusters" value={summary.linkedClusters}
                        color="text-purple-400"
                        sub="Same device/IP"
                    />
                    <SummaryCard
                        icon={Zap} label="Fraud attempts 24h" value={summary.fraudAttempts24h}
                        color="text-amber-400"
                        sub="Chat bypass triggers"
                    />
                </div>
            )}

            {/* User cards list */}
            <div className="space-y-3 relative">
                {loading ? (
                    <div className="py-20 text-center text-white/40 flex flex-col items-center gap-3">
                        <Loader2 size={28} className="animate-spin text-rose-500/50" />
                        <span className="text-sm">Analyzing platform activity...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {searchTerm || riskFilter !== 'ALL' ? 'No matches found' : 'Platform looks clean'}
                        </h3>
                        <p className="text-white/40 max-w-sm mx-auto text-sm">
                            {searchTerm || riskFilter !== 'ALL'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No suspicious activity detected at this time.'}
                        </p>
                    </div>
                ) : filtered.map(user => (
                    <div key={user.id} className={actionLoading?.startsWith(user.id) ? 'opacity-60 pointer-events-none' : ''}>
                        <FraudUserCard
                            user={user}
                            onAction={handleAction}
                            onViewTimeline={setTimelineUser}
                        />
                    </div>
                ))}
            </div>

            {/* Timeline modal */}
            {timelineUser && (
                <TimelineModal
                    user={timelineUser}
                    onClose={() => setTimelineUser(null)}
                />
            )}
        </div>
    );
};

export default FraudPage;
