import React from 'react';

const SettingsCard = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  action, 
  className = "", 
  padding = "p-5 sm:p-8 lg:p-10",
  headerBorder = true,
  iconClassName = ""
}) => {
  return (
    <div className={`glass-card rounded-2xl ${padding} relative overflow-hidden group ${className}`}>
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative z-10">
        {(title || subtitle || action) && (
          <div className={`flex flex-col sm:flex-row justify-between items-start gap-6 ${headerBorder ? 'mb-12' : ''}`}>
            <div>
              {title && (
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {Icon && (
                    typeof Icon === "string" ? (
                      <img 
                        src={Icon} 
                        alt="" 
                        className={`${iconClassName || 'w-5 h-5'} object-contain`} 
                      />
                    ) : (
                      <Icon size={20} className={`text-accent ${iconClassName}`} />
                    )
                  )}
                  {title}
                </h2>
              )}
              {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
