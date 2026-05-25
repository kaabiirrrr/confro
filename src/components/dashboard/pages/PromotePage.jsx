import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Eye, MousePointer,
  AlertCircle, CheckCircle2, Clock, ShoppingCart
} from 'lucide-react';
import { getMyPromotions, togglePromotion, getPromotionStats, getConnectsBalance } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

const BOOST_COST = 10; // connects required to activate profile boost

export default function PromotePage() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState(null);
  const [stats, setStats] = useState(null);
  const [connectsBalance, setConnectsBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [error, setError] = useState(null);

  const fetchBalance = () => {
    return getConnectsBalance()
      .then(c => {
        // API returns { success: true, data: { balance: N, ... } }
        const bal = c?.data?.balance ?? c?.balance ?? null;
        setConnectsBalance(bal);
        return bal;
      })
      .catch(() => {
        setConnectsBalance(null);
        return null;
      })
      .finally(() => setBalanceLoading(false));
  };

  useEffect(() => {
    Promise.all([
      getMyPromotions().catch(() => null),
      getPromotionStats().catch(() => null),
      fetchBalance(),
    ]).then(([p, s]) => {
      // getMyPromotions returns { success, data: { availability_badge, profile_boost } }
      const promoData = p?.data ?? p;
      setPromos(promoData);
      // getPromotionStats returns { success, data: { total_impressions, total_clicks, ctr, promotions } }
      const statsData = s?.data ?? s;
      setStats(statsData);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (type) => {
    // Pre-check: if toggling profile_boost and balance is insufficient, show error immediately
    if (type === 'profile_boost' && !promos?.profile_boost?.is_active) {
      if (connectsBalance !== null && connectsBalance < BOOST_COST) {
        setError(`You need at least ${BOOST_COST} connects to activate Profile Boost. You currently have ${connectsBalance}.`);
        return;
      }
    }

    setToggling(type);
    setError(null);
    try {
      const res = await togglePromotion(type);
      // togglePromotion returns { success, data: { ...promotion row }, message }
      const updated = res?.data ?? res;
      setPromos(prev => ({ ...prev, [type]: updated }));
      toast.success(updated?.is_active ? 'Promotion activated!' : 'Promotion deactivated');
      // Refresh connects balance after profile_boost toggle (deducts connects)
      if (type === 'profile_boost') {
        fetchBalance();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update promotion';
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
  const hasEnoughConnects = connectsBalance !== null && connectsBalance >= BOOST_COST;

  const ToggleSwitch = ({ isActive, onToggle, isToggling, disabled }) => (
    <button
      onClick={onToggle}
      disabled={isToggling || disabled}
      title={disabled ? `Need ${BOOST_COST} connects to activate` : undefined}
      className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
        isActive ? 'bg-accent' : 'bg-white/10'
      } ${isToggling ? 'opacity-50 cursor-wait' : disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/15'}`}
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

      {/* Connects Balance Banner */}
      <div className="flex items-center justify-between p-4 border border-black/10 dark:border-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <img src="/Icons/link.png" alt="connects" className="w-5 h-5 opacity-60" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">Your Connects Balance</p>
            {balanceLoading ? (
              <div className="h-5 w-16 bg-black/10 dark:bg-white/10 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-base font-bold text-black dark:text-white">
                {connectsBalance !== null ? connectsBalance : '—'}
                <span className="text-black/40 dark:text-white/40 text-xs font-normal ml-1">connects</span>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/freelancer/buy-connects')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-accent/20 transition-colors"
        >
          <ShoppingCart size={11} />
          Buy Connects
        </button>
      </div>

      {/* Performance Stats Strip */}
      {(stats || loading) && (
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="animate-pulse bg-secondary/50 border border-white/5 rounded-xl h-20 sm:h-24" />)
          ) : (
            [
              { label: 'Total Impressions', value: fmtNum(stats?.total_impressions ?? 0), Icon: Eye },
              { label: 'Total Clicks', value: fmtNum(stats?.total_clicks ?? 0), Icon: MousePointer },
              { label: 'Click Through Rate', value: stats?.ctr != null ? `${Number(stats.ctr).toFixed(2)}%` : '0.00%', Icon: TrendingUp },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="p-3 sm:p-5 border border-black/10 dark:border-white/5 rounded-xl flex flex-col gap-1 sm:gap-2 group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-light-text/30 group-hover:text-black/60 dark:group-hover:text-light-text/50 transition-colors">
                  <Icon size={11} className="text-accent/40 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ').slice(-1)[0]}</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-black dark:text-white tracking-tight">{value}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Promotions List */}
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
            <div className={`p-6 border ${badge?.is_active ? 'border-accent' : 'border-black/10 dark:border-white/10'} rounded-xl transition-all group shadow-sm`}>
              <div className="flex justify-between items-start mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-light-text/40">
                  AVAILABILITY PROMOTION
                </span>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-black/40 dark:text-light-text/30">
                    FREE SERVICE
                  </span>
                  <ToggleSwitch
                    isActive={!!badge?.is_active}
                    onToggle={() => handleToggle('availability_badge')}
                    isToggling={toggling === 'availability_badge'}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-3">
                Availability Badge
              </h3>

              <p className="text-[13.5px] text-black/50 dark:text-light-text/50 mb-7 leading-relaxed font-normal max-w-2xl">
                Show clients you're actively looking for work and can start immediately. Your profile will stand out in search results with a specialized badge.
              </p>

              <div className="flex items-center gap-6 pt-5 border-t border-black/10 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-light-text/30">
                {badge?.is_active ? (
                  <>
                    {badge.expires_at && (
                      <span className="flex items-center gap-1.5 text-accent/60">
                        <CheckCircle2 size={13} /> {fmtDate(badge.expires_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} /> {fmtNum(badge.impressions ?? 0)} IMPRESSIONS
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MousePointer size={13} /> {fmtNum(badge.clicks ?? 0)} CLICKS
                    </span>
                  </>
                ) : (
                  <span className="text-black/30 dark:text-light-text/20 italic">PROMOTION INACTIVE — ENABLE TO SEE LIVE STATS</span>
                )}
              </div>
            </div>

            {/* Profile Boost Card */}
            <div className={`p-6 border ${boost?.is_active ? 'border-accent' : 'border-black/10 dark:border-white/10'} rounded-xl transition-all group shadow-sm`}>
              <div className="flex justify-between items-start mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-light-text/40">
                  PROFILE BOOST
                </span>
                <div className="flex items-center gap-4">
                  {/* Show cost badge — not user's balance */}
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                    hasEnoughConnects || boost?.is_active
                      ? 'bg-accent/10 border-accent/20 text-accent'
                      : 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400'
                  }`}>
                    COSTS {BOOST_COST} CONNECTS
                  </span>
                  <ToggleSwitch
                    isActive={!!boost?.is_active}
                    onToggle={() => handleToggle('profile_boost')}
                    isToggling={toggling === 'profile_boost'}
                    disabled={!boost?.is_active && !hasEnoughConnects && connectsBalance !== null}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-3">
                Ads Boost Profile
              </h3>

              <p className="text-[13.5px] text-black/50 dark:text-light-text/50 mb-7 leading-relaxed font-normal max-w-2xl">
                Elevate your profile to the top of search results for a 30-day period. This significantly increases client reach and invitation probabilities.
              </p>

              {/* Insufficient connects warning (pre-toggle) */}
              {!boost?.is_active && connectsBalance !== null && !hasEnoughConnects && (
                <div className="flex items-center gap-2 mb-6 p-4 bg-amber-50 dark:bg-amber-500/5 rounded-xl text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                  <AlertCircle size={14} className="shrink-0 text-amber-500" />
                  <span>
                    You need <strong>{BOOST_COST} connects</strong> to activate Profile Boost.
                    You currently have <strong>{connectsBalance}</strong>.
                  </span>
                  <button
                    onClick={() => navigate('/freelancer/buy-connects')}
                    className="underline hover:opacity-70 transition ml-auto font-bold uppercase tracking-widest text-[9px] whitespace-nowrap text-amber-700 dark:text-amber-300"
                  >
                    Buy Connects
                  </button>
                </div>
              )}

              {/* Error from toggle attempt */}
              {error && (
                <div className="flex items-center gap-2 mb-6 p-4 bg-red-50 dark:bg-red-500/5 rounded-xl text-xs text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/10">
                  <AlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                  <button
                    onClick={() => navigate('/freelancer/buy-connects')}
                    className="underline hover:opacity-70 transition ml-auto font-bold uppercase tracking-widest text-[9px] whitespace-nowrap"
                  >
                    Buy Connects
                  </button>
                </div>
              )}

              <div className="flex items-center gap-6 pt-5 border-t border-black/10 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-light-text/30">
                {boost?.is_active ? (
                  <>
                    {boost.expires_at && (
                      <span className="flex items-center gap-1.5 text-accent/60">
                        <Clock size={13} /> {fmtDate(boost.expires_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} /> {fmtNum(boost.impressions ?? 0)} IMPRESSIONS
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MousePointer size={13} /> {fmtNum(boost.clicks ?? 0)} CLICKS
                    </span>
                  </>
                ) : (
                  <span className="text-black/30 dark:text-light-text/20 italic">BOOST INACTIVE — ENABLE TO FEATURE PROFILE</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
