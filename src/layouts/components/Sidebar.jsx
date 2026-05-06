import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BadgeCheck,
  Coins,
  ChevronRight,
  UserCircle2,
  ArrowUpRight,
  Loader2,
  ChevronDown,
  MessageSquare,
  Briefcase,
  Clock,
  FileText,
  Wallet,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { getIdentityStatus } from "../../services/apiService";
import Avatar from "../../components/Avatar";

const Sidebar = () => {
  const { status, balance, loading } = useProfile();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isClient = role === 'CLIENT';
  const basePath = isClient ? '/client' : '/freelancer';

  const percentage = status?.profile_completion_percentage ?? 0;
  const name = status?.name || user?.user_metadata?.full_name || (isClient ? "Client" : "Freelancer");
  const title = status?.title || (isClient ? "Hiring Manager" : "Freelancer");
  const avatarUrl = status?.avatar_url || user?.user_metadata?.avatar_url || null;
  const profileId = user?.id || status?.user_id || status?.id;
  const profileDone = percentage >= 100;

  // IDV status
  const [idvStatus, setIdvStatus] = useState(null);

  useEffect(() => {
    getIdentityStatus().then(r => setIdvStatus(r?.data ?? r)).catch(() => { });
  }, []);

  return (
    <aside className="w-full flex-shrink-0 space-y-4 pr-2">

      {/* ── PROFILE CARD ── */}
      <div
        onClick={() => navigate(isClient ? `${basePath}/settings` : `${basePath}/${profileId}`)}
        className="border border-white/5 bg-transparent p-4 rounded-2xl cursor-pointer group hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar 
            src={avatarUrl} 
            name={name} 
            size="w-12 h-12" 
            className="shrink-0 transition-all" 
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-[13px] truncate group-hover:text-accent transition-colors">{name}</p>
            <p className="text-white/40 text-[10px] truncate mt-0.5 uppercase tracking-wider">{title}</p>
          </div>
          <ArrowUpRight size={14} className="text-white/20 group-hover:text-accent transition-colors shrink-0" />
        </div>

        {/* Profile completion */}
        {!profileDone && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-tight">Status</span>
              <span className="text-accent text-[10px] font-black">{percentage}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div className="bg-accent h-1 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.5)]" style={{ width: `${percentage}%` }} />
            </div>
            <button
              onClick={e => { e.stopPropagation(); localStorage.setItem("profileStep", String(status?.current_step ?? 1)); navigate(`${basePath}/setup-profile`); }}
              className="text-accent text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full bg-transparent border border-accent/40 hover:bg-accent/10 transition-all"
            >
              Complete Profile
            </button>
          </div>
        )}

        {profileDone && (
          <div className="flex items-center gap-1.5 text-green-500/80 text-[10px] font-black uppercase tracking-widest">
            <BadgeCheck size={12} />
            <span>Profile complete</span>
          </div>
        )}
      </div>

      {/* ── CONNECTS ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-accent" />
            <span className="text-light-text font-semibold text-[13px]">Connects</span>
          </div>
          <span className="text-xl font-bold text-light-text">{loading ? "—" : balance}</span>
        </div>
        <Link to={`${basePath}/buy-connects`}
          className="btn-outline block text-center w-full py-2.5 rounded-full text-sm transition text-white hover:bg-accent hover:border-accent">
          {isClient ? "Buy Post Connects" : "Buy Connects"}
        </Link>
        <Link to={`${basePath}/connects`} className="block text-center text-text-muted hover:text-light-text text-xs mt-2.5 transition">
          View history
        </Link>
      </div>

      {/* ── IDENTITY VERIFICATION ── */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center shrink-0 mt-0.5">
            <BadgeCheck size={17} className={
              (idvStatus?.is_verified || idvStatus?.verification_status === 'APPROVED') ? 'text-green-500'
                : (idvStatus?.verification_status === 'PENDING' || idvStatus?.verification_status === 'UNDER_REVIEW') ? 'text-yellow-500'
                  : 'text-blue-500'
            } />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-light-text font-medium text-[13px]">Identity Verification</p>
            {(idvStatus?.is_verified || idvStatus?.verification_status === 'APPROVED') ? (
              <div>
                <span className="text-green-500 text-[11px] font-semibold mt-0.5 inline-block">✅ Identity Verified</span>
                <p className="text-text-muted text-[12px] mt-1 leading-relaxed">Your IDV badge is active on your profile.</p>
              </div>
            ) : (idvStatus?.verification_status === 'PENDING' || idvStatus?.verification_status === 'UNDER_REVIEW') ? (
              <div>
                <span className="text-yellow-500 text-[11px] font-semibold mt-0.5 inline-block">⏳ Under Review</span>
                <p className="text-text-muted text-[12px] mt-1 leading-relaxed">We'll notify you once reviewed.</p>
              </div>
            ) : (
              <div>
                <p className="text-text-muted text-[11px] mt-0.5 leading-relaxed">Get an IDV badge to increase visibility and trust.</p>
                <Link to={`${basePath}/identity-verification`} className="text-accent text-[11px] mt-2 hover:underline inline-block">Get verified →</Link>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ── QUICK LINKS ── */}
      <div className="glass-card overflow-hidden">
        {
          [
            ...(isClient ? [] : [{ label: "Direct Contracts", to: "/freelancer/direct-contracts" }]),
            ...(isClient ? [] : [{ label: "Work Activity", to: "/freelancer/work-activity" }]),
            ...(isClient ? [] : [{ label: "Withdrawals", to: "/freelancer/withdraw" }]),
            { label: "Membership", to: `${basePath}/membership` },
            { label: "Settings", to: `${basePath}/settings` },
          ].map(({ label, to }, i, arr) => (
            <Link key={to} to={to}
              className={`flex items-center justify-between px-5 py-3 text-[13px] text-text-muted hover:text-accent hover:bg-hover transition ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <span>{label}</span>
              <ChevronRight size={12} className="text-icon" />
            </Link>
          ))
        }
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
