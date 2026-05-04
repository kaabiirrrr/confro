import { useState, useEffect } from 'react';
import {
    Users, Briefcase, FileSignature,
    CreditCard, AlertOctagon, Activity,
    LayoutDashboard, Zap, Shield
} from 'lucide-react';
import { fetchDashboardStats } from '../../services/adminService';

// New Dashboard Components
import StatCard from '../components/dashboard/StatCard';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityPanel from '../components/dashboard/ActivityPanel';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import InfinityLoader from '../../components/common/InfinityLoader';
import RevenueOverviewCard from '../components/dashboard/RevenueOverviewCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <InfinityLoader
                    fullScreen={false}
                    size="lg"
                    text="SYNCHRONIZING PLATFORM DATA..."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-rose-100 bg-rose-500/10 border border-rose-500/20 rounded-2xl m-6 text-center">
                <Shield className="mx-auto mb-4 text-rose-500" size={32} />
                <h3 className="text-lg font-bold mb-2">Access Error</h3>
                <p className="text-sm opacity-60">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-10 pb-6 sm:pb-10 px-2 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-dashboard-96.png" alt="Dashboard" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Command Center
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Global Analytics & Live Monitoring
                    </p>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2.5 sm:gap-4 bg-transparent border border-white/5 px-3 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-white tracking-widest uppercase">
                        SYSTEM {stats?.overview?.systemStatus || 'HEALTHY'}
                    </span>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>

            {/* Top Tier Stats (4 Cards) */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-slate-500 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Primary Network Metrics</h2>
                <DashboardGrid>
                    <StatCard title="Total Users" value={stats.overview.totalUsers} icon="/Icons/icons8-user-100.png" />
                    <StatCard title="Freelancers" value={stats.overview.totalFreelancers} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Active Jobs" value={stats.overview.totalJobs} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Live Contracts" value={stats.overview.activeContracts} icon="/Icons/icons8-smart-contracts-60.png" />
                </DashboardGrid>
            </section>

            {/* Second Tier Stats (4 Cards) */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-slate-500 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Network Activity & Verification</h2>
                <DashboardGrid>
                    <StatCard title="Pending Verifications" value={stats.overview.pendingVerifications} icon="/Icons/icons8-verification-100.png" trendType="none" />
                    <StatCard title="Live Activity" value={stats.overview.recentActivityCount} icon="/Icons/icons8-heart-monitor-96.png" trendType="none" />
                    <StatCard title="Job Applications" value={stats.overview.totalProposals || 0} icon="/Icons/icons8-new-job-100.png" trendType="none" />
                    <StatCard title="Active Disputes" value={stats.overview.pendingDisputes || 0} icon="/Icons/icons8-disputes-100.png" trendType="none" />
                </DashboardGrid>
            </section>

            {/* Visual Analytics & Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
                {/* Visual Analytics Column */}
                <div className="xl:col-span-2 space-y-4 sm:space-y-8">
                    <ChartCard
                        title="User Growth Trend"
                        type="line"
                        data={stats.userGrowth}
                        dataKey={[
                            { key: 'total', name: 'Total Users', color: '#2563EB' },
                            { key: 'freelancers', name: 'Freelancers', color: '#10B981' },
                            { key: 'clients', name: 'Clients', color: '#F59E0B' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <ChartCard
                            title="Most Visited Features"
                            type="bar"
                            data={stats.topPages}
                            dataKey="count"
                            categoryKey="page"
                            color="#6366F1"
                        />
                        <ChartCard
                            title="Feature Usage Mix"
                            type="pie"
                            data={stats.topFeatures}
                            dataKey="value"
                            color="#2563EB"
                        />
                    </div>

                    <RecentTransactions />
                </div>


                {/* Real-time Activity Column */}
                <div className="xl:col-span-1 min-h-[400px] sm:min-h-[600px] xl:sticky xl:top-6 self-start space-y-4 sm:space-y-8">
                    <ActivityPanel limit={8} />

                    {/* Financial Summary Gauge */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {(() => {
                            // Calculate real growth/trend data
                            const revData = stats?.revenueGrowth || [];
                            
                            // Better growth calculation: compare last 7 days vs previous 7 days (within our 30-day window)
                            const last7 = revData.slice(-7).reduce((acc, curr) => acc + curr.amount, 0);
                            const prev7 = revData.slice(-14, -7).reduce((acc, curr) => acc + curr.amount, 0);

                            const diff = prev7 === 0 ? (last7 > 0 ? 100 : 0) : ((last7 - prev7) / prev7) * 100;
                            const trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;

                            return (
                                <RevenueOverviewCard
                                    totalCommission={stats.overview.platformCommission || 0}
                                    totalRevenue={stats.overview.totalEarnings || 0}
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


        </div>
    );
};

export default AdminDashboard;
