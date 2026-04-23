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

    useEffect(() => {
        const fetchDashboardData = async () => {
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
                setIsLoading(false);
            }
        };

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
            <div className="p-8 text-rose-100 bg-rose-500/10 border border-rose-500/20 rounded-[32px] m-6 text-center">
                <Shield className="mx-auto mb-4 text-rose-500" size={32} />
                <h3 className="text-lg font-bold mb-2">Access Error</h3>
                <p className="text-sm opacity-60">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <img src="/Icons/icons8-dashboard-96.png" alt="Dashboard" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter">Command Center</h1>
                    </div>
                    <p className="text-white/40 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em]">
                        Global Analytics & Live Monitoring
                    </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-transparent border border-white/5 px-4 sm:px-6 py-3 sm:py-4 rounded-[18px] sm:rounded-[24px]">
                    <div className="flex flex-col items-end">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                        <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase">
                            SYSTEM {stats?.overview?.systemStatus || 'HEALTHY'}
                        </span>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>

            {/* Top Tier Stats (4 Cards) */}
            <section className="space-y-4">
                <h2 className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Primary Network Metrics</h2>
                <DashboardGrid>
                    <StatCard title="Total Users" value={stats.overview.totalUsers} icon="/Icons/icons8-user-100.png" />
                    <StatCard title="Freelancers" value={stats.overview.totalFreelancers} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Active Jobs" value={stats.overview.totalJobs} icon="/Icons/icons8-bag-80.png" />
                    <StatCard title="Live Contracts" value={stats.overview.activeContracts} icon="/Icons/icons8-smart-contracts-60.png" />
                </DashboardGrid>
            </section>

            {/* Second Tier Stats (4 Cards) */}
            <section className="space-y-4">
                <h2 className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Network Activity & Verification</h2>
                <DashboardGrid>
                    <StatCard title="Pending Verifications" value={stats.overview.pendingVerifications} icon="/Icons/icons8-verification-100.png" trendType="none" />
                    <StatCard title="Live Activity" value={stats.overview.recentActivityCount} icon="/Icons/icons8-heart-monitor-96.png" trendType="none" />
                    <StatCard title="Job Applications" value={stats.overview.totalProposals || 0} icon="/Icons/icons8-new-job-100.png" trendType="none" />
                    <StatCard title="Platform Status" value={stats.overview.systemStatus} icon="/Icons/icons8-system-100.png" trendType="none" />
                </DashboardGrid>
            </section>

            {/* Visual Analytics & Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Analytics Column */}
                <div className="xl:col-span-2 space-y-8">
                    <ChartCard
                        title="User Growth Trend"
                        type="line"
                        data={stats.userGrowth}
                        dataKey={[
                            { key: 'total', name: 'Total Users', color: '#3B82F6' },
                            { key: 'freelancers', name: 'Freelancers', color: '#60A5FA' },
                            { key: 'clients', name: 'Clients', color: '#93C5FD' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <ChartCard
                            title="Most Visited Features"
                            type="bar"
                            data={stats.topPages}
                            dataKey="count"
                            categoryKey="page"
                            color="#3B82F6"
                        />
                        <ChartCard
                            title="Feature Usage Mix"
                            type="pie"
                            data={stats.topFeatures}
                            dataKey="value"
                            color="#3B82F6"
                        />
                    </div>

                    <RecentTransactions />
                </div>


                {/* Real-time Activity Column */}
                <div className="xl:col-span-1 min-h-[600px] xl:sticky xl:top-6 self-start space-y-8">
                    <ActivityPanel limit={8} />
                    
                    {/* Financial Summary Gauge */}
                    <div className="flex flex-col gap-6">
                        {(() => {
                            // Calculate real growth/trend data
                            const revData = stats?.revenueGrowth || [];
                            const current = revData[revData.length - 1]?.amount || 0;
                            const previous = revData[revData.length - 2]?.amount || 0;
                            
                            const diff = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
                            const trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
                            
                            return (
                                <RevenueOverviewCard 
                                    totalCommission={stats.overview.platformCommission || 0}
                                    totalRevenue={stats.overview.totalEarnings || 0}
                                    growth={Math.abs(Number(diff.toFixed(1)))} // Using absolute for visual gauge filling
                                    commissionTrend={trendStr}
                                    revenueTrend={trendStr}
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
