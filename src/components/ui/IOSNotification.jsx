import { motion, AnimatePresence } from "framer-motion";
import React from "react";

/**
 * Premium iOS-style glassmorphism notification (toast).
 * 
 * @param {Object} props
 * @param {boolean} props.show - Controls visibility
 * @param {string} props.title - Main title text
 * @param {string} props.message - Descriptive message
 * @param {Function} props.onClose - Callback when notification is dismissed or timed out
 */
export default function IOSNotification({ show, message, title, type = 'default', onClose }) {
  // Determine small top-left icon styling based on type
  let iconTheme = {
    bg: "bg-blue-500/10",
    dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    text: "text-[#8e8e93]",
    label: "CONNECT • now"
  };

  if (type === 'success') {
    iconTheme = {
      bg: "bg-green-500/10",
      dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
      text: "text-green-600 dark:text-green-500",
      label: "SUCCESS • now"
    };
  } else if (type === 'error') {
    iconTheme = {
      bg: "bg-red-500/10",
      dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      text: "text-red-500",
      label: "ERROR • now"
    };
  } else if (type === 'message') {
    iconTheme = {
      bg: "bg-purple-500/10",
      dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
      text: "text-purple-500",
      label: "MESSAGE • now"
    };
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 24, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            mass: 0.8
          }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="
            pointer-events-auto
            backdrop-blur-2xl
            saturate-[150%]
            bg-white/85
            dark:bg-[#0F172A]/70
            border border-white/20
            dark:border-white/5
            shadow-[0_12px_40px_rgba(0,0,0,0.15)]
            rounded-[28px]
            px-5 py-4
            w-[340px]
            max-w-[90vw]
            flex flex-col
            gap-1.5
            select-none
            cursor-default
          ">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${iconTheme.dot}`} />
                <p className={`text-[10px] font-bold tracking-[0.1em] ${iconTheme.text} uppercase`}>
                  {iconTheme.label}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
                aria-label="Dismiss"
              >
                <div className="w-2.5 h-[1.2px] bg-[#8e8e93] rotate-45 absolute" />
                <div className="w-2.5 h-[1.2px] bg-[#8e8e93] -rotate-45 absolute" />
              </button>
            </div>

            <div className="space-y-0.5">
              <p className="text-[15px] font-bold text-black dark:text-white tracking-tight leading-tight">
                {title}
              </p>
              <p className="text-[13px] text-black/60 dark:text-white/50 leading-snug font-medium">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
