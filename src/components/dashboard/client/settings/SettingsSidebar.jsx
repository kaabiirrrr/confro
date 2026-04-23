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
    <div className="w-full lg:w-[260px]">
      <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative text-left whitespace-nowrap px-4 lg:pl-6 py-3 transition-all duration-300 ${
              active === item.id 
                ? "text-white font-semibold bg-white/5 lg:bg-transparent" 
                : "text-white/40 hover:text-white hover:bg-white/5 lg:hover:bg-transparent"
            } rounded-lg lg:rounded-none`}
          >
            {/* Desktop side indicator */}
            {active === item.id && (
              <span className="hidden lg:block absolute left-0 top-0 h-full w-[3px] bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"></span>
            )}
            
            {/* Mobile bottom indicator */}
            {active === item.id && (
              <span className="lg:hidden absolute bottom-0 left-2 right-2 h-[2px] bg-accent"></span>
            )}
            
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;