import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import VerifyEmailCard from "../components/VerifyEmailCard";
import InterventionBanner from "../../common/InterventionBanner";
import {
  Plus, Search, Mail, Shield, ShieldCheck, LayoutGrid, List, ChevronLeft, ChevronRight, X, ArrowRight,
  Briefcase, FileSignature, Clock, CheckCircle2, AlertCircle, BadgeCheck, CreditCard
} from "lucide-react";
import axios from "axios";
import { supabase } from "../../../../lib/supabase";
import { getOnboardingStatus, sendVerificationEmail, getClientDashboard, getAllServices, getClientWorkSummary, askForWorkUpdate } from "../../../../services/apiService";
import api from "../../../../lib/api";
import { getApiUrl } from "../../../../utils/authUtils";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import SectionHeader from "../../../ui/SectionHeader";
import Button from "../../../ui/Button";
import InfinityLoader from '../../../common/InfinityLoader';
import WalletModal from '../../../common/WalletModal';
import { formatINR } from "../../../../utils/currencyUtils";
import { cleanImageUrl } from "../../../../utils/imageUrl";

const categories = [
  { title: "Development & IT", value: "development", image: "/dev copy.png" },
  { title: "AI Services", value: "ai", image: "/ai.png" },
  { title: "Marketing", value: "marketing", image: "/marketing.png" },
  { title: "Design & Creative", value: "design", image: "/design.png" },
  { title: "Writing & Translation", value: "writing", image: "/writing.png" },

  { title: "Development & IT", image: "/dev copy.png" },
  { title: "AI Services", image: "/ai.png" },
  { title: "Marketing", image: "/marketing.png" },
  { title: "Design", image: "/design.png" },
  { title: "Writing & Translation", image: "/writing.png" },
  { title: "Administration", image: "/admin.png" },
];

