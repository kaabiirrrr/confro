import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Image } from 'lucide-react';
import { getWorkDiary, logWorkDiary, deleteWorkDiaryEntry, getMyContracts } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../../context/AuthContext';
import InfinityLoader from '../../../../common/InfinityLoader';
import CustomDropdown from '../../../../ui/CustomDropdown';
import CustomDatePicker from '../../../../ui/CustomDatePicker';

const today = () => new Date().toISOString().split('T')[0];
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

const EMPTY_FORM = { work_date: today(), hours: '', description: '', screenshot_url: '' };

export default function WorkDiariesPage() {
  const { role } = useAuth();
  const isFreelancer = role === 'FREELANCER';

  const [entries, setEntries] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ contract_id: '', week_start: '' });

  useEffect(() => {
    getMyContracts()
      .then(r => setContracts(r?.data ?? []))
      .catch(() => { });
  }, []);

  const load = useCallback(async () => {
    if (!filters.contract_id) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await getWorkDiary(clean);
      setEntries(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load work diary');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.work_date) e.work_date = 'Required';
    if (!form.hours || isNaN(parseFloat(form.hours)) || parseFloat(form.hours) <= 0) e.hours = 'Enter valid hours';
    if (!form.description.trim()) e.description = 'Required';
    if (!filters.contract_id) e.contract_id = 'Select a contract first';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        contract_id: filters.contract_id,
        work_date: form.work_date,
        hours: parseFloat(form.hours),
        description: form.description.trim(),
        ...(form.screenshot_url ? { screenshot_url: form.screenshot_url } : {}),
      };
      const res = await logWorkDiary(payload);
      toast.success('Time logged');
      setEntries(prev => [res?.data ?? res, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      toastApiError(err, 'Failed to log time');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteWorkDiaryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (err) {
      toastApiError(err, 'Failed to delete entry');
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls = "w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all";

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6 pb-12 space-y-6">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Work Diaries</h1>
          <p className="text-white/50 text-[11px] sm:text-sm mt-1 max-w-xl">Review and approve daily work logs for hourly contracts.</p>
        </div>
        {isFreelancer && (
          <button
            onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Plus size={18} />
            LOG TIME
          </button>
        )}
      </div>

      {/* Filters Interface */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4 mb-8 p-3 sm:p-4 bg-transparent border border-white/10 rounded-2xl">
        <div className="space-y-1.5 w-full sm:flex-1 sm:min-w-[240px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Select Contract</label>
          <CustomDropdown
            options={[
              { label: 'All active contracts', value: '' },
              ...contracts.map(c => ({ label: c.job?.title || c.title || `Contract #${c.id.substring(0, 8)}`, value: c.id }))
            ]}
            value={filters.contract_id}
            onChange={val => setFilters(p => ({ ...p, contract_id: val }))}
            className="w-full"
          />
          {errors.contract_id && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.contract_id}</p>}
        </div>
        
        <div className="space-y-1.5 w-full sm:min-w-[200px]">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Filter By Date</label>
          <CustomDatePicker value={filters.week_start} onChange={(val) => setFilters(p => ({ ...p, week_start: val }))} />
        </div>

      </div>

      {/* Log Time Command Console */}
      {isFreelancer && showForm && (
        <form onSubmit={handleSubmit} className="bg-transparent border border-white/10 rounded-2xl p-6 mb-8 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Plus size={18} />
            </div>
            <h3 className="font-semibold text-white uppercase text-xs tracking-widest">Initialization Log</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Logging Date</label>
              <input type="date" value={form.work_date} onChange={set('work_date')} className={inputCls} />
              {errors.work_date && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.work_date}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Unit Hours</label>
              <input type="number" min="0.25" step="0.25" max="24" value={form.hours} onChange={set('hours')} placeholder="0.00" className={inputCls} />
              {errors.hours && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.hours}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Operational Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the mission objectives..." className={`${inputCls} resize-none`} />
            {errors.description && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Evidence Link (URL)</label>
            <input value={form.screenshot_url} onChange={set('screenshot_url')} placeholder="https://..." className={inputCls} />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-full border border-white/5 bg-white/5 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95">Discard</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <InfinityLoader/> : 'Confirm Log Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Main Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-24" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-transparent rounded-2xl">
          <BookOpen className="mx-auto text-white/20 mb-4" size={48} />
          <h3 className="text-white font-semibold text-lg">No Activity Logged</h3>
          <p className="text-white/30 text-xs mt-2 max-w-xs mx-auto font-medium">
            {!filters.contract_id
              ? 'Select a designated contract above to initialize and view the work diary stream.'
              : isFreelancer ? 'You have not authenticated any work hours for this period. Log your first session.' : 'No operational logs have been verified for this contractor.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="group bg-transparent border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex items-center gap-6">
              {/* Chronological Token */}
              <div className="w-16 h-16 shrink-0 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl group-hover:bg-accent/5 group-hover:border-accent/20 transition-all">
                <p className="text-white font-black text-xl leading-none">{entry.work_date ? new Date(entry.work_date).toLocaleDateString('en-US', { day: 'numeric' }) : '—'}</p>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">{entry.work_date ? new Date(entry.work_date).toLocaleDateString('en-US', { month: 'short' }) : ''}</p>
              </div>

              {/* Data Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                    {entry.hours} HOURS
                  </span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{fmt(entry.work_date)}</span>
                </div>
                <p className="text-white/70 text-sm font-medium leading-relaxed truncate md:whitespace-normal">{entry.description}</p>
                {entry.screenshot_url && (
                  <a href={entry.screenshot_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent text-[10px] font-black uppercase tracking-widest mt-3 hover:text-accent/80 transition-colors">
                    <Image size={12} /> View Evidence
                  </a>
                )}
              </div>

              {/* Secure Disposal */}
              {isFreelancer && (
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all disabled:opacity-50 shrink-0 active:scale-90"
                  title="Dispose Log Entry"
                >
                  {deletingId === entry.id ? <InfinityLoader/> : <Trash2 size={18} />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
