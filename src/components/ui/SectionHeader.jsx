import React from 'react';

const SectionHeader = ({ title, subtext, action, className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {subtext && (
            <p className="text-base text-light-text/70 mt-1">{subtext}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
