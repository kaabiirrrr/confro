import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const FILTER_SECTIONS = [
  {
    id: 'experience_level',
    title: 'Experience Level',
    options: [
      { id: 'entry', label: 'Entry Level', countKey: 'entry' },
      { id: 'intermediate', label: 'Intermediate', countKey: 'intermediate' },
      { id: 'expert', label: 'Expert', countKey: 'expert' }
    ]
  },
  {
    id: 'budget_type',
    title: 'Job Type',
    options: [
      { id: 'hourly', label: 'Hourly', countKey: 'hourly' },
      { id: 'fixed', label: 'Fixed-Price', countKey: 'fixed' }
    ]
  },
  {
    id: 'proposal_count_range',
    title: 'Number of Proposals',
    options: [
      { id: '0-5', label: 'Less than 5', countKey: '0-5' },
      { id: '5-10', label: '5 to 10', countKey: '5-10' },
      { id: '10-15', label: '10 to 15', countKey: '10-15' },
      { id: '15-20', label: '15 to 20', countKey: '15-20' },
      { id: '20-50', label: '20 to 50', countKey: '20-50' }
    ]
  },
  {
    id: 'duration',
    title: 'Project Length',
    options: [
      { id: 'less_than_1_month', label: 'Less than 1 month', countKey: 'less_than_1_month' },
      { id: '1-3_months', label: '1 to 3 months', countKey: '1-3_months' },
      { id: '3-6_months', label: '3 to 6 months', countKey: '3-6_months' },
      { id: 'more_than_6_months', label: 'More than 6 months', countKey: 'more_than_6_months' }
    ]
  }
];

export default function JobFiltersModal({ isOpen, onClose, currentFilters, onApply, stats }) {
  const [tempFilters, setTempFilters] = useState(currentFilters || {});
  const [expandedSections, setExpandedSections] = useState(['experience_level', 'budget_type']);

  useEffect(() => {
    if (isOpen) setTempFilters(currentFilters || {});
  }, [isOpen, currentFilters]);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleCheckboxChange = (sectionId, optionId) => {
    setTempFilters(prev => {
      const current = prev[sectionId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, [sectionId]: updated };
    });
  };

  const clearAll = () => {
    setTempFilters({});
  };

  const applyFilters = () => {
    onApply(tempFilters);
    onClose();
  };

  const getCount = (sectionId, countKey) => {
    if (!stats) return null;
    if (sectionId === 'experience_level') return stats.experience?.[countKey];
    if (sectionId === 'budget_type') return stats.budget_type?.[countKey];
    if (sectionId === 'proposal_count_range') return stats.proposals?.[countKey];
    if (sectionId === 'duration') return stats.duration?.[countKey];
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-[400px] h-full bg-secondary border-l border-white/5 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <h2 className="text-[15px] font-semibold text-white tracking-tight">Filter Jobs</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Filters Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {FILTER_SECTIONS.map((section, idx) => (
            <div key={section.id} className="border-b border-white/5 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full group mb-3"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] group-hover:text-white transition-colors">
                  {section.title}
                </span>
                <ChevronDown 
                  size={14} 
                  strokeWidth={2}
                  className={`text-white/20 transition-transform duration-300 ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`} 
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden space-y-3"
                  >
                    {section.options.map((option) => {
                      const isChecked = (tempFilters[section.id] || []).includes(option.id);
                      const count = getCount(section.id, option.countKey);

                      return (
                        <label
                          key={option.id}
                          className="flex items-center justify-between cursor-pointer group py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <input
                                type="checkbox"
                                className="peer hidden"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(section.id, option.id)}
                              />
                              <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all duration-200 ${
                                isChecked 
                                  ? 'bg-transparent border-white/40' 
                                  : 'bg-transparent border-white/10 group-hover:border-white/30'
                              }`}>
                                {isChecked && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2.5 h-2.5 bg-white/70 rounded-[2px]"
                                  />
                                )}
                              </div>
                            </div>
                            <span className={`text-[13px] transition-colors leading-none pt-0.5 ${isChecked ? 'text-white font-medium' : 'text-[#94A3B8] group-hover:text-white'}`}>
                              {option.label}
                            </span>
                          </div>
                          {count !== null && (
                            <span className="min-w-[20px] h-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] tabular-nums bg-white/5 text-white/40">
                              {count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Budget Range */}
          <div className="pt-2">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-4">
              Fixed Price Range
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Min Budget</label>
                <div className="relative group/input">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[13px]">₹</span>
                  <input
                    type="number"
                    value={tempFilters.budget_min || ''}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, budget_min: e.target.value }))}
                    className="w-full bg-transparent border border-white/10 rounded-lg pl-7 pr-3 py-2 text-[13px] focus:border-white/30 outline-none transition-all placeholder:text-white/20 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Max Budget</label>
                <div className="relative group/input">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[13px]">₹</span>
                  <input
                    type="number"
                    value={tempFilters.budget_max || ''}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, budget_max: e.target.value }))}
                    className="w-full bg-transparent border border-white/10 rounded-lg pl-7 pr-3 py-2 text-[13px] focus:border-white/30 outline-none transition-all placeholder:text-white/20 text-white"
                    placeholder="Any"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-secondary flex items-center gap-3 mt-auto">
          <button
            onClick={clearAll}
            className="flex-1 h-10 text-[11px] font-bold tracking-wider border border-white/10 rounded-full hover:bg-white/5 transition-all text-[#94A3B8] hover:text-white"
          >
            CLEAR ALL
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 h-10 px-8 text-[11px] font-bold tracking-wider bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white rounded-full transition-all active:scale-[0.98]"
          >
            APPLY FILTERS
          </button>
        </div>
      </motion.div>

    </div>
  );
}
