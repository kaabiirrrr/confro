import { useState, useEffect } from 'react';
import {
    Search, CornerUpLeft, RefreshCw,
    TrendingUp, CreditCard, Users, Zap, Banknote, IndianRupee
} from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const COMMISSION_RATE = 0.03; // 3%

const fmtCommission = (v) => {
    const n = parseFloat(v || 0);
    if (n === 0) return '₹0';
    if (n < 1) return `₹${n.toFixed(2)}`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
};

// ── Revenue stat card ─────────────────────────────────────────
function RevenueCard({ label, value, icon: Icon, highlight, sub }) {
    return (
        <div className={`rounded-xl p-5 border flex flex-col gap-3 ${highlight ? 'bg-accent/5 border-accent/20' : 'bg-transparent border-white/10'
            }`}>
            <div className="flex items-center justify-between">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{label}</p>
                <Icon size={20} className={highlight ? 'text-accent' : 'text-white/40'} />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-accent' : 'text-white'}`}>
                {value}
            </p>
            {sub && <p className="text-white/30 text-[10px]">{sub}</p>}
        </div>
    );
}

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
        fetchRevenue();
    }, [statusFilter]);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchPayments({ status: statusFilter });
            if (result.success) setPayments(result.data);
        } catch { toast.error('Failed to load payments'); }
        finally { setIsLoading(false); }
    };

    const fetchRevenue = async () => {
        setRevenueLoading(true);
        try {
            const result = await adminService.fetchPlatformRevenue();
            setRevenue(result?.data ?? result);
        } catch { setRevenue(null); }
        finally { setRevenueLoading(false); }
    };

    const handleRefund = async (paymentId) => {
        if (!confirm('Issue a refund for this payment?')) return;
        try {
            const result = await adminService.issueRefund(paymentId);
            if (result.success) { toast.success('Refund issued'); fetchPayments(); }
        } catch { toast.error('Refund failed'); }
    };

    const filteredPayments = payments.filter(p =>
        (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payee?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fallback: compute from payments list if API not ready
    const releasedTotal = payments
        .filter(p => p.status === 'released')
        .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

    const contractCommission = revenue?.contract_commission ?? revenue?.total_commission ?? (releasedTotal * COMMISSION_RATE);
    const membershipRevenue = revenue?.membership_revenue ?? 0;
    const connectsRevenue = revenue?.connects_revenue ?? 0;
    const withdrawalFees = revenue?.withdrawal_fees ?? 0;
    const totalRevenue = contractCommission + membershipRevenue + connectsRevenue + withdrawalFees;

    const fmt = (v) => formatINR(parseFloat(v || 0));

    const breakdown = [
        { source: 'Contract Commission (3%)', amount: contractCommission },
        { source: 'Membership Plans', amount: membershipRevenue },
        { source: 'Connects Purchases', amount: connectsRevenue },
        { source: 'Withdrawal Fees (3%)', amount: withdrawalFees },
    ];

    return (
        <div className="space-y-8">

            <div className="flex justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-payments-64.png" alt="Revenue" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                        Revenue & Payments
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Platform earnings across all revenue streams · 3% commission</p>
                </div>
                <button onClick={() => { fetchPayments(); fetchRevenue(); }}
                    className="p-2 text-white/60 hover:text-accent transition-colors"
                    title="Refresh">
                    <RefreshCw size={18} className={(isLoading || revenueLoading) ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ── 4 Stat Cards ── */}
            {revenueLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <RevenueCard
                        label="Total Revenue"
                        value={fmt(totalRevenue)}
                        icon={TrendingUp}
                        highlight
                        sub="All sources combined"
                    />
                    <RevenueCard
                        label="Contract Commission"
                        value={fmt(contractCommission)}
                        icon={CreditCard}
                        sub="3% of released payments"
                    />
                    <RevenueCard
                        label="Membership Revenue"
                        value={fmt(membershipRevenue)}
                        icon={Users}
                        sub="Plan subscriptions"
                    />
                    <RevenueCard
                        label="Connects Revenue"
                        value={fmt(connectsRevenue)}
                        icon={Zap}
                        sub="Freelancer connect purchases"
                    />
                </div>
            )}

            {/* ── Breakdown Table ── */}
            {!revenueLoading && (
                <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h2 className="text-white font-semibold text-sm">Revenue Breakdown</h2>
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
                            {breakdown.map(({ source, amount }) => (
                                <tr key={source} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3.5 text-white/70 text-sm">{source}</td>
                                    <td className="px-6 py-3.5 text-white font-semibold text-sm text-right">{fmt(amount)}</td>
                                    <td className="px-6 py-3.5 text-right">
                                        <span className="text-white/40 text-xs">
                                            {totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : '0.0'}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {/* Total row */}
                            <tr className="bg-white/[0.02] border-t border-white/10">
                                <td className="px-6 py-3.5 text-white font-bold text-sm">Total</td>
                                <td className="px-6 py-3.5 text-accent font-bold text-sm text-right">{fmt(totalRevenue)}</td>
                                <td className="px-6 py-3.5 text-right">
                                    <span className="text-accent text-xs font-bold">100%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                            <Banknote className="text-accent" size={20} />
                            Transaction History
                        </h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Protocol Audit Log · All Financial Movements</p>
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
                            className="w-full sm:w-44"
                        />
                    </div>
                </div>

                <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto admin-table-wrap">
                        <table className="w-full text-left text-sm text-white/70">
                            <thead className="border-b border-white/10 text-white/90">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Txn ID</th>
                                    <th className="px-6 py-4 font-medium">Payer (Client)</th>
                                    <th className="px-6 py-4 font-medium">Payee (Freelancer)</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Commission (3%)</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="7" className="px-6 py-12 text-center text-white/40">
                                        <InfinityLoader fullScreen={false} text="Loading transactions..." />
                                    </td></tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr><td colSpan="7" className="px-6 py-8 text-center text-white/50">No transactions found.</td></tr>
                                ) : filteredPayments.map(payment => {
                                    const amt = parseFloat(payment.amount) || 0;
                                    const commission = amt * COMMISSION_RATE;
                                    return (
                                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-mono text-[11px] truncate block w-24">{payment.id?.slice(0, 8).toUpperCase()}</span>
                                                <span className="text-white/40 text-[10px]">{new Date(payment.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{payment.payer?.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm">{payment.payee?.email || 'N/A'}</td>
                                            <td className="px-6 py-4 font-semibold text-white">{formatINR(amt)}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-accent font-semibold text-sm">{fmtCommission(commission)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'escrow' ? 'bg-blue-500/10 text-blue-400' :
                                                    payment.status === 'released' ? 'bg-green-500/10 text-green-400' :
                                                        payment.status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-white/10 text-white/60'
                                                    }`}>
                                                    {payment.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Refund button — requires backend POST /api/admin/refund */}
                                                {payment.status !== 'refunded' && (
                                                    <button onClick={() => handleRefund(payment.id)}
                                                        className="text-xs flex items-center justify-end gap-1 ml-auto text-white/20 cursor-not-allowed"
                                                        title="Refund endpoint not yet available"
                                                        disabled
                                                    >
                                                        <CornerUpLeft size={14} /> Refund
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
