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
      <div className="flex lg:hidden gap-4 overflow-x-auto no-scrollbar w-full min-w-0 relative border-b border-white/5 px-2">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative shrink-0 px-1 py-4 text-[13px] font-bold whitespace-nowrap transition-all ${active === item.id
              ? "text-white"
              : "text-white/40 hover:text-white"
              }`}
          >
            {item.label}
            {active === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-accent rounded-full z-10" />
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
            className={`relative text-left pl-6 pr-4 py-3 text-sm transition-all rounded-full ${active === item.id
              ? "text-white font-semibold"
              : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
          >
            {active === item.id && (
              <span className="absolute left-0 top-0 h-full w-[3px] bg-accent rounded-full" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;