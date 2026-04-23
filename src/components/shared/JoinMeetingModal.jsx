import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, ArrowRight } from 'lucide-react';

const JoinMeetingModal = ({ isOpen, onClose, onJoin }) => {
  const [meetingId, setMeetingId] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setMeetingId('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (meetingId.trim()) {
      onJoin(meetingId.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-start justify-center pointer-events-none">
        {/* Backdrop - only below header/navbar area to avoid "blanking" */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          style={{ top: '80px' }} // Starts below the standard navbar height
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-[360px] mt-[120px] bg-secondary border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Video size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Join Meeting</h2>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider leading-none mt-1">Enter your meeting ID</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/20 text-[8px] font-bold uppercase tracking-[0.2em] pl-1">Meeting ID</label>
              <input
                autoFocus
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="e.g. 123-456-789"
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-accent/40 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold rounded-xl transition-all uppercase tracking-widest text-[9px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!meetingId.trim()}
                className="flex-[2] py-2.5 bg-accent hover:saturate-[1.2] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 group"
              >
                <span className="uppercase tracking-widest text-[9px]">Join Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Subtext */}
          <div className="px-6 pb-6 text-center text-white/20 text-[9px] font-medium leading-tight">
            Check your internet connection before joining.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JoinMeetingModal;
