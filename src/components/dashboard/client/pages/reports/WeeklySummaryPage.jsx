import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Lock, RotateCcw, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getWeeklySummary } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';

const toInputDate = (d) => d.toISOString().split('T')[0];
const nWeeksAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n * 7); return toInputDate(d); };

const fmt$ = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STAT_CARDS = [
  { key: 'total_spent',     label: 'Total Spent',     image: '/Icons/icons8-rupee-64.png'      },
  { key: 'total_released',  label: 'Released',        image: '/Icons/icons8-growth-100.png'           },
  { key: 'total_in_escrow', label: 'In Escrow',       image: '/Icons/icons8-bag-100.png'       },
  { key: 'total_refunded',  label: 'Refunded',        image: '/Icons/icons8-refund-80.png' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-accent font-semibold">{fmt$(payload[0]?.value)}</p>
    </div>
  );
};

export default function WeeklySummaryPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(nWeeksAgo(4));
  const [to, setTo] = useState(toInputDate(new Date()));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWeeklySummary({ from, to });
      setSummary(res?.data ?? res);
    } catch (err) {
      toastApiError(err, 'Could not load weekly summary');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const chartData = (summary?.weeks ?? []).map(w => ({
    week: w.week_label ?? w.week_start?.slice(0, 10) ?? '—',
    spent: parseFloat(w.total_spent || 0),
  }));

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Weekly Financial Summary</h1>
        <p className="text-white/50 text-sm mt-1 font-medium">Overview of your spending activity over time.</p>
      </div>

      {/* Temporal Parameters & Presets */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 mb-10 p-4 sm:p-6 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 w-full sm:min-w-[160px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium" />
        </div>
        <div className="space-y-1.5 w-full sm:min-w-[160px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium" />
        </div>
        <div className="h-px w-full sm:h-10 sm:w-px bg-white/5 sm:mx-2" />
        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { label: '4 weeks', weeks: 4 },
            { label: '8 weeks', weeks: 8 },
            { label: '12 weeks', weeks: 12 },
          ].map(({ label, weeks }) => (
            <button key={weeks} onClick={() => { setFrom(nWeeksAgo(weeks)); setTo(toInputDate(new Date())); }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl transition-all active:scale-95">
              Last {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-32" />)}
          </div>
          <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-80" />
        </div>
      ) : !summary ? (
        <div className="text-center py-24 bg-transparent border border-white/10 rounded-2xl">
          <BarChart3 className="mx-auto text-white/10 mb-6" size={56} strokeWidth={1.5} />
          <h3 className="text-white font-bold text-xl tracking-tight">No Data Available</h3>
          <p className="text-white/30 text-xs mt-3 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest italic">
            Zero financial metrics found for this period. Try extending the date range.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
            {STAT_CARDS.map(({ key, label, image }) => (
              <div key={key} className="bg-transparent border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div className="mb-4">
                  <img src={image} alt={label} className="w-14 h-14" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1.5">{label}</p>
                  <p className={`text-3xl font-black tracking-tighter ${key === 'total_refunded' ? 'text-red-500' : 'text-white'}`}>{fmt$(summary[key])}</p>
                  {key === 'total_spent' && summary.transaction_count != null && (
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-2">{summary.transaction_count} transactions</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          {chartData.length > 0 ? (
            <div className="bg-transparent border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                 <BarChart3 size={20} className="text-accent" />
                 <div>
                   <p className="text-[10px] text-light-text/20 font-black uppercase tracking-widest leading-none mb-1">Analytics</p>
                   <h3 className="text-light-text font-bold text-sm uppercase tracking-wider">Weekly Spending</h3>
                 </div>
              </div>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={v => `₹${v}`} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-hover)', radius: 8 }} />
                    <Bar dataKey="spent" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={56} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center text-white/30 text-sm font-medium italic tracking-wider">
              No weekly breakdown available for this temporal range.
            </div>
          )}
        </>
      )}
    </div>
  );
}
