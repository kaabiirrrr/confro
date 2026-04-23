import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast, useToaster, Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import InfinityLoader from '../common/InfinityLoader';

// ─── Unified blue SaaS palette ────────────────────────────────
const TYPE_CONFIG = {
  success: {
    Icon: CheckCircle2,
    iconColor: '#60a5fa',          // blue-400
    iconGlow: 'rgba(59,130,246,0.18)',
    iconBg: 'rgba(37,99,235,0.12)',
    iconBorder: 'rgba(59,130,246,0.2)',
    cardBorder: 'rgba(59,130,246,0.14)',
    cardShadow: '0 8px 32px rgba(15,23,42,0.55), 0 0 0 1px rgba(59,130,246,0.06)',
  },
  error: {
    Icon: XCircle,
    iconColor: '#f87171',          // red-400 — only type that breaks blue
    iconGlow: 'rgba(239,68,68,0.15)',
    iconBg: 'rgba(239,68,68,0.1)',
    iconBorder: 'rgba(239,68,68,0.18)',
    cardBorder: 'rgba(239,68,68,0.12)',
    cardShadow: '0 8px 32px rgba(15,23,42,0.55), 0 0 0 1px rgba(239,68,68,0.05)',
  },
  loading: {
    Icon: (props) => <InfinityLoader size={props.size || 24} />,
    iconColor: '#93c5fd',          // blue-300
    iconGlow: 'rgba(59,130,246,0.15)',
    iconBg: 'rgba(37,99,235,0.1)',
    iconBorder: 'rgba(59,130,246,0.18)',
    cardBorder: 'rgba(59,130,246,0.12)',
    cardShadow: '0 8px 32px rgba(15,23,42,0.55), 0 0 0 1px rgba(59,130,246,0.05)',
  },
  blank: {
    Icon: Info,
    iconColor: '#7dd3fc',          // sky-300
    iconGlow: 'rgba(56,189,248,0.12)',
    iconBg: 'rgba(14,165,233,0.08)',
    iconBorder: 'rgba(56,189,248,0.15)',
    cardBorder: 'rgba(56,189,248,0.1)',
    cardShadow: '0 8px 32px rgba(15,23,42,0.55), 0 0 0 1px rgba(56,189,248,0.04)',
  },
};

/**
 * Premium Compact System Message (iOS Pill Style at Top Center)
 */
function CenteredSystemMessage({ t }) {
  const message = typeof t.message === 'string' ? t.message : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[100000] w-full max-w-[400px] px-4 pointer-events-none"
    >
      <div className="
        relative
        pointer-events-auto
        w-full
        bg-white/[0.6]
        dark:bg-black/[0.4]
        backdrop-blur-2xl
        border border-white/20
        dark:border-white/5
        shadow-[0_20px_50px_rgba(0,0,0,0.15)]
        rounded-[30px]
        p-4.5
        flex items-center gap-4
      ">
        {/* Shimmer effect / Gloss */}
        <div className="absolute inset-0 rounded-[30px] overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[100%] bg-gradient-to-b from-white/20 to-transparent opacity-50" />
        </div>

        {/* Icon (Now floating, no background box) */}
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-20 rounded-full" />
          <ShieldAlert size={28} className="text-red-500 relative z-10" strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-black dark:text-white tracking-tight leading-tight">
            System Message
          </h3>
          <p className="text-[13px] text-black/60 dark:text-white/50 leading-tight font-medium mt-1 truncate">
            {message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="
            w-9 h-9
            bg-black/5 hover:bg-black/10
            dark:bg-white/5 dark:hover:bg-white/10
            text-black/40 hover:text-black
            dark:text-white/40 dark:hover:text-white
            rounded-full
            transition-all
            flex items-center justify-center
          "
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function ToastItem({ t }) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.blank;
  const { Icon, iconColor, iconGlow, iconBg, iconBorder, cardBorder, cardShadow } = cfg;
  const message = typeof t.message === 'string' ? t.message : '';

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => toast.dismiss(t.id), 280);
  };

  // If it's a system notification, don't render it in the tray
  if (t.className === 'system-notification') return null;

  return (
    <div
      onClick={dismiss}
      className="bg-white/[0.6] dark:bg-[#0A1121]/50 text-black dark:text-white backdrop-blur-[24px] saturate-[120%] border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer select-none relative overflow-hidden"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 16,
        minWidth: 320,
        maxWidth: 450,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
        transition: 'opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.2), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: 'transparent',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 9,
          background: `radial-gradient(circle at center, ${iconColor}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        {t.type === 'loading' ? (
          <Icon size={16} color={iconColor} strokeWidth={2.5}
            style={{ animation: 'toast-spin 0.8s linear infinite', position: 'relative' }} />
        ) : (
          <Icon size={16} color={iconColor} strokeWidth={2.2} style={{ position: 'relative' }} />
        )}
      </div>

      <p className="flex-1 m-0 text-[13px] font-medium leading-[1.45] tracking-wide line-clamp-2">
        {message}
      </p>

      <button
        onClick={e => { e.stopPropagation(); dismiss(); }}
        className="w-[22px] h-[22px] rounded-md flex-shrink-0 flex items-center justify-center transition-all bg-black/[0.04] hover:bg-black/10 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.06] text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function PremiumToaster() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  const trayToasts = toasts.filter(t => t.visible && t.className !== 'system-notification');
  const systemToasts = toasts.filter(t => t.visible && t.className === 'system-notification');

  return (
    <>
      <style>{`@keyframes toast-spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Standard Tray (Top Center) */}
      <div
        onMouseEnter={startPause}
        onMouseLeave={endPause}
        style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999,
          display: 'flex', flexDirection: 'column', gap: 7,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {trayToasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem t={t} />
          </div>
        ))}
      </div>

      {/* System Modal Tray (Centered) */}
      <AnimatePresence>
        {systemToasts.map(t => (
          <CenteredSystemMessage key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </>
  );
}
