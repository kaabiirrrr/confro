import React from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobFilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  onApply, 
  onClear 
}) => {
  const { category, expLevel, budgetType, minBudget, maxBudget, skills } = filters;

  const toggleExp = (level) => {
    setFilters(prev => ({ 
      ...prev, 
      expLevel: prev.expLevel === level ? '' : level 
    }));
  };

  const toggleBudgetType = (type) => {
    setFilters(prev => ({ 
      ...prev, 
      budgetType: prev.budgetType === type ? '' : type 
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-secondary border-l border-border shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 sm:px-8 py-5 sm:py-7 border-b border-border flex items-center justify-between bg-secondary/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-base sm:text-xl font-bold text-light-text tracking-tight">Filter Jobs</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-light-text/5 text-light-text/40 hover:text-light-text transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:pt-6 space-y-6 sm:space-y-9 custom-scrollbar bg-secondary">
              
              {/* Experience Level */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-light-text/30 uppercase tracking-[0.1em]">Experience Level</h3>
                  <ChevronDown size={13} className="text-light-text/20" />
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'beginner', label: 'Entry Level', count: 0 },
                    { id: 'intermediate', label: 'Intermediate', count: 3 },
                    { id: 'expert', label: 'Expert', count: 2 }
                  ].map((level) => (
                    <label key={level.id} className="flex items-center justify-between cursor-pointer group" onClick={() => toggleExp(level.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border transition-all flex items-center justify-center ${expLevel === level.id ? 'bg-accent border-accent' : 'border-border bg-white/5 group-hover:border-accent/40'}`}>
                          {expLevel === level.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className={`text-xs sm:text-[14px] font-semibold transition-colors ${expLevel === level.id ? 'text-light-text' : 'text-light-text/50 group-hover:text-light-text/80'}`}>
                          {level.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-light-text/30 bg-light-text/5 px-2 py-0.5 rounded-full border border-border/50">{level.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-light-text/30 uppercase tracking-[0.1em]">Job Type</h3>
                  <ChevronDown size={13} className="text-light-text/20" />
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'hourly', label: 'Hourly', count: 2 },
                    { id: 'fixed', label: 'Fixed-Price', count: 5 }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center justify-between cursor-pointer group" onClick={() => toggleBudgetType(type.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border transition-all flex items-center justify-center ${budgetType === type.id ? 'bg-accent border-accent' : 'border-border bg-white/5 group-hover:border-accent/40'}`}>
                          {budgetType === type.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className={`text-xs sm:text-[14px] font-semibold transition-colors ${budgetType === type.id ? 'text-light-text' : 'text-light-text/50 group-hover:text-light-text/80'}`}>
                          {type.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-light-text/30 bg-light-text/5 px-2 py-0.5 rounded-full border border-border/50">{type.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of Proposals */}
              <div className="space-y-4 border-t border-border pt-5">
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-light-text/30 uppercase tracking-[0.1em]">Number of Proposals</h3>
                  <ChevronDown size={13} className="text-light-text/20" />
                </div>
              </div>

              {/* Project Length */}
              <div className="space-y-4 border-t border-border pt-5">
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-light-text/30 uppercase tracking-[0.1em]">Project Length</h3>
                  <ChevronDown size={13} className="text-light-text/20" />
                </div>
              </div>

              {/* Fixed Price Range */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] sm:text-[11px] font-bold text-light-text/30 uppercase tracking-[0.1em]">Fixed Price Range</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-light-text/40 uppercase tracking-widest pl-1">Min Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/20 text-sm">₹</span>
                      <input type="number" value={minBudget} onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))} placeholder="0"
                        className="w-full bg-secondary border border-border rounded-xl pl-7 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm text-light-text focus:outline-none focus:border-accent transition-all placeholder:text-light-text/10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-light-text/40 uppercase tracking-widest pl-1">Max Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/20 text-sm">₹</span>
                      <input type="text" value={maxBudget} onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))} placeholder="Any"
                        className="w-full bg-secondary border border-border rounded-xl pl-7 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm text-light-text focus:outline-none focus:border-accent transition-all placeholder:text-light-text/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 sm:px-8 py-4 sm:py-8 border-t border-border bg-secondary flex gap-3 sm:gap-4">
              <button onClick={onClear} className="flex-1 h-10 sm:h-12 rounded-xl sm:rounded-2xl border border-border text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-light-text/40 hover:text-light-text hover:bg-light-text/5 transition-all">
                Clear All
              </button>
              <button onClick={onApply} className="flex-[1.5] h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-accent text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all active:scale-[0.98]">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobFilterSidebar;
