import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Clock,
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';
import { getMyPayments, getMyContracts } from '../../../services/apiService';
import CustomDatePicker from '../../ui/CustomDatePicker';
import CustomDropdown from '../../ui/CustomDropdown';
import { formatINR } from '../../../utils/currencyUtils';

/* ─── Helpers ─────────────────────────────────────────────── */
const toInputDate = (d) => d.toISOString().split('T')[0];
const nDaysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toInputDate(d); };

const fmtINR = (v) => formatINR(v);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : '—';

const STATUS_CFG = {
  escrow: { cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', Icon: Clock },
  released: { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', Icon: CheckCircle2 },
  refunded: { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', Icon: RotateCcw },
  failed: { cls: 'bg-red-500/10 text-red-500 border-red-500/20', Icon: XCircle },
  pending: { cls: 'bg-orange-500/10 text-orange-500 border-orange-500/20', Icon: Clock },
  paid: { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();
  const cfg = STATUS_CFG[key] || {
    cls: 'bg-white/10 text-white/50 border-white/10',
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

const TransactionsPage = () => {
  const [rows, setRows] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: nDaysAgo(30),
    to: toInputDate(new Date()),
    status: '',
    contract_id: '',
    page: 1
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, contractsRes] = await Promise.all([
        getMyPayments(),
        getMyContracts()
      ]);
      setRows(paymentsRes?.data ?? []);
      setContracts(contractsRes?.data ?? []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const filteredRows = rows.filter(row => {
    const rowDate = new Date(row.created_at).toISOString().split('T')[0];
    const statusMatch = !filters.status || row.status?.toLowerCase() === filters.status.toLowerCase();
    const contractMatch = !filters.contract_id || row.contract_id === filters.contract_id;
    const dateMatch = rowDate >= filters.from && rowDate <= filters.to;
    return statusMatch && contractMatch && dateMatch;
  });

  const pages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paged = filteredRows.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);

  const STATUSES = ['', 'released', 'escrow', 'pending', 'refunded', 'failed'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight"
    >
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Transaction History</h1>
        <p className="text-light-text/60 text-xs sm:text-sm mt-1">All payment transactions across your contracts.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border border-border p-4 sm:p-5 rounded-xl sm:rounded-2xl">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-light-text/30 mb-2 ml-1">Start Date</label>
          <CustomDatePicker
            value={filters.from}
            onChange={(val) => handleFilterChange('from', val)}
            placeholder="Start Date"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-light-text/30 mb-2 ml-1">End Date</label>
          <CustomDatePicker
            value={filters.to}
            onChange={(val) => handleFilterChange('to', val)}
            placeholder="End Date"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-light-text/30 mb-2 ml-1">Status</label>
          <CustomDropdown
            options={[
              { label: 'All Statuses', value: '' },
              ...STATUSES.filter(s => s).map(s => ({
                label: s.charAt(0).toUpperCase() + s.slice(1),
                value: s
              }))
            ]}
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-light-text/30 mb-2 ml-1">Contract</label>
          <CustomDropdown
            options={[
              { label: 'All Active Contracts', value: '' },
              ...contracts.map(c => ({
                label: c.title || c.job?.title || `Contract #${String(c.id).slice(-4)}`,
                value: c.id
              }))
            ]}
            value={filters.contract_id}
            onChange={(val) => handleFilterChange('contract_id', val)}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="animate-pulse bg-transparent border border-border rounded-2xl h-20" />)}
        </div>
      ) : paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-transparent border border-border border-dashed rounded-2xl text-center">
          <Receipt className="w-12 h-12 text-light-text/10 mb-4" />
          <h3 className="text-lg font-semibold text-light-text/40 mb-2">No transactions found</h3>
          <p className="text-light-text/20 text-sm">Adjust your filters to broaden your search</p>
        </div>
      ) : (
        <>
          <div className="bg-transparent border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[120px_1fr_1fr_120px_140px] gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 text-[9px] sm:text-[10px] text-light-text/30 font-bold uppercase tracking-widest min-w-[500px]">
              <span>Date</span>
              <span>Project / Reference</span>
              <span>Payer</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-border/30 min-w-[500px]">
              {paged.map((tx, i) => {
                const sender = tx.sender_name || tx.payer_name || tx.client_name || '—';
                return (
                  <div key={tx.id ?? i} className="grid grid-cols-[120px_1fr_1fr_120px_140px] gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/5 transition-all items-center group">
                    <span className="text-light-text/40 text-xs font-medium">{fmtDate(tx.created_at ?? tx.date)}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-xs sm:text-sm font-semibold truncate group-hover:text-accent transition-colors tracking-tight">
                        {tx.contract_title || tx.contract?.title || tx.job?.title || `Contract #${String(tx.contract_id).slice(-4)}`}
                      </span>
                      <span className="text-light-text/20 text-[10px] font-medium tracking-widest uppercase mt-0.5">ID: {String(tx.id).toUpperCase().slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-medium shrink-0 border border-accent/20">
                        {sender[0]?.toUpperCase()}
                      </div>
                      <span className="text-light-text/60 text-xs sm:text-sm font-medium truncate tracking-tight">{sender}</span>
                    </div>
                    <span className="text-right text-white font-semibold text-sm sm:text-base">{fmtINR(tx.amount)}</span>
                    <div className="flex justify-end"><StatusBadge status={tx.status} /></div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-light-text/40 pt-8 border-t border-border">
              <span>{filteredRows.length} TRANSACTIONS</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1 px-4">
                  PAGE <span className="text-accent">{filters.page}</span> OF {pages}
                </div>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page >= pages}
                  className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default TransactionsPage;
