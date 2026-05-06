import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, BadgeCheck, Clock, CheckCircle2, XCircle,
  AlertCircle, X, Plus, Search, ShieldCheck, MessageCircle, User,
  Briefcase, ChevronRight
} from 'lucide-react';
import {
  getConsultationExperts, getMyConsultations, bookConsultation, updateConsultationStatus,
} from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../common/InfinityLoader';
import CustomDropdown from '../../../ui/CustomDropdown';
import SectionHeader from '../../../ui/SectionHeader';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Tabs from '../../../ui/Tabs';

const STATUS_CFG = {
  PENDING:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  CONFIRMED: { cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
  COMPLETED: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] || { cls: 'bg-white/5 text-white/40 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] border ${cfg.cls} capitalize font-bold`}>
      <cfg.Icon size={10} />{status}
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
              {submitting && <InfinityLoader/>}
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
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [categories, setCategories] = useState([]);
  const [bookTarget, setBookTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { search };
      if (category && category !== 'All') filters.category = category;
      const res = await getConsultationExperts(filters);
      setExperts(res?.data ?? res ?? []);
      if (res?.categories) {
        setCategories(['All', ...res.categories]);
      }
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
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6 pb-12 space-y-6">
      <SectionHeader
        title="Consultations"
        subtext="Book one-on-one sessions with verified experts."
      />

      {/* Tabs */}
      <div className="flex flex-row gap-3 mb-6">
        <button
          onClick={() => setTab('experts')}
          className={`flex-1 md:flex-none md:min-w-[160px] flex flex-row items-center justify-center gap-2 py-2.5 px-6 rounded-full transition-all duration-300 ${
            tab === 'experts'
              ? 'bg-accent text-white'
              : 'bg-transparent border border-white/10 text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          <span className={`text-[11px] font-black whitespace-nowrap`}>Find Experts</span>
        </button>

        <button
          onClick={() => setTab('my')}
          className={`flex-1 md:flex-none md:min-w-[160px] flex flex-row items-center justify-center gap-2 py-2.5 px-6 rounded-full transition-all duration-300 ${
            tab === 'my'
              ? 'bg-accent text-white'
              : 'bg-transparent border border-white/10 text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          <span className={`text-[11px] font-black whitespace-nowrap`}>My Consultations</span>
        </button>
      </div>

      {/* ── EXPERTS TAB ── */}
      {tab === 'experts' && (
        <>
          {/* Search + category filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative md:flex-[3]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search experts by name or skills..."
                className="w-full bg-secondary border border-white/10 text-white text-sm rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-accent/50 placeholder-white/20 transition-all"
              />
            </div>
            <div className="md:flex-1">
              <CustomDropdown
                options={(categories.length > 0 ? categories : ['All']).map(c => ({ label: c, value: c }))}
                value={category}
                onChange={val => setCategory(val)}
                variant="glass"
                fullWidth={true}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="h-64 animate-pulse bg-white/[0.02]" />
              ))}
            </div>
          ) : experts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <img src="/Icons/icons8-expert-100.png" alt="No experts" className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">No experts found</h3>
              <p className="text-white/40 text-sm max-w-xs">We couldn't find any experts matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map(expert => (
                <Card key={expert.id} padding="p-6" className="group/expert hover:border-accent/40 transition-all duration-300 flex flex-col gap-6 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {expert.avatar_url ? (
                          <img src={expert.avatar_url} alt={expert.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/5" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xl border-2 border-accent/20">
                            {expert.name?.[0]}
                          </div>
                        )}
                        {expert.is_verified && (
                          <div className="absolute -bottom-1 -right-1 p-1 bg-accent rounded-full ring-4 ring-[#0F1115]">
                            <ShieldCheck size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-white truncate tracking-tight group-hover/expert:text-accent transition-colors">
                          {expert.name}
                        </h3>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest truncate">{expert.title || 'Consultation Expert'}</p>
                      </div>
                    </div>
                    {expert.hourly_rate && (
                      <div className="text-right">
                        <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest">Rate</span>
                        <span className="text-base font-black text-accent">${expert.hourly_rate}</span>
                        <span className="text-[9px] text-white/20 font-bold">/hr</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {expert.category && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-wider text-white/60 border border-white/5">
                          {expert.category}
                        </span>
                      </div>
                    )}
                    {expert.bio && (
                      <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                        {expert.bio}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                    <Button
                      onClick={() => setBookTarget(expert)}
                      variant="primary"
                      className="flex-1 !rounded-xl font-black text-[8px] uppercase tracking-[0.2em] py-2"
                    >
                      Book Session
                    </Button>
                    <button
                      onClick={() => navigate(`/client/messages?userId=${expert.id}`)}
                      className="p-2 text-white/30 hover:text-accent transition-all duration-300"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MY CONSULTATIONS TAB ── */}
      {tab === 'my' && (
        loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-white/[0.02]" />)}
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img src="/Icons/icons8-consultation-64.png" alt="No sessions" className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">No sessions booked</h3>
            <p className="text-white/40 text-sm max-w-xs mb-8">You haven't scheduled any consultations yet. Find an expert to get started.</p>
            <button 
              onClick={() => setTab('experts')} 
              className="w-full md:w-auto px-10 py-3 bg-accent text-white font-black text-[11px] uppercase tracking-widest rounded-full border border-accent/20 hover:bg-accent/90 transition-all duration-300"
            >
              Browse Experts
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map(c => {
              const expert = c.expert?.profiles || c.expert || {};
              const name = expert.name || c.expert_name || 'Expert';
              const avatar = expert.avatar_url;
              const isUpdating = updatingId === c.id;
              const canCancel = !['CANCELLED', 'COMPLETED'].includes(c.status?.toUpperCase());

              return (
                <Card key={c.id} padding="p-0" className="overflow-hidden group/consultation">
                  <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                    <div className="flex items-center gap-4 md:w-1/3 shrink-0">
                      <div className="relative">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black text-lg">
                            {name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-sm truncate group-hover/consultation:text-accent transition-colors">{name}</p>
                        <div className="flex items-center gap-2">
                          <Clock size={10} className="text-white/20" />
                          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{c.duration_minutes} Minutes Session</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 font-medium text-xs mb-1 line-clamp-1">{c.title}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                          <Calendar size={9} className="text-accent" />
                          <span className="text-[9px] font-bold text-white/60">{fmtDate(c.scheduled_at)}</span>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 shrink-0">
                      {canCancel && (
                        <button
                          onClick={() => handleStatusUpdate(c.id, 'CANCELLED')}
                          disabled={isUpdating}
                          className="p-2 rounded-xl border border-white/5 text-white/40 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all duration-300 disabled:opacity-50"
                          title="Cancel Session"
                        >
                          {isUpdating ? <InfinityLoader /> : <XCircle size={16} />}
                        </button>
                      )}
                      <Button
                        onClick={() => navigate(`/client/messages?userId=${expert.id || c.expert_id}`)}
                        variant="glass"
                        className="!rounded-xl px-4 py-2 text-[8px] font-black uppercase tracking-widest"
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
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
