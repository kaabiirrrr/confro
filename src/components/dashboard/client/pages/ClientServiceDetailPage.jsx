import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Clock, RefreshCcw, Check,
  Shield, AlertCircle, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getServiceById, orderService, getOrCreateConversation } from '../../../../services/apiService';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../common/InfinityLoader';

const ClientServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        if (data.success) {
          setService(data.data);
        } else {
          toast.error('Service not found');
        }
      } catch (err) {
        toast.error('Failed to load service details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <InfinityLoader fullScreen={false} text="" />
        <p className="text-slate-400 dark:text-white/40 text-sm font-medium">Fetching service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="w-16 h-16 text-white/10 mb-6" />
        <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Service Not Found</h1>
        <p className="text-slate-500 dark:text-white/40 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          The service you're looking for might have been removed or is no longer available.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const defaultPackages = [
    { name: 'Basic', price: service.price || 0, delivery: service.delivery_days || 3, revisions: service.revisions || 1, description: 'Basic starter package for this service.', features: ['Standard Support', '1 Revision', 'High Quality Delivery'] },
    { name: 'Standard', price: Math.round((service.price || 0) * 1.5), delivery: Math.max(1, (service.delivery_days || 3) - 1), revisions: (service.revisions || 1) + 2, description: 'Expanded features with faster turnaround.', features: ['Priority Support', '3 Revisions', 'Source Files', 'Expanded Scope'] },
    { name: 'Premium', price: (service.price || 0) * 2, delivery: Math.max(1, (service.delivery_days || 3) - 2), revisions: 99, description: 'Elite professional package with full commercial rights.', features: ['24/7 VIP Support', 'Unlimited Revisions', 'Full Source Files', 'Commercial Rights', 'Rush Delivery'] },
  ];

  const packages =
    service.packages && Array.isArray(service.packages) && service.packages.length > 0
      ? service.packages.map((p, i) => ({
          ...defaultPackages[i],
          ...p,
          features: Array.isArray(p.features) ? p.features : defaultPackages[i]?.features || [],
        }))
      : defaultPackages;

  const currentPkg = packages[selectedPackage] || packages[0];

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const res = await orderService(service.id, {
        package_name: currentPkg?.name || 'Basic',
        requirements: '',
      });
      if (res.success) {
        toast.success('Order placed successfully!');
        navigate('/client/contracts');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    setContacting(true);
    try {
      const res = await getOrCreateConversation(service.freelancer?.user_id);
      const convId = res.data?.id || res.id;
      navigate(`/client/messages${convId ? `?conv=${convId}` : ''}`);
    } catch (err) {
      toast.error('Failed to start conversation');
    } finally {
      setContacting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-16"
    >
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition text-sm font-medium group mb-6"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </button>

      {/* TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {service.title}
          </h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1 font-medium">
            Service ID: {service.id?.split('-')[0]} · Published by {service.freelancer?.name || 'Verified Expert'}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleContact}
            disabled={contacting}
            className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            {contacting ? 'Opening...' : 'Contact Expert'}
          </button>
          <button
            onClick={handleOrder}
            disabled={ordering}
            className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            {ordering ? 'Ordering...' : 'Hire Now'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* IMAGE */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-[400px]">
            <img
              src={service.images?.[0] || '/service1.jpeg'}
              className="w-full h-full object-cover"
              alt={service.title}
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Category', value: service.category || 'General', icon: Info },
              { label: 'Rating', value: service.rating ? `${Number(service.rating).toFixed(1)}/5.0` : 'No ratings yet', icon: Star, color: 'text-yellow-400' },
              { label: 'Orders', value: service.orders_count != null ? `${service.orders_count}` : '0', icon: Check },
              { label: 'Delivery', value: `${service.delivery_days || 1} Day${(service.delivery_days || 1) > 1 ? 's' : ''}`, icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <stat.icon className={`w-4 h-4 ${stat.color || 'text-accent'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase font-bold tracking-wider leading-none mb-1">{stat.label}</p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white/80 truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-5 flex items-center gap-3">
              <span className="w-1 h-3 bg-accent rounded-full" />
              Description
            </h2>
            <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
              {service.description || 'No detailed description available.'}
            </p>
          </div>

          {/* SELLER CARD */}
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl overflow-hidden border border-accent/20 shrink-0">
              {service.freelancer?.avatar_url
                ? <img src={service.freelancer.avatar_url} className="w-full h-full object-cover" alt={service.freelancer.name} />
                : service.freelancer?.name?.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-0.5">
                {service.freelancer?.name || 'Expert'}
              </h3>
              <p className="text-slate-400 dark:text-white/40 text-sm truncate">
                {service.freelancer?.title || 'Professional Freelancer'}
              </p>
            </div>
            <button
              className="text-accent hover:text-accent/70 font-semibold text-sm transition-colors shrink-0"
              onClick={() => navigate(`/freelancer/${service.freelancer?.user_id || service.freelancer?.id}`)}
            >
              View Profile
            </button>
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">

            {/* PRICING CARD */}
            <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
              {/* PACKAGE TABS */}
              <div className="flex border-b border-slate-200 dark:border-white/10">
                {packages.map((pkg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPackage(idx)}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition border-b-2 ${
                      selectedPackage === idx
                        ? 'text-accent border-accent'
                        : 'text-slate-400 dark:text-white/40 border-transparent hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* PRICE */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1">Total Price</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">₹{currentPkg.price}</h3>
                </div>

                <p className="text-slate-500 dark:text-white/50 text-sm mb-5 leading-relaxed">
                  {currentPkg.description}
                </p>

                {/* DELIVERY & REVISIONS */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-white/50">
                    <span className="flex items-center gap-2 font-medium"><Clock size={14} /> Delivery Time</span>
                    <span className="font-bold text-slate-900 dark:text-white/80">{currentPkg.delivery} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-white/50">
                    <span className="flex items-center gap-2 font-medium"><RefreshCcw size={14} /> Revisions</span>
                    <span className="font-bold text-slate-900 dark:text-white/80">
                      {currentPkg.revisions === 99 ? 'Unlimited' : currentPkg.revisions}
                    </span>
                  </div>
                </div>

                {/* FEATURES */}
                <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  {(currentPkg.features || []).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-white/60">
                      <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleOrder}
                  disabled={ordering}
                  className="w-full py-3.5 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
                >
                  {ordering ? 'Placing Order...' : 'Select and Hire'}
                </button>
              </div>
            </div>

            {/* SAFE & PROTECTED */}
            <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-4 h-4 text-accent shrink-0" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white/80">Safe & Protected</h4>
              </div>
              <p className="text-slate-400 dark:text-white/30 text-sm leading-relaxed">
                Funds are securely held in escrow and released only when you approve the final delivery.
              </p>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ClientServiceDetailPage;
