import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onChange, className = '', variant = 'underline' }) => {
  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar p-1 bg-slate-900/5 dark:bg-white/5 rounded-2xl w-fit ${className}`}>
        {tabs.map(tab => {
          const isActive = activeTab === (tab.key || tab.id);
          const label = (tab.label || '').toUpperCase();
          
          return (
            <button 
              key={tab.key || tab.id} 
              onClick={() => onChange(tab.key || tab.id)}
              className={`flex-none px-3 py-2 sm:px-6 sm:py-2.5 text-[9px] sm:text-[11px] font-bold tracking-widest transition-all whitespace-nowrap rounded-xl ${
                isActive 
                  ? 'bg-white dark:bg-secondary text-accent shadow-md shadow-black/5 dark:shadow-none' 
                  : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/80'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {label}
                {tab.count !== undefined && (
                  <span className={`text-[9px] sm:text-[10px] font-black ${isActive ? 'text-accent/60' : 'opacity-40'}`}>
                    ({tab.count})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 sm:gap-10 border-b border-white/5 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === (tab.key || tab.id);
        const label = (tab.label || '').toUpperCase();
        
        return (
          <button 
            key={tab.key || tab.id} 
            onClick={() => onChange(tab.key || tab.id)}
            className={`flex-none pb-4 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.15em] transition-all relative whitespace-nowrap ${
              isActive ? 'text-accent' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/80'
            }`}
          >
            <div className="flex items-center gap-2">
              {label}
              {tab.count !== undefined && (
                <span className={`text-[9px] sm:text-[10px] font-medium ${isActive ? 'text-accent/80' : 'opacity-60'}`}>
                  ({tab.count})
                </span>
              )}
            </div>
            {isActive ? (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            ) : (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent/0 hover:bg-accent/20 transition-all duration-300 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
