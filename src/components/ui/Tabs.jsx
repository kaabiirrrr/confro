import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-10 border-b border-white/5 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === (tab.key || tab.id);
        const label = (tab.label || '').toUpperCase();
        
        return (
          <button 
            key={tab.key || tab.id} 
            onClick={() => onChange(tab.key || tab.id)}
            className={`pb-4 text-[11px] font-bold tracking-[0.15em] transition-all relative whitespace-nowrap ${
              isActive ? 'text-accent' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <div className="flex items-center gap-2">
              {label}
              {tab.count !== undefined && (
                <span className={`text-[10px] opacity-60 font-medium ${isActive ? 'text-accent' : ''}`}>
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
