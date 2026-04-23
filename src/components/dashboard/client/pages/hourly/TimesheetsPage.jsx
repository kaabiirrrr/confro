import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { getTimesheets, updateTimesheetStatus, getMyContracts } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../../common/InfinityLoader';
import CustomDropdown from '../../../../ui/CustomDropdown';

const STATUS_CFG = {
  PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  APPROVED: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: CheckCircle2 },
  DISPUTED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: AlertCircle },
  PAID: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-white/10 text-white/50 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`}>
      <cfg.Icon size={11} />{status}
    </span>
  );
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [memoModal, setMemoModal] = useState(null); // { id, status }
  const [memo, setMemo] = useState('');
  const [filters, setFilters] = useState({ contract_id: '', week_start: '', status: '' });

  useEffect(() => {
    getMyContracts()
      .then(r => setContracts(r?.data ?? []))
      .catch(() => { });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await getTimesheets(clean);
      setTimesheets(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load timesheets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleAction = (id, status) => {
    if (status === 'DISPUTED') { setMemoModal({ id, status }); setMemo(''); return; }
    doUpdate(id, status, '');
  };

  const doUpdate = async (id, status, m) => {
    setActionId(id);
    try {
      await updateTimesheetStatus(id, status, m);
      toast.success(status === 'APPROVED' ? 'Timesheet approved' : 'Timesheet disputed');
      setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      toastApiError(err, 'Failed to update timesheet');
    } finally {
      setActionId(null);
      setMemoModal(null);
    }
  };

  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Timesheets</h1>
        <p className="text-white/50 text-sm mt-1">Review and approve weekly timesheets from your active freelancers.</p>
      </div>

      {/* Filters Interface */}
      <div className="flex flex-wrap items-end gap-4 mb-8 p-5 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 flex-1 min-w-[240px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Select Contract</label>
          <CustomDropdown
            options={[
              { label: 'All active contracts', value: '' },
              ...contracts.map(c => ({ label: c.title || `Contract #${c.id}`, value: c.id }))
            ]}
            value={filters.contract_id}
            onChange={val => setFilters(p => ({ ...p, contract_id: val }))}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5 min-w-[200px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Week Start Date</label>
          <input
            type="date"
            value={filters.week_start}
            onChange={e => setFilters(p => ({ ...p, week_start: e.target.value }))}
            className="w-full bg-transparent border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>

        <div className="space-y-1.5 min-w-[180px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Status Protocol</label>
          <CustomDropdown
            options={[
              { label: 'All status logs', value: '' },
              ...['PENDING', 'APPROVED', 'DISPUTED', 'PAID'].map(s => ({ label: s, value: s }))
            ]}
            value={filters.status}
            onChange={val => setFilters(p => ({ ...p, status: val }))}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-28" />)}
        </div>
      ) : timesheets.length === 0 ? (
        <div className="text-center py-20 bg-transparent border border-white/10 rounded-2xl">
          <Clock className="mx-auto text-white/20 mb-4" size={48} />
          <h3 className="text-white font-semibold text-lg">No Timesheets Found</h3>
          <p className="text-white/30 text-xs mt-2 max-w-xs mx-auto font-medium italic">
            Timesheets appear here once your authenticated freelancers log their operational hours.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {timesheets.map(ts => {
            const freelancer = ts.freelancer?.profiles || ts.freelancer || {};
            const name = freelancer.name || 'Freelancer';
            const avatar = freelancer.avatar_url;
            const contractTitle = ts.contract?.title || `Contract #${ts.contract_id}`;
            const isPending = ts.status === 'PENDING';

            return (
              <div key={ts.id} className="group bg-transparent border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                  {/* Entity Information */}
                  <div className="flex items-center gap-4 xl:w-1/4 shrink-0">
                    <div className="relative">
                      {avatar
                        ? <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover shadow-inner" />
                        : <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black text-sm">{name[0]?.toUpperCase()}</div>
                      }
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white tracking-tight truncate">{name}</p>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">{contractTitle}</p>
                    </div>
                  </div>

                  {/* Temporal Data */}
                  <div className="flex-1">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1.5">Operational Period</p>
                    <div className="flex items-center gap-2">
                       <span className="text-white font-bold text-sm">{fmt(ts.week_start)}</span>
                       <span className="text-white/10 text-xs">—</span>
                       <span className="text-white font-bold text-sm">{fmt(ts.week_end)}</span>
                    </div>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="flex gap-10 shrink-0 px-8 border-x border-white/5">
                    <div className="text-center">
                      <p className="text-white font-black text-lg leading-none">{ts.total_hours ?? '0.0'}</p>
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1.5">Total Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-black text-lg leading-none">${parseFloat(ts.total_amount || 0).toFixed(2)}</p>
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1.5">Net Amount</p>
                    </div>
                  </div>

                  {/* Status & Protocol Controls */}
                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={ts.status} />

                    {isPending && (
                      <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                        <button
                          onClick={() => handleAction(ts.id, 'APPROVED')}
                          disabled={actionId === ts.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {actionId === ts.id ? <InfinityLoader size={20} /> : <CheckCircle2 size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(ts.id, 'DISPUTED')}
                          disabled={actionId === ts.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <AlertCircle size={14} />
                          Dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-entry Stream (Optional) */}
                {ts.entries?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {ts.entries.map(e => (
                      <div key={e.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">{fmt(e.work_date)}</p>
                          <p className="text-accent font-black text-xs">{e.hours}h</p>
                        </div>
                        {e.description && <p className="text-white/60 text-[11px] font-medium leading-relaxed truncate" title={e.description}>{e.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute Intervention Interface */}
      {memoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 px-2">
          <div className="bg-primary/95 border border-white/10 rounded-2xl w-full max-w-sm p-8 shadow-3xl transform animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-white font-bold text-xl tracking-tight mb-2">Initialize Dispute</h3>
            <p className="text-white/40 text-xs font-medium mb-6 leading-relaxed">Please provide a technical justification for the dispute log. This will be visible to the freelancer. </p>
            
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={4}
              placeholder="Operational discrepancies..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 resize-none mb-6 placeholder-white/20 transition-all"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setMemoModal(null)} 
                className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => doUpdate(memoModal.id, 'DISPUTED', memo)}
                disabled={!!actionId}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionId && <InfinityLoader size={20} />}
                Confirm Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
