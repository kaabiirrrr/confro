import React, { useState, useEffect } from 'react';
import { Settings2, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { fetchPayments } from '../../../services/adminService';
import { formatINR } from '../../../utils/currencyUtils';

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('month');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const timeframes = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'year', label: 'This Year' },
        { id: 'all', label: 'All Time' }
    ];

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            const response = await fetchPayments({ 
                limit: 10,
                timeframe: timeframe
            });
            
            if (response.data) {
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
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error("Failed to fetch payments:", err);
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [timeframe]);

    const getStatusStyle = (status) => {
        const s = status.toLowerCase();
        
        // Success / Completed
        if (s === 'completed' || s === 'success') {
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
        }
        
        // Pending / Escrow / Requires Capture
        if (s === 'escrow' || s === 'requires_capture' || s === 'pending') {
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
        }

        // Default / Other
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'; 
    };

    return (
        <div className="bg-transparent border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-8 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white shrink-0">
                    Recent Transactions
                </h3>
                
                <div className="flex items-center gap-2 sm:gap-3 relative">
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all text-[10px] sm:text-sm font-bold text-slate-600 dark:text-white/80 whitespace-nowrap min-w-[100px] sm:min-w-[120px]"
                        >
                            {timeframes.find(t => t.id === timeframe)?.label} 
                            <ChevronDown size={14} className={`text-slate-400 dark:text-white/60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                                    {timeframes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setTimeframe(t.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                                timeframe === t.id 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5">
                            <th className="pb-4 pr-6 font-black text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 whitespace-nowrap">Transaction Name ↕</th>
                            <th className="pb-4 pr-6 font-black text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 whitespace-nowrap">Account ↕</th>
                            <th className="pb-4 pr-6 font-black text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 whitespace-nowrap">Date & Time ↕</th>
                            <th className="pb-4 pr-6 font-black text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 whitespace-nowrap">Amount ↕</th>
                            <th className="pb-4 font-black text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 whitespace-nowrap">Status ↕</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-white/40">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Syncing transactions...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-white/40">No transactions found for this period.</td>
                            </tr>
                        ) : transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                <td className="py-4 pr-6">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white/90">{tx.name}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-white/40 mt-1">{tx.category}</p>
                                </td>
                                <td className="py-4 pr-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center bg-slate-100 dark:bg-white rounded flex-shrink-0 px-2 py-0.5 border border-slate-200 dark:border-transparent">
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
                                        <span className="text-sm text-slate-600 dark:text-white/60">{tx.accountName}</span>
                                    </div>
                                </td>
                                <td className="py-4 pr-6">
                                    <p className="text-sm font-medium text-slate-700 dark:text-white/80">{tx.date}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-white/40 mt-1">{tx.time}</p>
                                </td>
                                <td className="py-4 pr-6">
                                    <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatINR(Math.abs(tx.amount))}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusStyle(tx.status)}`}>
                                        {tx.status.replace('_', ' ')}
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