const STATUS_CFG = {
  OPEN: { cls: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", Icon: CheckCircle2 },
  DRAFT: { cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", Icon: Clock },
  IN_PROGRESS: { cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", Icon: Clock },
  ACTIVE: { cls: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", Icon: CheckCircle2 },
  COMPLETED: { cls: "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/10", Icon: CheckCircle2 },
  PENDING: { cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", Icon: AlertCircle },
};

const StatusBadge = ({ status }) => {
  const s = (status || "").toUpperCase();
  const cfg = STATUS_CFG[s] || { cls: "bg-white/5 text-white/40 border-white/10", Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.cls} capitalize`}>
      <cfg.Icon size={10} />
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STAT_CARDS = [
  { key: "open_jobs", label: "Open Jobs", Icon: ({ size }) => <img src="/Icons/icons8-jobs-64.png" alt="Open Jobs" style={{ width: size, height: size }} className="object-contain" />, color: "text-accent", bg: "bg-accent/10" },
  { key: "active_contracts", label: "Active Contracts", Icon: ({ size }) => <img src="/Icons/icons8-contract-60.png" alt="Active Contracts" style={{ width: size, height: size }} className="object-contain" />, color: "text-green-400", bg: "bg-green-500/10" },
  { key: "pending_proposals", label: "Pending Proposals", Icon: ({ size }) => <img src="/Icons/icons8-time-machine-100 copy.png" alt="Pending Proposals" style={{ width: size, height: size }} className="object-contain" />, color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

const fmtTimeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const WorkActivityCard = ({ activity, onAskUpdate, onClick }) => (
  <div
    onClick={onClick}
    className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-accent/40 cursor-pointer transition shadow-sm backdrop-blur-sm group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 overflow-hidden">
          {activity.freelancer?.avatar_url ? (
            <img src={cleanImageUrl(activity.freelancer.avatar_url, activity.freelancer.name)} className="w-full h-full object-cover" alt={activity.freelancer.name} />
          ) : (
            <Briefcase size={18} />
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white/90 truncate max-w-[140px] group-hover:text-accent transition-colors">{activity.jobTitle}</h4>
          <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest leading-none mt-1">{activity.freelancer?.name || 'Assigned'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tighter leading-none">{activity.hoursToday || 0}h</p>
        <p className="text-[8px] text-slate-400 dark:text-white/20 uppercase font-bold tracking-widest mt-1">Today</p>
      </div>
    </div>

    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 mb-4 relative overflow-hidden group/note">
      <div className="flex items-center gap-2 mb-1.5">
        <Clock size={10} className="text-slate-300 dark:text-white/20" />
        <span className="text-[8px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Last Activity: {fmtTimeAgo(activity.lastUpdate)}</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-white/50 line-clamp-2 italic leading-relaxed">
        {activity.notePreview || "No notes logged for today yet."}
      </p>
    </div>

    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${activity.status === 'UPDATED' ? 'bg-green-500 animate-pulse' : 'bg-slate-200 dark:bg-white/20'}`} />
        <span className="text-[9px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">{activity.status?.replace(/_/g, ' ')}</span>
      </div>
      {activity.status === 'PENDING' && (
        <button
          onClick={(e) => { e.stopPropagation(); onAskUpdate(activity.jobId, activity.freelancer?.id); }}
          className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-1"
        >
          Ask Update <ArrowRight size={10} />
        </button>
      )}
    </div>
  </div>
);

// Connects Activity Section
const ConnectsActivitySection = memo(() => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/connects/history?dateFilter=30')
      .then(res => { if (res.data.success) setHistory(res.data.data.slice(0, 5)); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!history.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Connect Activity</h3>
        <Link to="/client/connects" className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition">View All →</Link>
      </div>
      <div className="overflow-hidden divide-y divide-white/5">
        {history.map((tx, i) => (
          <div key={tx.id || i} className="px-2 py-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-white">{tx.description}</p>
                <p className="text-xs text-white/30">{fmtDate(tx.created_at)}</p>
              </div>
            </div>
            <span className={`text-sm font-black ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

// Memoized Analytics Grid for Client
const AnalyticsGrid = memo(({ stats }) => {
  const { wallet, profile, role, membership: authMembership } = useAuth();
  const [membership, setMembership] = useState(null);
  const [connectWallet, setConnectWallet] = useState(null);

  const isClient = role === 'CLIENT';
  const basePath = isClient ? '/client' : '/freelancer';

  useEffect(() => {
    const fetchFinData = async () => {
      try {
        // Fetch Current Membership
        const { data: memRes } = await api.get('/api/membership/current');
        if (memRes.success) setMembership(memRes.data);

        // Fetch Real-time Connect Wallet
        const { data: wallRes } = await api.get('/api/connects/balance');
        if (wallRes.success) setConnectWallet(wallRes.data);
      } catch (err) { console.error('Failed to fetch dashboard fin data', err); }
    };
    fetchFinData();
  }, []);

  const items = useMemo(() => {
    const planName = membership?.plan_snapshot?.name
      || membership?.plan?.name
      || authMembership?.plan_snapshot?.name
      || authMembership?.plan?.name
      || profile?.membership_type
      || "Free";

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
        label: "Hiring Plan",
        value: planName,
        icon: "plan",
        badge: true
      },
      {
        label: "Post Credits",
        value: connectWallet?.balance || 0,
        icon: "connects",
        subValue: `Next: ${nextTopupStr}`
      },
      {
        label: "Available Balance",
        value: formatINR(wallet?.balance || 0),
        icon: "credits"
      },
      {
        label: "Trust Score",
        value: `${profile?.trust_score || 0}%`,
        icon: "reliability"
      },
    ];
  }, [wallet, membership, profile, connectWallet]);

  const ICON_MAP = {
    plan: <img src="/Icons/icons8-membership-card-100.png" alt="" className="w-full h-full object-contain" />,
    connects: <img src="/Icons/link.png" alt="" className="w-full h-full object-contain" />,
    credits: <img src="/Icons/icons8-rupee-64.png" alt="" className="w-full h-full object-contain" />,
    reliability: <img src="/Icons/icons8-reliability-68.png" alt="" className="w-full h-full object-contain" />,
    growth: <img src="/Icons/icons8-growth-100.png" alt="" className="w-full h-full object-contain" />
  };

  return (
    <div className="space-y-4 mb-8">
      {/* System Health Guard */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-white/5 border border-white/5 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/40 whitespace-nowrap">Capital Economy Active</span>
        </div>
        <Link to={`${basePath}/buy-connects`} className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-accent hover:text-white transition-colors whitespace-nowrap">
          Refill Post Credits
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
                {ICON_MAP[item.icon]}
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

const ClientDashboardHome = () => {
  const { profile, wallet, refreshWallet } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("grid");
  const scrollRef = useRef(null);

  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const servicesScrollRef = useRef(null);

  const [workSummary, setWorkSummary] = useState([]);
  const [workLoading, setWorkLoading] = useState(true);

  const [walletHistory, setWalletHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // TOP-UP MODAL STATE
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Refresh wallet on mount so balance is always live
  useEffect(() => { refreshWallet(); }, []);


  useEffect(() => {
    if (!profile) return;

    const fetchDash = async () => {
      try {
        const res = await getClientDashboard();
        setDashData(res?.data ?? res);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setDashLoading(false);
      }
    };
    const fetchOnboarding = async () => {
      try {
        const res = await getOnboardingStatus();
        setOnboarding(res?.data ?? res);
      } catch {
        // non-critical
      }
    };
    const fetchServices = async () => {
      try {
        const res = await getAllServices({ limit: 50 });
        setServices(res?.data || []);
      } catch (err) {
        console.error("Services fetch error:", err);
      } finally {
        setServicesLoading(false);
      }
    };
    const fetchWorkSummary = async () => {
      try {
        const res = await getClientWorkSummary();
        setWorkSummary(res.data || []);
      } catch (err) {
        console.error("Work summary error:", err);
      } finally {
        setWorkLoading(false);
      }
    };
    const fetchHistory = async () => {
      try {
        const { data: res } = await api.get('/api/wallet/history');
        if (res.success) setWalletHistory(res.data || []);
      } catch (err) {
        console.error("Wallet history error:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchDash();
    fetchOnboarding();
    fetchServices();
    fetchWorkSummary();
    fetchHistory();
  }, [profile]);


  const handleTopupSuccess = () => {
    refreshWallet();
  };

  const handleAskUpdate = async (jobId, freelancerId) => {
    try {
      await askForWorkUpdate({ job_id: jobId, freelancer_id: freelancerId });
      toast.success('Wait, update request sent to freelancer', { icon: '📬' });
      // Refresh summary
      const res = await getClientWorkSummary();
      setWorkSummary(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Daily limit reached for this job');
    }
  };


  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent — check your inbox");
    } catch (err) {
      toastApiError(err, "Could not send verification email");
    } finally {
      setSendingVerification(false);
    }
  };

  const showEmailCard = onboarding && onboarding.email_verified === false;
  const showBillingCard = onboarding && onboarding.has_billing_method === false;
  const showOnboarding = !dashLoading && onboarding && (showEmailCard || showBillingCard);
  const isFullySetup = onboarding && onboarding.email_verified && onboarding.has_billing_method;

  const stats = dashData?.stats ?? {};
  const overviewJobs = dashData?.jobs ?? [];
  const overviewContracts = dashData?.active_contracts ?? [];

  // Deduplicate: If a job has an active contract, prioritize the contract over the job posting
  const contractJobIds = new Set(overviewContracts.map(c => c.job_id).filter(Boolean));
  const filteredJobs = overviewJobs.filter(j => !contractJobIds.has(j.id));
  const overviewItems = [...overviewContracts, ...filteredJobs];
  const hasOverview = overviewItems.length > 0;

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const scrollServicesLeft = () => servicesScrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollServicesRight = () => servicesScrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });


  return (
    <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-6 sm:py-8 text-light-text font-sans tracking-tight">
      <InterventionBanner />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {profile?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-[11px] sm:text-sm text-white/40 mt-1 font-medium">Review your performance, managed talent, and operational insights.</p>
        </div>
        <Button
          onClick={() => navigate('/client/post-job')}
          className="rounded-full px-6 h-10 sm:h-12 text-sm font-semibold shadow-lg shadow-accent/20 hover:scale-105 transition-all w-full sm:w-fit"
        >
          Post a Job
        </Button>
      </div>

      <AnalyticsGrid stats={stats} />

      {/* ENTERPRISE WALLET SECTION (V3 - REAL DATA) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 p-6 rounded-[24px] border border-slate-200 dark:border-white/10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <Shield size={120} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-accent">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] whitespace-nowrap sm:whitespace-normal text-slate-900 dark:text-white/60 mb-1">
                Enterprise Wallet (Verified)
              </h3>
              <p className="text-slate-600 dark:text-white/60 text-xs font-medium">Manage your project funding and escrow balance securely.</p>
            </div>
          </div>
          <Shield className="hidden sm:block absolute top-1/2 -right-8 -translate-y-1/2 w-48 h-48 text-accent/5 -rotate-12" />

          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 w-full sm:w-auto relative z-10">
            <div className="flex items-center justify-between w-full sm:w-auto sm:gap-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Available Balance</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatINR(wallet?.balance || 0)}
                </span>
              </div>
              <div className="flex flex-col text-right sm:text-left">
                <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">In Escrow</span>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" title="Securely Held" />
                </div>
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {formatINR(wallet?.pending_balance || 0)}
                  </span>
                  <ShieldCheck size={14} className="text-emerald-500/40" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center w-full sm:w-auto">
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-[0.1em] hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PREMIUM TOP-UP MODAL */}
      <WalletModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopupSuccess}
      />

      {/* CONNECTS ACTIVITY SECTION */}
      <ConnectsActivitySection />

      {/* TRANSACTION HISTORY SECTION */}
      {walletHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Recent Activity</h4>
            </div>
          </div>
          <div className="overflow-hidden divide-y divide-white/5">
            {walletHistory.slice(0, 5).map((tx, idx) => (
              <div key={tx.id || idx} className="p-4 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{tx.description || 'Wallet Transaction'}</p>
                    <p className="text-xs text-white/30 font-medium">{fmtDate(tx.created_at)} • {tx.status || 'completed'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatINR(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* REQUIRED STEPS — only shown while incomplete */}
      {showOnboarding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {showEmailCard && (
            <button
              onClick={handleSendVerification}
              disabled={sendingVerification}
              className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 flex justify-between items-start hover:border-accent/30 transition shadow-sm backdrop-blur-sm text-left w-full disabled:opacity-60 relative"
            >
              <div className="w-full flex flex-col items-center sm:items-start text-center sm:text-left pr-6 sm:pr-0">
                <p className="text-[10px] sm:text-xs text-light-text/40 mb-2 uppercase tracking-wider">Required to hire</p>
                <h3 className="font-semibold text-base sm:text-lg underline">Verify your email</h3>
                <p className="text-light-text/60 text-xs sm:text-sm mt-2 max-w-[280px]">
                  Confirm it's you and establish trust with freelancers.
                </p>
                <p className="text-accent text-xs mt-3">
                  {sendingVerification ? "Sending…" : "Click to send verification email →"}
                </p>
              </div>
              <div className="absolute top-5 right-5 sm:relative sm:top-auto sm:right-auto">
                {sendingVerification
                  ? <InfinityLoader/>
                  : <Mail className="text-light-text/40 shrink-0" size={20} />
                }
              </div>
            </button>
          )}
          {showBillingCard && (
            <button
              onClick={() => navigate("/client/billing")}
              className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 flex justify-between items-start hover:border-accent/30 transition shadow-sm backdrop-blur-sm text-left w-full relative"
            >
              <div className="w-full flex flex-col items-center sm:items-start text-center sm:text-left pr-6 sm:pr-0">
                <p className="text-[10px] sm:text-xs text-light-text/40 mb-2 uppercase tracking-wider">Required to hire</p>
                <h3 className="font-semibold text-base sm:text-lg underline">Add a billing method</h3>
                <p className="text-light-text/60 text-xs sm:text-sm mt-2 max-w-[280px]">
                  This can increase your hiring speed by up to 3x.
                </p>
                <p className="text-accent text-xs mt-3">Click to add a payment method →</p>
              </div>
              <div className="absolute top-5 right-5 sm:relative sm:top-auto sm:right-auto">
                <CreditCard className="text-light-text/40 shrink-0" size={20} />
              </div>
            </button>
          )}
        </div>
      )}


      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Overview</h2>
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm relative scale-90 sm:scale-100 origin-right">
          <button
            onClick={() => setView("grid")}
            className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full relative z-10 transition-colors duration-300 ${view === "grid" ? "text-white dark:text-primary" : "text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"}`}
          >
            {view === "grid" && (
              <motion.div
                layoutId="view-toggle"
                className="absolute inset-0 bg-accent rounded-full -z-10 shadow-lg shadow-accent/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full relative z-10 transition-colors duration-300 ${view === "list" ? "text-white dark:text-primary" : "text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"}`}
          >
            {view === "list" && (
              <motion.div
                layoutId="view-toggle"
                className="absolute inset-0 bg-accent rounded-full -z-10 shadow-lg shadow-accent/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <List size={16} />
          </button>
        </div>
      </div>


      {/* STAT CARDS */}
      {!dashLoading && (stats.open_jobs != null || stats.active_contracts != null) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {STAT_CARDS.map(({ key, label, Icon }) => (
            <div key={key} className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex items-center sm:block gap-4 sm:gap-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center sm:mb-4 shrink-0">
                <Icon size={40} />
              </div>
              <div>
                <p className="text-slate-400 dark:text-light-text/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">{label}</p>
                <p className={`text-xl sm:text-2xl font-bold text-slate-900 dark:text-white`}>{stats[key] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OVERVIEW LIST / EMPTY STATE */}
      {dashLoading ? (
        <div className="space-y-3 mb-16 sm:mb-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-xl h-16" />
          ))}
        </div>
      ) : hasOverview ? (
        <div
          className={`mb-16 sm:mb-20 ${view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}`}
        >
          {overviewItems.map((item, i) => {
            const isContract = item.freelancer != null || item.freelancer_id != null || item.agreed_rate != null || item.is_direct != null;
            const title = item.title || (isContract ? (item.job?.title || "Contract") : "Job");
            const date = item.created_at || item.start_date;
            return (
              <div
                key={item.id ?? i}
                onClick={() => navigate(isContract ? `/client/contracts` : `/client/jobs`)}
                className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:border-accent/40 cursor-pointer transition shadow-sm backdrop-blur-sm group"
              >
                <div className="shrink-0">
                  {isContract ? (
                    <img src="/Icons/icons8-contract-60.png" alt="Contract" className="w-10 h-10 object-contain" />
                  ) : (
                    <img src="/Icons/icons8-bag-100.png" alt="Job" className="w-10 h-10 object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-700 dark:text-white/70 group-hover:text-accent transition-colors leading-snug break-words">{title}</p>
                  {isContract && item.deadline_risk && (
                    <div className={`inline-flex mt-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${item.deadline_risk.risk === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                      item.deadline_risk.risk === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}>
                      {item.deadline_risk.probability}% Delay Risk
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right flex flex-col items-end gap-1.5 ml-auto">
                  <StatusBadge status={item.status} />
                  <p className="text-slate-400 dark:text-light-text/30 text-[9px] uppercase font-bold tracking-widest whitespace-nowrap">
                    {fmtDate(date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-12 sm:p-20 text-center mb-16 sm:mb-20 backdrop-blur-sm">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img src="/Icons/icons8-bag-100.png" alt="Job" className="w-24 h-24 object-contain" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No job posts or contracts in progress right now
          </h3>
          <p className="text-slate-500 dark:text-light-text/50 text-base mb-8 max-w-md mx-auto">
            Get started by posting your first job or browsing talent marketplace.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/find-freelancers")}
              variant="secondary"
              className="rounded-full px-8"
              icon={Search}
            >
              Find Talent
            </Button>
            <Button
              onClick={() => navigate("/client/post-job")}
              className="rounded-full px-8"
            >
              Post a Job
            </Button>
          </div>
        </div>
      )}

      {/* WORK ACTIVITY SUMMARY */}
      {!workLoading && (workSummary.length > 0 || stats.active_contracts > 0) && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Work Activity</h2>
            <div className="flex items-center justify-between mt-1">
              <p className="text-slate-400 dark:text-white/30 text-[10px] uppercase font-black tracking-widest leading-none">Today's Progress Updates</p>
              <button
                onClick={() => navigate('/client/work-activity')}
                className="shrink-0 text-slate-400 dark:text-white/40 hover:text-accent dark:hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap"
              >
                Detailed History <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workSummary.map((activity) => (
              <WorkActivityCard
                key={activity.contractId}
                activity={activity}

                onAskUpdate={handleAskUpdate}
                onClick={() => navigate(`/client/work-activity?jobId=${activity.jobId}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-16 sm:mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Find experts by category</h2>
          <button
            onClick={() => navigate("/client/consultations")}
            className="shrink-0 text-accent flex items-center gap-2 hover:underline text-xs font-bold uppercase tracking-widest whitespace-nowrap"
          >
            Browse all <ChevronRight size={18} />
          </button>
        </div>

        <div className="relative group">
          <button
            onClick={scrollLeft}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 bg-primary/80 border border-white/10 p-2 sm:p-3 rounded-full hover:bg-white/5 z-10 opacity-0 group-hover:opacity-100 transition shadow-xl backdrop-blur-md"
          >
            <ChevronLeft size={18} />
          </button>

          <div ref={scrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-4">
            <div className="min-w-[280px] sm:min-w-[320px] h-[320px] sm:h-[360px] bg-blue-600 rounded-xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm opacity-80 uppercase tracking-widest font-bold">Guided tour</span>
                <X size={16} className="cursor-pointer opacity-60 hover:opacity-100" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold leading-relaxed">
                Book a consultation with an expert to review your project's budget, timeline, and scope one-on-one.
              </h3>
              <button
                onClick={() => navigate("/client/consultations")}
                className="bg-white text-blue-600 px-6 py-2 rounded-full w-fit text-sm font-bold shadow-lg hover:bg-gray-100 transition"
              >
                Learn more
              </button>
            </div>

            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(`/client/consultations?category=${encodeURIComponent(cat.title)}`)}
                className="min-w-[280px] sm:min-w-[320px] h-[320px] sm:h-[360px] bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-48 h-48 object-contain mb-6 group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="text-lg font-semibold text-center text-slate-300 dark:text-white/50 group-hover:text-accent transition-colors">
                  {cat.title}
                </h3>
              </div>
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 bg-primary/80 border border-white/10 p-2 sm:p-3 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition shadow-xl backdrop-blur-md"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SERVICE MARKETPLACE */}
      <div className="mb-16 sm:mb-24">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Project Marketplace</h2>
          <button
            onClick={() => navigate("/services")}
            className="text-accent flex items-center gap-1.5 hover:underline text-xs font-bold uppercase tracking-widest shrink-0"
          >
            Browse all <ArrowRight size={14} />
          </button>
        </div>

        <div className="relative group">
          <button
            onClick={scrollServicesLeft}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 bg-primary/80 border border-white/10 p-2 sm:p-3 rounded-full hover:bg-white/5 z-10 opacity-0 group-hover:opacity-100 transition shadow-xl backdrop-blur-md"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={servicesScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-4"
          >
            {servicesLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] h-[340px] bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))
            ) : services.length > 0 ? (
              services.map((svc) => (
                <div
                  key={svc.id}
                  className="min-w-[280px] sm:min-w-[320px] h-[340px] bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col hover:border-accent transition-all duration-300 cursor-pointer group shrink-0 backdrop-blur-sm shadow-sm"
                  onClick={() => navigate(`/client/service/${svc.id}`)}
                >
                  <div className="h-40 w-full rounded-xl overflow-hidden mb-4 border border-white/5 relative">
                    <img
                      src={cleanImageUrl(svc.images?.[0], svc.title) || '/service1.jpeg'}
                      className="w-full h-full object-cover"
                      alt={svc.title}
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-accent uppercase tracking-tighter border border-white/10">
                      Top Rated
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                          {svc.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-700 dark:text-white/70 line-clamp-2 leading-relaxed group-hover:text-accent transition-colors">
                        {svc.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-3">
                      <div className="flex flex-col">
                        <p className="text-slate-400 dark:text-white/20 text-[8px] uppercase font-bold tracking-widest leading-none mb-1">Starting at</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{formatINR(svc.price)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white dark:group-hover:text-primary group-hover:border-accent transition-all duration-300 shadow-lg">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-20 text-center bg-transparent rounded-[40px] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="text-white/10" size={32} />
                </div>
                <h3 className="text-white/30 font-bold text-lg mb-1 uppercase tracking-tighter">Marketplace is growing</h3>
                <p className="text-white/15 text-sm max-w-xs mx-auto">Expert services published by freelancers will appear here shortly.</p>
              </div>
            )}
          </div>

          <button
            onClick={scrollServicesRight}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 bg-primary/80 border border-white/10 p-2 sm:p-3 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition shadow-xl backdrop-blur-md"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>


      {/* HELP AND RESOURCES */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Help and resources</h2>
          <button
            onClick={() => navigate("/client/getting-started")}
            className="flex items-center gap-1.5 text-accent hover:underline text-xs font-bold uppercase tracking-widest shrink-0"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between mb-8 gap-6 hover:border-accent/40 transition shadow-sm backdrop-blur-sm">
          <div className="text-center lg:text-left w-full lg:w-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2">Get started</p>
            <h3 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white mb-5 max-w-[520px] leading-tight">
              Get started and connect with talent to get work done
            </h3>
            <Button onClick={() => navigate("/client/getting-started")} variant="secondary" className="rounded-full px-8 w-full sm:w-fit">
              Learn more
            </Button>
          </div>
          <img src="/start.png" alt="start" className="w-40 sm:w-60 lg:w-70 opacity-90 object-contain" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { tag: "Payments", title: "Everything you need to know about payments", img: "/payment.png" },
            { tag: "Billing", title: "How to set up your preferred billing method", img: "/billing.png" },
            { tag: "Trust & safety", title: "Keep yourself and others safe on Connect", img: "/safety.png" },
          ].map((item, i) => (
            <div key={i} className="bg-secondary dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-8 flex justify-between items-center hover:border-accent/40 transition shadow-sm backdrop-blur-sm group cursor-pointer">
              <div className="flex-1 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2">{item.tag}</p>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-white/70 line-clamp-2 leading-snug">{item.title}</h3>
              </div>
              <img src={item.img} className="w-20 sm:w-28 object-contain shrink-0" alt={item.tag} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClientDashboardHome;
