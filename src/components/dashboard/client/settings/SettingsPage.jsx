import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";

// Reuse freelancer components that are identical
import FreelancerSettingsSidebar from "../../freelancer/settings/FreelancerSettingsSidebar";
import FreelancerPasswordSection from "../../freelancer/settings/FreelancerPasswordSection";
import FreelancerNotificationSection from "../../freelancer/settings/FreelancerNotificationSection";
import AppearanceSection from "./AppearanceSection";

// Client-specific sections
import AccountSection from "./AccountSection";
import CompanyDetailsSection from "./CompanyDetailsSection";
import CompanyContactsSection from "./CompanyContactsSection";
import AccountActionsSection from "./AccountActionsSection";
import BillingPaymentsSection from "./BillingPaymentsSection";
import TeamsMembersSection from "./TeamsMembersSection";
import ProfileImageModal from "./ProfileImageModal";

// Override sidebar to add Teams & Members for clients
const ClientSettingsSidebar = ({ active, setActive }) => {
  const menu = [
    { id: "info",         label: "My info" },
    { id: "appearance",   label: "Appearance" },
    { id: "billing",      label: "Billing & Payments" },
    { id: "password",     label: "Password & Security" },
    { id: "team",         label: "Teams & Members" },
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
            className={`relative shrink-0 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all rounded-full ${
              active === item.id ? "text-white" : "text-white/40 hover:text-white"
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
            className={`relative text-left pl-6 pr-4 py-3 text-sm transition-all rounded-full ${
              active === item.id
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

const SettingsPage = () => {
  const [active, setActive] = useState("info");
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(null);
  const { setProfile } = useAuth();

  const handleAvatarUpdate = (url) => {
    setTempAvatar(url);
    // Persist into AuthContext so the new URL survives tab/component switches
    setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">

      <div className="mb-6 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-xs sm:text-sm mt-1 font-medium">Manage your account settings, security, and team preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-14 w-full min-w-0 items-start">

        <aside className="sticky top-[56px] sm:top-[70px] lg:sticky lg:top-28 lg:self-start z-[30] w-full lg:w-auto shrink-0 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none py-1 lg:py-0">
          <ClientSettingsSidebar active={active} setActive={setActive} />
        </aside>

        <div className="flex-1 min-w-0 space-y-6 sm:space-y-10">

          {active === "info" && (
            <>
              <AccountSection
                onOpenImageModal={() => setShowProfileImageModal(true)}
                updatedAvatar={tempAvatar}
              />
              <CompanyDetailsSection />
              <CompanyContactsSection />
              <AccountActionsSection />
            </>
          )}

          {active === "appearance"   && <AppearanceSection />}
          {active === "billing"      && <BillingPaymentsSection />}
          {active === "password"     && <FreelancerPasswordSection />}
          {active === "team"         && <TeamsMembersSection setActive={setActive} />}
          {active === "notification" && <FreelancerNotificationSection />}

        </div>
      </div>

      <ProfileImageModal
        isOpen={showProfileImageModal}
        onClose={() => setShowProfileImageModal(false)}
        onImageSelect={handleAvatarUpdate}
      />
    </div>
  );
};

export default SettingsPage;
