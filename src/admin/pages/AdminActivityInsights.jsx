import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, RefreshCw } from 'lucide-react';
import { fetchAdminActivityStats, fetchAdminLogs } from '../../services/adminService';
import ChartCard from '../components/dashboard/ChartCard';
import StatCard from '../components/dashboard/StatCard';
import InfinityLoader from '../../components/common/InfinityLoader';

const AdminActivityInsights = () => {
    const [stats, setStats]         = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [result, logsResult] = await Promise.all([
                fetchAdminActivityStats(),
                fetchAdminLogs({})
            ]);
            if (result.success) setStats(result.data);
            else setError('Failed to load activity statistics.');
            if (logsResult?.data && Array.isArray(logsResult.data)) {
                setRecentLogs(logsResult.data.slice(0, 5));
            }
        } catch {
            setError('Failed to connect to the analytics engine.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const actionColor = (type = '') => {
        if (type.includes('DELETE') || type.includes('REMOVE')) return 'text-red-500';
        if (type.includes('UPDATE') || type.includes('CHANGE')) return 'text-amber-500';
        if (type.includes('CREATE') || type.includes('ADD'))    return 'text-emerald-600 dark:text-emerald-400';
        return 'text-accent';
    };

    const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
    const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-leader-100.png" alt="Insights" className="w-7 h-7 object-contain" />
                            Admin Insights
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Performance tracking and feature engagement analysis</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Performance tracking and feature engagement analysis</p>

                <div className="hidden sm:flex items-center gap-3">
                    {/* Status pill */}
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 dark:text-white">Active Monitoring</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-xl p-5 flex items-center gap-3">
                    <Shield size={18} className="text-red-500 shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <InfinityLoader fullScreen={false} text="Aggregating Network Insights..." />
            )}

            {!loading && !error && stats && (
                <>
                    {/* Stat cards */}
                    <div>
                        <p className="text-slate-400 dark:text-white/25 text-[10px] font-bold uppercase tracking-widest mb-3">Operational Velocity</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard
                                title="Total Admin Actions"
                                value={stats.actionDistribution.reduce((a, c) => a + c.value, 0)}
                                icon="/Icons/icons8-reports-100.png"
                                trendType="none"
                            />
                            <StatCard
                                title="Top Performing Admin"
                                value={stats.actionsPerAdmin[0]?.name || 'N/A'}
                                icon="/Icons/icons8-leader-100.png"
                                trendType="none"
                            />
                            <StatCard
                                title="Most Investigated"
                                value={stats.featureEngagement[0]?.name || 'N/A'}
                                subValue={stats.attribution?.topFeatureAdmin ? `Top: ${stats.attribution.topFeatureAdmin}` : null}
                                icon="/Icons/icons8-search-64.png"
                                trendType="none"
                            />
                            <StatCard
                                title="Primary Workload"
                                value={stats.actionDistribution[0]?.name?.replace(/_/g, ' ') || 'N/A'}
                                subValue={stats.attribution?.primaryWorkloadAdmin ? `Top: ${stats.attribution.primaryWorkloadAdmin}` : null}
                                icon="/Icons/icons8-system-100.png"
                                trendType="none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                        <div className="space-y-6">
                            {/* Recent Actions */}
                            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Administrative Actions</h3>
                                        <p className="text-slate-400 dark:text-white/30 text-[10px] mt-0.5">5 most recent actions taken by administrators</p>
                                    </div>
                                    <Link
                                        to="/admin/logs"
                                        className="text-accent text-xs font-bold hover:underline whitespace-nowrap"
                                    >
                                        View All →
                                    </Link>
                                </div>

                                {recentLogs.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 dark:text-white/30 text-sm">No recent activity found</div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {recentLogs.map(log => (
                                            <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                                    {log.admin?.photo_url
                                                        ? <img src={log.admin.photo_url} alt="" className="w-full h-full object-cover" />
                                                        : <span className="text-xs font-bold text-accent">{(log.admin?.name || log.admin_email || 'A').charAt(0).toUpperCase()}</span>
                                                    }
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <p className="text-slate-800 dark:text-white font-bold text-sm">{log.admin?.name || 'Admin'}</p>
                                                        <span className="text-slate-400 dark:text-white/25 text-[10px]">{formatDate(log.timestamp)} {formatTime(log.timestamp)}</span>
                                                    </div>
                                                    <p className="text-slate-400 dark:text-white/30 text-[10px] truncate">{log.admin?.email || log.admin_email}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${actionColor(log.action_type)}`}>
                                                            {log.action_type?.replace(/_/g, ' ') || 'ACTION'}
                                                        </span>
                                                        <span className="text-slate-300 dark:text-white/15 text-[9px]">·</span>
                                                        <span className="text-slate-500 dark:text-white/40 text-[9px] font-bold uppercase tracking-wider">{log.target_type || 'System'}</span>
                                                    </div>
                                                    {log.description && (
                                                        <p className="text-slate-500 dark:text-white/40 text-[10px] mt-1 line-clamp-1">{log.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ChartCard
                                    title="Workload Distribution"
                                    type="bar"
                                    data={stats.actionDistribution}
                                    dataKey="value"
                                    categoryKey="name"
                                    color="#F59E0B"
                                />
                                <ChartCard
                                    title="Actions by Administrator"
                                    type="bar"
                                    data={stats.actionsPerAdmin}
                                    dataKey="value"
                                    categoryKey="name"
                                    color="#10B981"
                                />
                                <ChartCard
                                    title="Feature Engagement"
                                    type="pie"
                                    data={stats.featureEngagement}
                                    dataKey="value"
                                    color="#3B82F6"
                                />
                                <ChartCard
                                    title="Activity Timeline (7 Days)"
                                    type="area"
                                    color="#F97316"
                                    data={stats.activityTimeline}
                                    dataKey={[{ key: 'value', name: 'Actions', color: '#F97316' }]}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Status */}
                            <div className="border border-accent/20 rounded-xl p-5 flex gap-3 items-start">
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse mt-1 shrink-0" />
                                <div>
                                    <h4 className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">Active Monitoring</h4>
                                    <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                        All administrative actions are being logged and analyzed in real time.
                                    </p>
                                </div>
                            </div>

                            {/* Top admins */}
                            {stats.actionsPerAdmin.length > 0 && (
                                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <img src="/Icons/icons8-leader-100.png" alt="Top" className="w-4 h-4 object-contain opacity-60" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Top Admins</h3>
                                    </div>
                                    {stats.actionsPerAdmin.slice(0, 5).map((admin, i) => (
                                        <div key={i} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] font-bold text-accent">{(admin.name || 'A').charAt(0).toUpperCase()}</span>
                                                </div>
                                                <span className="text-slate-700 dark:text-white/70 text-xs truncate">{admin.name}</span>
                                            </div>
                                            <span className="text-slate-800 dark:text-white font-black text-sm shrink-0">{admin.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Feature engagement */}
                            {stats.featureEngagement.length > 0 && (
                                <div className="border border-amber-500/20 rounded-xl p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <img src="/Icons/icons8-search-64.png" alt="Features" className="w-4 h-4 object-contain opacity-60" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Feature Usage</h3>
                                    </div>
                                    {stats.featureEngagement.slice(0, 5).map((f, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600 dark:text-white/60 text-[10px] truncate">{f.name}</span>
                                                <span className="text-slate-800 dark:text-white text-[10px] font-bold shrink-0 ml-2">{f.value}</span>
                                            </div>
                                            <div className="h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-amber-400"
                                                    style={{ width: `${Math.min((f.value / (stats.featureEngagement[0]?.value || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminActivityInsights;
