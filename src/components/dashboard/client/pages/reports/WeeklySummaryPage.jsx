import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Lock, RotateCcw, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getWeeklySummary } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import CustomDatePicker from '../../../../ui/CustomDatePicker';

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
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Weekly Financial Summary</h1>
        <p className="text-white/40 text-[11px] sm:text-sm mt-1 font-medium leading-relaxed max-w-2xl">Overview of your spending activity and transaction velocity over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 p-3 sm:p-4 bg-transparent border border-white/10 rounded-[24px] items-end">
        <div className="lg:col-span-3 space-y-1.5">
          <label className="block text-[9px] text-white/20 font-black uppercase tracking-[0.25em] ml-1">Temporal Start</label>
          <CustomDatePicker value={from} onChange={setFrom} />
        </div>
        <div className="lg:col-span-3 space-y-1.5">
          <label className="block text-[9px] text-white/20 font-black uppercase tracking-[0.25em] ml-1">Temporal End</label>
          <CustomDatePicker value={to} onChange={setTo} />
        </div>
        <div className="lg:col-span-6 flex gap-2 w-full overflow-x-auto no-scrollbar pb-1">
          {[
            { label: '4 weeks', weeks: 4 },
            { label: '8 weeks', weeks: 8 },
            { label: '12 weeks', weeks: 12 },
          ].map(({ label, weeks }) => (
            <button key={weeks} onClick={() => { setFrom(nWeeksAgo(weeks)); setTo(toInputDate(new Date())); }}
              className="flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-white/5 text-white/30 hover:text-white hover:bg-white/5 hover:border-white/10 rounded-full transition-all active:scale-95">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries({
              total_spent: 'Aggregate Outflow',
              transaction_count: 'Velocity',
              total_escrow: 'Active Escrow',
              total_refunded: 'Recovered'
            }).map(([key, label]) => (
              <div key={key} className="bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-accent/10 transition-all duration-700" />
                <div className="relative z-10">
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
                  <p className={`text-2xl sm:text-3xl font-black tracking-tighter ${key === 'total_refunded' && summary[key] > 0 ? 'text-red-500' : 'text-white'}`}>
                    {key === 'transaction_count' ? summary[key] : fmt$(summary[key])}
                  </p>
                  {key === 'total_spent' && summary.transaction_count != null && (
                    <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-2">Historical Events</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          {chartData.length > 0 ? (
            <div className="bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />
              <div className="flex items-center gap-3 mb-8 relative z-10">
                 <BarChart3 size={20} className="text-accent" />
                 <div>
                   <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Temporal Analytics</p>
                   <h3 className="text-white font-bold text-sm uppercase tracking-wider">Weekly Capital Velocity</h3>
                 </div>
              </div>
              <div className="w-full h-[320px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={v => `₹${v}`} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} />
                    <Bar dataKey="spent" fill="var(--color-accent)" radius={[6, 6, 0, 0]} maxBarSize={56} animationDuration={1500} />
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
