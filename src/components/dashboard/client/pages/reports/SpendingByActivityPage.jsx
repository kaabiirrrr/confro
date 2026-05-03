import { useState, useEffect, useCallback } from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getSpendingByActivity, getMyContracts } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';

const toInputDate = (d) => d.toISOString().split('T')[0];
const nDaysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toInputDate(d); };
const fmt$ = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Palette that works on dark backgrounds
const COLORS = ['#38bdf8', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#fb923c', '#e879f9'];

const TYPE_BADGE = {
  HOURLY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FIXED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-medium mb-0.5">{d.label ?? d.key}</p>
      <p className="text-accent">{fmt$(d.total)}</p>
      <p className="text-white/40 text-xs">{d.count} transaction{d.count !== 1 ? 's' : ''} · {Number(d.percentage || 0).toFixed(1)}%</p>
    </div>
  );
};

const RANGE_PRESETS = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

export default function SpendingByActivityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(nDaysAgo(90));
  const [to, setTo] = useState(toInputDate(new Date()));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSpendingByActivity({ from, to });
      setData(res?.data ?? res);
    } catch (err) {
      toastApiError(err, 'Could not load spending data');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const breakdown = data?.breakdown ?? [];
  const byContract = data?.by_contract ?? [];
  const grandTotal = data?.grand_total ?? 0;

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Spending Analysis by Activity</h1>
        <p className="text-white/50 text-sm mt-1 font-medium">Comprehensive breakdown of organizational capital allocation and operational expenditure.</p>
      </div>

      {/* Temporal Parameters & Presets */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-5 mb-10 p-4 sm:p-6 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 w-full sm:w-auto">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Temporal Origin</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium"
          />
        </div>
        <div className="space-y-1.5 w-full sm:w-auto">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Temporal Termination</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium"
          />
        </div>
        <div className="h-px w-full sm:h-10 sm:w-px bg-white/5 sm:mx-2" />
        <div className="flex gap-2 w-full sm:w-auto">
          {RANGE_PRESETS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => { setFrom(nDaysAgo(days)); setTo(toInputDate(new Date())); }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl transition-all active:scale-95"
            >
              Last {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-24 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-80" />
            <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-80" />
          </div>
        </div>
      ) : !data || (breakdown.length === 0 && byContract.length === 0) ? (
        <div className="text-center py-24 bg-transparent border border-white/10 rounded-2xl">
          <PieIcon className="mx-auto text-white/10 mb-6" size={56} strokeWidth={1.5} />
          <h3 className="text-white font-bold text-xl tracking-tight">No Expenditure Detected</h3>
          <p className="text-white/30 text-xs mt-3 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest italic">
            Zero transaction events identified within the current temporal parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Aggregate Expenditure Card */}
          <div className="bg-transparent border border-white/10 rounded-2xl p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Total Organizational Expenditure</p>
              <h3 className="text-white font-bold text-sm tracking-wide opacity-60">Aggregate Capital Distribution</h3>
            </div>
            <div className="text-right">
              <span className="text-accent text-3xl md:text-4xl font-black tracking-tighter leading-none">{fmt$(grandTotal)}</span>
              <p className="text-white/10 text-[8px] font-black uppercase mb-0.5 tracking-widest">Validated Assets (INR)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Visual Analytics Segment */}
            {breakdown.length > 0 && (
              <div className="bg-transparent border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <PieIcon size={20} className="text-accent" />
                  <div>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Analytics</p>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Spending Distribution</h3>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {/* High-Fidelity Donut Chart */}
                  <div className="w-full h-80 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdown}
                          dataKey="total"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={4}
                          stroke="none"
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {breakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Stat */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Total</p>
                      <p className="text-white text-xl font-black tracking-tighter">{fmt$(grandTotal)}</p>
                    </div>
                  </div>

                  {/* Enhanced Legend System */}
                  <div className="w-full mt-10 space-y-3.5">
                    {breakdown.map((item, i) => (
                      <div key={item.key ?? i} className="group flex items-center justify-between gap-4 p-3.5 bg-transparent border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg shadow-black/10" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-white/60 text-xs font-bold uppercase tracking-tight truncate pr-4">{item.label ?? item.key}</span>
                        </div>
                        <div className="flex items-center gap-5 shrink-0 px-1">
                          <div className="text-right">
                            <p className="text-white/10 text-[8px] font-black uppercase mb-0.5">Ratio</p>
                            <span className="text-white/40 text-[11px] font-black">{Number(item.percentage || 0).toFixed(1)}%</span>
                          </div>
                          <div className="text-right">
                            <p className="text-accent/20 text-[8px] font-black uppercase mb-0.5">Capital</p>
                            <span className="text-white font-black text-xs group-hover:text-accent transition-colors">{fmt$(item.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Contract Breakdown Table */}
            {byContract.length > 0 && (
              <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden self-stretch flex flex-col">
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-accent/40 rounded-full" />
                    <p className="text-white font-bold text-sm uppercase tracking-[0.1em]">Top Strategic Allocations</p>
                  </div>
                  <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">{byContract.length} Identified Active Nodes</span>
                </div>

                <div className="flex-1 overflow-auto">
                  {/* Desktop header */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_80px] gap-4 px-8 py-4 border-b border-white/10 text-[9px] text-white/20 font-black uppercase tracking-widest sticky top-0 bg-primary/95 backdrop-blur-md">
                    <span>Contract</span>
                    <span>Type</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Events</span>
                  </div>
                  {byContract.map((c, i) => {
                    const contractLabel = c.job_title || c.title || c.contract?.title || `Contract #${c.contract_id?.slice(-8) || 'N/A'}`;
                    return (
                      <div key={c.contract_id ?? i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group">
                        {/* Mobile card */}
                        <div className="sm:hidden flex flex-col gap-2 px-5 py-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white text-xs font-bold truncate group-hover:text-accent transition-colors">{contractLabel}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase tracking-wider shrink-0 ${TYPE_BADGE[c.project_type] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
                              {c.project_type ?? '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{c.transaction_count ?? 0} event{c.transaction_count !== 1 ? 's' : ''}</span>
                            <span className="text-accent font-black text-sm">{fmt$(c.total_amount)}</span>
                          </div>
                        </div>
                        {/* Desktop row */}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_80px] gap-4 px-8 py-5 items-center">
                          <div className="min-w-0 pr-4">
                            <span className="text-white text-xs font-bold truncate block group-hover:text-accent transition-colors">{contractLabel}</span>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter block mt-1">ID: {c.contract_id?.slice(-8) || 'N/A'}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase tracking-wider inline-block ${TYPE_BADGE[c.project_type] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
                              {c.project_type ?? '—'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-accent font-black text-xs">{fmt$(c.total_amount)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white/40 text-[11px] font-bold tracking-tight">{c.transaction_count ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
