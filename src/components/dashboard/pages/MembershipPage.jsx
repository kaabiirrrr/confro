import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Building, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { getApiUrl } from '../../../utils/authUtils';
 
const API_URL = getApiUrl();

const MembershipPage = () => {
  const { theme } = useTheme();
  const { role, profile: user, membership, refreshProfile } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const isClient = role === 'CLIENT';
  const [activePlan, setActivePlan] = useState("Professional"); // Default to middle plan
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const [dbPlans, setDbPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);

  // 1. DYNAMICALLY LOAD RAZORPAY SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── PROACTIVE REFRESH ON MOUNT ──────────────────────────────────────────────
  useEffect(() => {
    // Proactively refresh profile to ensure membership is up to date
    refreshProfile?.().catch(err => console.error("[MembershipPage] Proactive refresh failed:", err));
  }, [refreshProfile]);

  const handleUpgrade = async (plan) => {
    if (plan.price === 0) return;

    // 2. ELITE UX: Disable button during processing
    setPurchasingPlanId(plan.id);

    try {
      // 3. CREATE ORDER ON BACKEND (Zero Trust)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { data: orderResponse } = await axios.post(
        `${API_URL}/api/membership/create-order`,
        { plan_id: plan.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.success) throw new Error(orderResponse.message);

      const { data: orderData } = orderResponse;

      // 4. RAZORPAY CONFIGURATION
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "Connect Freelance",
        description: isClient ? `Upgrade Hiring Power to ${plan.name}` : `Upgrade to ${plan.name} Membership`,
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            // 5. SERVER-SIDE VERIFICATION (Mandatory)
            const { data: verifyData } = await axios.post(
              `${API_URL}/api/membership/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: plan.id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyData.success) {
              toast.success(verifyData.message || 'Membership Activated Successfully!');
              // 6. INSTANT UI REFRESH
              window.location.reload();
            } else {
              toast.error(verifyData.message || 'Verification failed');
            }
          } catch (vErr) {
            // 7. ELITE FAIL-SAFE: If verified by RZP but API fails, don't scare user
            console.error('Verify failed', vErr);
            setPurchasingPlanId(null); // Reset UI state
            toast.success('Payment received! We are processing your activation...');
          }
        },
        prefill: {
          name: user?.name || "Member",
          email: user?.email || "test@connect.com",
          contact: "9999999999"
        },
        theme: {
          color: "#38bdf8"
        },
        modal: {
          ondismiss: () => setPurchasingPlanId(null)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('[Purchase] Payment initialization failed', err);
      toast.error(err.message || 'Payment initiation failed. Please try again.');
      setPurchasingPlanId(null);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const { data: res } = await axios.get(`${API_URL}/api/membership/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success) {
          setDbPlans(res.data);
          const popular = res.data.find(p => p.is_popular);
          if (popular) setActivePlan(popular.name);
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const plans = dbPlans.filter(p => p.billing_type === (isYearly ? 'yearly' : 'monthly'));

  // To handle case where plans are removed/recreated and activePlan ID string changed
  useEffect(() => {
    if (plans.length > 0 && !plans.find(p => p.name === activePlan)) {
      setActivePlan(plans[Math.floor(plans.length / 2)]?.name || plans[0]?.name);
    }
  }, [plans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 space-y-12">

      {/* Header Section (Match Account Health) */}
      <div className="text-left space-y-4">
        <div className="flex flex-col items-start relative">
          <div className="absolute -top-6 left-0 flex items-center gap-2">
            <span className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Live Systems Check
            </span>
            <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
              TEST MODE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-tight">
            {isClient ? "Scale Your Hiring Power" : "Level Up Your Career"}
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-medium mt-2 max-w-xl">
            {isClient
              ? "Unlock the tools you need to find the best talent and scale your business impact."
              : "Unlock the tools you need to connect with the best opportunities and scale your professional impact."}
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-start gap-6 pt-4">
          <span className={`text-[13px] font-bold uppercase tracking-widest ${!isYearly ? 'text-white' : 'text-white/30'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6 rounded-full bg-white/5 border border-white/10 p-1 relative transition-all"
          >
            <div className={`w-4 h-4 rounded-full bg-accent shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-bold uppercase tracking-widest ${isYearly ? 'text-white' : 'text-white/30'}`}>Yearly</span>
            <span className="bg-accent/10 text-accent text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Save 20%</span>
          </div>
        </div>
      </div>

      {/* 3-Card Overlapping Layout (Image 2 style) */}
      <div className="relative pt-10 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 px-4">
          {dbPlans.map((plan, index) => {
            // Exact ID match for the user's active plan row
            const isActivePlanInDb = membership?.plan_id === plan.id;
            const isActive = activePlan === plan.name;

            return (
              <motion.div
                key={plan.id}
                layout
                onClick={() => setActivePlan(plan.name)}
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 0.9,
                  zIndex: isActive ? 30 : index === 1 ? 20 : 10,
                  x: 0,
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`cursor-pointer group relative w-full max-w-[400px] rounded-[32px] border p-8 flex flex-col transition-all duration-500 shadow-2xl ${isActive
                  ? 'bg-secondary border-white/20 shadow-black/40 ring-1 ring-white/10 mt-0 active-card'
                  : 'bg-primary/40 border-white/5 shadow-black/20 mt-8 lg:mt-12 backdrop-blur-md'
                  }`}
              >
                {/* Popular Badge */}
                {plan.is_popular && isActive && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(77,199,255,0.3)]">
                    Most Chosen
                  </div>
                )}

                <div className="text-center mb-8 border-b border-white/5 pb-8">
                  <h3 className={`text-lg font-bold transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex flex-col items-center mt-4">
                    <div className="flex items-start">
                      <span className={`text-sm font-bold mt-1.5 mr-1 ${isActive ? 'text-white/40' : 'text-white/20'}`}>₹</span>
                      <span className={`text-3xl font-black ${isActive ? 'text-white' : 'text-white/40'}`}>
                        {plan.price / 100}
                      </span>
                    </div>
                    {plan.price > 0 && (isActive) && (
                      <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        per {isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-6 mb-10">
                  {plan.membership_features?.map((f, fIndex) => (
                    <div key={f.id || fIndex} className="flex items-center gap-4">
                      <div className={`p-1.5 rounded-lg shrink-0 border ${isActive ? 'bg-primary border-white/10 text-accent' : 'bg-transparent border-white/5 text-white/10'}`}>
                        <Check size={14} />
                      </div>
                      <span className={`text-xs font-medium leading-tight ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                        {f.feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => isActive && plan.price > 0 && !isActivePlanInDb && handleUpgrade(plan)}
                  disabled={purchasingPlanId === plan.id || (isActive && isActivePlanInDb)}
                  className={`w-full py-4 rounded-2xl font-bold text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isActive
                    ? isActivePlanInDb
                      ? 'bg-white/10 text-white/40 cursor-default border border-white/5'
                      : 'bg-accent text-primary hover:bg-white shadow-accent/20 disabled:opacity-60'
                    : 'bg-white/5 text-white/20 border border-white/5 group-hover:bg-white/10'
                    }`}
                >
                  {purchasingPlanId === plan.id
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : isActivePlanInDb
                      ? "Your Current Plan"
                      : "Upgrade Now"
                  }
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Section */}
      <div className="bg-secondary border border-white/10 rounded-[28px] sm:rounded-[40px] px-6 sm:px-10 py-8 sm:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-12 shadow-xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6">
            <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-5 sm:h-7 object-contain block dark:hidden" />
            <img src="/Logo2.png" alt="Connect" className="h-4 sm:h-6 object-contain hidden dark:block" />
            <span className="border-l border-accent/30 pl-3">Enterprise</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Need a limitless solution for a large organization?
          </h2>
          <p className="text-white/50 text-[10px] sm:text-xs font-medium leading-relaxed">
            Design a custom-tailored plan for large agencies or corporate teams that breaks standard platform limits and drives extreme scalability.
          </p>
        </div>
        <button onClick={() => setIsSalesModalOpen(true)}
          className="relative z-10 shrink-0 bg-white text-black px-7 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-[15px] hover:bg-white/90 transition-all shadow-2xl flex items-center gap-2 group w-full sm:w-auto justify-center">
          Talk to Sales
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* MODAL (Unchanged but ensuring it aligns with dark design) */}
      <AnimatePresence>
        {isSalesModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSalesModalOpen(false)}
              className="absolute inset-0 bg-primary/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-secondary border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-black/50"
            >
              <div className="flex justify-center mb-6">
                <img src="/Logo2.png" alt="Logo" className="h-10 object-contain" />
              </div>
              <p className="text-white/40 text-sm mb-8">Reach out to our team for custom platform configurations and volume pricing.</p>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsSalesModalOpen(false); }}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Work Email</label>
                  <input type="email" required className="w-full bg-primary border border-white/5 focus:border-accent/50 outline-none rounded-xl px-5 py-4 text-white text-sm" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Organizational Needs</label>
                  <textarea rows={4} className="w-full bg-primary border border-white/5 focus:border-accent/50 outline-none rounded-xl px-5 py-4 text-white text-sm resize-none" placeholder="Describe your scaling requirements..." />
                </div>
                <button type="submit" className="w-full bg-accent text-primary hover:bg-white px-6 py-4 rounded-xl font-bold text-sm transition-all mt-4">
                  Request Custom Proposal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembershipPage;
