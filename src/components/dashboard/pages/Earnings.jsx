import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle2, RotateCcw, XCircle, Clock, Receipt, IndianRupee
} from 'lucide-react';
import { getMyPayments } from '../../../services/apiService';
import { formatINR } from '../../../utils/currencyUtils';
import CustomDropdown from '../../ui/CustomDropdown';

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtINR = (v) => formatINR(v);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '—';

const STATUS_CFG = {
  escrow: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  released: { cls: 'bg-green-500/10  text-green-400  border-green-500/20', Icon: CheckCircle2 },
  refunded: { cls: 'bg-blue-500/10   text-blue-400   border-blue-500/20', Icon: RotateCcw },
  failed: { cls: 'bg-red-500/10    text-red-400    border-red-500/20', Icon: XCircle },
  pending: { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20', Icon: Clock },
  paid: { cls: 'bg-green-500/10  text-green-400  border-green-500/20', Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();
  const cfg = STATUS_CFG[key] || {
    cls: 'bg-white/5 text-light-text/40 border-white/10',
    Icon: AlertCircle,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}
    >
      <cfg.Icon size={12} />
      {status || '—'}
    </span>
  );
};

const PAGE_SIZE = 10;

/* ─── Main Component ──────────────────────────────────────── */
const Earnings = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyPayments();
      setRows(res?.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Derived stats */
  const available = rows
    .filter((r) => r.status?.toLowerCase() === 'released')
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const pending = rows
    .filter((r) => ['escrow', 'pending'].includes(r.status?.toLowerCase()))
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const inReview = rows
    .filter((r) => r.status?.toLowerCase() === 'in_review')
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const total = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  /* Filtered + paginated rows */
  const filtered = statusFilter
    ? rows.filter((r) => r.status?.toLowerCase() === statusFilter)
    : rows;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STATUSES = ['', 'released', 'escrow', 'pending', 'refunded', 'failed'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-12 gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">My Earnings</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">Monitor your financial overview and withdrawal history.</p>
        </div>
        <button onClick={() => navigate('/freelancer/withdraw')}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-border text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/60 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all shadow-sm flex-shrink-0">
          <img src="/Icons/credit.png" alt="withdraw" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain opacity-60" />
          <span className="hidden sm:inline">WITHDRAW FUNDS</span>
          <span className="sm:hidden">WITHDRAW</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-20">
        {[
          { label: 'Available Now', value: fmtINR(available), icon: '/Icons/credit.png' },
          { label: 'Pending Payout', value: fmtINR(pending), icon: '/Icons/growth.png' },
          { label: 'In Review', value: fmtINR(inReview), icon: '/Icons/progress.png' },
          { label: 'Total Earned', value: fmtINR(total), icon: '/Icons/rupee.png' }
        ].map((stat, i) => (
          <div key={i} className="border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 hover:border-accent/30 transition-all group shadow-sm bg-transparent">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src={stat.icon} alt={stat.label} className="w-8 h-8 sm:w-12 sm:h-12 object-contain opacity-80" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/30 mb-1">{stat.label}</p>
              <h4 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1">
                <IndianRupee size={14} className="text-white/40 sm:hidden" />
                <IndianRupee size={18} className="text-white/40 hidden sm:block" />
                {stat.value.replace('₹', '')}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
            <button className="text-accent relative pb-4">
              RECENT ACTIVITY
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
            </button>
          </div>
          <div className="flex items-center gap-3 min-w-[140px] sm:min-w-[180px]">
            <CustomDropdown
              options={STATUSES.map(s => ({
                label: s === '' ? 'ALL STATUSES' : s.toUpperCase(),
                value: s
              }))}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              placeholder="ALL STATUSES"
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-transparent border border-border rounded-2xl h-24" />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-20 bg-transparent border border-border border-dashed rounded-2xl">
            <div className="mb-4 text-light-text/10 flex justify-center">
              <Receipt size={48} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-semibold text-light-text/40 mb-1">No transactions found</h3>
            <p className="text-xs text-light-text/20 font-medium">Try adjusting your filter settings</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-transparent border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
              <div className="grid grid-cols-[1fr_1fr_120px_130px_160px] gap-4 px-4 sm:px-8 py-4 sm:py-5 border-b border-border/50 text-[9px] sm:text-[10px] font-bold text-light-text/30 uppercase tracking-widest min-w-[600px]">
                <span>Sender / Note</span>
                <span>Payment Method</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Status</span>
                <span className="text-right">Date</span>
              </div>
              <div className="divide-y divide-border/30 min-w-[600px]">
                {paged.map((tx, i) => {
                  const sender = tx.sender_name || tx.payer_name || tx.client?.name || '—';
                  const upiId = tx.upi_id || tx.upi || 'Wire Transfer';
                  return (
                    <div key={tx.id ?? i} className="grid grid-cols-[1fr_1fr_120px_130px_160px] gap-4 px-4 sm:px-8 py-4 sm:py-6 hover:bg-primary/30 transition-colors items-center group cursor-default">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent text-sm font-black shrink-0">
                          {sender[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-light-text font-semibold truncate group-hover:text-accent transition-colors leading-none mb-1.5 text-xs sm:text-sm">{sender}</span>
                          <span className="text-light-text/20 text-[9px] font-mono uppercase tracking-tighter">ID: {String(tx.id || i).slice(-8)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-light-text/60 text-xs font-bold uppercase tracking-tight">{upiId}</span>
                        <span className="text-light-text/10 text-[9px] font-black uppercase tracking-widest leading-none mt-1">Direct Deposit</span>
                      </div>
                      <span className="text-right text-white font-bold text-sm sm:text-lg tracking-tight flex items-center justify-end gap-0.5">
                        <IndianRupee size={12} className="text-white/40" />
                        {fmtINR(tx.amount).replace('₹', '')}
                      </span>
                      <div className="flex justify-end"><StatusBadge status={tx.status} /></div>
                      <span className="text-right text-light-text/30 text-[9px] sm:text-[10px] font-bold font-mono tracking-tighter uppercase whitespace-nowrap">
                        {fmtDate(tx.created_at ?? tx.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-light-text/40 pt-8 border-t border-border">
                <span>{filtered.length} TRANSACTIONS</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-white/5 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1 px-4">
                    PAGE <span className="text-accent">{page}</span> OF {pages}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                    className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-white/5 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Earnings;
