import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../../../components/ui/CustomDropdown';
import InfinityLoader from '../../../../components/common/InfinityLoader';

import { getApiUrl } from '../../../../utils/authUtils';
 
const API_URL = getApiUrl();

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    original_price: '',
    offer_price: '',
    duration: 'monthly',
    features: '',
    is_popular: false,
  });

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentRole = currentUser.role || 'ADMIN';
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/api/plans/admin/all`, {
        headers: getAuthHeader(),
      });
      if (data.success) setPlans(data.data);
    } catch (error) {
      // Fallback: fetch public plans if not super admin
      try {
        const { data } = await axios.get(`${API_URL}/api/plans`);
        if (data.success) setPlans(data.data);
      } catch {
        toast.error('Failed to load plans');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can manage plans');
      return;
    }
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        original_price: plan.original_price,
        offer_price: plan.offer_price,
        duration: plan.duration,
        features: plan.features.join('\n'),
        is_popular: plan.is_popular,
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', original_price: '', offer_price: '', duration: 'monthly', features: '', is_popular: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const featuresArray = formData.features.split('\n').filter((f) => f.trim() !== '');
    const payload = { ...formData, features: featuresArray };

    try {
      if (editingPlan) {
        const { data } = await axios.put(`${API_URL}/api/plans/${editingPlan.id}`, payload, { headers: getAuthHeader() });
        if (data.success) toast.success('Plan updated');
      } else {
        const { data } = await axios.post(`${API_URL}/api/plans/create`, payload, { headers: getAuthHeader() });
        if (data.success) toast.success('Plan created');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving plan');
    }
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) return;
    if (!window.confirm('Delete this plan?')) return;
    try {
      const { data } = await axios.delete(`${API_URL}/api/plans/${id}`, { headers: getAuthHeader() });
      if (data.success) { toast.success('Plan deleted'); fetchPlans(); }
    } catch { toast.error('Error deleting plan'); }
  };

  const handleTogglePublish = async (plan) => {
    if (!isSuperAdmin) return;
    try {
      const { data } = await axios.patch(`${API_URL}/api/plans/${plan.id}/toggle-publish`, {}, { headers: getAuthHeader() });
      if (data.success) {
        toast.success(data.data.is_published ? 'Plan published — visible to users' : 'Plan unpublished — hidden from users');
        fetchPlans();
      }
    } catch { toast.error('Failed to toggle publish status'); }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <InfinityLoader fullScreen={false} text="Loading plans..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
        <div>
          <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight">Membership Plans Management</h1>
          <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">Manage platform pricing and dynamic offers.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1 sm:gap-2 bg-accent text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all h-[28px] sm:h-[32px] shrink-0"
          >
            <Plus size={13} />
            Create Plan
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border rounded-2xl p-5 transition-all duration-200 ${plan.is_published
              ? 'border-white/10 hover:border-white/20'
              : 'border-white/5 opacity-60 border-dashed'
              }`}
          >
            {/* Popular badge */}
            {plan.is_popular && (
              <div className="absolute -top-3 right-5 bg-accent text-primary text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest">
                Popular
              </div>
            )}

            {/* Unpublished badge */}
            {!plan.is_published && (
              <div className="absolute -top-3 left-5 bg-white/10 text-white/50 text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest">
                Draft
              </div>
            )}

            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{plan.name}</h3>
                <span className="text-[9px] uppercase font-bold tracking-widest text-accent px-1.5 py-0.5 bg-accent/10 rounded-md mt-1 inline-block">
                  {plan.duration === 'monthly' ? 'Monthly' : 'Yearly'}
                </span>
              </div>
              <div className="flex gap-1.5">
                {isSuperAdmin && (
                  <>
                    {/* Publish Toggle */}
                    <button
                      onClick={() => handleTogglePublish(plan)}
                      title={plan.is_published ? 'Unpublish (hide from users)' : 'Publish (show to users)'}
                      className="p-1.5 text-white/40 hover:text-emerald-400 transition-colors"
                    >
                      {plan.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-1.5 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-4">
              {plan.original_price > plan.offer_price && (
                <p className="line-through text-white/30 text-xs mb-0.5">₹{plan.original_price}</p>
              )}
              <div className="flex items-end gap-1.5">
                <p className="text-2xl font-black text-white">₹{plan.offer_price}</p>
                {plan.discount_percentage > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 mb-0.5">
                    Save {plan.discount_percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">Features Included</h4>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/30 border border-white/5 border-dashed rounded-2xl text-sm">
            No plans found. Create one to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 sm:pt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/90 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] bg-secondary"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-accent transition-colors"
              >
                <X size={16} />
              </button>

              <h2 className="text-base font-bold text-white mb-5">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Plan Name</label>
                  <input
                    required type="text"
                    className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent/50 outline-none transition-all placeholder:text-white/20"
                    placeholder="e.g. Professional Membership"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Original Price (₹)</label>
                    <input
                      required type="number" min="0"
                      className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent/50 outline-none transition-all placeholder:text-white/20"
                      placeholder="2000"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Offer Price (₹)</label>
                    <input
                      required type="number" min="0"
                      className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent/50 outline-none transition-all placeholder:text-white/20"
                      placeholder="1499"
                      value={formData.offer_price}
                      onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Duration</label>
                    <CustomDropdown
                      options={[
                        { label: 'Monthly', value: 'monthly' },
                        { label: 'Yearly', value: 'yearly' }
                      ]}
                      value={formData.duration}
                      onChange={(val) => setFormData({ ...formData, duration: val })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 bg-secondary py-2.5 px-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/8 transition-colors">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-white/20 text-accent"
                        checked={formData.is_popular}
                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      />
                      <span className="text-xs font-semibold text-white/60">Mark as Popular</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Features (One per line)</label>
                  <textarea
                    rows={4}
                    className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent/50 outline-none transition-all placeholder:text-white/20 resize-none"
                    placeholder={"80 Connects per month\nVerified Pro Badge\nPriority Support"}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-full text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-full text-xs font-bold bg-accent text-white hover:text-primary hover:bg-white transition-all shadow-lg">
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
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

export default PlansManagement;
