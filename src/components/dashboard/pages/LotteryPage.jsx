import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Trophy, Star, Info, RefreshCw,
  CheckCircle2, Clock, Gift, TrendingUp, Crown
} from 'lucide-react';
import { getMyLotteryStatus, getMyLotteryHistory } from '../../../services/apiService';
import { formatINR } from '../../../utils/currencyUtils';
import InfinityLoader from '../../common/InfinityLoader';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MAX_TICKETS = 10;

// ── Ticket visual ─────────────────────────────────────────────
function TicketBadge({ earned, max }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div key={i}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            i < earned
              ? 'bg-accent text-primary shadow-lg shadow-accent/20'
              : 'bg-white/5 border border-white/10 text-white/20'
          }`}>
          <Ticket size={13} />
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-accent' }) {
  return (
    <div className="bg-transparent border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon size={15} className={color} />
        </div>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-white/30 text-xs">{sub}</p>}
    </div>
  );
}

export default function LotteryPage() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        getMyLotteryStatus(),
        getMyLotteryHistory().catch(() => ({ data: [] })),
      ]);
      setStatus(s?.data ?? s);
      setHistory(h?.data ?? h ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <div className="w-full flex items-center justify-center py-32">
      <InfinityLoader/>
    </div>
  );

  const tickets       = status?.tickets_earned ?? 0;
  const jobsCompleted = status?.jobs_completed ?? 0;
  const isEligible    = status?.is_eligible ?? (tickets > 0);
  const totalWinnings = history.reduce((s, h) => s + (parseFloat(h.reward_amount) || 0), 0);
  const now           = new Date();
  const monthLabel    = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="w-full max-w-[900px] mx-auto space-y-8 pb-16 font-sans tracking-tight">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Ticket size={20} className="text-accent" /> Monthly Lottery
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Complete jobs to earn tickets and win monthly prizes</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-40">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Lottery Card ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-7 space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1">{monthLabel} Draw</p>
            <h2 className="text-white font-semibold text-lg">Your Lottery Status</h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isEligible
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {isEligible ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {isEligible ? 'Eligible' : 'Not yet eligible'}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Jobs completed: <span className="text-white font-semibold">{jobsCompleted}</span></span>
            <span className="text-white/60">Tickets earned: <span className="text-accent font-bold">{tickets}/{MAX_TICKETS}</span></span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((tickets / MAX_TICKETS) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <p className="text-white/30 text-xs">
            {tickets >= MAX_TICKETS
              ? '🎉 Maximum tickets reached for this month!'
              : `Complete ${MAX_TICKETS - tickets} more job${MAX_TICKETS - tickets !== 1 ? 's' : ''} to earn max tickets`}
          </p>
        </div>

        {/* Ticket grid */}
        <div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">Your Tickets</p>
          <TicketBadge earned={tickets} max={MAX_TICKETS} />
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={Ticket}    label="Tickets This Month" value={tickets}              sub={`Out of ${MAX_TICKETS} max`} />
        <StatCard icon={TrendingUp} label="Jobs Completed"    value={jobsCompleted}         sub="This month" color="text-blue-400" />
        <StatCard icon={Gift}      label="Total Winnings"     value={formatINR(totalWinnings)} sub="All time" color="text-yellow-400" />
      </div>

      {/* ── Rewards / Past Winnings ── */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Trophy size={15} className="text-yellow-400" /> Past Winnings
        </h2>
        {history.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl py-12 text-center">
            <Trophy size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No winnings yet — keep completing jobs!</p>
          </div>
        ) : (
          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3">Position</th>
                  <th className="px-5 py-3">Tickets</th>
                  <th className="px-5 py-3 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((w, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-white/70 text-sm">{w.month || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        w.position === 1 ? 'text-yellow-400' :
                        w.position === 2 ? 'text-slate-300' :
                        w.position === 3 ? 'text-amber-600' : 'text-white/50'
                      }`}>
                        {w.position === 1 && <Crown size={12} />}
                        {w.position ? `#${w.position}` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm">{w.tickets_used ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right text-accent font-semibold text-sm">
                      {w.reward_amount ? formatINR(w.reward_amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Rules ── */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-3">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Info size={14} className="text-white/40" /> How It Works
        </h2>
        <ul className="space-y-2">
          {[
            '1 completed job (min ₹500) = 1 lottery ticket',
            'Maximum 10 tickets per month',
            'Draw happens on the last day of each month',
            'Winners are selected randomly weighted by ticket count',
            'Rewards are credited to your wallet within 24 hours',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-white/50 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-1.5 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
