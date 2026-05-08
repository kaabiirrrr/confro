import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createDirectContract } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import InfinityLoader from '../../../common/InfinityLoader';

const INITIAL = {
  title: '',
  description: '',
  project_type: 'FIXED',
  agreed_rate: '',
  weekly_limit: '',
  start_date: '',
  end_date: '',
};

export default function NewDirectContractModal({ isOpen, onClose, onCreated, prefillFreelancerId, prefillFreelancerName }) {
  const [form, setForm] = useState(INITIAL);
  const [freelancerId, setFreelancerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL);
      setFreelancerId(prefillFreelancerId || '');
    }
  }, [isOpen, prefillFreelancerId]);

  if (!isOpen) return null;

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!freelancerId.trim()) return toast.error('Freelancer ID is required');
    setSubmitting(true);
    try {
      const payload = {
        freelancer_id: freelancerId.trim(),
        title: form.title,
        description: form.description,
        project_type: form.project_type,
        agreed_rate: parseFloat(form.agreed_rate),
        ...(form.project_type === 'HOURLY' && form.weekly_limit ? { weekly_limit: parseFloat(form.weekly_limit) } : {}),
        ...(form.start_date ? { start_date: form.start_date } : {}),
        ...(form.end_date ? { end_date: form.end_date } : {}),
      };
      const res = await createDirectContract(payload);
      toast.success('Direct contract created');
      onCreated?.(res?.data || res);
      onClose();
    } catch (err) {
      toastApiError(err, 'Failed to create contract');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-secondary border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-light-text font-semibold text-lg">New Direct Contract</h2>
          <button onClick={onClose} className="text-light-text/40 hover:text-light-text transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Freelancer */}
          <div>
            <label className="block text-sm text-white/60 mb-1">
              Freelancer ID {prefillFreelancerName && <span className="text-accent">({prefillFreelancerName})</span>}
            </label>
            <input
              value={freelancerId}
              onChange={(e) => setFreelancerId(e.target.value)}
              placeholder="Paste freelancer user ID"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Contract Title</label>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. React Dashboard Development"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Describe the work scope..."
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Project Type</label>
            <div className="flex gap-2">
              {['FIXED', 'HOURLY'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, project_type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    form.project_type === t
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {t === 'FIXED' ? 'Fixed Price' : 'Hourly'}
                </button>
              ))}
            </div>
          </div>

          {/* Rate */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-1">
                {form.project_type === 'HOURLY' ? 'Hourly Rate (₹)' : 'Fixed Price (₹)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.agreed_rate}
                onChange={set('agreed_rate')}
                placeholder="0.00"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            {form.project_type === 'HOURLY' && (
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Weekly Hours Limit</label>
                <input
                  type="number"
                  min="0"
                  value={form.weekly_limit}
                  onChange={set('weekly_limit')}
                  placeholder="e.g. 40"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={set('start_date')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-1">End Date (optional)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={set('end_date')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-light-text/60 hover:text-light-text text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <InfinityLoader/>}
              Create Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
