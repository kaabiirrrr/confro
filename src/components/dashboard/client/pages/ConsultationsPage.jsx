import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, BadgeCheck, Clock, CheckCircle2, XCircle,
  AlertCircle, X, Plus, Search, ShieldCheck
} from 'lucide-react';
import {
  getConsultationExperts, getMyConsultations, bookConsultation, updateConsultationStatus,
} from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../common/InfinityLoader';
import CustomDropdown from '../../../ui/CustomDropdown';

const STATUS_CFG = {
  PENDING:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  CONFIRMED: { cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
  COMPLETED: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] || { cls: 'bg-white/5 text-white/40 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${cfg.cls} capitalize`}>
      <cfg.Icon size={11} />{status}
    </span>
  );
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const DURATIONS = [30, 60, 90];

// ── Book Modal ────────────────────────────────────────────────
function BookModal({ expert, onClose, onBooked }) {
  const [form, setForm] = useState({
    title: `Consultation with ${expert.name}`,
    description: '',
    duration_minutes: 60,
    scheduled_at: '',
    category: expert.category || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.scheduled_at) e.scheduled_at = 'Pick a date and time';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await bookConsultation({ ...form, expert_id: expert.id, duration_minutes: Number(form.duration_minutes) });
      toast.success('Consultation booked');
      onBooked();
    } catch (err) {
      toastApiError(err, 'Failed to book consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-hover border border-border rounded-lg px-3 py-2.5 text-light-text text-sm focus:outline-none focus:border-accent/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-secondary border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {expert.avatar_url
              ? <img src={expert.avatar_url} alt={expert.name} className="w-9 h-9 rounded-full object-cover" />
              : <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">{expert.name?.[0]}</div>
            }
            <div>
              <p className="text-light-text font-semibold text-sm">{expert.name}</p>
              <p className="text-light-text/40 text-xs">{expert.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Title</label>
            <input value={form.title} onChange={set('title')} className={inputCls} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={set('description')} rows={2}
              placeholder="What would you like to discuss?" className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button"
                  onClick={() => setForm(p => ({ ...p, duration_minutes: d }))}
                  className={`flex-1 py-2 rounded-lg border text-sm transition ${form.duration_minutes === d ? 'bg-accent/10 border-accent/40 text-accent' : 'border-white/10 text-white/60 hover:text-white'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Date & Time</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} className={inputCls} />
            {errors.scheduled_at && <p className="text-red-400 text-xs mt-1">{errors.scheduled_at}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-light-text/60 hover:text-light-text text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <InfinityLoader size={20} />}
              Book Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ConsultationsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('experts'); // 'experts' | 'my'
  const [experts, setExperts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [bookTarget, setBookTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConsultationExperts({ search, category });
      setExperts(res?.data ?? res ?? []);
      if (res?.categories) setCategories(res.categories);
    } catch (err) {
      toastApiError(err, 'Could not load experts');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyConsultations();
      setConsultations(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load consultations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'experts') loadExperts();
    else loadConsultations();
  }, [tab, loadExperts, loadConsultations]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateConsultationStatus(id, status);
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Consultation ${status.toLowerCase()}`);
    } catch (err) {
      toastApiError(err, 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 text-light-text">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Consultations</h1>
          <p className="text-white/50 text-sm">Book one-on-one sessions with verified experts.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'experts', label: 'Find Experts' }, { key: 'my', label: 'My Consultations' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm transition ${tab === t.key ? 'bg-accent/10 text-accent border border-accent/20' : 'text-white/50 hover:text-white border border-transparent'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXPERTS TAB ── */}
      {tab === 'experts' && (
        <>
          {/* Search + category filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search experts..."
                className="w-full bg-secondary border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-accent/50 placeholder-white/30" />
            </div>
            {categories.length > 0 && (
              <div className="min-w-[160px]">
                <CustomDropdown
                  options={categories.map(c => ({ label: c, value: c }))}
                  value={category}
                  onChange={val => setCategory(val)}
                  placeholder="All categories"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="animate-pulse bg-secondary border border-white/5 rounded-xl h-52" />)}
            </div>
          ) : experts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-transparent border border-white/5 rounded-xl text-center">
              <p className="text-white/40 text-sm">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experts.map(expert => (
                <div key={expert.id} className="bg-transparent border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:border-white/20 transition">
                  <div className="flex items-start gap-3">
                    {expert.avatar_url
                      ? <img src={expert.avatar_url} alt={expert.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold shrink-0">{expert.name?.[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold truncate">{expert.name}</p>
                        {expert.is_verified && <ShieldCheck size={14} className="text-blue-400 shrink-0" title="Identity Verified" />}
                      </div>
                      <p className="text-white/50 text-sm truncate">{expert.title}</p>
                      {expert.category && <p className="text-white/30 text-xs">{expert.category}</p>}
                    </div>
                    {expert.hourly_rate && (
                      <span className="text-accent font-semibold text-sm shrink-0">${expert.hourly_rate}/hr</span>
                    )}
                  </div>
                  <button
                    onClick={() => setBookTarget(expert)}
                    className="w-full py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Book Consultation
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MY CONSULTATIONS TAB ── */}
      {tab === 'my' && (
        loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="animate-pulse bg-secondary border border-white/5 rounded-xl h-20" />)}
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-transparent border border-white/5 rounded-xl text-center">
            <Calendar className="w-12 h-12 text-white/20 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No consultations yet</h3>
            <p className="text-white/40 text-sm mb-4">Find an expert and book your first session.</p>
            <button onClick={() => setTab('experts')} className="text-accent text-sm hover:underline">Browse experts →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map(c => {
              const expert = c.expert?.profiles || c.expert || {};
              const name = expert.name || c.expert_name || 'Expert';
              const avatar = expert.avatar_url;
              const isUpdating = updatingId === c.id;
              const canCancel = !['CANCELLED', 'COMPLETED'].includes(c.status?.toUpperCase());

              return (
                <div key={c.id} className="bg-transparent border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 md:w-1/4 shrink-0">
                    {avatar
                      ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      : <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm shrink-0">{name[0]}</div>
                    }
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{name}</p>
                      <p className="text-white/40 text-xs">{c.duration_minutes} min</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-white/40 text-xs">{fmtDate(c.scheduled_at)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                  {canCancel && (
                    <button
                      onClick={() => handleStatusUpdate(c.id, 'CANCELLED')}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition disabled:opacity-50 shrink-0"
                    >
                      {isUpdating ? <InfinityLoader size={20} /> : <XCircle size={12} />}
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Book modal */}
      {bookTarget && (
        <BookModal
          expert={bookTarget}
          onClose={() => setBookTarget(null)}
          onBooked={() => { setBookTarget(null); setTab('my'); loadConsultations(); }}
        />
      )}
    </div>
  );
}
