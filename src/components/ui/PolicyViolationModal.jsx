import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Info, ShieldX, ArrowRight, ExternalLink } from "lucide-react";

/* ─────────────────────────────────────────────
   Premium Policy Violation Modal (v2)
   Design: Authority-focused, Serious, Dark-mode optimized
───────────────────────────────────────────── */

export default function PolicyViolationModal({
  isOpen = false,
  reason = "Contact Information Sharing",
  flaggedContent = "",
  warningCount = 1,
  severity = "High",
  onClose,
}) {
  const isSuspended = warningCount >= 5;
  const accentColor = "#ef4444"; // Enforcement Red (Always red for safety)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="moderation-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[500px] bg-secondary border border-white/5 rounded-[32px] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.4)]"
          >
            <div className="p-8">
              {/* Header Icon Section */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative`}>
                   <div className="relative z-10 w-full h-full rounded-3xl flex items-center justify-center">
                      <ShieldAlert size={44} className="text-red-500" />
                   </div>
                </div>

                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    Security Policy Violation
                   </h2>
                   <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20">
                      Revenue Protection & Trust System
                   </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-8">
                <div className="space-y-4">
                    <p className="text-sm text-white/60 leading-relaxed text-center">
                        You violated our policy regarding off-platform communication. Manual contact sharing is strictly prohibited.
                    </p>
                    
                    {flaggedContent && (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-white/20 tracking-wider">Flagged Content</span>
                            <code className="px-4 py-2 rounded-xl bg-red-500/5 text-red-500/80 font-mono text-xs break-all">
                                {flaggedContent}
                            </code>
                        </div>
                    )}
                </div>

                {/* Risk & Warning Counters */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Warning Status</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white"># {warningCount || 1}</span>
                            <span className="text-white/20 text-[10px] font-bold">/ 5</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Account Risk</span>
                        <span className={`text-[11px] font-black tracking-widest uppercase text-red-500`}>
                            {isSuspended ? 'BANNED' : severity === 'High' ? 'HIGH RISK' : 'MODERATE'}
                        </span>
                    </div>
                </div>
              </div>

              {/* Status Bar / Progressive Enforcement */}
              <div className="mt-8 space-y-3">
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div 
                            key={s}
                            className={`flex-1 ${s <= (warningCount || 1) ? 'bg-red-500' : 'bg-transparent'} ${s < 5 && 'border-r border-black/20'}`}
                            style={{ opacity: s <= (warningCount || 1) ? (s/5 + 0.5) : 1 }}
                        />
                    ))}
                 </div>
                 <p className="text-[10px] text-center text-white/30 font-medium">
                    {isSuspended ? 'Your account has been permanently suspended.' : '5 Strikes will lead to a permanent account ban.'}
                 </p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-accent text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-accent/20"
                >
                  I Understand the Policy
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-4">
                    <a href="#" className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                        Terms of Service <ExternalLink size={10} />
                    </a>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <a href="#" className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                        Security FAQ <ExternalLink size={10} />
                    </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
