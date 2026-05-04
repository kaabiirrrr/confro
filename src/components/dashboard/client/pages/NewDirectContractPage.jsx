import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, IndianRupee } from 'lucide-react';
import { convertToUSD, formatINR } from '../../../../utils/currencyUtils';
import { createDirectContract, getFreelancerProfile } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import InfinityLoader from '../../../common/InfinityLoader';

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

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">{label}</label>
    {children}
    {error && <p className="text-red-400 text-[10px] font-medium">{error}</p>}
  </div>
);

const inputCls = "w-full bg-secondary border border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all placeholder:text-white/20";

export default function NewDirectContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillId = searchParams.get('freelancer_id') || '';

  const [form, setForm] = useState(INITIAL);
  const [freelancerId, setFreelancerId] = useState(prefillId);
  const [prefillFreelancer, setPrefillFreelancer] = useState(null);
  const [loadingFreelancer, setLoadingFreelancer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // If freelancer_id is in query params, try to fetch their info
  useEffect(() => {
    if (!prefillId) return;
    setLoadingFreelancer(true);
    getFreelancerProfile(prefillId)
      .then((res) => {
        if (res?.data) {
          setPrefillFreelancer(res.data);
          if (res.data?.hourly_rate) {
            setForm(p => ({ ...p, agreed_rate: (res.data.hourly_rate * 92.74).toFixed(2) }));
          }
        }
      })
      .catch((err) => {
        console.error('Failed to prefetch freelancer for contract', err);
      })
      .finally(() => setLoadingFreelancer(false));
  }, [prefillId]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!freelancerId.trim()) e.freelancer_id = 'Freelancer ID is required';
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
        freelancer_id: freelancerId.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        project_type: form.project_type,
        agreed_rate: convertToUSD(form.agreed_rate),
        ...(form.project_type === 'HOURLY' && form.weekly_limit ? { weekly_limit: parseFloat(form.weekly_limit) } : {}),
        ...(form.start_date ? { start_date: form.start_date } : {}),
        ...(form.end_date ? { end_date: form.end_date } : {}),
      };
      const res = await createDirectContract(payload);
      toast.success('Direct contract created');
      const id = res?.data?.id ?? res?.id;
      navigate(id ? `/client/direct-contracts/${id}` : '/client/direct-contracts');
    } catch (err) {
      toastApiError(err, 'Failed to create contract');
    } finally {
      setSubmitting(false);
    }
  };

  const freelancerName = prefillFreelancer?.name || prefillFreelancer?.profiles?.name || 'Freelancer';
  const freelancerAvatar = prefillFreelancer?.avatar_url || prefillFreelancer?.profiles?.avatar_url;
  const freelancerTitle = prefillFreelancer?.title || prefillFreelancer?.profiles?.title;

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6 pb-12 text-white">
      {/* Back */}
      <button
        onClick={() => navigate('/client/direct-contracts')}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-3 sm:mb-6 transition"
      >
        <ArrowLeft size={16} />
        Direct Contracts
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">New Direct Contract</h1>
        <p className="text-white/50 text-sm mt-1">Create a contract directly with a freelancer — no job post needed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Freelancer */}
        <div>
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider mb-2 ml-1">Freelancer</label>
          {prefillId && loadingFreelancer ? (
            <div className="flex items-center gap-2 text-white/40 text-xs py-3">
              <InfinityLoader size={20} /> Loading freelancer info...
            </div>
          ) : prefillId && freelancerName ? (
            <div className="flex items-center gap-3 bg-secondary border border-white/10 rounded-full px-6 py-4">
              {freelancerAvatar ? (
                <img src={freelancerAvatar} alt={freelancerName} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold shrink-0">
                  {freelancerName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{freelancerName}</p>
                {freelancerTitle && <p className="text-white/40 text-[10px] mt-0.5">{freelancerTitle}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setFreelancerId(''); setPrefillFreelancer(null); navigate('/client/direct-contracts/new'); }}
                className="px-4 py-2 rounded-full border border-white/10 text-white/30 hover:text-white text-[10px] uppercase font-bold tracking-wider transition"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <input
                value={freelancerId}
                onChange={(e) => { setFreelancerId(e.target.value); setErrors((p) => ({ ...p, freelancer_id: undefined })); }}
                placeholder="Paste freelancer user ID"
                className={inputCls}
              />
              {errors.freelancer_id && <p className="text-red-400 text-xs mt-1 ml-4">{errors.freelancer_id}</p>}
                <p className="text-white/30 text-[10px] mt-2 ml-4">
                  You can find the freelancer ID on their profile page, or use the "Direct Contract" button from talent search.
                </p>
            </div>
          )}
        </div>

        {/* Title */}
        <Field label="Contract Title" error={errors.title}>
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. React Dashboard Development"
            className={inputCls}
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            placeholder="Describe the work scope, deliverables, and expectations..."
            className="w-full bg-secondary border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all placeholder:text-white/20 resize-none"
          />
        </Field>

        {/* Project Type */}
        <div className="space-y-2">
          <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider ml-1">Project Type</label>
          <div className="flex gap-3">
            {['FIXED', 'HOURLY'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, project_type: t }))}
                className={`flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                  form.project_type === t
                    ? 'bg-accent/10 border-accent/40 text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]'
                    : 'bg-secondary border-white/5 text-white/50 hover:text-white hover:border-white/10'
                }`}
              >
                {t === 'FIXED' ? 'Fixed Price' : 'Hourly'}
              </button>
            ))}
          </div>
        </div>

        {/* Rate + Weekly Limit */}
        <div className="flex gap-3">
          <Field label={form.project_type === 'HOURLY' ? '₹/hr Rate' : 'Fixed Price (₹)'} error={errors.agreed_rate}>
            <div className="relative">
              <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.agreed_rate}
                onChange={set('agreed_rate')}
                placeholder="0.00"
                className={`${inputCls} pl-12`}
              />
            </div>
          </Field>
          {form.project_type === 'HOURLY' && (
            <Field label="Weekly Hours Limit (optional)">
              <input
                type="number"
                min="0"
                value={form.weekly_limit}
                onChange={set('weekly_limit')}
                placeholder="e.g. 40"
                className={inputCls}
              />
            </Field>
          )}
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <Field label="Start Date">
            <input type="date" value={form.start_date} onChange={set('start_date')} className={`${inputCls} px-6`} />
          </Field>
          <Field label="End Date (optional)">
            <input type="date" value={form.end_date} onChange={set('end_date')} className={`${inputCls} px-6`} />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => navigate('/client/direct-contracts')}
            className="flex-1 py-3 sm:py-3.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-bold uppercase tracking-widest transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 sm:py-3.5 rounded-full bg-accent text-white text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-accent/90 transition shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <InfinityLoader size={20} />}
            Create Contract
          </button>
        </div>
      </form>
    </div>
  );
}
