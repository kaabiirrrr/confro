import { useState, useEffect, useCallback } from 'react';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import { getTimeByFreelancer } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const toInputDate = (d) => d.toISOString().split('T')[0];

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toInputDate(d);
};

export default function TimeByFreelancerPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toInputDate(new Date()));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTimeByFreelancer({ from, to });
      setRows(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load time data');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const totalHours = rows.reduce((s, r) => s + (parseFloat(r.total_hours) || 0), 0);
  const totalAmount = rows.reduce((s, r) => s + (parseFloat(r.total_amount) || 0), 0);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Time by Freelancer</h1>
        <p className="text-white/50 text-sm mt-1">Summary of operational hours logged per contractor across all hourly engagements.</p>
      </div>

      {/* Filters Interface */}
      <div className="flex flex-wrap items-end gap-4 mb-8 p-5 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 min-w-[200px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Authentication Start</label>
          <input 
            type="date" 
            value={from} 
            onChange={e => setFrom(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium" 
          />
        </div>
        <div className="space-y-1.5 min-w-[200px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Authentication End</label>
          <input 
            type="date" 
            value={to} 
            onChange={e => setTo(e.target.value)}
            className="w-full bg-transparent border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/50 transition-all font-medium" 
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-24" />
            <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-24" />
          </div>
          {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-16" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 bg-transparent border border-white/10 rounded-2xl">
          <Users className="mx-auto text-white/20 mb-4" size={48} />
          <h3 className="text-white font-semibold text-lg">No Operational Data Found</h3>
          <p className="text-white/30 text-xs mt-2 max-w-xs mx-auto font-medium italic">
            Adjust the temporal parameters above to initialize the data stream for this reporting period.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Intelligence Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-transparent border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Aggregate Operational Hours</p>
              <div className="flex items-end gap-2">
                 <p className="text-white text-3xl font-black tracking-tighter leading-none">{totalHours.toFixed(1)}</p>
                 <span className="text-white/40 text-xs font-bold uppercase tracking-widest pb-0.5">Logged Hours</span>
              </div>
            </div>
            <div className="bg-transparent border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Net Financial Liability</p>
              <div className="flex items-end gap-2">
                 <p className="text-accent text-3xl font-black tracking-tighter leading-none">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 <span className="text-accent/40 text-xs font-bold uppercase tracking-widest pb-0.5">USD</span>
              </div>
            </div>
          </div>

          {/* Reporting Stream */}
          <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_40px] gap-4 px-8 py-4 border-b border-white/5 text-[9px] text-white/20 font-black uppercase tracking-widest">
              <span>Verified Freelancer</span>
              <span className="text-right">Unit Hours</span>
              <span className="text-right">Earnings Matrix</span>
              <span />
            </div>

            {rows.map(row => {
              const p = row.freelancer?.profiles || row.freelancer || {};
              const name = p.name || row.freelancer_name || 'Freelancer';
              const avatar = p.avatar_url;
              const isOpen = expanded.has(row.freelancer_id);

              return (
                <div key={row.freelancer_id} className="border-b border-white/5 last:border-0 group transition-all">
                  <button
                    onClick={() => toggle(row.freelancer_id)}
                    className="w-full grid grid-cols-1 md:grid-cols-[1fr_120px_140px_40px] gap-4 px-8 py-5 hover:bg-white/5 transition-all text-left items-center"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        {avatar
                          ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover bg-white/5" />
                          : <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xs">{name[0]?.toUpperCase()}</div>
                        }
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-primary rounded-full" />
                      </div>
                      <span className="font-bold text-white tracking-tight truncate group-hover:text-accent transition-colors">{name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-2 px-1">
                       <span className="md:hidden text-[9px] text-white/20 font-black uppercase">Hours</span>
                       <span className="text-right text-white font-bold">{parseFloat(row.total_hours || 0).toFixed(1)}h</span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-2 px-1">
                       <span className="md:hidden text-[9px] text-white/20 font-black uppercase">Earnings</span>
                       <span className="text-right text-accent font-black">${parseFloat(row.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <span className="hidden md:flex justify-center text-white/10 group-hover:text-white/40 transition-colors">
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                  </button>

                  {/* Expanded: Operational Breakdown */}
                  {isOpen && row.contracts?.length > 0 && (
                    <div className="px-8 pb-6 space-y-3 mt-1 scale-in animate-in fade-in duration-200">
                      <div className="text-[9px] text-white/10 font-black uppercase tracking-widest mb-2 pb-1 border-b border-white/5">Operational Breakdown</div>
                      {row.contracts.map(c => (
                        <div key={c.contract_id} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-5 py-3 hover:bg-white/10 transition-all shadow-inner">
                          <span className="text-white/60 text-[11px] font-bold uppercase tracking-tight truncate pr-4">{c.title || `Contract #${c.contract_id}`}</span>
                          <div className="flex gap-8 shrink-0 ml-4">
                            <div className="text-right">
                               <p className="text-white/20 text-[8px] font-black uppercase mb-0.5">Hours</p>
                               <span className="text-white font-bold text-xs">{parseFloat(c.total_hours || 0).toFixed(1)}h</span>
                            </div>
                            <div className="text-right">
                               <p className="text-accent/20 text-[8px] font-black uppercase mb-0.5">USD</p>
                               <span className="text-accent font-black text-xs">${parseFloat(c.total_amount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
