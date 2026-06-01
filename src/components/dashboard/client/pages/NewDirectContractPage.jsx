import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Sparkles } from 'lucide-react';
import { convertToUSD } from '../../../../utils/currencyUtils';
import {
  createDirectContract,
  getFreelancerProfile,
  lookupFreelancerByEmail,
  aiImproveJob,
} from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import InfinityLoader from '../../../common/InfinityLoader';
import AIJobPreviewModal from './AIJobPreviewModal';
import { useTheme } from '../../../../context/ThemeContext';

const today = () => new Date().toISOString().split('T')[0];

const INITIAL = {
  title: '',
  description: '',
  project_type: 'FIXED',
  agreed_rate: '',
  weekly_limit: '',
  start_date: today(),
  end_date: '',
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUUID = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim());

export default function NewDirectContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillId = searchParams.get('freelancer_id') || '';
  const { theme } = useTheme();

  const isLight = theme === 'light' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const aiLogoSrc = isLight ? '/Icons/AI-Connect.png' : '/Icons/White-AI-Connect.png';

  const [form, setForm] = useState(INITIAL);
  const [freelancerInput, setFreelancerInput] = useState(prefillId); // email or UUID
  const [resolvedFreelancer, setResolvedFreelancer] = useState(null); // { id, name, avatar_url, title }
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [aiModal, setAiModal] = useState({ isOpen: false, aiData: null, isThinking: false });

  // If prefill UUID is in query params, fetch their profile
  useEffect(() => {
    if (!prefillId || !isUUID(prefillId)) return;
    setLookingUp(true);
    getFreelancerProfile(prefillId)
      .then((res) => {
        if (res?.data) {
          const p = res.data;
          setResolvedFreelancer({
            id: prefillId,
            name: p.name || p.profiles?.name || 'Freelancer',
            avatar_url: p.avatar_url || p.profiles?.avatar_url || null,
            title: p.title || p.profiles?.title || null,
          });
          if (p.hourly_rate) {
            setForm(prev => ({ ...prev, agreed_rate: (p.hourly_rate * 92.74).toFixed(2) }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLookingUp(false));
  }, [prefillId]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  // Resolve freelancer input (email or UUID) on blur or Enter
  const handleFreelancerLookup = async () => {
    const val = freelancerInput.trim();
    if (!val) return;
    if (resolvedFreelancer?.id) return; // already resolved

    setErrors(p => ({ ...p, freelancer_id: undefined }));

    if (isUUID(val)) {
      // Direct UUID — fetch profile
      setLookingUp(true);
      try {
        const res = await getFreelancerProfile(val);
        if (res?.data) {
          const p = res.data;
          setResolvedFreelancer({
            id: val,
            name: p.name || p.profiles?.name || 'Freelancer',
            avatar_url: p.avatar_url || p.profiles?.avatar_url || null,
            title: p.title || p.profiles?.title || null,
          });
        } else {
          setErrors(p => ({ ...p, freelancer_id: 'Freelancer not found' }));
        }
      } catch {
        setErrors(p => ({ ...p, freelancer_id: 'Could not find freelancer with this ID' }));
      } finally {
        setLookingUp(false);
      }
    } else if (isEmail(val)) {
      // Email — lookup via backend
      setLookingUp(true);
      try {
        const res = await lookupFreelancerByEmail(val);
        if (res?.success && res.data) {
          setResolvedFreelancer(res.data);
          if (res.data.hourly_rate) {
            setForm(prev => ({ ...prev, agreed_rate: (res.data.hourly_rate * 92.74).toFixed(2) }));
          }
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Freelancer not found with this email';
        setErrors(p => ({ ...p, freelancer_id: msg }));
      } finally {
        setLookingUp(false);
      }
    }
  };

  const handleAIRewrite = async () => {
    if (!form.description.trim() && !form.title.trim()) {
      toast.error('Please add a title or rough description first.');
      return;
    }
    setAiModal(p => ({ ...p, isThinking: true }));
    try {
      const context = `Title: ${form.title}\nDescription: ${form.description}`;
      const res = await aiImproveJob(context);
      if (res.success) {
        const description = typeof res.data === 'string'
          ? res.data
          : res.data.improvedPost || res.data.description || JSON.stringify(res.data);
        setAiModal({ isOpen: true, aiData: { description, skills: [] }, isThinking: false });
      }
    } catch {
      toast.error('AI rewrite failed. Please try again.');
      setAiModal(p => ({ ...p, isThinking: false }));
    }
  };

  const applyAI = (aiData) => {
    if (aiData.description) setForm(p => ({ ...p, description: aiData.description }));
    setAiModal(p => ({ ...p, isOpen: false }));
    toast.success('AI description applied!');
  };

  const validate = () => {
    const e = {};
    if (!resolvedFreelancer?.id) e.freelancer_id = 'Please enter a valid freelancer email or ID';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.agreed_rate || isNaN(parseFloat(form.agreed_rate)) || parseFloat(form.agreed_rate) <= 0)
      e.agreed_rate = 'Enter a valid rate greater than 0';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        freelancer_id: resolvedFreelancer.id,
        title: form.title.trim(),
        description: form.description.trim(),
        project_type: form.project_type,
        agreed_rate: convertToUSD(form.agreed_rate),
        ...(form.project_type === 'HOURLY' && form.weekly_limit ? { weekly_limit: parseFloat(form.weekly_limit) } : {}),
        ...(form.start_date ? { start_date: form.start_date } : {}),
        ...(form.end_date ? { end_date: form.end_date } : {}),
      };
      const res = await createDirectContract(payload);
      toast.success('Direct contract sent to freelancer!');
      const id = res?.data?.id ?? res?.id;
      navigate(id ? `/client/direct-contracts/${id}` : '/client/direct-contracts');
    } catch (err) {
      toastApiError(err, 'Failed to create contract');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto mt-2 pb-12 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* BACK */}
      <button
        onClick={() => navigate('/client/direct-contracts')}
        className="inline-flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Direct Contracts
      </button>

      {/* TITLE */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">New Direct Contract</h1>
        <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-sm mt-1 font-medium leading-relaxed max-w-2xl">
          Create a contract directly with a freelancer — no job post needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">

        {/* FREELANCER */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Freelancer</p>
          {lookingUp ? (
            <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-sm py-3">
              <InfinityLoader fullScreen={false} text="" /> Looking up freelancer...
            </div>
          ) : resolvedFreelancer ? (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4">
              {resolvedFreelancer.avatar_url ? (
                <img src={resolvedFreelancer.avatar_url} alt={resolvedFreelancer.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold shrink-0">
                  {resolvedFreelancer.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium text-sm">{resolvedFreelancer.name}</p>
                {resolvedFreelancer.title && <p className="text-slate-400 dark:text-white/40 text-[10px] mt-0.5">{resolvedFreelancer.title}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setResolvedFreelancer(null); setFreelancerInput(''); }}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white text-[10px] uppercase font-bold tracking-wider transition"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <input
                value={freelancerInput}
                onChange={(e) => { setFreelancerInput(e.target.value); setErrors(p => ({ ...p, freelancer_id: undefined })); }}
                onBlur={handleFreelancerLookup}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFreelancerLookup())}
                placeholder="Enter freelancer email or user ID"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all"
              />
              {errors.freelancer_id && <p className="text-red-400 text-xs mt-2">{errors.freelancer_id}</p>}
              <p className="text-slate-400 dark:text-white/30 text-[10px] mt-2">
                Enter the freelancer's email address or their user ID. Press Enter or click away to look them up.
              </p>
            </div>
          )}
        </div>

        {/* CONTRACT TITLE */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Contract Title</p>
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. React Dashboard Development"
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all"
          />
          {errors.title && <p className="text-red-400 text-xs mt-2">{errors.title}</p>}
        </div>

        {/* DESCRIPTION */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em]">Description</p>
            <button
              type="button"
              onClick={handleAIRewrite}
              disabled={aiModal.isThinking}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-full text-accent text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              <img src={aiLogoSrc} alt="Connect AI" className="w-3.5 h-3.5 object-contain" />
              <span className="hidden sm:inline">
                {aiModal.isThinking ? 'Rewriting...' : 'Rewrite with Connect AI'}
              </span>
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={5}
            placeholder="Describe the work scope, deliverables, and expectations..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all resize-none leading-relaxed"
          />
          {errors.description && <p className="text-red-400 text-xs mt-2">{errors.description}</p>}
        </div>

        {/* PROJECT TYPE */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Project Type</p>
          <div className="grid grid-cols-2 gap-3">
            {['FIXED', 'HOURLY'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, project_type: t }))}
                className={`relative border rounded-xl p-5 text-left transition-all duration-300 ${
                  form.project_type === t ? 'border-accent' : 'border-slate-200 dark:border-white/10 hover:border-accent/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-bold ${form.project_type === t ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50'}`}>
                    {t === 'FIXED' ? 'Fixed Price' : 'Hourly'}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.project_type === t ? 'border-accent' : 'border-slate-300 dark:border-white/20'}`}>
                    {form.project_type === t && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RATE */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">
            {form.project_type === 'HOURLY' ? '₹/hr Rate' : 'Fixed Price (₹)'}
          </p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.agreed_rate}
                onChange={set('agreed_rate')}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all"
              />
            </div>
            {form.project_type === 'HOURLY' && (
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={form.weekly_limit}
                  onChange={set('weekly_limit')}
                  placeholder="Weekly hours limit (optional)"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all"
                />
              </div>
            )}
          </div>
          {errors.agreed_rate && <p className="text-red-400 text-xs mt-2">{errors.agreed_rate}</p>}
        </div>

        {/* DATES */}
        <div className="rounded-xl p-3 sm:p-4 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Project Dates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Start Date</p>
              <input
                type="date"
                value={form.start_date}
                onChange={set('start_date')}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">
                End Date <span className="normal-case tracking-normal font-normal text-slate-300 dark:text-white/20">(optional)</span>
              </p>
              <input
                type="date"
                value={form.end_date}
                onChange={set('end_date')}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-slate-200 dark:border-white/5 pt-8">
          <button
            type="button"
            onClick={() => navigate('/client/direct-contracts')}
            className="w-full sm:w-auto text-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 bg-accent text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? <><InfinityLoader fullScreen={false} text="" /> Sending...</> : 'Send Contract'}
          </button>
        </div>

      </form>

      {/* AI MODAL */}
      <AIJobPreviewModal
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal(p => ({ ...p, isOpen: false }))}
        onApply={applyAI}
        originalData={{ description: form.description }}
        aiData={aiModal.aiData}
        type="improve"
      />
    </div>
  );
}
