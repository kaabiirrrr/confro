import { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, TrendingUp, Download, Loader2, Filter } from 'lucide-react';
import { formatINR } from '../../../../utils/currencyUtils';
import { getMyPayments } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Tabs from '../../../ui/Tabs';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';

const STATUS_BADGE = {
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const res = await getMyPayments();
      if (res.success) setPayments(res.data || []);
    } catch (err) {
      // Gracefully handle if payment history endpoint doesn't exist yet
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = activeTab === 'all' ? payments : payments.filter(p => (p.status || '').toUpperCase() === activeTab);
  const totalSpent = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const completedPayments = payments.filter(p => p.status === 'COMPLETED' || p.status === 'completed');
  const fmt$ = (v) => formatINR(v);
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const formatAmount = a => formatINR(a);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PENDING', label: 'Pending' },
  ];

  return (
    <div className="max-w-[1630px] mx-auto py-6 sm:py-8 text-light-text font-sans tracking-tight animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Payments</h1>
          <p className="text-sm sm:text-base text-light-text/70">Your payment history and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary/70 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-secondary/70 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm group hover:border-accent/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <IndianRupee size={24} className="text-accent" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/40 mb-1">Total Spent</p>
          <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-3xl font-black text-white">{formatAmount(totalSpent)}</h3>
          </div>
        </div>

        <div className="bg-secondary/70 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm group hover:border-blue-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CreditCard size={24} className="text-blue-400" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/40 mb-1">Total Transactions</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl sm:text-3xl font-black text-white">{payments.length}</h3>
          </div>
        </div>

        <div className="bg-secondary/70 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm group hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-emerald-400" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/40 mb-1">Completed</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl sm:text-3xl font-black text-white">{completedPayments.length}</h3>
          </div>
        </div>
      </div>

      {/* TABS - Standardized Pill Style */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-8">
        <div className="flex gap-2 bg-secondary/70 p-1 rounded-full border border-white/10 backdrop-blur-sm overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-6 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-accent text-primary shadow-lg shadow-accent/10"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-secondary/70 border border-white/10 rounded-2xl h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-secondary/70 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
          <CreditCard className="w-12 h-12 text-light-text/20 mb-6" />
          <h3 className="text-lg font-semibold text-white mb-2">No payments found</h3>
          <p className="text-light-text/50 text-base mb-8 max-w-md mx-auto">
            Payments will appear here when contracts are funded and milestones are released.
          </p>
        </div>
      ) : (
        <div className="bg-secondary/70 border border-white/10 rounded-2xl overflow-hidden shadow-sm backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-light-text/40">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-light-text/40">Recipient</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-light-text/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-light-text/40 text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-light-text/40 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(payment => {
                  const badge = STATUS_BADGE[(payment.status || '').toUpperCase()] || 'bg-white/5 text-white/40 border-white/10';
                  return (
                    <tr key={payment.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">{payment.description || 'Project Payment'}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mt-1">ID: {payment.id?.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold">
                            {(payment.freelancer?.name || payment.receiver?.name || '?').charAt(0)}
                          </div>
                          <span className="text-sm text-light-text/70">{payment.freelancer?.name || payment.receiver?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-light-text/50">{formatDate(payment.created_at)}</td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-white font-semibold text-base">
                          {formatINR(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-block min-w-[100px] ${badge}`}>
                          {(payment.status || 'processing').toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};



export default Payments;