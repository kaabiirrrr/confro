import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

/**
 * Modern, high-aesthetic generic confirmation modal using React Portal.
 * Renders into document.body to ensure perfect centering and overlay.
 * 
 * @param {boolean} isOpen - Whether the modal is active.
 * @param {function} onClose - Function to handle cancellation/dismissal.
 * @param {function} onConfirm - Function to handle the actual action.
 * @param {string} title - The main heading.
 * @param {string} message - The description.
 * @param {string} confirmText - Text for confirm button.
 * @param {string} cancelText - Text for cancel button.
 * @param {React.ReactNode} icon - Optional custom icon component, defaults to AlertCircle.
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = <AlertCircle size={48} className="text-[#ef4444] ml-1.5" />
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-950/30 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Container - Using theme-aware glass pane */}
      <div 
        className="w-full max-w-[380px] bg-white dark:bg-[#0A1121] border border-black/5 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative p-8 text-center animate-in zoom-in-95 duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
        >
          <X size={18} />
        </button>

        {/* Icon Area - Enhanced for both modes */}
        <div className="mb-6 flex flex-col items-center mt-2">
          <div className="relative group">
            <div className="relative flex items-center justify-center group-hover:rotate-6 transition-all duration-700">
               {icon}
            </div>
            {/* Subtle glow effect for dark mode */}
            <div className="absolute inset-0 bg-[#ef4444]/20 blur-2xl -z-10 opacity-0 dark:group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        </div>

        {/* Text Content */}
        <div className="mb-8">
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight mb-2">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-white/60 text-[14px] leading-relaxed max-w-[260px] mx-auto">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 px-2">
          
          <button
            onClick={onClose}
            className="flex-[1] py-2.5 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white font-semibold text-[13.5px] hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95"
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-[1] py-2.5 flex items-center justify-center rounded-xl bg-[#ef4444] text-white font-bold text-[13.5px] hover:bg-[#ef4444]/90 transition-all duration-300 shadow-lg shadow-[#ef4444]/20 active:scale-95"
          >
            {confirmText}
          </button>

        </div>

      </div>

      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />
      
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
