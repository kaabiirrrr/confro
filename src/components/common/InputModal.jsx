import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Info } from 'lucide-react';
import InfinityLoader from './InfinityLoader';

export default function InputModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  subtitle, 
  placeholder, 
  defaultValue = '', 
  type = 'text', 
  confirmLabel = 'Confirm',
  icon: Icon = Info
}) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!value?.trim() && type !== 'number') return;
    
    setLoading(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-7">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  {type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder}
                      autoFocus
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium text-white focus:outline-none focus:border-accent/40 transition-all placeholder:text-white/10 resize-none"
                    />
                  ) : (
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder}
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-lg font-bold text-white focus:outline-none focus:border-accent/40 transition-all placeholder:text-white/10"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-full border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!value?.trim() && type !== 'number')}
                    className="flex-[1.5] bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <InfinityLoader size={18} />
                    ) : (
                      <>
                        {confirmLabel} <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
