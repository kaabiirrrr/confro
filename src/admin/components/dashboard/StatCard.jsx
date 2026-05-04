import { formatINR } from '../../../utils/currencyUtils';

const StatCard = ({ title, value, icon: Icon, trend, trendType = 'up', subtext = "than last month", subValue }) => {
  const isUp = trendType === 'up';
  const isImageIcon = typeof Icon === 'string';

  const isCurrency = title.toLowerCase().includes('earnings') || 
                    title.toLowerCase().includes('commission') || 
                    title.toLowerCase().includes('revenue');
  
  // Shrink text if it's a long string or if we have a subValue
  const isLongText = typeof value === 'string' && value.length > 10;
  const valueSizeClass = (isLongText || subValue) ? 'text-xl' : 'text-3xl';
  
  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-4 sm:p-6 hover:border-accent/30 transition-all group shadow-sm">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="text-secondary group-hover:scale-110 transition-transform flex items-center justify-center">
          {isImageIcon ? (
            <img src={Icon} alt={title} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          ) : (
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-tight ${
            isUp ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            <img src="/Icons/icons8-sales-growth-64.png" alt="Growth" className={`w-4 h-4 sm:w-5 sm:h-5 object-contain ${!isUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h3 className="text-slate-500 dark:text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">
          {title}
        </h3>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <p className={`${isLongText || subValue ? 'text-base sm:text-xl' : 'text-xl sm:text-3xl'} font-bold text-slate-900 dark:text-white tracking-tighter truncate max-w-full`}>
              {isCurrency ? formatINR(value) : value?.toLocaleString() || '0'}
            </p>
            {trend && (
              <span className="text-[10px] text-slate-400 dark:text-white/20 font-medium whitespace-nowrap">
                {subtext}
              </span>
            )}
          </div>
          {subValue && (
            <p className="text-sm text-accent/90 font-bold truncate mt-1">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
