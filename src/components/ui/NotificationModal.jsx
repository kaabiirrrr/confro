import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info, RefreshCw } from "lucide-react";

/* ─────────────────────────────────────────────
   Variant configuration
───────────────────────────────────────────── */
const VARIANTS = {
  error: {
    icon: AlertCircle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    glow: "shadow-red-500/10",
    accent: "#ef4444",
    badgeBg: "bg-red-500/10 border-red-500/20",
    badgeText: "text-red-400",
    label: "Error",
    primaryBtn: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
    glow: "shadow-green-500/10",
    accent: "#22c55e",
    badgeBg: "bg-green-500/10 border-green-500/20",
    badgeText: "text-green-400",
    label: "Success",
    primaryBtn: "bg-green-500 hover:bg-green-600 shadow-green-500/20",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    glow: "shadow-blue-500/10",
    accent: "#3b82f6",
    badgeBg: "bg-blue-500/10 border-blue-500/20",
    badgeText: "text-blue-400",
    label: "Info",
    primaryBtn: "bg-[#3b82f6] hover:bg-[#2563eb] shadow-blue-500/20",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/10",
    accent: "#f59e0b",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    label: "Warning",
    primaryBtn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
  },
};

/* ─────────────────────────────────────────────
   Thin animated top-border accent
───────────────────────────────────────────── */
function AccentLine({ color }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ background: color, transformOrigin: "left" }}
      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
    />
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
/**
 * NotificationModal
 *
 * @param {boolean}  isOpen       - Control visibility
 * @param {"error"|"success"|"info"|"warning"} type
 * @param {string}   title        - Modal heading
 * @param {string}   message      - Body text
 * @param {string}   [retryLabel] - Label for primary action (default: "Retry")
 * @param {string}   [cancelLabel]- Label for secondary action (default: "Dismiss")
 * @param {Function} [onRetry]    - Primary button callback; omit to hide button
 * @param {Function} onClose      - Close / cancel callback (required)
 */
export default function NotificationModal({
  isOpen = false,
  type = "error",
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  retryLabel = "Retry",
  cancelLabel = "Dismiss",
  onRetry,
  onClose,
}) {
  const v = VARIANTS[type] || VARIANTS.error;
  const Icon = v.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── BACKDROP ── */
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/70 backdrop-blur-md"
        >
          {/* ── CARD ── */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-[400px] max-w-[92vw] rounded-2xl overflow-hidden
                        border border-border
                        bg-secondary
                        shadow-2xl ${v.glow} text-light-text`}
          >
            {/* Accent top line */}
            <AccentLine color={v.accent} />

            <div className="p-6 pt-8">
              {/* ── CLOSE btn ── */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-light-text/40 hover:text-light-text transition-colors duration-200"
              >
                <X size={18} />
              </button>

              {/* ── HEADER ── */}
              <div className="flex items-start gap-4 mb-4">
                {/* Icon bubble */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${v.iconBg}`}>
                  <Icon size={22} className={v.iconColor} />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Type badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${v.badgeBg} ${v.badgeText} mb-1.5`}>
                    {v.label}
                  </span>
                  <h2 className="text-[16px] font-semibold text-light-text leading-tight">
                    {title}
                  </h2>
                </div>
              </div>

              {/* ── MESSAGE ── */}
              <p className="text-sm text-light-text/60 leading-relaxed mb-6 pl-[60px]">
                {message}
              </p>

              {/* ── DIVIDER ── */}
              <div className="border-t border-border mb-5" />

              {/* ── ACTION BUTTONS ── */}
              <div className="flex gap-3">
                {onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onRetry}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                text-sm font-semibold text-white transition-colors shadow-lg
                                ${v.primaryBtn}`}
                  >
                    <RefreshCw size={14} />
                    {retryLabel}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className={`${onRetry ? "flex-1" : "w-full"} py-2.5 rounded-xl text-sm font-medium
                              text-light-text/60 border border-border
                              hover:bg-hover hover:text-light-text transition-all`}
                >
                  {cancelLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
