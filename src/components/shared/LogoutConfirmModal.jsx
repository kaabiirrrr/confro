import React from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Modern, high-aesthetic logout confirmation modal using React Portal.
 * Renders into document.body to ensure perfect centering and overlay.
 * 
 * @param {boolean} isOpen - Whether the modal is active.
 * @param {function} onClose - Function to handle cancellation/dismissal.
 * @param {function} onConfirm - Function to handle the actual logout action.
 */
const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Container */}
      <div 
        className="w-full max-w-[420px] bg-[#0A1121] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden relative p-12 text-center animate-in zoom-in-95 duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Logo and Icon Area */}
        <div className="mb-10 flex flex-col items-center">
          {/* Connect Logo (Logo2.png) */}
          <img 
            src="/Logo2.png" 
            alt="Connect Logo" 
            className="h-10 object-contain mb-12 opacity-100 invert dark:invert-0 brightness-110 shadow-sm transition-transform hover:scale-105 duration-500"
          />
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#38bdf8]/10 rounded-full blur-xl group-hover:bg-[#38bdf8]/20 transition-all duration-700" />
            <div className="relative w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-[#38bdf8]/10 border border-[#38bdf8]/5 group-hover:rotate-6 transition-all duration-700">
               <LogOut size={48} className="text-[#38bdf8] ml-1.5" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="mb-12">
          <h2 className="text-[32px] font-bold text-white leading-tight mb-4">
            Are you logging out?
          </h2>
          <p className="text-white/60 text-[16px] leading-relaxed max-w-[280px] mx-auto">
            You can always log back in at any time. if you just want to switch accounts, you can{" "}
            <button 
              onClick={() => {
                navigate('/signup');
                onClose();
              }}
              className="text-[#38bdf8] font-bold underline hover:text-[#38bdf8]/80 transition-colors"
            >
              add another account.
            </button>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 px-2">
          
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-full border border-white/10 bg-white/5 text-white font-bold text-[15px] hover:bg-white/10 transition-all duration-300 active:scale-95"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-full bg-[#38bdf8] text-white font-black text-[15px] hover:bg-[#0ea5e9] transition-all duration-300 shadow-xl shadow-[#38bdf8]/10 active:scale-95"
          >
            Log out
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

export default LogoutConfirmModal;
