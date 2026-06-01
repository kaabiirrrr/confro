import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Building, ChevronRight, Loader2, Sparkles, Clock, CheckCircle2, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import InfinityLoader from '../../common/InfinityLoader';
import { getApiUrl } from '../../../utils/authUtils';

const API_URL = getApiUrl();

const MembershipPage = () => {
  const { theme } = useTheme();
  const { role, profile: user, membership, refreshProfile, setMembership } = useAuth();
  const { refetch: refetchProfileContext, setBalance } = useProfile();
  const [searchParams] = useSearchParams();
  const [isYearly, setIsYearly] = useState(false);
  const isClient = role === 'CLIENT';
  const [activePlan, setActivePlan] = useState("PRO"); // Track selected plan for interactive layout
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  // Auto-highlight plan from URL param e.g. ?plan=elite
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setActivePlan(planParam.toUpperCase());
      // Scroll to plans section after a short delay to let the page render
      setTimeout(() => {
        const el = document.getElementById('plans-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  const [salesEmail, setSalesEmail] = useState('');
  const [salesNeeds, setSalesNeeds] = useState('');
  const [isSubmittingSales, setIsSubmittingSales] = useState(false);
  
  const [customProposals, setCustomProposals] = useState([]);
  const [purchasingCustomId, setPurchasingCustomId] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setSalesEmail(user.email);
    }
  }, [user]);

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    if (!salesEmail || !salesNeeds) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmittingSales(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/api/membership/sales-proposal`,
        { email: salesEmail, needs: salesNeeds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Your proposal request has been submitted!");
        setIsSalesModalOpen(false);
        setSalesNeeds('');
      } else {
        toast.error(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while submitting.");
    } finally {
      setIsSubmittingSales(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/membership/my-proposals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCustomProposals(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch custom proposals', err);
    }
  };

  const handleUpgradeCustom = async (proposal) => {
    setPurchasingCustomId(proposal.id);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { data: orderResponse } = await axios.post(
        `${API_URL}/api/membership/create-custom-order`,
        { proposal_id: proposal.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.success) throw new Error(orderResponse.message);

      const { data: orderData } = orderResponse;

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "Connect Freelance",
        description: `Custom Proposal Membership`,
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              `${API_URL}/api/membership/verify-custom`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                proposal_id: proposal.id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyData.success) {
              toast.success(verifyData.message || 'Custom Membership Activated!');
              if (verifyData.data) {
                if (verifyData.data.membership && setMembership) {
                  setMembership(verifyData.data.membership);
                  localStorage.setItem('user_membership', JSON.stringify(verifyData.data.membership));
                }
                if (verifyData.data.balance !== undefined && setBalance) setBalance(verifyData.data.balance);
              }
              if (refreshProfile) await refreshProfile().catch(err => console.error(err));
              if (refetchProfileContext) await refetchProfileContext().catch(err => console.error(err));
              fetchProposals();
            } else {
              toast.error(verifyData.message || 'Verification failed');
            }
          } catch (vErr) {
            console.error(vErr);
            toast.error(vErr.response?.data?.message || 'Payment verification failed');
          } finally {
            setPurchasingCustomId(null);
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "",
          contact: "9999999999"
        },
        theme: {
          color: "#38bdf8"
        },
        modal: {
          ondismiss: () => setPurchasingCustomId(null)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('[Purchase Custom] Payment failed', err);
      toast.error(err.response?.data?.message || 'Payment initiation failed.');
      setPurchasingCustomId(null);
    }
  };

  const [dbPlans, setDbPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              if (verifyData.data) {
                if (verifyData.data.membership && setMembership) {
                  setMembership(verifyData.data.membership);
                  localStorage.setItem('user_membership', JSON.stringify(verifyData.data.membership));
                }
                if (verifyData.data.balance !== undefined && setBalance) setBalance(verifyData.data.balance);
              }
              if (refreshProfile) await refreshProfile().catch(err => console.error(err));
              if (refetchProfileContext) await refetchProfileContext().catch(err => console.error(err));
              setPurchasingPlanId(null);
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
          if (popular) {
            setActivePlan(popular.name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
    fetchProposals();
  }, []);

  const plans = dbPlans.filter(p => p.billing_type === (isYearly ? 'yearly' : 'monthly'));

  // Ensure middle plan is active if selected plan is not found in the current plans filter
  useEffect(() => {
    if (plans.length > 0 && !plans.find(p => p.name === activePlan)) {
      const popular = plans.find(p => p.is_popular);
      if (popular) {
        setActivePlan(popular.name);
      } else {
        setActivePlan(plans[Math.floor(plans.length / 2)]?.name || plans[0]?.name);
      }
    }
  }, [plans]);

  const getFeatureIcon = (featureText) => {
    const text = featureText.toLowerCase();
    
    if (text.includes('connect')) {
      return '/Icons/link.png';
    }
    if (text.includes('ai proposal')) {
      const isLight = theme === 'light' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches);
      return isLight ? '/Icons/AI-Connect.png' : '/Icons/White-AI-Connect.png';
    }
    if (text.includes('verified')) {
      return '/Icons/verified.png';
    }
    if (text.includes('service fee')) {
      return '/Icons/icons8-setting-100.png';
    }
    if (text.includes('search')) {
      return '/Icons/icons8-search-64.png';
    }
    if (text.includes('elite partner') || text.includes('partner status')) {
      return '/Icons/icons8-meeting-room-100.png';
    }
    if (text.includes('dedicated') || text.includes('manager')) {
      return '/Icons/icons8-critical-thinking-80.png';
    }
    if (text.includes('priority') || text.includes('visibility')) {
      return '/Icons/icons8-medal-96.png';
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <InfinityLoader/>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 space-y-12">

      {/* Header Section (Match Account Health) */}
      <div className="text-left space-y-4">
        <div className="flex flex-col items-start">
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
            className={`w-12 h-6 rounded-full p-1 relative transition-all duration-300 ${
              isYearly ? 'bg-accent border border-transparent' : 'bg-white/10 border border-white/10'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-bold uppercase tracking-widest ${isYearly ? 'text-white' : 'text-white/30'}`}>Yearly</span>
            <span className="bg-accent/10 text-accent text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Save 20%</span>
          </div>
        </div>
      </div>

      {/* Custom Proposals Section */}
      {customProposals.length > 0 && (
        <div className="space-y-6 w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent animate-pulse" size={20} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Your Custom Proposals</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {customProposals.map((prop) => (
              <div 
                key={prop.id}
                className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm dark:shadow-none"
              >
                {/* Visual decorative background element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-3 flex-1 relative z-10 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-accent/15 text-accent border border-accent/25">
                      Tailored Deal
                    </span>
                    {prop.status === 'PENDING' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 dark:text-amber-400">
                        <Clock size={12} /> Under Review
                      </span>
                    )}
                    {prop.status === 'REVIEWED' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        <Sparkles size={12} /> Proposal Prepared
                      </span>
                    )}
                    {prop.status === 'RESOLVED' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} /> Active Plan
                      </span>
                    )}
                    {prop.status === 'REJECTED' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={12} /> Declined
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mb-1">Your Stated Requirements</h3>
                    <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed italic">"{prop.needs}"</p>
                  </div>

                  {prop.admin_comment && (
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Admin Response</h4>
                      <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">{prop.admin_comment}</p>
                    </div>
                  )}

                  {prop.custom_price && prop.status === 'REVIEWED' && (
                    <div className="flex flex-wrap gap-6 pt-2">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block">Proposed Price</span>
                        <span className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white">₹{prop.custom_price}</span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block">Connects Credits</span>
                        <span className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white">{prop.custom_connects}</span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block">Duration</span>
                        <span className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white uppercase">{prop.custom_duration}</span>
                      </div>
                    </div>
                  )}

                  {prop.custom_features && prop.custom_features.length > 0 && prop.status === 'REVIEWED' && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 block">Included Benefits</span>
                      <div className="flex flex-wrap gap-2">
                        {prop.custom_features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg text-[9px] font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/60">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {prop.status === 'REVIEWED' && (
                  <div className="shrink-0 flex flex-col items-center justify-center min-w-[200px] relative z-10 w-full md:w-auto">
                    <button
                      onClick={() => handleUpgradeCustom(prop)}
                      disabled={purchasingCustomId === prop.id}
                      className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-60 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-transparent"
                    >
                      {purchasingCustomId === prop.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" />
                          Processing...
                        </>
                      ) : (
                        "Accept & Pay"
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 mt-2 text-center">Protected by secure Razorpay checkout</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Card Layout */}
      <div className="relative pt-10 pb-20" id="plans-section">
        <div className="flex flex-row items-center lg:items-stretch justify-center gap-2 sm:gap-6 w-full max-w-6xl mx-auto px-1 sm:px-4 relative h-[530px] lg:h-auto overflow-visible">
          {plans.map((plan, index) => {
            // Exact ID match for the user's active plan row or fallback to free plan
            const isActivePlanInDb = membership 
              ? membership.plan_id === plan.id 
              : (plan.price === 0);

            const isPopular = plan.is_popular;
            const isSelected = activePlan === plan.name;

            const activeIndex = index;
            const selectedIndex = plans.findIndex(p => p.name === activePlan);
            const offset = activeIndex - selectedIndex;

            return (
              <motion.div
                key={plan.id}
                layout
                onClick={() => setActivePlan(plan.name)}
                animate={isLargeScreen 
                  ? {
                      scale: isSelected ? 1.05 : 0.95,
                      y: isSelected ? 0 : 32,
                      x: 0,
                      opacity: isSelected ? 1 : 0.8,
                      zIndex: isSelected ? 20 : 10
                    }
                  : {
                      scale: isSelected ? 1 : 0.9,
                      x: offset * 50,
                      y: isSelected ? 0 : 20,
                      opacity: isSelected ? 1 : 0.5,
                      zIndex: 20 - Math.abs(offset) * 5
                    }
                }
                whileHover={isLargeScreen 
                  ? {
                      scale: isSelected ? 1.08 : 0.98,
                      y: isSelected ? -4 : 28,
                    }
                  : {}
                }
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8
                }}
                className={`cursor-pointer border flex flex-col transition-all duration-300 shadow-none ${
                  isLargeScreen 
                    ? 'relative w-full' 
                    : 'absolute w-[260px] left-[calc(50%-130px)]'
                } ${
                  isSelected
                    ? 'bg-secondary border-accent/40 shadow-none ring-1 ring-white/10 z-10 p-6 lg:p-10 lg:max-w-[400px] rounded-3xl'
                    : 'bg-secondary/40 border-transparent shadow-none backdrop-blur-md opacity-80 hover:opacity-100 p-6 lg:p-8 lg:max-w-[360px] rounded-3xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-none whitespace-nowrap">
                    Most Chosen
                  </div>
                )}

                <div className="text-center mb-8 border-b border-white/5 pb-8">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    {plan.name}
                  </h3>
                  <div className="flex flex-col items-center mt-4">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-white/40 mr-1 mt-1">₹</span>
                      <span className="text-4xl font-black text-white">
                        {plan.price / 100}
                      </span>
                    </div>
                    {plan.price > 0 && (
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        per {isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-6 mb-10">
                  {plan.membership_features?.map((f, fIndex) => (
                    <div key={f.id || fIndex} className="flex items-center gap-4">
                      {getFeatureIcon(f.feature) ? (
                        <img 
                          src={getFeatureIcon(f.feature)} 
                          alt={f.feature} 
                          className={`h-6 w-6 shrink-0 object-contain transition-all duration-300 ${
                            isSelected ? 'opacity-100' : 'opacity-40 filter grayscale'
                          }`}
                        />
                      ) : (
                        <Check size={18} className={`shrink-0 transition-colors duration-300 ${isSelected ? 'text-accent' : 'text-white/20'}`} />
                      )}
                      <span className={`text-xs sm:text-sm font-medium leading-tight transition-colors duration-300 ${
                        isSelected ? 'text-white/80' : 'text-white/30'
                      }`}>
                        {f.feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.price > 0 && !isActivePlanInDb) {
                      handleUpgrade(plan);
                    }
                  }}
                  disabled={purchasingPlanId === plan.id || isActivePlanInDb}
                  className={`w-full py-3.5 lg:py-4 rounded-full font-bold text-xs transition-all shadow-none active:scale-95 flex items-center justify-center gap-2 ${
                    isActivePlanInDb
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40 cursor-default border border-slate-200 dark:border-white/5 shadow-none'
                      : isSelected
                        ? 'bg-accent text-white hover:bg-accent/90 disabled:opacity-60 shadow-none'
                        : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white shadow-none'
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
      <div className="bg-secondary border border-slate-200 dark:border-white/10 rounded-xl px-6 sm:px-10 py-8 sm:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-12 shadow-sm dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full lg:max-w-2xl">
          <div className="flex lg:inline-flex items-center justify-between lg:justify-start lg:gap-3 w-full lg:w-auto px-4 py-2.5 lg:py-1.5 rounded-xl lg:rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6">
            <div className="flex items-center">
              <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-5 sm:h-7 object-contain block dark:hidden" />
              <img src="/Logo2.png" alt="Connect" className="h-4 sm:h-6 object-contain hidden dark:block" />
            </div>
            <span className="lg:border-l lg:border-accent/30 lg:pl-3">Enterprise</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 leading-tight">
            Need a limitless solution for a large organization?
          </h2>
          <p className="text-slate-500 dark:text-white/50 text-[10px] sm:text-xs font-medium leading-relaxed">
            Design a custom-tailored plan for large agencies or corporate teams that breaks standard platform limits and drives extreme scalability.
          </p>
        </div>
        <button onClick={() => setIsSalesModalOpen(true)}
          className="relative z-10 shrink-0 bg-accent text-white px-7 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-[15px] hover:bg-accent/90 transition-all shadow-none flex items-center group w-full sm:w-auto justify-center">
          Talk to Sales
        </button>
      </div>

      {/* MODAL (Unchanged but ensuring it aligns with dark design) */}
      <AnimatePresence>
        {isSalesModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsSalesModalOpen(false)}
              className="absolute inset-0 bg-primary/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm aspect-square flex flex-col justify-between bg-secondary border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 z-10 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setIsSalesModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200 p-1.5 rounded-full hover:bg-white/5 z-20"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <img src="/Logo2.png" alt="Logo" className="h-7 object-contain" />
                  </div>
                  <p className="text-slate-500 dark:text-white/40 text-xs px-2 leading-relaxed">
                    Reach out to our team for custom platform configurations and volume pricing.
                  </p>
                </div>

                <form className="mt-4 flex-1 flex flex-col justify-between gap-3" onSubmit={handleSalesSubmit}>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest pl-1 block">Work Email</label>
                      <input 
                        type="email" 
                        required 
                        value={salesEmail} 
                        onChange={(e) => setSalesEmail(e.target.value)} 
                        className="w-full bg-primary border border-slate-200 dark:border-white/5 focus:border-accent/50 outline-none rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm" 
                        placeholder="john@company.com" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest pl-1 block">Organizational Needs</label>
                      <textarea 
                        rows={2} 
                        required 
                        value={salesNeeds} 
                        onChange={(e) => setSalesNeeds(e.target.value)} 
                        className="w-full bg-primary border border-slate-200 dark:border-white/5 focus:border-accent/50 outline-none rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm resize-none" 
                        placeholder="Describe your scaling requirements..." 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingSales} 
                    className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-60 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent mt-2"
                  >
                    {isSubmittingSales ? (
                      <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                    ) : (
                      "Request Custom Proposal"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembershipPage;
