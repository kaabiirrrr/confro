import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, TrendingUp, ArrowRight, LayoutGrid, RefreshCw, Star, Shield, Zap, Clock, Crown, DollarSign } from "lucide-react";
import JobCard from "../components/JobCard";
import JobFiltersModal from "../components/JobFiltersModal";
import InterventionBanner from "../common/InterventionBanner";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import { profileApi } from "../../../services/profileApi";
import logger from "../../../utils/logger";
import InfinityLoader from "../../common/InfinityLoader";
import { formatINR } from "../../../utils/currencyUtils";
import { cleanImageUrl } from "../../../utils/imageUrl";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  getJobStats,
  getFreelancerStats,
  searchJobs,
  getBestMatchJobs,
  getRecentJobs,
  getSavedJobIds,
  getSavedJobs,
  toggleBookmarkJob as toggleSaveJob
} from "../../../services/apiService";
import { useRealtimeJobs } from "../../../context/RealtimeContext";
import { useDashboardCache } from "../../../context/DashboardCacheContext";

import { getApiUrl } from '../../../utils/authUtils';
const API_URL = getApiUrl();

// Memoized Promo Slider to prevent unnecessary re-animations
const PromoSlider = memo(({ ads, currentAd, setCurrentAd }) => {
  return (
    <div className="relative group rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden bg-primary/20 backdrop-blur-xl h-[180px] sm:h-[300px] flex items-center">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentAd}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            src={cleanImageUrl(ads[currentAd].image, ads[currentAd].title)}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/ad-direct-contracts.png' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-16 gap-4 sm:gap-8 w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
          <Zap size={12} className="fill-accent" /> Featured Highlight
        </div>
        <div className="space-y-1 sm:space-y-3">
          <h2 className="text-xl sm:text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter">
            {ads[currentAd].title}
          </h2>
          <p className="text-white/60 text-sm sm:text-lg font-medium max-w-lg leading-relaxed hidden sm:block">
            {ads[currentAd].text}
          </p>
        </div>
        <button className="px-5 sm:px-8 h-10 sm:h-14 bg-accent text-white font-black rounded-full hover:scale-105 transition-all flex items-center gap-2 sm:gap-4 active:scale-95 text-sm sm:text-base">
          {ads[currentAd].button} <ArrowRight size={16} />
        </button>
      </div>

      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-16 flex gap-2 sm:gap-3 z-20">
        {ads.map((_, i) => (
          <button key={i} onClick={() => setCurrentAd(i)} className={`h-1.5 sm:h-2 rounded-full transition-all duration-700 ${currentAd === i ? 'w-8 sm:w-10 bg-accent' : 'w-2 sm:w-3 bg-white/10 hover:bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
});

// Memoized Analytics Grid
const AnalyticsGrid = memo(({ freelancerStats, reliability }) => {
    const { wallet, profile, role, refreshWallet, membership: authMembership } = useAuth();
    const [membership, setMembership] = useState(null);
    const [connectWallet, setConnectWallet] = useState(null);

    const isClient = role === 'CLIENT';
    const basePath = isClient ? '/client' : '/freelancer';

    useEffect(() => {
        const fetchFinData = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Current Membership
                const { data: memRes } = await axios.get(`${API_URL}/api/membership/current`, { headers });
                if (memRes.success) setMembership(memRes.data);

                // Fetch Real-time Connect Wallet
                const { data: wallRes } = await axios.get(`${API_URL}/api/connects/balance`, { headers });
                if (wallRes.success) setConnectWallet(wallRes.data);

                // Refresh Money Wallet Balance
                await refreshWallet();
            } catch (err) { console.error('Failed to fetch dashboard fin data', err); }
        };
        fetchFinData();
    }, [refreshWallet]);

  const items = useMemo(() => {
    // Prefer live API response, fallback to auth context, then profile field, then FREE
    const activeMembership = membership || authMembership;
    const plan = activeMembership?.plan?.name || activeMembership?.plan_snapshot?.name || profile?.membership_type || 'FREE';

    // Calculate Next Top-up
    let nextTopupStr = '30 days';
    if (connectWallet?.last_topup_date) {
      const last = new Date(connectWallet.last_topup_date);
      const next = new Date(last.getTime() + 30 * 24 * 60 * 60 * 1000);
      const options = { day: 'numeric', month: 'short' };
      nextTopupStr = next.toLocaleDateString('en-IN', options);
    }

    return [
      {
        label: "Current Plan",
        value: plan,
        icon: "plan",
        badge: true,
        subValue: activeMembership?.status === 'ACTIVE' ? `Renew: ${new Date(activeMembership.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Free Tier'
      },
      {
        label: "Available Connects",
        value: connectWallet?.balance || 0,
        icon: "connects",
        subValue: `Refill: ${nextTopupStr}`
      },
      {
        label: "Wallet Balance",
        value: formatINR(wallet?.balance || 0),
        icon: "credits",
        subValue: wallet?.is_sandbox ? "Demo Wallet" : "Real Wallet"
      },
      {
        label: "Reliability",
        value: `${reliability?.score ?? 100}%`,
        icon: "reliability",
        subValue: reliability?.isNew ? "New Freelancer" : `${reliability?.stats?.logs || 0}/${reliability?.stats?.expected || 30} days tracked`
      },
    ];
  }, [reliability, wallet, membership, authMembership, profile, connectWallet]);

  const ICON_MAP = {
    plan: <img src="/Icons/icons8-membership-card-100.png" alt="" className="w-full h-full object-contain" />,
    connects: <img src="/Icons/link.png" alt="" className="w-full h-full object-contain" />,
    credits: <img src="/Icons/icons8-rupee-64.png" alt="" className="w-full h-full object-contain" />,
    reliability: <img src="/Icons/icons8-reliability-68.png" alt="" className="w-full h-full object-contain" />,
    growth: <img src="/Icons/icons8-growth-100.png" alt="" className="w-full h-full object-contain" />
  };

  return (
    <div className="space-y-4 mb-4">
      {/* System Health Guard */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-white/5 border border-white/5 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/40 whitespace-nowrap">Connect Economy Active</span>
        </div>
        <Link to={`${basePath}/buy-connects`} className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-accent hover:text-white transition-colors whitespace-nowrap">
          Refill Connects
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-y-6 sm:gap-0 -mx-3 sm:mx-0">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group transition-all px-3 sm:px-4 w-1/2 sm:w-auto flex-shrink-0"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110">
                {typeof item.icon === 'string' ? ICON_MAP[item.icon] : item.icon}
              </div>
              <h3 className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-tight text-center sm:text-left">{item.label}</h3>
            </div>
            <p className={`text-center sm:text-left text-lg sm:text-xl font-black tracking-tight ${item.badge ? 'text-accent' : 'text-white'}`}>
              {item.value}
            </p>
            {item.subValue && (
              <p className="text-center sm:text-left text-[8px] font-medium text-white/20 uppercase tracking-widest mt-0.5">
                {item.subValue}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});

function DashboardHome() {
  const profileContext = useProfile();
  const authContext = useAuth();
  const cacheContext = useDashboardCache();

  const profile = profileContext?.status;
  const user = authContext?.user;
  const userId = user?.id;

  const {
    stats: cachedStats,
    jobs: cachedJobs,
    savedJobIds: cachedSavedJobIds,
    setSavedJobIds,
    updateStats,
    updateJobs,
    isFresh,
    clearCache
  } = cacheContext || {};

  const [activeTab, setActiveTab] = useState("BEST MATCHES");
  const [jobs, setJobs] = useState(cachedJobs?.["BEST MATCHES"] || []);
  const [savedJobs, setSavedJobs] = useState(cachedJobs?.["SAVED JOBS"] || []);
  const [loading, setLoading] = useState(isFresh ? !isFresh(`jobs_${activeTab}`) : true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: [], budget_type: [], experience_level: [] });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [jobStats, setJobStats] = useState(cachedStats);
  const [freelancerStats, setFreelancerStats] = useState({
    total_proposals: 0,
    active_contracts: 0,
    profile_views: 0,
    search_presence: 0,
    connects: 0
  });
  const [currentAd, setCurrentAd] = useState(0);
  const [reliability, setReliability] = useState(null);
  const [showInsight, setShowInsight] = useState(true);

  const [savedJobIdsInternal, setSavedJobIdsInternal] = useState(cachedSavedJobIds || new Set());


  useEffect(() => {
    if (setSavedJobIds && savedJobIdsInternal) setSavedJobIds(savedJobIdsInternal);
  }, [savedJobIdsInternal, setSavedJobIds]);

  const tabs = useMemo(() => ["BEST MATCHES", "MOST RECENT", "SAVED JOBS"], []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getFreelancerStats();
        if (res.success) setFreelancerStats(res.data);
      } catch (err) { console.error(err); }
    };

    const fetchReliability = async () => {
      if (!userId) return;
      try {
        const res = await profileApi.getReliabilityData(userId);
        if (res.success) setReliability(res.data);
      } catch (err) { logger.error(err); }
    };

    fetchStats();
    fetchReliability();
  }, [userId]);


  useEffect(() => {
    const fetchSavedIds = async () => {
      if (!userId || (isFresh && isFresh('saved_ids'))) return;
      try {
        const res = await getSavedJobIds();
        if (res.success) setSavedJobIdsInternal(new Set(res.data));
      } catch (err) { console.error(err); }
    };
    fetchSavedIds();
  }, [userId, isFresh]);

  const ads = useMemo(() => [
    { title: "Direct Contracts", text: "Create contracts and bring new clients with a low 5% service fee.", button: "Create contract", image: "/ad-direct-contracts.png" },
    { title: "Boost Your Profile", text: "Higher visibility leads to more job invites. Try profile boosting.", button: "Boost profile", image: "/ad-boost-profile.png" }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentAd(p => (p + 1) % ads.length), 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const fetchJobs = useCallback(async (force = false) => {
    if (!isFresh) return;

    // Check if we already have data for this tab and it's fresh (skip jobs/savedJobs from deps to avoid stale closure loop)
    if (!force && isFresh(`jobs_${activeTab}`)) return;

    setLoading(true);
    try {
      if (activeTab === "SAVED JOBS") {
        const res = await getSavedJobs();
        if (res?.success) {
          const data = res.data || [];
          setSavedJobs(data);
          if (updateJobs) updateJobs("SAVED JOBS", data);
        }
      } else {
        const res = (activeTab === "BEST MATCHES" && userId) ? await getBestMatchJobs(userId) : await getRecentJobs();
        if (res?.success) {
          const data = res.data || [];
          setJobs(data);
          if (updateJobs) updateJobs(activeTab, data);
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [activeTab, userId, isFresh, updateJobs]);

  // Fetch jobs on mount and whenever the active tab changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (searchQuery.trim()) {
      if (activeTab === "SAVED JOBS") return; // Local filter handles saved jobs

      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await searchJobs(searchQuery);
          if (res?.success) setJobs(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
      }, 300); // Snappier 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab]);

  const handleToggleSave = useCallback(async (jobId, isNowSaved) => {
    setSavedJobIdsInternal(prev => {
      const next = new Set(prev);
      if (isNowSaved) next.add(jobId); else next.delete(jobId);
      return next;
    });
    if (activeTab === "SAVED JOBS" && !isNowSaved) {
      setSavedJobs(p => p.filter(j => j.id !== jobId));
    }
    await toggleSaveJob(jobId);
  }, [activeTab]);

  const handleManualRefresh = useCallback(() => {
    if (clearCache) clearCache();
    fetchJobs(true);
  }, [clearCache, fetchJobs]);

  const displayedJobs = useMemo(() => {
    let list = activeTab === "SAVED JOBS" ? savedJobs : jobs;

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.skills || []).some(s => s.toLowerCase().includes(query)) ||
        (job.category || "").toLowerCase().includes(query)
      );
    }

    const hasFilters = Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : !!val);
    if (!hasFilters) return list;

    return list.filter(job => {
      if (filters.experience_level?.length > 0) {
        const jobExp = (job.experience_level || "").toLowerCase();
        const matches = filters.experience_level.some(fl => jobExp.includes(fl) || fl.includes(jobExp));
        if (!matches) return false;
      }
      if (filters.budget_type?.length > 0) {
        const jobType = (job.budget_type || "").toLowerCase();
        const matches = filters.budget_type.some(fl => jobType.includes(fl) || fl.includes(jobType));
        if (!matches) return false;
      }
      if (filters.budget_min && job.budget !== null && job.budget !== undefined) {
        if (Number(job.budget) < Number(filters.budget_min)) return false;
      }
      if (filters.budget_max && job.budget !== null && job.budget !== undefined) {
        if (Number(job.budget) > Number(filters.budget_max)) return false;
      }
      return true;
    });
  }, [jobs, savedJobs, activeTab, searchQuery, filters]);

  return (
    <div className="w-full space-y-8 pb-20 font-sans tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
      <InterventionBanner />
      <JobFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filters}
        onApply={setFilters}
        stats={jobStats}
      />

      {/* COMPLETED PROFILE BANNER */}
      {profile && profile.profile_completion_percentage < 100 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-transparent border border-white/5 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 overflow-hidden relative group hover:border-white/10 transition-all">
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-black text-accent text-xs shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.1)]">
              {profile.profile_completion_percentage}%
            </div>
            <div className="space-y-0.5">
              <h4 className="font-black text-accent tracking-widest uppercase text-[10px]">Profile Incomplete</h4>
              <p className="text-white/60 font-medium text-xs sm:text-[13px] tracking-tight">Boost your visibility by 3x by completing your profile.</p>
            </div>
          </div>
          <a href="/freelancer/setup-profile" className="px-4 sm:px-6 py-2 bg-transparent border border-accent/40 text-accent font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-accent/10 transition-all shadow-lg shadow-accent/5 self-start sm:self-auto">
            Continue Setup
          </a>
        </motion.div>
      )}

      {/* Connect AI Quick Insight */}
      {showInsight && reliability?.insight && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pb-3 border-b border-white/5 flex items-start sm:items-center justify-between gap-3 sm:gap-4 mt-2 group"
        >
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-5 h-5 shrink-0 flex items-center justify-center mt-1 sm:mt-0">
              <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="w-full h-full object-contain dark:hidden brightness-0" />
              <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="w-full h-full object-contain hidden dark:block grayscale opacity-70" />
            </div>
            <div className="space-y-1 sm:space-y-0.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-black text-accent uppercase tracking-widest shrink-0">Connect AI Performance</span>
                <span className="w-1 h-1 bg-slate-900/20 dark:bg-white/20 rounded-full shrink-0" />
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest shrink-0 ${reliability.insight.risk === 'low' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{reliability.insight.risk} Risk</span>
              </div>
              <p className="text-slate-900/60 dark:text-white/80 text-[13px] sm:text-sm font-medium leading-relaxed italic break-words text-justify">
                "{reliability.insight.summary}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInsight(false)}
            className="text-slate-400 dark:text-white/20 hover:text-accent transition-all p-1 shrink-0 mt-0.5 sm:mt-0"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      <PromoSlider ads={ads} currentAd={currentAd} setCurrentAd={setCurrentAd} />

      <AnalyticsGrid freelancerStats={freelancerStats} reliability={reliability} />


      {/* FEED CONTROLS */}
      <div className="space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-4 sm:gap-8 border-b border-white/5 pb-6">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">Active Market</h2>
            <p className="text-[12px] sm:text-lg text-white/40 font-medium">Real-time opportunities matched to your profile.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={handleManualRefresh}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-0 sm:px-6 w-10 h-10 sm:w-auto sm:h-11 rounded-full text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-accent sm:text-white/60 sm:border sm:border-white/10 hover:text-accent hover:border-accent uppercase transition-all group"
            >
              <RefreshCw size={18} className={`sm:w-3.5 sm:h-3.5 sm:text-accent ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">SYNC</span>
            </button>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="relative flex items-center justify-center gap-1.5 sm:gap-2 px-0 sm:px-6 w-10 h-10 sm:w-auto sm:h-11 rounded-full text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] bg-transparent sm:bg-accent text-accent sm:text-white hover:bg-white/5 sm:hover:bg-accent/80 uppercase transition-all group"
            >
              <Filter size={18} className="sm:w-3.5 sm:h-3.5 text-accent sm:text-white" />
              <span className="hidden sm:inline">
                {Object.values(filters).flat().length > 0 ? `FILT (${Object.values(filters).flat().length})` : 'FILTER'}
              </span>
              {Object.values(filters).flat().length > 0 && (
                <span className="sm:hidden absolute top-0 right-0 w-4 h-4 bg-accent text-white text-[9px] flex items-center justify-center rounded-full border border-primary font-bold">
                  {Object.values(filters).flat().length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-6">
          {/* SEARCH BAR */}
          <div className="relative group w-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {loading ? (
                <RefreshCw size={18} className="text-accent animate-spin" />
              ) : (
                <Search size={18} className="text-white/20 group-focus-within:text-accent transition-colors" />
              )}
            </div>
            <input
              type="text"
              placeholder="Search for jobs, skills, or keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 sm:h-14 pl-12 pr-6 bg-white/[0.02] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/[0.05] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white transition-all active:scale-90">
                <X size={12} />
              </button>
            )}
          </div>

          {/* TABS */}
          <div className="flex items-center w-full justify-between border-b border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 sm:pb-6 text-[8px] sm:text-[10px] font-black tracking-wider sm:tracking-[0.3em] transition-all relative uppercase flex-1 text-center ${activeTab === tab ? "text-accent" : "text-white/20 hover:text-white"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FEED GRID */}
        <div className="space-y-10 min-h-[500px]">
          {loading ? (
            <InfinityLoader fullScreen={false} text="Syncing Network..."/>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="text-white/5 mx-auto mb-6" />
              <h3 className="text-xl font-black text-white mb-2">Zero Matches Found</h3>
              <p className="text-white/20 text-sm font-medium">Try broadening your search or sync your profile tags.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {displayedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIdsInternal.has(job.id)}
                  onToggleSave={handleToggleSave}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardHome);