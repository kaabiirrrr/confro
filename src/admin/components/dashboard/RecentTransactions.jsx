import React, { useState, useEffect } from 'react';
import { Settings2, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { fetchPayments } from '../../../services/adminService';
import { formatINR } from '../../../utils/currencyUtils';

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                const response = await fetchPayments({ limit: 10 });
                if (response.data && response.data.length > 0) {
                    // Map real payments to this structure
                    const mapped = response.data.map(p => ({
                        id: p.id,
                        name: p.contract?.job?.title || p.description || `Payment #${p.id.slice(-6)}`,
                        category: p.description?.split('-')[1] || (p.status === 'escrow' ? 'In Escrow' : 'Payment Released'),
                        accountType: p.payment_method_type?.toUpperCase() || 'BANK', 
                        accountName: p.payer?.profiles?.name || p.payer?.email?.split('@')[0] || "Verified Client",
                        date: new Date(p.created_at).toISOString().split('T')[0],
                        time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        amount: Number(p.amount) || 0,
                        status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
                        isIncome: true
                    }));
                    setTransactions(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch payments:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPayments();
    }, []);

    const getStatusStyle = (status) => {
        if (status === 'Completed') {
            // Dark green background with white/emerald text
            return 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20';
        }
        // Light green background with darker text for Pending in image, but using dark theme compatible:
        return 'bg-green-500 text-green-950 font-bold'; 
    };

    return (
        <div className="bg-transparent border border-white/5 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight text-white">
                    Recent Transactions
                </h3>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-medium text-white/80">
                        This Month <ChevronDown size={16} className="text-white/60" />
                    </button>
                    <button className="p-2.5 bg-transparent hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white/80">
                        <Settings2 size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="pb-4 font-medium text-[11px] uppercase tracking-wider text-white/30 whitespace-nowrap">Transaction Name ↕</th>
                            <th className="pb-4 font-medium text-[11px] uppercase tracking-wider text-white/30 whitespace-nowrap">Account ↕</th>
                            <th className="pb-4 font-medium text-[11px] uppercase tracking-wider text-white/30 whitespace-nowrap">Date & Time ↕</th>
                            <th className="pb-4 font-medium text-[11px] uppercase tracking-wider text-white/30 whitespace-nowrap">Amount ↕</th>
                            <th className="pb-4 font-medium text-[11px] uppercase tracking-wider text-white/30 whitespace-nowrap">Status ↕</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-white/40">Loading transactions...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-white/40">No recent transactions found.</td>
                            </tr>
                        ) : transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-4 pr-4">
                                    <p className="text-sm font-semibold text-white/90">{tx.name}</p>
                                    <p className="text-xs text-white/40 mt-1.5">{tx.category}</p>
                                </td>
                                <td className="py-4 pr-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center bg-white rounded flex-shrink-0 px-2 py-0.5">
                                            {tx.accountType === 'VISA' ? (
                                                <span className="text-[10px] font-black text-blue-900 tracking-tighter">VISA</span>
                                            ) : tx.accountType === 'MASTERCARD' ? (
                                                <div className="flex items-center h-4">
                                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
                                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80 -ml-1 mix-blend-multiply" />
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-500 tracking-tighter uppercase">{tx.accountType}</span>
                                            )}
                                        </div>
                                        <span className="text-sm text-white/60">{tx.accountName}</span>
                                    </div>
                                </td>
                                <td className="py-4 pr-4">
                                    <p className="text-sm font-medium text-white/80">{tx.date}</p>
                                    <p className="text-xs text-white/40 mt-1.5">{tx.time}</p>
                                </td>
                                <td className="py-4 pr-4">
                                    <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-white' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatINR(Math.abs(tx.amount))}
                                    </span>
                                </td>
                                <td className="py-4 min-w-[100px]">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider ${getStatusStyle(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactions;
