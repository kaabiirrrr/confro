import { useState, useEffect, useCallback } from 'react';
import { Receipt, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RotateCcw, XCircle, Clock } from 'lucide-react';
import { getTransactions, getMyContracts } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import CustomDropdown from '../../../../ui/CustomDropdown';

const toInputDate = (d) => d.toISOString().split('T')[0];
const nDaysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toInputDate(d); };
const fmt$ = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS_CFG = {
  escrow:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  released: { cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  refunded: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      Icon: RotateCcw },
  failed:   { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const cfg = STATUS_CFG[s] || { cls: 'bg-white/10 text-white/50 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${cfg.cls} capitalize`}>
      <cfg.Icon size={11} />{status}
    </span>
  );
};

const STATUSES = ['', 'escrow', 'released', 'refunded', 'failed'];
const LIMIT = 20;

export default function TransactionsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: nDaysAgo(30), to: toInputDate(new Date()), status: '', contract_id: '', page: 1,
  });

  useEffect(() => {
    getMyContracts().then(r => setContracts(r?.data ?? [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: LIMIT };
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
      const res = await getTransactions(clean);
      setRows(res?.data ?? []);
      setPagination(res?.pagination ?? { total: 0, page: 1, pages: 1 });
    } catch (err) {
      toastApiError(err, 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key) => (e) => setFilters(p => ({ ...p, [key]: e.target.value, page: 1 }));
  const goPage = (p) => setFilters(prev => ({ ...prev, page: p }));

  const selectCls = "bg-transparent border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium min-w-[160px]";

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Transaction History</h1>
        <p className="text-white/50 text-sm mt-1 font-medium">All payment transactions across your contracts.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-5 mb-10 p-4 sm:p-6 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 w-full sm:flex-1 sm:min-w-[160px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">From</label>
          <input type="date" value={filters.from} onChange={setFilter('from')} className={`w-full ${selectCls}`} />
        </div>
        <div className="space-y-1.5 w-full sm:flex-1 sm:min-w-[160px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">To</label>
          <input type="date" value={filters.to} onChange={setFilter('to')} className={`w-full ${selectCls}`} />
        </div>
        <div className="space-y-1.5 w-full sm:flex-1 sm:min-w-[160px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Status</label>
          <CustomDropdown
            options={STATUSES.map(s => ({ label: s || 'All statuses', value: s }))}
            value={filters.status}
            onChange={(val) => setFilters(p => ({ ...p, status: val, page: 1 }))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5 w-full sm:flex-[2] sm:min-w-[200px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Contract</label>
          <CustomDropdown
            options={[
              { label: 'All contracts', value: '' },
              ...contracts.map(c => ({ label: c.job?.title || c.title || `Contract #${c.id.substring(0, 8)}`, value: c.id }))
            ]}
            value={filters.contract_id}
            onChange={(val) => setFilters(p => ({ ...p, contract_id: val, page: 1 }))}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-16 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-transparent border border-white/10 rounded-2xl">
          <Receipt className="mx-auto text-white/10 mb-6" size={56} strokeWidth={1.5} />
          <h3 className="text-white font-bold text-xl tracking-tight">No transactions found</h3>
          <p className="text-white/30 text-xs mt-3 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest italic">
            Try adjusting the filters to see results.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden mb-4">
            {/* Desktop Header - hidden on mobile */}
            <div className="hidden sm:grid sm:grid-cols-[140px_1fr_1fr_100px_120px] gap-4 px-8 py-5 border-b border-white/10 text-[9px] text-white/20 font-black uppercase tracking-widest">
              <span>Date</span>
              <span>Contract</span>
              <span>Counterparty</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>

            {rows.map((tx, i) => {
              const party = tx.counterparty?.profiles || tx.counterparty || {};
              const partyName = party.name || tx.counterparty_name || '—';
              const partyAvatar = party.avatar_url;
              const contractLabel = tx.contract_title || tx.contract?.title || tx.job?.title || `Contract #${tx.contract_id?.substring(0, 8) ?? '—'}`;

              return (
                <div key={tx.id ?? i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition group">
                  {/* Mobile card layout */}
                  <div className="sm:hidden flex flex-col gap-2 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{fmtDate(tx.created_at ?? tx.date)}</span>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="text-white text-sm font-bold truncate group-hover:text-accent transition-colors">{contractLabel}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {partyAvatar
                          ? <img src={partyAvatar} alt={partyName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          : <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">{partyName[0]?.toUpperCase()}</div>
                        }
                        <span className="text-white/60 text-xs truncate">{partyName}</span>
                      </div>
                      <span className="text-accent font-black text-sm shrink-0">{fmt$(tx.amount)}</span>
                    </div>
                  </div>
                  {/* Desktop row layout */}
                  <div className="hidden sm:grid sm:grid-cols-[140px_1fr_1fr_100px_120px] gap-4 px-8 py-5 items-center">
                    <span className="text-white/50 text-sm font-medium">{fmtDate(tx.created_at ?? tx.date)}</span>
                    <span className="text-white text-sm font-bold truncate block group-hover:text-accent transition-colors">{contractLabel}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      {partyAvatar
                        ? <img src={partyAvatar} alt={partyName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">{partyName[0]?.toUpperCase()}</div>
                      }
                      <span className="text-white/80 font-medium text-sm truncate">{partyName}</span>
                    </div>
                    <span className="text-right text-accent font-black text-sm">{fmt$(tx.amount)}</span>
                    <div className="flex justify-end"><StatusBadge status={tx.status} /></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>{pagination.total} transaction{pagination.total !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-white/60">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => goPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
