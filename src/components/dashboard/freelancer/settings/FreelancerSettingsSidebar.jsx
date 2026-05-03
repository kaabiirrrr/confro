import React from "react";

const FreelancerSettingsSidebar = ({ active, setActive }) => {
  const menu = [
    { id: "info", label: "My info" },
    { id: "appearance", label: "Appearance" },
    { id: "billing", label: "Billing & Payments" },
    { id: "password", label: "Password & Security" },
    { id: "notification", label: "Notification Settings" },
  ];

  return (
    <div className="w-full lg:w-[220px] min-w-0">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="flex lg:hidden gap-1 overflow-x-auto no-scrollbar border-b border-white/5 w-full min-w-0 relative">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative shrink-0 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all rounded-full ${active === item.id
                ? "text-white"
                : "text-white/40 hover:text-white"
              }`}
          >
            {item.label}
            {active === item.id && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-accent rounded-full z-10" />
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
              <span className="absolute left-0 top-0 h-full w-[3px] bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FreelancerSettingsSidebar;
