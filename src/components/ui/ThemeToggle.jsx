import React, { useState } from 'react';
import { Check, ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  const [openTheme, setOpenTheme] = useState(false);

  const themeOptions = [
    { key: "auto", label: "Auto", desc: "Sync with system", iconPath: "/Icons/icons8-system-100.png" },
    { key: "light", label: "Light", desc: "Always light theme", iconPath: "/Icons/icons8-brightness-100.png" },
    { key: "dark", label: "Dark", desc: "Always dark theme", iconPath: "/Icons/icons8-night-100.png" },
  ];

  const currentIcon = theme === 'light' ? '/Icons/icons8-brightness-100.png' : 
                      theme === 'dark' ? '/Icons/icons8-night-100.png' : 
                      '/Icons/icons8-system-100.png';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpenTheme(!openTheme)}
        className="dropdown-item w-full flex justify-between items-center selection:bg-transparent group"
      >
        <div className="flex items-center gap-3 capitalize">
          <img 
            src={currentIcon} 
            alt="" 
            className="w-5 h-5 object-contain transition-all" 
                style={{ filter: 'var(--dropdown-icon-filter)' }}
          />
          <span>Theme: {theme}</span>
        </div>

        <ChevronUp
          size={16}
          className={`transition ${openTheme ? "rotate-180" : ""}`}
        />
      </button>

      {openTheme && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[260px] bg-secondary border border-border rounded-xl shadow-xl p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
          {themeOptions.map(({ key, label, desc, iconPath }) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                setOpenTheme(false);
              }}
              className={`theme-item flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${
                theme === key ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5'
              } group/item`}
            >
              <img 
                src={iconPath} 
                alt="" 
                className={`w-5 h-5 object-contain transition-all ${
                  theme === key ? 'scale-110' : 'group-hover/item:scale-110'
                }`} 
                style={{ filter: 'var(--dropdown-icon-filter)' }}
              />
              <div className="flex-1">
                <p className={`font-medium ${theme === key ? 'text-accent' : 'text-light-text'}`}>{label}</p>
                <p className="text-xs text-light-text/40">{desc}</p>
              </div>
              {theme === key && <Check size={16} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
