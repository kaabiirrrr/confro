import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, X, ChevronDown,
  ToggleLeft, ToggleRight, Plus, Trash2
} from 'lucide-react';
import { createService, updateService, getMyServices, uploadServiceImage } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import InfinityLoader from '../../common/InfinityLoader';

const CATEGORIES = [
  'Development & IT', 'Design & Creative', 'Writing & Translation',
  'Marketing & SEO', 'AI Services', 'Finance & Accounting', 'Legal', 'HR',
];

const EMPTY_FORM = {
  title: '', description: '', category: '', price: '', delivery_days: '',
  revisions: '', tags: [], images: ['', '', ''], is_active: true,
  packages: [], faqs: [],
};

const inputCls = "w-full bg-transparent border border-white/10 rounded-full px-5 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 placeholder-white/20 transition";
const labelCls = "block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2";

// â”€â”€â”€ Custom Select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between ${inputCls} text-left`}>
        <span className={value ? 'text-white' : 'text-white/20'}>{value || placeholder}</span>
        <ChevronDown size={15} className={`text-white/30 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto">
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/5 ${value === opt ? 'text-accent bg-accent/5' : 'text-white/70'}`}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// â”€â”€â”€ Image Upload Slot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ImageSlot({ url, onUrl }) {
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const ref = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadServiceImage(file);
      const u = data?.data?.url ?? data?.url;
      if (u) {
        onUrl(u);
        toast.success('Image uploaded');
      } else {
        toast.error('No URL returned');
      }
    } catch (err) {
      toastApiError(err, 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-accent/40 transition bg-white/[0.02] cursor-pointer"
        onClick={() => !url && ref.current?.click()}>
        {url ? (
          <>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                <Upload size={16} className="text-white" />
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onUrl(''); }}
                className="p-2 bg-red-500/40 hover:bg-red-500/60 rounded-lg transition">
                <X size={16} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-6">
            {uploading
              ? <InfinityLoader size={20} />
              : <><Upload size={22} className="text-white/20" /><span className="text-white/20 text-xs">Click to upload</span></>
            }
          </div>
        )}
      </div>
      <button type="button" onClick={() => setShowUrl(p => !p)}
        className="text-white/20 hover:text-white/40 text-xs text-center transition">
        {showUrl ? 'Hide URL' : 'or paste URL'}
      </button>
      {showUrl && (
        <input placeholder="https://..." className={inputCls + ' text-xs py-2'}
          defaultValue={url}
          onBlur={e => { if (e.target.value) onUrl(e.target.value); }}
          onKeyDown={e => { if (e.key === 'Enter' && e.target.value) { onUrl(e.target.value); setShowUrl(false); } }} />
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// â”€â”€â”€ Section Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Section = ({ title, subtitle, children }) => (
  <div className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-5">
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/5 pb-4 mb-5">{title}</h3>
      {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ServiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getMyServices()
      .then(res => {
        const list = res?.data ?? res ?? [];
        const svc = list.find(s => String(s.id) === String(id));
        if (svc) setForm({ ...EMPTY_FORM, ...svc, images: [...(svc.images ?? []), '', '', ''].slice(0, 3) });
        else toast.error('Service not found');
      })
      .catch(() => toast.error('Failed to load service'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const setVal = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setImage = (i, v) => { const imgs = [...form.images]; imgs[i] = v; setForm(p => ({ ...p, images: imgs })); };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };

  const getPkg = (i) => {
    const defaults = ['Basic', 'Standard', 'Premium'];
    return form.packages[i] ?? { name: defaults[i], price: '', delivery_days: '', revisions: '' };
  };
  const setPkg = (i, field, v) => {
    const pkgs = [0, 1, 2].map(j => getPkg(j));
    pkgs[i] = { ...pkgs[i], [field]: v };
    setForm(p => ({ ...p, packages: pkgs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.category) return toast.error('Select a category');
    if (!form.price || isNaN(parseFloat(form.price))) return toast.error('Enter a valid price');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        delivery_days: parseInt(form.delivery_days) || 1,
        revisions: parseInt(form.revisions) || 0,
        images: form.images.filter(Boolean),
        packages: form.packages.filter(p => p.name && p.price).map(p => ({
          ...p, price: parseFloat(p.price) || 0,
          delivery_days: parseInt(p.delivery_days) || 1,
          revisions: parseInt(p.revisions) || 0,
        })),
        faqs: form.faqs.filter(f => f.question),
      };
      isEdit ? await updateService(id, payload) : await createService(payload);
      toast.success(isEdit ? 'Service updated' : 'Service created');
      navigate('/freelancer/services');
    } catch (err) {
      toastApiError(err, 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return (
    <div className="w-full mx-auto flex items-center justify-center py-32">
      <InfinityLoader size={20} />
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 sm:px-10 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/freelancer/services')}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition">
          <ArrowLeft size={16} /> My Services
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{isEdit ? 'Edit Service' : 'Create New Service'}</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">{isEdit ? 'Update your service details' : 'Fill in the details to publish your service'}</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={() => navigate('/freelancer/services')}
            className="flex-1 sm:flex-none px-5 h-9 sm:h-10 rounded-full border border-white/10 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-9 sm:h-10 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition disabled:opacity-50 shadow-lg shadow-accent/10">
            {saving && <InfinityLoader size={18} />}
            {isEdit ? 'Save Changes' : 'Publish Service'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information" subtitle="The core details clients will see first">
            <div>
              <label className={labelCls}>Service Title</label>
              <input value={form.title} onChange={set('title')}
                placeholder="e.g. I will build a professional React web application"
                className={inputCls} />
              <p className="text-white/20 text-xs mt-1.5">{form.title.length}/80 characters</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <CustomSelect value={form.category} onChange={v => setVal('category', v)}
                  options={CATEGORIES} placeholder="Select a category" />
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag, press Enter" className={inputCls} />
                  <button type="button" onClick={addTag}
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition shrink-0 flex items-center justify-center">
                    <Plus size={15} />
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-full px-2.5 py-0.5 text-xs">
                        {t}
                        <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={set('description')} rows={6}
                placeholder="Describe your service in detail — what you'll deliver, your process, requirements from the client, and why they should choose you..."
                className="w-full bg-transparent border border-white/10 rounded-[32px] px-6 py-5 text-white text-sm focus:outline-none focus:border-accent/50 placeholder-white/20 transition resize-none" />
            </div>
          </Section>

          {/* Images */}
          <Section title="Service Images" subtitle="Add up to 3 images showcasing your work (first image is the thumbnail)">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <ImageSlot key={i} url={form.images[i] ?? ''} onUrl={v => setImage(i, v)} />
              ))}
            </div>
          </Section>

          {/* Packages */}
          <Section title="Packages" subtitle="Offer tiered pricing — leave price empty to skip a tier">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Basic', 'Standard', 'Premium'].map((tier, i) => {
                const pkg = getPkg(i);
                const colors = ['border-white/10', 'border-accent/20', 'border-purple-500/20'];
                const headers = ['text-white/50', 'text-accent', 'text-purple-400'];
                return (
                  <div key={tier} className={`border ${colors[i]} rounded-xl p-4 space-y-3 bg-white/[0.02]`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${headers[i]}`}>{tier}</p>
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input value={pkg.price} onChange={e => setPkg(i, 'price', e.target.value)} type="number" placeholder="â€”" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Delivery (days)</label>
                      <input value={pkg.delivery_days} onChange={e => setPkg(i, 'delivery_days', e.target.value)} type="number" placeholder="â€”" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Revisions</label>
                      <input value={pkg.revisions} onChange={e => setPkg(i, 'revisions', e.target.value)} type="number" placeholder="â€”" className={inputCls} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* FAQs */}
          <Section title="FAQs" subtitle="Answer common questions clients might have">
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/8 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Question {i + 1}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, faqs: p.faqs.filter((_, j) => j !== i) }))}
                      className="text-red-400/60 hover:text-red-400 transition"><Trash2 size={14} /></button>
                  </div>
                  <input value={faq.question}
                    onChange={e => { const f = [...form.faqs]; f[i] = { ...f[i], question: e.target.value }; setForm(p => ({ ...p, faqs: f })); }}
                    placeholder="e.g. What do you need from me to get started?" className={inputCls} />
                  <textarea value={faq.answer} rows={2}
                    onChange={e => { const f = [...form.faqs]; f[i] = { ...f[i], answer: e.target.value }; setForm(p => ({ ...p, faqs: f })); }}
                    placeholder="Your answer..." className={`${inputCls} resize-none`} />
                </div>
              ))}
              <button type="button"
                onClick={() => setForm(p => ({ ...p, faqs: [...p.faqs, { question: '', answer: '' }] }))}
                className="flex items-center gap-2 text-accent text-sm hover:text-accent/80 transition">
                <Plus size={15} /> Add FAQ
              </button>
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Pricing */}
          <Section title="Pricing & Delivery">
            <div>
              <label className={labelCls}>Base Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₹</span>
                <input type="number" min="1" step="0.01" value={form.price} onChange={set('price')}
                  placeholder="50" className={inputCls + ' pl-8'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Delivery Days</label>
              <input type="number" min="1" value={form.delivery_days} onChange={set('delivery_days')}
                placeholder="3" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Revisions Included</label>
              <input type="number" min="0" value={form.revisions} onChange={set('revisions')}
                placeholder="2" className={inputCls} />
            </div>
          </Section>

          {/* Visibility */}
          <Section title="Visibility">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Active</p>
                <p className="text-white/30 text-xs mt-0.5">Visible to clients on the marketplace</p>
              </div>
              <div
                onClick={() => setVal('is_active', !form.is_active)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${form.is_active ? 'bg-accent' : 'bg-white/10'}`}
              >
                <motion.div
                  animate={{ x: form.is_active ? 22 : 4 }}
                  initial={false}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </div>
            </div>
          </Section>

          {/* Sticky publish */}
          <div className="lg:sticky lg:top-24">
            <button onClick={handleSubmit} disabled={saving}
              className="w-full flex items-center justify-center gap-2 h-11 bg-accent text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-accent/90 transition disabled:opacity-50">
              {saving && <InfinityLoader size={20} />}
              {isEdit ? 'Save Changes' : 'Publish Service'}
            </button>
            <button type="button" onClick={() => navigate('/freelancer/services')}
              className="w-full mt-3 py-2 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition text-center">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

