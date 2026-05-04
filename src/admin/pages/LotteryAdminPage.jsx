import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Trophy, Crown, Play, Plus, RefreshCw,
  Users, CheckCircle2, Loader2, AlertCircle, Calendar, Trash2
} from 'lucide-react';
import {
  adminGetLotteryDraws,
  adminCreateLotteryDraw,
  adminRunLottery,
  adminGetLotteryWinners,
  adminDeleteLotteryDraw,
} from '../../services/apiService';
import { formatINR } from '../../utils/currencyUtils';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import CustomDropdown from '../../components/ui/CustomDropdown';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const now = new Date();

// ── Create Draw Form ──────────────────────────────────────────
function CreateDrawForm({ onCreated }) {
  const [form, setForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    prize_1st: '',
    prize_2nd: '',
    prize_3rd: '',
  });  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const p1 = parseFloat(form.prize_1st);
    const p2 = parseFloat(form.prize_2nd);
    const p3 = parseFloat(form.prize_3rd);

    if (!p1 || p1 <= 0) { toast.error('1st prize must be a positive number'); return; }
    setSubmitting(true);
    try {
      const monthStr = `${form.year}-${String(form.month).padStart(2, '0')}`;
      const reward_distribution = [{ position: 1, amount: p1 }];
      if (p2 > 0) reward_distribution.push({ position: 2, amount: p2 });
      if (p3 > 0) reward_distribution.push({ position: 3, amount: p3 });

      await adminCreateLotteryDraw({ month: monthStr, reward_distribution });
      toast.success('Lottery draw created');
      setForm(p => ({ ...p, prize_1st: '', prize_2nd: '', prize_3rd: '' }));
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create draw');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent transition-colors";

  return (
    <form onSubmit={handleSubmit} className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-white font-semibold text-base flex items-center gap-2">
        <Plus size={16} className="text-accent" /> Create Lottery Draw
      </h2>

      {/* Month + Year */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">Month</label>
          <CustomDropdown
            value={form.month}
            onChange={(val) => setForm(p => ({ ...p, month: val }))}
            options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
            className="w-full"
            variant="accent"
            rounded="rounded-xl"
          />
        </div>
        <div>
          <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">Year</label>
          <input type="number" value={form.year} onChange={set('year')} min={2024} max={2030} className={inputCls} />
        </div>
      </div>

      {/* Prizes */}
      <div className="space-y-3">
        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest">Prize Amounts (₹)</label>
        {[
          { key: 'prize_1st', label: '🥇 1st Prize', required: true },
          { key: 'prize_2nd', label: '🥈 2nd Prize' },
          { key: 'prize_3rd', label: '🥉 3rd Prize' },
        ].map(({ key, label, required }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm text-white/50 w-24 shrink-0">{label}</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">₹</span>
              <input
                type="number" min={1} step={1}
                value={form[key]} onChange={set(key)}
                placeholder="Enter amount"
                required={required}
                className={inputCls + ' pl-7'}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Plus size={15} /> Create Draw</>}
      </button>
    </form>
  );
}

// ── Draw Card ─────────────────────────────────────────────────
function DrawCard({ draw, onRun, onViewWinners, onDelete }) {
  const [running, setRunning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isCompleted = ['COMPLETED', 'completed', 'done'].includes(draw.status);

  // Parse month — could be "2026-04" string or integer
  const monthLabel = typeof draw.month === 'string' && draw.month.includes('-')
    ? (() => { const [y, m] = draw.month.split('-'); return `${MONTHS[parseInt(m) - 1]} ${y}`; })()
    : `${MONTHS[(draw.month || 1) - 1]} ${draw.year || ''}`;

  // Handle both { prizes: { first, second, third } } and reward_distribution array
  const getPrize = (pos) => {
    if (draw.prizes) return draw.prizes[pos === 1 ? 'first' : pos === 2 ? 'second' : 'third'] || 0;
    if (Array.isArray(draw.reward_distribution)) {
      const r = draw.reward_distribution.find(r => r.position === pos);
      return r?.amount || r?.reward_amount || 0;
    }
    return 0;
  };
  const p1 = getPrize(1), p2 = getPrize(2), p3 = getPrize(3);

  const handleRun = async () => {
    if (!confirm(`Run lottery for ${monthLabel}? This cannot be undone.`)) return;
    setRunning(true);
    try { await onRun(draw.id); }
    finally { setRunning(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete the ${monthLabel} draw? This cannot be undone.`)) return;
    setDeleting(true);
    try { await onDelete(draw.id); }
    finally { setDeleting(false); }
  };

  return (
    <div className={`border rounded-2xl p-5 space-y-4 transition-all ${
      isCompleted ? 'border-green-500/20 bg-green-500/[0.02]' : 'border-white/10 bg-transparent'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-white/40" />
            <p className="text-white font-semibold text-sm">{monthLabel}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              isCompleted
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <span className="flex items-center gap-1"><Users size={11} /> {draw.total_participants ?? 0} participants</span>
            <span className="flex items-center gap-1"><Ticket size={11} /> {draw.total_tickets ?? 0} tickets</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-accent font-bold text-sm">₹{p1.toLocaleString()}</p>
          <p className="text-white/30 text-[10px]">1st prize</p>
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="flex gap-3">
        {[
          { label: '🥇 1st', amount: p1 },
          { label: '🥈 2nd', amount: p2 },
          { label: '🥉 3rd', amount: p3 },
        ].filter(p => p.amount > 0).map(p => (
          <div key={p.label} className="flex-1 bg-white/[0.03] rounded-xl px-3 py-2 text-center">
            <p className="text-white/40 text-[10px]">{p.label}</p>
            <p className="text-white text-sm font-semibold">₹{p.amount?.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isCompleted && (
          <button onClick={handleRun} disabled={running}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-primary text-xs font-bold transition-colors disabled:opacity-50">
            {running ? <><Loader2 size={13} className="animate-spin" /> Running…</> : <><Play size={13} /> Run Lottery</>}
          </button>
        )}
        {isCompleted && (
          <button onClick={() => onViewWinners(draw.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
            <Trophy size={13} /> View Winners
          </button>
        )}
        <button onClick={handleDelete} disabled={deleting || isCompleted}
          className="px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={isCompleted ? 'Cannot delete completed draw' : 'Delete draw'}>
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

// ── Winners Modal ─────────────────────────────────────────────
function WinnersModal({ drawId, onClose }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetLotteryWinners(drawId)
      .then(res => setWinners(res?.data ?? res ?? []))
      .catch(() => setWinners([]))
      .finally(() => setLoading(false));
  }, [drawId]);

  const POSITION_STYLE = {
    1: { label: '🥇 1st', cls: 'text-yellow-400' },
    2: { label: '🥈 2nd', cls: 'text-slate-300' },
    3: { label: '🥉 3rd', cls: 'text-amber-600' },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
        className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" /> Lottery Winners
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition text-lg leading-none">✕</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><InfinityLoader size={24} /></div>
          ) : winners.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No winners found</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/40 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="pb-3">Position</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Tickets</th>
                  <th className="pb-3 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {winners.map((w, i) => {
                  const pos = POSITION_STYLE[w.position] || { label: `#${w.position}`, cls: 'text-white/50' };
                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5">
                        <span className={`font-bold text-sm ${pos.cls}`}>{pos.label}</span>
                      </td>
                      <td className="py-3.5">
                        <p className="text-white text-sm font-medium">{w.user?.name || 'Unknown'}</p>
                        <p className="text-white/40 text-xs">{w.user?.email}</p>
                      </td>
                      <td className="py-3.5 text-white/60 text-sm">{w.tickets_count ?? '—'}</td>
                      <td className="py-3.5 text-right">
                        <span className="text-accent font-bold text-sm">{formatINR(w.reward_amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LotteryAdminPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingWinnersId, setViewingWinnersId] = useState(null);

  const loadDraws = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetLotteryDraws();
      setDraws(res?.data ?? res ?? []);
    } catch { toast.error('Failed to load draws'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDraws(); }, [loadDraws]);

  const handleDelete = async (drawId) => {
    try {
      await adminDeleteLotteryDraw(drawId);
      toast.success('Draw deleted');
      await loadDraws();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('Delete endpoint not available yet — ask backend to add DELETE /api/admin/lottery/draws/:id');
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete draw');
      }
    }
  };

  const handleRun = async (drawId) => {
    try {
      await adminRunLottery(drawId);
      toast.success('Lottery run successfully! Winners selected.');
      await loadDraws();
      setViewingWinnersId(drawId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run lottery');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Ticket size={24} className="text-accent" /> Lottery Management
          </h1>
          <p className="text-white/40 text-xs mt-1">Create and manage monthly lottery draws</p>
        </div>
        <button onClick={loadDraws}
          className="p-2 rounded-xl text-white/40 hover:text-white transition">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">

        {/* Create form */}
        <CreateDrawForm onCreated={loadDraws} />

        {/* Draws list */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm">All Draws</h2>
          {loading ? (
            <div className="flex justify-center py-16"><InfinityLoader size={24} /></div>
          ) : draws.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center">
              <Ticket size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No draws created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {draws.map(draw => (
                <DrawCard
                  key={draw.id}
                  draw={draw}
                  onRun={handleRun}
                  onViewWinners={setViewingWinnersId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winners modal */}
      <AnimatePresence>
        {viewingWinnersId && (
          <WinnersModal drawId={viewingWinnersId} onClose={() => setViewingWinnersId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
