import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, BarChart2,
  Eye, MousePointer, XCircle, ToggleLeft, ToggleRight, Tag
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../../../components/ui/CustomDropdown';

import { getApiUrl } from '../../../../utils/authUtils';
 
const API_URL = getApiUrl();

const OFFER_TYPES = [
  { value: 'limited_offer',   label: '🔥 Limited Offer' },
  { value: 'flash_sale',      label: '⚡ Flash Sale' },
  { value: 'seasonal_deal',   label: '🎉 Seasonal Deal' },
  { value: 'launch_offer',    label: '🚀 Launch Offer' },
  { value: 'platform_update', label: '📢 Platform Update' },
  { value: 'feature_release', label: '✨ Feature Release' },
];

const defaultForm = {
  title: '',
  message: '',
  type: 'limited_offer',
  start_time: '',
  end_time: '',
  is_active: true,
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const timeLeft = (end) => {
  const diff = new Date(end) - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m left`;
};

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isSuperAdmin = (currentUser.role || '') === 'SUPER_ADMIN';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [offRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/api/announcements/admin/all`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/announcements/admin/analytics`, { headers: getHeaders() }),
      ]);
      if (offRes.data.success) setOffers(offRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    if (!isSuperAdmin) return toast.error('Only Super Admins can create offers');
    setEditing(null);
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setForm({ ...defaultForm, start_time: toLocalInput(now.toISOString()), end_time: toLocalInput(next7.toISOString()) });
    setIsModalOpen(true);
  };

  const openEdit = (offer) => {
    if (!isSuperAdmin) return toast.error('Only Super Admins can edit offers');
    setEditing(offer);
    setForm({
      title: offer.title,
      message: offer.message,
      type: offer.type || 'limited_offer',
      start_time: toLocalInput(offer.start_time),
      end_time: toLocalInput(offer.end_time),
      is_active: offer.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (!form.end_time) return toast.error('End time is required');
    const payload = {
      ...form,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : new Date().toISOString(),
      end_time: new Date(form.end_time).toISOString(),
    };
    try {
      if (editing) {
        await axios.patch(`${API_URL}/api/announcements/admin/${editing.id}`, payload, { headers: getHeaders() });
        toast.success('Offer updated');
      } else {
        await axios.post(`${API_URL}/api/announcements/admin/create`, payload, { headers: getHeaders() });
        toast.success('Offer published');
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin || !window.confirm('Delete this offer?')) return;
    try {
      await axios.delete(`${API_URL}/api/announcements/admin/${id}`, { headers: getHeaders() });
      toast.success('Offer deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleActive = async (offer) => {
    if (!isSuperAdmin) return toast.error('Only Super Admins can do this');
    try {
      await axios.patch(`${API_URL}/api/announcements/admin/${offer.id}`, { is_active: !offer.is_active }, { headers: getHeaders() });
      toast.success(offer.is_active ? 'Offer hidden' : 'Offer is now live');
      fetchAll();
    } catch { toast.error('Failed to toggle'); }
  };

  const getOfferLabel = (val) => OFFER_TYPES.find(t => t.value === val)?.label || val;

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex justify-between items-center border border-white/10 rounded-2xl px-5 py-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Tag size={17} className="text-yellow-400" />
            Offer Banners
          </h1>
          <p className="text-white/40 text-xs mt-0.5">Manage animated offer banners shown to authenticated users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${showAnalytics ? 'bg-accent/10 text-accent' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart2 size={14} /> Analytics
          </button>
          {isSuperAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
            >
              <Plus size={14} /> New Offer
            </button>
          )}
        </div>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && Object.keys(analytics).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="border border-white/10 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/25">Engagement Analytics</h2>
            {offers.map((offer) => {
              const s = analytics[offer.id] || { views: 0, clicks: 0, dismisses: 0, engagement_rate: '0.0' };
              return (
                <div key={offer.id} className="space-y-1.5">
                  <p className="text-xs font-semibold text-white/70 truncate">{offer.title}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-white/40"><Eye size={11} className="text-blue-400" /> {s.views} views</span>
                    <span className="flex items-center gap-1 text-[11px] text-white/40"><MousePointer size={11} className="text-emerald-400" /> {s.clicks} clicks</span>
                    <span className="flex items-center gap-1 text-[11px] text-white/40"><XCircle size={11} className="text-rose-400" /> {s.dismisses} dismisses</span>
                    <span className="text-[11px] font-bold text-yellow-400">{s.engagement_rate}% CTR</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${Math.min(parseFloat(s.engagement_rate), 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden">
        {offers.length === 0 ? (
          <div className="py-20 text-center text-white/30 text-sm">No offers yet. Create one to show an animated banner.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/25">Offer Name</th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white/25 hidden md:table-cell">Category</th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white/25 hidden lg:table-cell">Start</th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white/25 hidden lg:table-cell">Expires</th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white/25">Status</th>
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white/25 hidden md:table-cell">Engage</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const s = analytics[offer.id] || { views: 0, clicks: 0, engagement_rate: '0.0' };
                const expired = new Date(offer.end_time) < Date.now();
                return (
                  <tr key={offer.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <p className="text-sm font-semibold text-white truncate">{offer.title}</p>
                      <p className="text-xs text-white/35 truncate">{offer.message}</p>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">
                        {getOfferLabel(offer.type)}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell text-xs text-white/40">
                      {offer.start_time ? new Date(offer.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs font-medium ${expired ? 'text-rose-400' : 'text-white/50'}`}>
                        {timeLeft(offer.end_time)}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button onClick={() => handleToggleActive(offer)} disabled={!isSuperAdmin} className="flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {offer.is_active && !expired
                          ? <ToggleRight size={18} className="text-emerald-400" />
                          : <ToggleLeft size={18} className="text-white/20" />
                        }
                        <span className={`text-[10px] font-bold ${offer.is_active && !expired ? 'text-emerald-400' : 'text-white/30'}`}>
                          {offer.is_active && !expired ? 'Live' : expired ? 'Expired' : 'Off'}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell text-xs text-white/40">
                      {s.views}v · {s.clicks}c · <span className="text-yellow-400">{s.engagement_rate}%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(offer)} className="p-1 text-white/30 hover:text-accent transition-colors duration-150"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(offer.id)} className="p-1 text-white/30 hover:text-rose-400 transition-colors duration-150"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0f1624] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Tag size={15} className="text-yellow-400" />
                {editing ? 'Edit Offer' : 'Create New Offer'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Offer Name */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Offer Name</label>
                  <input required type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 placeholder:text-white/20"
                    placeholder='e.g. "April Pro Membership Deal"'
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* Offer Category dropdown */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Offer Category</label>
                  <CustomDropdown
                    options={OFFER_TYPES}
                    value={form.type}
                    onChange={(val) => setForm({ ...form, type: val })}
                    className="w-full"
                  />
                </div>

                {/* Banner Message */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Banner Message</label>
                  <input required type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 placeholder:text-white/20"
                    placeholder='e.g. "40% off — through April 10. Limited seats! 🎉"'
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">
                      Start Time
                    </label>
                    <input type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                    <p className="text-[10px] text-white/25 mt-1 pl-1">When to show (defaults to now)</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">
                      End Time <span className="text-yellow-400">*</span>
                    </label>
                    <input required type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                    <p className="text-[10px] text-white/25 mt-1 pl-1">Banner auto-hides at this time</p>
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 bg-white/5 py-2.5 px-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-yellow-400"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <div>
                    <span className="text-xs font-bold text-white/70">Make offer live immediately</span>
                    <p className="text-[10px] text-white/30 mt-0.5">Uncheck to save as draft and publish later</p>
                  </div>
                </label>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/20">
                    {editing ? 'Save Changes' : 'Publish Offer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OffersManagement;
