import { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Wifi, Ban, Flag, CreditCard, ArrowDownToLine, Star, Briefcase, ChevronRight } from 'lucide-react';
import { fetchDashboardStats } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currencyUtils';
import { cleanImageUrl } from '../../utils/imageUrl';

import StatCard from '../components/dashboard/StatCard';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityPanel from '../components/dashboard/ActivityPanel';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import InfinityLoader from '../../components/common/InfinityLoader';
import RevenueOverviewCard from '../components/dashboard/RevenueOverviewCard';

// ── Mini section label ──────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <h2 className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">{children}</h2>
);

// ── Pending Actions Queue card ──────────────────────────────────────────────
const PendingActionItem = ({ label, count, color, to, navigate }) => (
    <button
        onClick={() => navigate(to)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
    >
        <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${count > 0 ? `${color} text-white` : 'bg-white/5 text-white/30'}`}>
            {count}
        </span>
    </button>
);

// ── Funnel step ─────────────────────────────────────────────────────────────
const FunnelStep = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs font-medium">{label}</span>
                <span className="text-white text-xs font-bold">{value} <span className="text-white/30">({pct}%)</span></span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ── Top performer row ────────────────────────────────────────────────────────
const PerformerAvatar = ({ name, avatar }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const initial = (name || '?')[0].toUpperCase();

    // Strip cache-bust params that might cause CORS issues, keep the base URL
    const src = avatar && !imgFailed ? avatar : null;

    if (src) {
        return (
            <img
                src={src}
                alt={name || ''}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10 bg-accent/10"
                onError={() => setImgFailed(true)}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
            />
        );
    }
    return (
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0 border border-white/10">
            {initial}
        </div>
    );
};

const PerformerRow = ({ rank, name, email, avatar, count, label }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
        <span className="text-white/20 text-xs font-black w-4 shrink-0">#{rank}</span>
        <PerformerAvatar name={name} avatar={avatar} />
        <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-medium truncate">{name || 'Unknown'}</p>
            {email && <p className="text-white/30 text-[10px] truncate">{email}</p>}
        </div>
        <span className="text-accent text-xs font-black shrink-0">{count} {label}</span>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const result = await fetchDashboardStats();
            if (result.success) {
                setStats(result.data);
            } else {
                setError('Failed to load dashboard statistics.');
            }
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
            setError('Failed to load dashboard statistics.');
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Auto-refresh every 60s
        const interval = setInterval(() => fetchDashboardData(true), 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <InfinityLoader fullScreen={false} size="lg" text="SYNCHRONIZING PLATFORM DATA..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-rose-700 dark:text-rose-100 bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-center">
                <Shield className="mx-auto mb-4 text-rose-500" size={32} />
                <h3 className="text-lg font-bold mb-2">Access Error</h3>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    const o = stats?.overview || {};
    const funnel = stats?.funnel || {};
    const topFreelancers = stats?.topFreelancers || [];
    const topClients = stats?.topClients || [];

    return (
        <div className="space-y-8 pb-10 px-2 sm:px-0">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-dashboard-96.png" alt="Dashboard" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Command Center
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Global Analytics & Live Monitoring</p>
                </div>
                <div className="flex items-center gap-2.5 bg-transparent border border-white/5 px-4 py-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">SYSTEM {o.systemStatus || 'OPERATIONAL'}</span>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                </div>
            </div>

            {/* ── Tier 1: Primary Network Metrics ── */}
            <section className="space-y-3">
                <SectionLabel>Primary Network Metrics</SectionLabel>
                <DashboardGrid>
                    <StatCard title="Total Users" value={o.totalUsers} icon="/Icons/icons8-user-100.png" />
                    <StatCard title="Freelancers" value={o.totalFreelancers} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Active Jobs" value={o.totalJobs} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Live Contracts" value={o.activeContracts} icon="/Icons/icons8-smart-contracts-60.png" />
                </DashboardGrid>
            </section>

            {/* ── Tier 2: Network Activity ── */}
            <section className="space-y-3">
                <SectionLabel>Network Activity & Verification</SectionLabel>
                <DashboardGrid>
                    <StatCard title="Pending Verifications" value={o.pendingVerifications} icon="/Icons/icons8-verification-100.png" trendType="none" />
                    <StatCard title="Live Activity (24h)" value={o.recentActivityCount} icon="/Icons/icons8-heart-monitor-96.png" trendType="none" />
                    <StatCard title="Job Applications" value={o.totalProposals || 0} icon="/Icons/icons8-new-job-100.png" trendType="none" />
                    <StatCard title="Active Disputes" value={o.pendingDisputes || 0} icon="/Icons/icons8-disputes-100.png" trendType="none" />
                </DashboardGrid>
            </section>

            {/* ── Tier 3: New Feature Sections ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Platform Health Monitor */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Wifi size={14} className="text-accent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Platform Health</h3>
                    </div>
                    {[
                        { label: 'Database', status: 'Operational', ok: true },
                        { label: 'Email Service', status: 'Operational', ok: true },
                        { label: 'Storage', status: 'Operational', ok: true },
                        { label: 'Payment Gateway', status: 'Operational', ok: true },
                        { label: 'AI Assistant', status: 'Operational', ok: true },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">{s.label}</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                <span className={`text-xs font-bold ${s.ok ? 'text-emerald-400' : 'text-red-400'}`}>{s.status}</span>
                            </div>
                        </div>
                    ))}
                    <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs">Online Users</span>
                            <span className="text-accent font-black text-sm">{o.onlineUsers || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Actions Queue */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5 space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className="text-yellow-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Pending Actions Queue</h3>
                    </div>
                    <PendingActionItem label="Identity Verifications" count={o.pendingVerifications || 0} color="bg-yellow-500" to="/admin/verifications" navigate={navigate} />
                    <PendingActionItem label="Open Disputes" count={o.pendingDisputes || 0} color="bg-red-500" to="/admin/disputes" navigate={navigate} />
                    <PendingActionItem label="Withdrawal Requests" count={o.pendingWithdrawals || 0} color="bg-orange-500" to="/admin/finance" navigate={navigate} />
                    <PendingActionItem label="Flagged Users" count={o.flaggedUsers || 0} color="bg-purple-500" to="/admin/users" navigate={navigate} />
                    <PendingActionItem label="Banned Accounts" count={o.bannedUsers || 0} color="bg-rose-600" to="/admin/users" navigate={navigate} />
                </div>

                {/* Connects Economy */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={14} className="text-accent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Connects Economy</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Purchased</p>
                            <p className="text-white font-black text-xl">{o.connectsPurchased || 0}</p>
                        </div>
                        <div className="border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Withdrawals</p>
                            <p className="text-white font-black text-xl">{o.approvedWithdrawals || 0}</p>
                        </div>
                        <div className="border border-white/10 rounded-xl p-3 text-center col-span-2">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Total Withdrawal Volume</p>
                            <p className="text-accent font-black text-lg">{formatINR(o.totalWithdrawalAmount || 0)}</p>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-white/40 text-xs">Completed Contracts</span>
                        <span className="text-white font-bold text-sm">{o.completedContracts || 0}</span>
                    </div>
                </div>
            </div>

            {/* ── Revenue & Escrow + User Acquisition Funnel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue & Escrow Overview */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-accent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Revenue & Escrow Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-white/10 rounded-xl p-4">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Total Earnings</p>
                            <p className="text-white font-black text-lg">{formatINR(o.totalEarnings || 0)}</p>
                        </div>
                        <div className="border border-white/10 rounded-xl p-4">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Platform Fee</p>
                            <p className="text-accent font-black text-lg">{formatINR(o.platformCommission || 0)}</p>
                        </div>
                    </div>
                    <ChartCard
                        title=""
                        type="line"
                        data={stats?.revenueGrowth || []}
                        dataKey={[{ key: 'amount', name: 'Revenue', color: '#0ea5e9' }]}
                    />
                </div>

                {/* User Acquisition Funnel */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-accent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">User Acquisition Funnel</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                        <FunnelStep label="Registered" value={funnel.registered || 0} total={funnel.registered || 1} color="bg-blue-500" />
                        <FunnelStep label="Profile Completed" value={funnel.profileCompleted || 0} total={funnel.registered || 1} color="bg-indigo-500" />
                        <FunnelStep label="Proposal Submitted" value={funnel.proposalSubmitted || 0} total={funnel.registered || 1} color="bg-violet-500" />
                        <FunnelStep label="Contract Started" value={funnel.contractStarted || 0} total={funnel.registered || 1} color="bg-accent" />
                    </div>
                    <div className="pt-3 border-t border-white/5">
                        <p className="text-white/30 text-xs">Conversion: <span className="text-accent font-bold">{funnel.registered > 0 ? Math.round((funnel.contractStarted / funnel.registered) * 100) : 0}%</span> of registered users started a contract</p>
                    </div>
                </div>
            </div>

            {/* ── Top Performers ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Freelancers */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Star size={14} className="text-yellow-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Top Freelancers by Contracts</h3>
                    </div>
                    {topFreelancers.length > 0 ? topFreelancers.map((f, i) => (
                        <PerformerRow key={f.id} rank={i + 1} name={f.name} email={f.email} avatar={f.avatar} count={f.count} label="contracts" />
                    )) : <p className="text-white/20 text-sm text-center py-4">No data yet</p>}
                </div>

                {/* Top Clients */}
                <div className="bg-transparent border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={14} className="text-blue-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Top Clients by Jobs Posted</h3>
                    </div>
                    {topClients.length > 0 ? topClients.map((c, i) => (
                        <PerformerRow key={c.id} rank={i + 1} name={c.name} email={c.email} avatar={c.avatar} count={c.count} label="jobs" />
                    )) : <p className="text-white/20 text-sm text-center py-4">No data yet</p>}
                </div>
            </div>

            {/* ── Fraud & Risk Alerts ── */}
            <div className="bg-transparent border border-red-500/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Flag size={14} className="text-red-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/60">Fraud & Risk Alerts</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="border border-red-500/20 rounded-xl p-3 text-center">
                        <p className="text-red-400/60 text-[9px] uppercase tracking-widest mb-1">Banned</p>
                        <p className="text-red-400 font-black text-2xl">{o.bannedUsers || 0}</p>
                    </div>
                    <div className="border border-orange-500/20 rounded-xl p-3 text-center">
                        <p className="text-orange-400/60 text-[9px] uppercase tracking-widest mb-1">Restricted</p>
                        <p className="text-orange-400 font-black text-2xl">{o.flaggedUsers || 0}</p>
                    </div>
                    <div className="border border-yellow-500/20 rounded-xl p-3 text-center">
                        <p className="text-yellow-400/60 text-[9px] uppercase tracking-widest mb-1">Open Disputes</p>
                        <p className="text-yellow-400 font-black text-2xl">{o.pendingDisputes || 0}</p>
                    </div>
                    <div className="border border-purple-500/20 rounded-xl p-3 text-center">
                        <p className="text-purple-400/60 text-[9px] uppercase tracking-widest mb-1">Pending KYC</p>
                        <p className="text-purple-400 font-black text-2xl">{o.pendingVerifications || 0}</p>
                    </div>
                </div>
                {(o.bannedUsers > 0 || o.flaggedUsers > 0 || o.pendingDisputes > 0) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-red-500/10">
                        <AlertTriangle size={12} className="text-red-400" />
                        <p className="text-red-400/60 text-xs">
                            {o.bannedUsers + o.flaggedUsers + o.pendingDisputes} total items require attention
                        </p>
                        <button onClick={() => navigate('/admin/users')} className="ml-auto text-red-400 text-xs font-bold flex items-center gap-1 hover:text-red-300 transition-colors">
                            Review <ChevronRight size={12} />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Charts + Activity ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <ChartCard
                        title="User Growth Trend"
                        type="line"
                        data={stats?.userGrowth || []}
                        dataKey={[
                            { key: 'total', name: 'Total Users', color: '#2563EB' },
                            { key: 'freelancers', name: 'Freelancers', color: '#10B981' },
                            { key: 'clients', name: 'Clients', color: '#F59E0B' }
                        ]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartCard
                            title="Most Visited Features"
                            type="bar"
                            data={stats?.topPages || []}
                            dataKey="count"
                            categoryKey="page"
                            color="#6366F1"
                        />
                        <ChartCard
                            title="Feature Usage Mix"
                            type="pie"
                            data={stats?.topFeatures || []}
                            dataKey="value"
                            color="#2563EB"
                        />
                    </div>
                    <RecentTransactions />
                </div>

                <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-6 self-start">
                    <ActivityPanel limit={8} />
                    {(() => {
                        const revData = stats?.revenueGrowth || [];
                        const last7 = revData.slice(-7).reduce((acc, curr) => acc + curr.amount, 0);
                        const prev7 = revData.slice(-14, -7).reduce((acc, curr) => acc + curr.amount, 0);
                        const diff = prev7 === 0 ? (last7 > 0 ? 100 : 0) : ((last7 - prev7) / prev7) * 100;
                        const trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
                        return (
                            <RevenueOverviewCard
                                totalCommission={o.platformCommission || 0}
                                totalRevenue={o.totalEarnings || 0}
                                growth={Math.abs(Number(diff.toFixed(1)))}
                                commissionTrend={trendStr}
                                revenueTrend={trendStr}
                                onRefresh={() => fetchDashboardData(true)}
                            />
                        );
                    })()}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
