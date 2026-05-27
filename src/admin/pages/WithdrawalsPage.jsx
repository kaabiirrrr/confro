import { useState, useEffect } from 'react';
import { HandCoins, CheckCircle, XCircle, Clock, Search, Filter, IndianRupee, RefreshCw, FileDown } from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import { fetchWithdrawalRequests, processWithdrawal } from '../../services/adminService';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import { exportTableToPDF } from '../utils/exportPDF';

const WithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadWithdrawals();
    }, [statusFilter]);

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await fetchWithdrawalRequests({ status: statusFilter });
            setWithdrawals(response.data);
        } catch (error) {
            toast.error('Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await processWithdrawal(id, status);
            toast.success(`Withdrawal ${status.toLowerCase()}`);
            loadWithdrawals();
        } catch (error) {
            toast.error('Failed to process withdrawal');
        }
    };

    const filteredWithdrawals = withdrawals.filter(w => {
        const name = (w.user?.profiles[0]?.name || '').toLowerCase();
        const email = (w.user?.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const handleExportPDF = () => {
        const dateFiltered = withdrawals.filter(w => {
            const d = new Date(w.requested_at || w.created_at);
            if (dateFrom && d < new Date(dateFrom)) return false;
            if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
            return true;
        });
        const result = dateFiltered.filter(w => {
            const name = (w.user?.profiles[0]?.name || '').toLowerCase();
            const email = (w.user?.email || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            return name.includes(search) || email.includes(search);
        });
        if (result.length === 0) { toast.error('No data to export'); return; }
        exportTableToPDF({
            title: 'Withdrawal Requests',
            filename: 'withdrawals',
            columns: ['Freelancer', 'Email', 'Amount', 'Method', 'Status', 'Date'],
            rows: result.map(w => [
                w.user?.profiles[0]?.name || 'Unknown',
                w.user?.email || '',
                formatINR(w.amount),
                w.payment_method?.type || 'Bank Transfer',
                w.status,
                new Date(w.requested_at || w.created_at).toLocaleDateString()
            ]),
            filters: { Status: statusFilter || 'All', From: dateFrom || '—', To: dateTo || '—' }
        });
        toast.success('PDF exported');
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
            REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <img src="/Icons/icons8-withdrawal-80.png" alt="Withdrawals" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            Withdrawal Requests
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs sm:text-sm mt-1 font-medium">Manage and process freelancer payment withdrawals</p>
                    </div>
                    {/* Refresh — visible only on mobile, inline with title */}
                    <button
                        onClick={loadWithdrawals}
                        className="sm:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Date pickers */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-36">
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="w-full h-10 px-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-accent transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                            <span className="absolute -top-2 left-2 px-1 bg-[#f7f7f5] dark:bg-[#0F172A] text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">From</span>
                        </div>
                        <div className="relative flex-1 sm:w-36">
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="w-full h-10 px-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-accent transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                            <span className="absolute -top-2 left-2 px-1 bg-[#f7f7f5] dark:bg-[#0F172A] text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">To</span>
                        </div>
                    </div>
                    {/* Status filter + Export — separate rows on mobile, same row on sm+ */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="w-full sm:flex-none sm:min-w-[140px]">
                            <CustomDropdown
                                options={[
                                    { label: 'All Status', value: '' },
                                    { label: 'Pending', value: 'PENDING' },
                                    { label: 'Approved', value: 'APPROVED' },
                                    { label: 'Rejected', value: 'REJECTED' }
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                variant="transparent"
                                className="w-full"
                            />
                        </div>
                        <button onClick={handleExportPDF}
                            className="w-full sm:flex-none flex items-center justify-center gap-2 h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap">
                            <FileDown size={14} /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent transition-all"
                    />
                </div>
                {/* Refresh — desktop only (mobile version is in the title row) */}
                <button
                    onClick={loadWithdrawals}
                    className="hidden sm:flex flex-shrink-0 w-12 h-12 items-center justify-center text-slate-400 dark:text-white/40 hover:text-accent transition-all group"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-5">Freelancer</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Method</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center">
                                    <InfinityLoader fullScreen={false} text="Loading withdrawals..."/>
                                </td></tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-white/40">No results found matching your search</td></tr>
                            ) : filteredWithdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 dark:text-white font-medium">{w.user?.profiles[0]?.name || 'Unknown'}</span>
                                            <span className="text-slate-400 dark:text-white/40 text-xs">{w.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-1">
                                            <IndianRupee size={14} className="text-slate-400 dark:text-white/40" />
                                            {formatINR(w.amount).replace('₹', '')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={18} className="text-accent" />
                                            <span className="text-slate-600 dark:text-white/60 text-sm capitalize">{w.payment_method?.type || 'Bank Transfer'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={w.status} /></td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-white/60 text-sm">
                                        {new Date(w.requested_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {w.status === 'PENDING' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleAction(w.id, 'REJECTED')} className="text-red-500 hover:text-red-400 transition" title="Reject">
                                                    <XCircle size={20} />
                                                </button>
                                                <button onClick={() => handleAction(w.id, 'APPROVED')} className="text-green-500 hover:text-green-400 transition" title="Approve">
                                                    <CheckCircle size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 dark:text-white/20 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <InfinityLoader fullScreen={false} text="Loading withdrawals..." />
                    </div>
                ) : filteredWithdrawals.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-white/40 text-sm">No results found matching your search</div>
                ) : filteredWithdrawals.map((w) => (
                    <div key={w.id} className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
                        {/* Top row: avatar + name + status */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                    {(w.user?.profiles[0]?.name || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-800 dark:text-white font-semibold text-sm truncate">{w.user?.profiles[0]?.name || 'Unknown'}</p>
                                    <p className="text-slate-400 dark:text-white/40 text-xs truncate">{w.user?.email}</p>
                                </div>
                            </div>
                            <StatusBadge status={w.status} />
                        </div>

                        {/* Details row */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 font-bold mb-0.5">Amount</p>
                                <p className="text-slate-800 dark:text-white font-bold text-sm flex items-center gap-0.5">
                                    <IndianRupee size={12} className="text-slate-400 dark:text-white/40" />
                                    {formatINR(w.amount).replace('₹', '')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 font-bold mb-0.5">Method</p>
                                <p className="text-slate-600 dark:text-white/60 text-xs capitalize">{w.payment_method?.type || 'Bank Transfer'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 font-bold mb-0.5">Date</p>
                                <p className="text-slate-600 dark:text-white/60 text-xs">{new Date(w.requested_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {w.status === 'PENDING' && (
                            <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                                <button
                                    onClick={() => handleAction(w.id, 'REJECTED')}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all"
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                                <button
                                    onClick={() => handleAction(w.id, 'APPROVED')}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-green-500/30 text-green-500 hover:bg-green-500/10 text-xs font-bold transition-all"
                                >
                                    <CheckCircle size={14} /> Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Internal CreditCard icon for method column
const CreditCard = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);

export default WithdrawalsPage;
