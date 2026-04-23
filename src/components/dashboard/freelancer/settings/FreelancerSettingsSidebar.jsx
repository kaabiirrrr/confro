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
    <div className="w-[260px]">
      <div className="flex flex-col gap-2">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative text-left pl-6 py-3 transition ${
              active === item.id 
                ? "text-white font-medium" 
                : "text-light-text/60 hover:text-light-text"
            }`}
          >
            {active === item.id && (
              <span className="absolute left-0 top-0 h-full w-[3px] bg-accent"></span>
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FreelancerSettingsSidebar;
