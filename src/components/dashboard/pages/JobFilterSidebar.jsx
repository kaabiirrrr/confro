import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_SECTIONS = [
  {
    id: 'expLevel',
    title: 'Experience Level',
    options: [
      { id: 'beginner', label: 'Entry Level' },
      { id: 'intermediate', label: 'Intermediate' },
      { id: 'expert', label: 'Expert' },
    ],
  },
  {
    id: 'budgetType',
    title: 'Job Type',
    options: [
      { id: 'hourly', label: 'Hourly' },
      { id: 'fixed', label: 'Fixed-Price' },
    ],
  },
  {
    id: 'proposalRange',
    title: 'Number of Proposals',
    options: [
      { id: '0-5', label: 'Less than 5' },
      { id: '5-10', label: '5 to 10' },
      { id: '10-15', label: '10 to 15' },
      { id: '15-20', label: '15 to 20' },
      { id: '20-50', label: '20 to 50' },
    ],
  },
  {
    id: 'duration',
    title: 'Project Length',
    options: [
      { id: 'less_than_1_month', label: 'Less than 1 month' },
      { id: '1-3_months', label: '1 to 3 months' },
      { id: '3-6_months', label: '3 to 6 months' },
      { id: 'more_than_6_months', label: 'More than 6 months' },
    ],
  },
];

const JobFilterSidebar = ({ isOpen, onClose, filters, setFilters, onApply, onClear }) => {
  const [expandedSections, setExpandedSections] = useState(FILTER_SECTIONS.map(s => s.id));
  // Local temp state so changes only apply on button click
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) setTempFilters(filters);
  }, [isOpen, filters]);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // For single-select sections (expLevel, budgetType) toggle on/off
  // For multi-select sections (proposalRange, duration) toggle array
  const handleOptionClick = (sectionId, optionId) => {
    if (sectionId === 'expLevel' || sectionId === 'budgetType') {
      setTempFilters(prev => ({
        ...prev,
        [sectionId]: prev[sectionId] === optionId ? '' : optionId,
      }));
    } else {
      setTempFilters(prev => {
        const current = prev[sectionId] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [sectionId]: updated };
      });
    }
  };

  const isChecked = (sectionId, optionId) => {
    if (sectionId === 'expLevel' || sectionId === 'budgetType') {
      return tempFilters[sectionId] === optionId;
    }
    return (tempFilters[sectionId] || []).includes(optionId);
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onApply();
  };

  const handleClear = () => {
    const cleared = {
      category: '',
      expLevel: '',
      budgetType: '',
      minBudget: '',
      maxBudget: '',
      skills: [],
      proposalRange: [],
      duration: [],
    };
    setTempFilters(cleared);
    setFilters(cleared);
    onClear();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-stretch justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-[calc(100vw-64px)] sm:w-[85vw] max-w-[360px] bg-secondary border-l border-white/5 flex flex-col shadow-2xl"
            style={{ height: '100dvh', minHeight: '100vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Filter Jobs</h2>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-accent transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable filters */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              {FILTER_SECTIONS.map((section) => (
                <div key={section.id} className="border-b border-white/5 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full group mb-3"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] group-hover:text-accent transition-colors">
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
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden space-y-3"
                      >
                        {section.options.map((option) => {
                          const checked = isChecked(section.id, option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex items-center justify-between cursor-pointer group py-2.5"
                            >
                              <div className="flex items-center gap-3" onClick={() => handleOptionClick(section.id, option.id)}>
                                <div className="relative flex-shrink-0">
                                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                    checked
                                      ? 'border-accent'
                                      : 'border-white/20 group-hover:border-accent/50'
                                  }`}>
                                    {checked && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2.5 h-2.5 rounded-full bg-accent"
                                      />
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[13px] transition-colors leading-none pt-0.5 ${checked ? 'text-accent font-medium' : 'text-[#94A3B8] group-hover:text-accent'}`}>
                                  {option.label}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Fixed Price Range */}
              <div className="pt-2">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-4">
                  Fixed Price Range
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Min Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[13px]">₹</span>
                      <input
                        type="number"
                        value={tempFilters.minBudget || ''}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg pl-7 pr-3 py-2 text-[13px] focus:border-white/30 outline-none transition-all placeholder:text-white/20 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Max Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[13px]">₹</span>
                      <input
                        type="text"
                        value={tempFilters.maxBudget || ''}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg pl-7 pr-3 py-2 text-[13px] focus:border-white/30 outline-none transition-all placeholder:text-white/20 text-white"
                        placeholder="Any"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pt-4 pb-6 border-t border-white/5 bg-secondary flex items-center gap-3 shrink-0">
              <button
                onClick={handleClear}
                className="flex-1 h-10 text-[11px] font-bold tracking-wider border border-white/10 rounded-full hover:bg-white/5 transition-all text-[#94A3B8] hover:text-accent"
              >
                CLEAR ALL
              </button>
              <button
                onClick={handleApply}
                className="flex-1 h-10 px-8 text-[11px] font-bold tracking-wider bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white rounded-full transition-all active:scale-[0.98]"
              >
                APPLY FILTERS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobFilterSidebar;
