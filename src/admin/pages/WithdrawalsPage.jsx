import { useState, useEffect } from 'react';
import { HandCoins, CheckCircle, XCircle, Clock, Search, Filter, IndianRupee } from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import { fetchWithdrawalRequests, processWithdrawal } from '../../services/adminService';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const WithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-withdrawal-80.png" alt="Withdrawals" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Withdrawal Requests
                    </h1>
                    <p className="text-white/60 text-xs sm:text-sm mt-1">Manage and process freelancer payment withdrawals</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-accent transition-all"
                        />
                    </div>
                    <CustomDropdown
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Pending', value: 'PENDING' },
                            { label: 'Approved', value: 'APPROVED' },
                            { label: 'Rejected', value: 'REJECTED' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        className="min-w-[110px] sm:min-w-[140px]"
                    />
                    <button onClick={loadWithdrawals} className="p-2 bg-transparent border border-white/10 rounded-xl text-white/60 hover:text-white transition flex-shrink-0">
                        <Clock size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-5">Freelancer</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Method</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} size="md" text="Loading withdrawals..." />
                                </td></tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">No results found matching your search</td></tr>
                            ) : filteredWithdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{w.user?.profiles[0]?.name || 'Unknown'}</span>
                                            <span className="text-white/40 text-xs">{w.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-1">
                                        <IndianRupee size={14} className="text-white/40" />
                                        {formatINR(w.amount).replace('₹', '')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                <CreditCard size={14} />
                                            </div>
                                            <span className="text-white/60 text-sm capitalize">{w.payment_method?.type || 'Bank Transfer'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={w.status} />
                                    </td>
                                    <td className="px-6 py-4 text-white/60 text-sm">
                                        {new Date(w.requested_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {w.status === 'PENDING' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(w.id, 'REJECTED')}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Reject"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(w.id, 'APPROVED')}
                                                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            </div>
                                        )}
                                        {w.status !== 'PENDING' && (
                                            <span className="text-xs text-white/20 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Internal CreditCard icon for method column
const CreditCard = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);

export default WithdrawalsPage;
