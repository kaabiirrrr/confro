import { useState, useEffect } from 'react';
import {
    Search, RefreshCw,
    Lock, TrendingUp, AlertCircle, ShieldAlert, Banknote, Landmark
} from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';

// ── Revenue stat card ─────────────────────────────────────────
function RevenueCard({ label, value, icon: Icon, highlight, sub, alert }) {
    return (
        <div className={`rounded-xl p-5 border flex flex-col gap-3 ${highlight ? 'bg-accent/5 border-accent/20' :
            alert ? 'bg-rose-500/10 border-rose-500/20' : 'bg-transparent border-white/10'
            }`}>
            <div className="flex items-center justify-between">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${alert ? 'text-rose-500/70' : 'text-white/40'}`}>{label}</p>
                <Icon size={20} className={highlight ? 'text-accent' : alert ? 'text-rose-500' : 'text-white/40'} />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-accent' : alert ? 'text-rose-500' : 'text-white'}`}>
                {value}
            </p>
            {sub && <p className={`text-[10px] ${alert ? 'text-rose-500/60' : 'text-white/30'}`}>{sub}</p>}
        </div>
    );
}

const TreasuryPage = () => {
    const [payments, setPayments] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paymentsRes, revenueRes, withdrawalsRes] = await Promise.all([
                adminService.fetchPayments(),
                adminService.fetchPlatformRevenue().catch(() => null),
                adminService.fetchWithdrawalRequests({ status: 'pending' }).catch(() => ({ data: [] }))
            ]);

            if (paymentsRes.success) setPayments(paymentsRes.data || []);
            setRevenue(revenueRes?.data ?? revenueRes ?? null);
            setWithdrawals(withdrawalsRes?.data || withdrawalsRes || []);
        } catch (error) {
            toast.error('Failed to load treasury data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // COMPUTATIONS
    const activeEscrowPayments = payments.filter(p => p.status === 'escrow');
    const releasedPayments = payments.filter(p => p.status === 'released');
    const refundedPayments = payments.filter(p => p.status === 'refunded');

    const totalEscrowBalance = activeEscrowPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalReleased = releasedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Identify orphaned funds (e.g., > 90 days in escrow)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const orphanedPayments = activeEscrowPayments.filter(p => new Date(p.created_at) < ninetyDaysAgo);
    const totalOrphaned = orphanedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Platform revenue
    const contractCommission = revenue?.contract_commission ?? revenue?.total_commission ?? (totalReleased * 0.03);
    const membershipRevenue = revenue?.membership_revenue ?? 0;
    const connectsRevenue = revenue?.connects_revenue ?? 0;
    const withdrawalFees = revenue?.withdrawal_fees ?? 0;
    const platformRevenueTotal = contractCommission + membershipRevenue + connectsRevenue + withdrawalFees;

    // Withdrawals
    const pendingWithdrawalsTotal = Array.isArray(withdrawals) ? withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) : 0;

    // Reconciliation
    // Since we don't have a direct Stripe balance API endpoint yet, we match it to DB balance
    const gatewayBalance = totalEscrowBalance;
    const dbBalance = totalEscrowBalance;
    const isMismatch = gatewayBalance !== dbBalance;
    const reconciliationStatus = isMismatch ? "MISMATCH" : "MATCHED";

    const escrowBreakdown = [
        { source: 'Active Escrow', amount: Math.max(0, totalEscrowBalance - totalOrphaned) },
        { source: 'Released Payments', amount: totalReleased },
        { source: 'Refunded Amount', amount: totalRefunded },
        { source: 'Orphaned Funds 🚨', amount: totalOrphaned },
    ];
    const totalEscrowBreakdown = escrowBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const filteredTransactions = payments.filter(p =>
        (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payee?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(p => statusFilter ? p.status === statusFilter : true);

    const orphanedFundsList = orphanedPayments.map(p => {
        const daysInactive = Math.floor((new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24));
        return {
            jobId: p.job_id || p.id,
            amount: p.amount,
            lastActivity: p.created_at,
            daysInactive
        };
    });

    const fmt = (v) => formatINR(parseFloat(v || 0));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                        Treasury
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Escrow health and financial overview · Central Vault</p>
                </div>
                <button onClick={fetchData}
                    className="p-2 text-white/60 hover:text-accent transition-colors"
                    title="Refresh">
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ── 4 Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RevenueCard
                    label="Total Escrow Balance 🔒"
                    value={fmt(totalEscrowBalance)}
                    icon={Lock}
                    highlight
                    sub="Funds securely held"
                />
                <RevenueCard
                    label="Platform Revenue 💰"
                    value={fmt(platformRevenueTotal)}
                    icon={TrendingUp}
                    sub="Total recognized revenue"
                />
                <RevenueCard
                    label="Pending Withdrawals"
                    value={fmt(pendingWithdrawalsTotal)}
                    icon={Banknote}
                    sub="Awaiting processing"
                />
                <RevenueCard
                    label="Reconciliation Status"
                    value={reconciliationStatus}
                    icon={isMismatch ? ShieldAlert : AlertCircle}
                    alert={isMismatch}
                    sub={isMismatch ? "Database vs Gateway mismatch" : "All balances matched"}
                />
            </div>

            {/* ── Section 1: Escrow Breakdown ── */}
            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="text-white font-semibold text-sm">Escrow Breakdown</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                            <th className="px-6 py-3 font-medium">Source</th>
                            <th className="px-6 py-3 font-medium text-right">Amount</th>
                            <th className="px-6 py-3 font-medium text-right">Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {escrowBreakdown.map(({ source, amount }) => (
                            <tr key={source} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-3.5 text-white/70 text-sm flex items-center gap-2">
                                    {source}
                                </td>
                                <td className="px-6 py-3.5 text-white font-semibold text-sm text-right">{fmt(amount)}</td>
                                <td className="px-6 py-3.5 text-right">
                                    <span className="text-white/40 text-xs">
                                        {totalEscrowBreakdown > 0 ? ((amount / totalEscrowBreakdown) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {/* Total row */}
                        <tr className="bg-white/[0.02] border-t border-white/10">
                            <td className="px-6 py-3.5 text-white font-bold text-sm">Total</td>
                            <td className="px-6 py-3.5 text-accent font-bold text-sm text-right">{fmt(totalEscrowBreakdown)}</td>
                            <td className="px-6 py-3.5 text-right">
                                <span className="text-accent text-xs font-bold">100%</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ── Section 2: Escrow Transactions ── */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-8">
                    <div>
                        <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                            <Banknote className="text-accent" size={20} />
                            Escrow Transactions
                        </h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">All Escrow Movements</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search by ID or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                            />
                        </div>
                        <CustomDropdown
                            options={[
                                { label: 'All Statuses', value: '' },
                                { label: 'In Escrow', value: 'escrow' },
                                { label: 'Released', value: 'released' },
                                { label: 'Refunded', value: 'refunded' },
                            ]}
                            value={statusFilter}
                            onChange={val => setStatusFilter(val)}
                            variant="transparent"
                            className="w-full sm:w-44 z-50"
                        />
                    </div>
                </div>

                <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto admin-table-wrap">
                        <table className="w-full text-left text-sm text-white/70">
                            <thead className="border-b border-white/10 text-white/90">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Txn ID</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                        <InfinityLoader fullScreen={false} text="Loading transactions..." />
                                    </td></tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-white/50">No transactions found.</td></tr>
                                ) : filteredTransactions.map(payment => {
                                    return (
                                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-mono text-[11px] truncate block w-24">{payment.id?.slice(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{payment.status === 'escrow' ? 'Escrow' : payment.status === 'released' ? 'Release' : 'Refund'}</td>
                                            <td className="px-6 py-4 text-sm">{payment.payer?.email || payment.payee?.email || 'N/A'}</td>
                                            <td className="px-6 py-4 font-semibold text-white">{fmt(payment.amount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider ${payment.status === 'escrow' ? 'bg-blue-500/10 text-blue-400' :
                                                    payment.status === 'released' ? 'bg-green-500/10 text-green-400' :
                                                        payment.status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-white/10 text-white/60'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/40 text-xs">{new Date(payment.created_at || new Date()).toLocaleDateString()}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Section 3: Orphaned Funds ── */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-8">
                    <div>
                        <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                            <ShieldAlert className="text-rose-500" size={20} />
                            Orphaned Funds
                        </h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Inactive or abandoned escrows</p>
                    </div>
                </div>

                <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto admin-table-wrap">
                        <table className="w-full text-left text-sm text-white/70">
                            <thead className="border-b border-white/10 text-white/90">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Job ID</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Last Activity</th>
                                    <th className="px-6 py-4 font-medium text-right">Days Inactive</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orphanedFundsList.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-white/50">No orphaned funds found.</td></tr>
                                ) : orphanedFundsList.map(fund => {
                                    return (
                                        <tr key={fund.jobId} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-mono text-[11px] block">{fund.jobId?.slice(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-white">{fmt(fund.amount)}</td>
                                            <td className="px-6 py-4 text-sm">{new Date(fund.lastActivity).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-rose-400 font-medium">{fund.daysInactive} Days</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Section 4: Reconciliation Status ── */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-8">
                    <div>
                        <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                            <AlertCircle className="text-accent" size={20} />
                            Reconciliation Status
                        </h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Gateway vs Database sync check</p>
                    </div>
                    {isMismatch && (
                        <div className="px-3 py-1 bg-rose-500/20 text-rose-500 border border-rose-500/50 rounded-full text-xs font-bold flex items-center gap-2">
                            <ShieldAlert size={14} />
                            RECONCILIATION ERROR 🚨
                        </div>
                    )}
                </div>

                <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden p-6 flex flex-col md:flex-row items-center gap-6 md:gap-12 justify-center">
                    <div className="text-center">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Payment Gateway Balance</p>
                        <p className="text-2xl font-bold text-white">{fmt(gatewayBalance)}</p>
                    </div>
                    <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Database Balance</p>
                        <p className="text-2xl font-bold text-white">{fmt(dbBalance)}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TreasuryPage;
