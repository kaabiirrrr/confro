import React from "react";

const SettingsSidebar = ({ active, setActive }) => {

  const menu = [
    { id: "info", label: "My info" },
    { id: "appearance", label: "Appearance" },
    { id: "billing", label: "Billing & Payments" },
    { id: "password", label: "Password & Security" },
    { id: "team", label: "Teams & Members" },
    { id: "notification", label: "Notification Settings" }
  ];

  return (
    <div className="w-full lg:w-[220px]">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="flex lg:hidden gap-1 overflow-x-auto no-scrollbar border-b border-white/5 pb-1">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative shrink-0 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-full ${
              active === item.id
                ? "text-white bg-white/5"
                : "text-white/40 hover:text-white"
            }`}
          >
            {item.label}
            {active === item.id && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:flex flex-col gap-1">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative text-left pl-6 pr-4 py-3 text-sm transition-all rounded-full ${
              active === item.id
                ? "text-white font-semibold"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {active === item.id && (
              <span className="absolute left-0 top-0 h-full w-[3px] bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;