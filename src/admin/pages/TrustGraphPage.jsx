import { useState, useEffect } from 'react';
import {
    Users, ShieldAlert, Link as LinkIcon, RefreshCw,
    AlertTriangle, UserX, ExternalLink, Zap, MapPin,
    Smartphone, X, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFraudClusters, recalculateTrustScore, flagFraudUser } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';

const TrustGraphPage = () => {
    const [clusters, setClusters]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [filterType, setFilterType]     = useState('');

    const loadClusters = async () => {
        setLoading(true);
        try {
            const response = await fetchFraudClusters();
            if (response.success) setClusters(response.data || []);
        } catch {
            toast.error('Failed to load trust clusters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadClusters(); }, []);

    const handleRecalculate = async (userId) => {
        setActionLoading(userId);
        try {
            const response = await recalculateTrustScore(userId);
            if (response.success) { toast.success('Reputation recalculated'); loadClusters(); }
        } catch { toast.error('Recalculation failed'); }
        finally { setActionLoading(null); }
    };

    const handleFlagFraud = async (userId) => {
        if (!confirm('Flag this user as fraud? This will significantly penalize their trust score.')) return;
        setActionLoading(`flag-${userId}`);
        try {
            const response = await flagFraudUser(userId, 'Detected in TrustGraph cluster');
            if (response.success) { toast.success('User flagged as fraud'); loadClusters(); }
        } catch { toast.error('Flagging failed'); }
        finally { setActionLoading(null); }
    };

    const getLinkTypeIcon = (type) => {
        switch (type) {
            case 'DEVICE': return <Smartphone size={12} />;
            case 'PAYOUT': return <Zap size={12} />;
            case 'IP':     return <MapPin size={12} />;
            default:       return <LinkIcon size={12} />;
        }
    };

    const getLinkBadge = (type) => {
        const map = {
            DEVICE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
            PAYOUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            IP:     'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
        return map[type] || 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10';
    };

    const totalIdentities = clusters.reduce((s, c) => s + (c.userIds?.length || 0), 0);
    const criticalCount   = clusters.filter(c => c.type === 'DEVICE' || c.type === 'PAYOUT').length;

    const filtered = clusters.filter(c => !filterType || c.type === filterType);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-trust-64.png" alt="TrustGraph" className="w-7 h-7 object-contain" />
                            TrustGraph Intelligence
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Link-based Sybil detection and Reputation Shield monitoring</p>
                    </div>
                    <button
                        onClick={loadClusters}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Link-based Sybil detection and Reputation Shield monitoring</p>
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={loadClusters}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Identified Clusters', value: clusters.length,  icon: '/Icons/icons8-trust-64.png' },
                    { label: 'Linked Identities',   value: totalIdentities,  icon: '/Icons/icons8-account-male-96.png' },
                    { label: 'Critical Links',       value: criticalCount,    icon: '/Icons/icons8-alert-96.png' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={icon} alt={label} className="w-4 h-4 object-contain opacity-50" />
                            <p className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                        </div>
                        <p className="text-slate-800 dark:text-white font-black text-2xl">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                {/* Cluster list */}
                <div className="space-y-4">
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 w-full">
                        {[
                            { id: '',       label: 'All' },
                            { id: 'DEVICE', label: 'Device' },
                            { id: 'PAYOUT', label: 'Payout' },
                            { id: 'IP',     label: 'IP' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setFilterType(tab.id); setSelectedCluster(null); }}
                                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative text-center ${
                                    filterType === tab.id
                                        ? 'text-accent'
                                        : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                                {filterType === tab.id && (
                                    <motion.div layoutId="trustTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-16 flex justify-center">
                            <InfinityLoader fullScreen={false} text="Analyzing trust graph…" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                            <img src="/Icons/icons8-trust-64.png" alt="No clusters" className="w-10 h-10 object-contain opacity-10 mx-auto mb-3" />
                            <p className="text-slate-400 dark:text-white/30 text-sm">No suspicious clusters detected</p>
                            <p className="text-slate-400 dark:text-white/25 text-xs mt-1">Behavioral links are automatically monitored</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((cluster, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedCluster(selectedCluster === cluster ? null : cluster)}
                                    className={`border rounded-xl p-5 cursor-pointer transition-all ${
                                        selectedCluster === cluster
                                            ? 'border-accent/30 bg-accent/[0.03]'
                                            : 'border-slate-200 dark:border-white/10 hover:border-accent/20'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase flex items-center gap-1 ${getLinkBadge(cluster.type)}`}>
                                                    {getLinkTypeIcon(cluster.type)} {cluster.type}
                                                </span>
                                                <span className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider">
                                                    Cluster #{idx + 1}
                                                </span>
                                            </div>

                                            {/* Avatar stack */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {(cluster.users || []).slice(0, 5).map((u, i) => (
                                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-accent/10">
                                                            {u.avatar_url
                                                                ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                                                : <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-accent">{(u.name || 'U').charAt(0)}</span>
                                                            }
                                                        </div>
                                                    ))}
                                                    {(cluster.users?.length || 0) > 5 && (
                                                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-white/40">
                                                            +{cluster.users.length - 5}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400 dark:text-white/30 text-[10px]">
                                                    <Users size={10} />
                                                    <span>{cluster.userIds?.length || 0} linked identities</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 dark:text-white/20 text-xs shrink-0">
                                            {selectedCluster === cluster ? '▲' : '▼'}
                                        </div>
                                    </div>

                                    {/* Expanded user list */}
                                    <AnimatePresence>
                                        {selectedCluster === cluster && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                                                    {(cluster.users || []).map(user => (
                                                        <div key={user.user_id} className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] overflow-hidden">
                                                            {/* User header row */}
                                                            <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-white/5">
                                                                <div className="relative shrink-0">
                                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/10">
                                                                        {user.avatar_url
                                                                            ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                                            : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-accent">{(user.name || 'U').charAt(0)}</span>
                                                                        }
                                                                    </div>
                                                                    {user.fraud_flag && (
                                                                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-slate-800 dark:text-white font-bold text-sm">{user.name || 'Unknown'}</p>
                                                                        {user.fraud_flag && (
                                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Flagged</span>
                                                                        )}
                                                                        {user.is_banned && (
                                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 border border-slate-300 dark:border-white/10 uppercase">Banned</span>
                                                                        )}
                                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                                                            user.role === 'freelancer'
                                                                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                                                                : user.role === 'client'
                                                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10'
                                                                        }`}>{user.role || 'user'}</span>
                                                                    </div>
                                                                    <p className="text-slate-400 dark:text-white/30 text-[10px] truncate">{user.email}</p>
                                                                    {user.title && <p className="text-slate-500 dark:text-white/40 text-[10px] truncate italic">{user.title}</p>}
                                                                </div>
                                                                {/* Actions */}
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); handleRecalculate(user.user_id); }}
                                                                        disabled={actionLoading === user.user_id}
                                                                        className="p-1.5 text-slate-400 dark:text-white/30 hover:text-accent transition-colors"
                                                                        title="Recalculate Score"
                                                                    >
                                                                        <RefreshCw size={13} className={actionLoading === user.user_id ? 'animate-spin' : ''} />
                                                                    </button>
                                                                    {!user.fraud_flag && (
                                                                        <button
                                                                            onClick={e => { e.stopPropagation(); handleFlagFraud(user.user_id); }}
                                                                            disabled={actionLoading === `flag-${user.user_id}`}
                                                                            className="p-1.5 text-slate-400 dark:text-white/30 hover:text-red-500 transition-colors"
                                                                            title="Flag as Fraud"
                                                                        >
                                                                            <UserX size={13} />
                                                                        </button>
                                                                    )}
                                                                    <a
                                                                        href={`/admin/users?search=${user.email}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="p-1.5 text-slate-400 dark:text-white/30 hover:text-accent transition-colors"
                                                                        title="View Profile"
                                                                    >
                                                                        <ExternalLink size={13} />
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {/* Stats grid */}
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-white/5">
                                                                {/* Trust Score */}
                                                                <div className="p-3 text-center">
                                                                    <p className="text-slate-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">Trust Score</p>
                                                                    <p className={`text-base font-black ${
                                                                        (user.trust_score ?? 0) > 70 ? 'text-emerald-600 dark:text-emerald-400' :
                                                                        (user.trust_score ?? 0) > 40 ? 'text-amber-500' : 'text-red-500'
                                                                    }`}>{user.trust_score ?? '—'}</p>
                                                                    {/* Score bar */}
                                                                    <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                (user.trust_score ?? 0) > 70 ? 'bg-emerald-500' :
                                                                                (user.trust_score ?? 0) > 40 ? 'bg-amber-400' : 'bg-red-500'
                                                                            }`}
                                                                            style={{ width: `${Math.min(user.trust_score ?? 0, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Role / Country */}
                                                                <div className="p-3 text-center">
                                                                    <p className="text-slate-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">Country</p>
                                                                    <p className="text-slate-800 dark:text-white font-bold text-sm">{user.country || '—'}</p>
                                                                </div>

                                                                {/* Earnings / Spent */}
                                                                <div className="p-3 text-center">
                                                                    <p className="text-slate-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">
                                                                        {user.role === 'freelancer' ? 'Earned' : 'Spent'}
                                                                    </p>
                                                                    <p className="text-slate-800 dark:text-white font-bold text-sm">
                                                                        {user.role === 'freelancer'
                                                                            ? user.total_earnings != null ? `$${Number(user.total_earnings).toLocaleString()}` : '—'
                                                                            : user.total_spent != null ? `$${Number(user.total_spent).toLocaleString()}` : '—'
                                                                        }
                                                                    </p>
                                                                </div>

                                                                {/* Joined */}
                                                                <div className="p-3 text-center">
                                                                    <p className="text-slate-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">Joined</p>
                                                                    <p className="text-slate-800 dark:text-white font-bold text-sm">
                                                                        {user.created_at
                                                                            ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                                                                            : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="border border-accent/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-alert-96.png" alt="Info" className="w-5 h-5 object-contain opacity-70 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">How It Works</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                TrustGraph links users sharing the same device, IP, or payout details. Clusters with 2+ linked identities are flagged for review.
                            </p>
                        </div>
                    </div>

                    <div className="border border-rose-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-light-100.png" alt="Tip" className="w-5 h-5 object-contain opacity-60 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-rose-500 font-bold text-[10px] uppercase tracking-widest mb-1">Link Priority</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                <span className="text-rose-500 font-bold">DEVICE</span> links are highest risk, followed by <span className="text-amber-500 font-bold">PAYOUT</span>, then <span className="text-blue-500 font-bold">IP</span>. Shared IPs may be false positives (e.g. office networks).
                            </p>
                        </div>
                    </div>

                    {/* Link type legend */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <img src="/Icons/icons8-growth-100.png" alt="Legend" className="w-4 h-4 object-contain opacity-60" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Signal Types</h3>
                        </div>
                        {[
                            { type: 'DEVICE', icon: <Smartphone size={11} />, desc: 'Same device fingerprint', color: 'text-rose-500' },
                            { type: 'PAYOUT', icon: <Zap size={11} />,        desc: 'Same payout account',    color: 'text-amber-500' },
                            { type: 'IP',     icon: <MapPin size={11} />,      desc: 'Same IP address',        color: 'text-blue-500' },
                        ].map(({ type, icon, desc, color }) => (
                            <div key={type} className="flex items-center gap-3">
                                <span className={`${color} shrink-0`}>{icon}</span>
                                <div>
                                    <p className={`text-[10px] font-bold ${color}`}>{type}</p>
                                    <p className="text-slate-400 dark:text-white/30 text-[9px]">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cluster summary */}
                    {clusters.length > 0 && (
                        <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={14} className="text-slate-400 dark:text-white/40" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Cluster Breakdown</h3>
                            </div>
                            {['DEVICE', 'PAYOUT', 'IP'].map(type => {
                                const count = clusters.filter(c => c.type === type).length;
                                if (!count) return null;
                                return (
                                    <div key={type} className="flex items-center justify-between">
                                        <span className={`text-xs font-bold ${getLinkBadge(type).split(' ')[1]}`}>{type}</span>
                                        <span className="text-slate-800 dark:text-white font-black text-sm">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustGraphPage;
