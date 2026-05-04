import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Shield, Users, Target, Clock, Zap,
    ArrowRight, MousePointer2, Layout, BarChart, PieChart
} from 'lucide-react';
import { fetchAdminActivityStats, fetchAdminLogs } from '../../services/adminService';
import ChartCard from '../components/dashboard/ChartCard';
import StatCard from '../components/dashboard/StatCard';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import InfinityLoader from '../../components/common/InfinityLoader';

const AdminActivityInsights = () => {
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [result, logsResult] = await Promise.all([
                    fetchAdminActivityStats(),
                    fetchAdminLogs({})
                ]);

                if (result.success) {
                    setStats(result.data);
                } else {
                    setError('Failed to load activity statistics.');
                }

                if (logsResult && logsResult.data && Array.isArray(logsResult.data)) {
                    setRecentLogs(logsResult.data.slice(0, 5));
                }
            } catch (err) {
                console.error("Failed to fetch admin activity stats", err);
                setError('Failed to connect to the analytics engine.');
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <InfinityLoader fullScreen={false} size="lg" text="Aggregating Network Insights..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-rose-100 bg-rose-500/10 border border-rose-500/20 rounded-[32px] m-6 text-center">
                <Shield className="mx-auto mb-4 text-rose-500" size={32} />
                <h3 className="text-lg font-bold mb-2">Analytics Error</h3>
                <p className="text-sm opacity-60">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <Activity className="text-accent" size={24} />
                        Admin Insights
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Performance tracking and feature engagement analysis
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-3 sm:px-6 sm:py-4 rounded-[20px] sm:rounded-[24px] w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-start md:items-end">
                        <span className="text-[9px] sm:text-[10px] text-slate-900/30 dark:text-white/30 font-black uppercase tracking-widest leading-none mb-1">Status</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Monitoring</span>
                    </div>
                    <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
                </div>
            </div>

            {/* Top Stats Overview */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-slate-900/20 dark:text-white/20 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] pl-1">Operational Velocity</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Total Admin Actions"
                        value={stats.actionDistribution.reduce((acc, curr) => acc + curr.value, 0)}
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
            </section>

            {/* Recent Detailed Activity Table */}
            <div className="bg-transparent border border-white/10 rounded-[24px] sm:rounded-[40px] p-5 sm:p-10 backdrop-blur-xl mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                            Recent Administrative Actions
                        </h3>
                        <p className="text-slate-900/40 dark:text-white/40 text-[11px] sm:text-xs mt-1 italic">Detailed log of the 5 most recent actions taken by administrators</p>
                    </div>
                    <Link to="/admin/logs" className="w-full sm:w-auto text-center px-6 py-2.5 rounded-full border border-white/10 text-white/60 text-[10px] sm:text-[11px] font-black uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all">
                        View All Logs
                    </Link>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-transparent text-white/60 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/10">
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Administrator</th>
                                <th className="px-6 py-4">Action Taken</th>
                                <th className="px-6 py-4">Feature / Target</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentLogs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40 text-sm font-bold">No recent activity found</td></tr>
                            ) : recentLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-slate-950 dark:text-white text-xs font-black">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                            </span>
                                            <span className="text-slate-900/40 dark:text-white/40 text-[10px] font-bold mt-0.5">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shadow-black/20 shrink-0">
                                                {log.admin?.photo_url ? (
                                                    <img src={log.admin.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm text-accent font-black">
                                                        {(log.admin?.name || log.admin_email || 'S').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-950 dark:text-white text-[13px] font-bold leading-tight">{log.admin?.name || 'Admin'}</span>
                                                <span className="text-slate-900/40 dark:text-white/40 text-[11px] font-medium mt-0.5">{log.admin?.email || log.admin_email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${log.action_type?.includes('DELETE') || log.action_type?.includes('REMOVE') ? 'text-rose-500' :
                                                log.action_type?.includes('UPDATE') || log.action_type?.includes('CHANGE') ? 'text-amber-500' :
                                                    log.action_type?.includes('CREATE') || log.action_type?.includes('ADD') ? 'text-emerald-500' :
                                                        'text-accent'
                                            }`}>
                                            {log.action_type?.replace(/_/g, ' ') || 'ACTION'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900/80 dark:text-white/80 text-[11px] font-black uppercase tracking-widest leading-tight">{log.target_type || 'System Feature'}</span>
                                            <span className="text-slate-900/40 dark:text-white/40 text-[9px] font-mono mt-0.5">{log.target_id?.slice(0, 8) || 'ID N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-950/60 dark:text-white/60 text-xs font-medium max-w-xs line-clamp-2 leading-relaxed">{log.description}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-white/5">
                    {recentLogs.length === 0 ? (
                        <div className="py-12 text-center text-white/40 text-sm font-bold">No recent activity found</div>
                    ) : recentLogs.map((log) => (
                        <div key={log.id} className="py-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-white/10 shrink-0">
                                        {log.admin?.photo_url ? (
                                            <img src={log.admin.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="text-xs text-accent font-black">{(log.admin?.name || log.admin_email || 'S').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate">{log.admin?.name || 'Admin'}</p>
                                        <p className="text-white/40 text-[10px] truncate">{log.admin?.email || log.admin_email}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-white text-[10px] font-black">{log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</p>
                                    <p className="text-white/30 text-[9px] font-bold">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${log.action_type?.includes('DELETE') || log.action_type?.includes('REMOVE') ? 'text-rose-500' :
                                        log.action_type?.includes('UPDATE') || log.action_type?.includes('CHANGE') ? 'text-amber-500' :
                                            log.action_type?.includes('CREATE') || log.action_type?.includes('ADD') ? 'text-emerald-500' :
                                                'text-accent'
                                    }`}>
                                    {log.action_type?.replace(/_/g, ' ')}
                                </span>
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-tighter truncate max-w-[150px]">{log.target_type}</span>
                            </div>
                            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 bg-white/[0.02] p-3 rounded-xl border border-white/5 italic">
                                "{log.description}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytical Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Workload Distribution */}
                <ChartCard
                    title="Administrative Workload Distribution"
                    type="bar"
                    data={stats.actionDistribution}
                    dataKey="value"
                    categoryKey="name"
                    color="#F59E0B"
                />

                {/* Team Performance */}
                <ChartCard
                    title="Action Ranking by Administrator"
                    type="bar"
                    data={stats.actionsPerAdmin}
                    dataKey="value"
                    categoryKey="name"
                    color="#10B981"
                />

                {/* Feature Engagement (Time Investment) */}
                <ChartCard
                    title="Feature Interest & Time Investment"
                    type="pie"
                    data={stats.featureEngagement}
                    dataKey="value"
                    color="#3B82F6"
                />

                {/* Activity Timeline */}
                <ChartCard
                    title="Network Engagement Timeline (Last 7 Days)"
                    type="area"
                    color="#F97316"
                    data={stats.activityTimeline}
                    dataKey={[
                        { key: 'value', name: 'Actions', color: '#F97316' }
                    ]}
                />
            </div>

            {/* Detailed Engagement Matrix */}
            <div className="bg-transparent border border-white/5 rounded-[40px] p-10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                            Engagement Matrix
                        </h3>
                        <p className="text-slate-900/40 dark:text-white/40 text-xs mt-1 italic">Correlation between admin roles and feature utilization</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.actionsPerAdmin.slice(0, 3).map((admin, idx) => (
                        <div key={idx} className="bg-transparent border border-white/5 rounded-3xl p-6 hover:bg-white/[0.07] transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black">
                                        {admin.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">{admin.name}</h4>
                                        <p className="text-[10px] text-slate-900/30 dark:text-white/30 truncate max-w-[120px]">{admin.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-950 dark:text-white leading-none">{admin.value}</p>
                                    <p className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase tracking-tighter">Actions</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                        <img src="/Icons/White-AI-Connect.png" alt="" className="w-3 h-3 object-contain dark:hidden brightness-0" />
                                        <img src="/Icons/White-AI-Connect.png" alt="" className="w-3 h-3 object-contain hidden dark:block grayscale opacity-70" />
                                        <span className="text-slate-900/40 dark:text-white/40">Reliability Rank</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold">Top Tier</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-accent h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

export default AdminActivityInsights;
