import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, TrendingUp, Eye, MousePointer, BarChart2,
  Loader2, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { getMyPromotions, togglePromotion, getPromotionStats } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

export default function PromotePage() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // 'availability_badge' | 'profile_boost'
  const [error, setError] = useState(null); // error message for profile_boost

  useEffect(() => {
    Promise.all([
      getMyPromotions().catch(() => null),
      getPromotionStats().catch(() => null),
    ]).then(([p, s]) => {
      setPromos(p?.data ?? p);
      setStats(s?.data ?? s);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (type) => {
    setToggling(type);
    setError(null);
    try {
      const res = await togglePromotion(type);
      const updated = res?.data ?? res;
      setPromos(prev => ({ ...prev, [type]: updated }));
      toast.success(updated?.is_active ? 'Activated' : 'Deactivated');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed';
      if (type === 'profile_boost' && err?.response?.status === 400) {
        setError(msg);
      } else {
        toastApiError(err, msg);
      }
    } finally {
      setToggling(null);
    }
  };

  const badge = promos?.availability_badge;
  const boost = promos?.profile_boost;

  const ToggleSwitch = ({ isActive, onToggle, isToggling }) => (
    <button
      onClick={onToggle}
      disabled={isToggling}
      className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isActive ? 'bg-accent' : 'bg-white/10'
        } ${isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:bg-white/15'}`}
    >
      <motion.div
        animate={{ x: isActive ? 18 : 2 }}
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  return (
    <div className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Promote with Ads</h1>
        <p className="text-light-text/60 text-xs sm:text-sm">Increase visibility and reach more clients</p>
      </div>

      {/* Performance Stats Strip */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Total Impressions', value: fmtNum(stats.total_impressions), Icon: Eye },
            { label: 'Total Clicks', value: fmtNum(stats.total_clicks), Icon: MousePointer },
            { label: 'Click Through Rate', value: stats.ctr != null ? `${Number(stats.ctr).toFixed(2)}%` : '—', Icon: TrendingUp },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="p-5 border border-white/5 rounded-2xl flex flex-col gap-2 group hover:border-accent/30 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-light-text/30 group-hover:text-light-text/50 transition-colors">
                <Icon size={12} className="text-accent/40" />
                {label}
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Promotions List (Single Column) */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-light-text/40">AVAILABLE PROMOTIONS</h2>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {loading ? (
          [1, 2].map(i => <div key={i} className="animate-pulse bg-secondary/50 border border-white/5 rounded-2xl h-44" />)
        ) : (
          <>
            {/* Availability Badge Card */}
            <div className={`p-6 border ${badge?.is_active ? 'border-accent' : 'border-white/10'} rounded-2xl transition-all group shadow-sm `}>
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/40">
                    AVAILABILITY PROMOTION
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-light-text/30">
                    FREE SERVICE
                  </span>
                  <ToggleSwitch
                    isActive={badge?.is_active}
                    onToggle={() => handleToggle('availability_badge')}
                    isToggling={toggling === 'availability_badge'}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-3">
                Availability Badge
              </h3>

              <p className="text-[13.5px] text-light-text/50 mb-7 leading-relaxed font-normal max-w-2xl">
                Show clients you're actively looking for work and can start immediately. Your profile will stand out in search results with a specialized badge.
              </p>

              <div className="flex items-center gap-6 pt-5 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-light-text/30">
                {badge?.is_active ? (
                  <>
                    <span className="flex items-center gap-1.5 text-accent/60">
                      <CheckCircle2 size={13} /> {fmtDate(badge.expires_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} /> {fmtNum(badge.impressions)} IMPRESSIONS
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MousePointer size={13} /> {fmtNum(badge.clicks)} CLICKS
                    </span>
                  </>
                ) : (
                  <span className="text-light-text/20 italic">PROMOTION INACTIVE — ENABLE TO SEE LIVE STATS</span>
                )}
              </div>
            </div>

            {/* Profile Boost Card */}
            <div className={`p-6 border ${boost?.is_active ? 'border-accent' : 'border-white/10'} rounded-2xl transition-all group shadow-sm`}>
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/40">
                    PROFILE BOOST
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[9px] font-bold uppercase tracking-wider text-accent font-extrabold">
                    10 CONNECTS
                  </span>
                  <ToggleSwitch
                    isActive={boost?.is_active}
                    onToggle={() => handleToggle('profile_boost')}
                    isToggling={toggling === 'profile_boost'}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-3">
                Ads Boost Profile
              </h3>

              <p className="text-[13.5px] text-light-text/50 mb-7 leading-relaxed font-normal max-w-2xl">
                Elevate your profile to the top of search results for a 30-day period. This significantly increases client reach and invitation probabilities.
              </p>

              {error && (
                <div className="flex items-center gap-2 mb-6 p-4 bg-red-500/5 rounded-2xl text-xs text-red-300 border border-red-500/10">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                  <button onClick={() => navigate('/freelancer/buy-connects')}
                    className="underline hover:text-red-200 transition ml-auto font-bold uppercase tracking-widest text-[9px]">
                    Buy connects
                  </button>
                </div>
              )}

              <div className="flex items-center gap-6 pt-5 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-light-text/30">
                {boost?.is_active ? (
                  <>
                    <span className="flex items-center gap-1.5 text-accent/60">
                      <Clock size={13} /> {fmtDate(boost.expires_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} /> {fmtNum(boost.impressions)} IMPRESSIONS
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MousePointer size={13} /> {fmtNum(boost.clicks)} CLICKS
                    </span>
                  </>
                ) : (
                  <span className="text-light-text/20 italic">BOOST INACTIVE — ENABLE TO FEATURE PROFILE</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
