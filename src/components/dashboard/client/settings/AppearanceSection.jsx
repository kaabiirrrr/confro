import React from "react";
import { Palette, Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import SettingsCard from "../../../ui/SettingsCard";

const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { key: "auto", label: "System Default", desc: "Adapt to your OS settings", icon: "/Icons/icons8-system-100.png" },
    { key: "light", label: "Light Mode", desc: "Clean and bright", icon: "/Icons/icons8-brightness-100.png" },
    { key: "dark", label: "Dark Mode", desc: "Easier on eyes", icon: "/Icons/icons8-night-100.png" },
  ];

  return (
    <SettingsCard
      title="Appearance"
      subtitle="Customize the look and feel of your experience"
      icon={Palette}
      iconClassName="w-[30px] h-[30px]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTheme(opt.key)}
            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center ${theme === opt.key
              ? "bg-accent/10 border-accent shadow-lg shadow-accent/10"
              : "bg-transparent border-white/5 hover:border-white/20"
              }`}
          >
            <div className={`flex items-center justify-center ${typeof opt.icon === 'string' ? '' : `p-3 rounded-xl ${theme === opt.key ? 'bg-accent text-white' : 'bg-white/5 text-white/40'}`}`}>
              {typeof opt.icon === 'string' ? (
                <img src={opt.icon} alt="" className="w-[30px] h-[30px] object-contain" />
              ) : (
                <opt.icon size={24} />
              )}
            </div>
            <div>
              <p className={`font-bold text-sm ${theme === opt.key ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">{opt.desc}</p>
            </div>
            {theme === opt.key && (
              <div className="mt-2 text-accent">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </SettingsCard>
  );
};

export default AppearanceSection;
