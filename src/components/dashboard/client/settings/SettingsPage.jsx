import React, { useState } from "react";

import AccountHealthSection from "./AccountHealthSection";
import SettingsSidebar from "./SettingsSidebar";
import AccountSection from "./AccountSection";
import CompanyDetailsSection from "./CompanyDetailsSection";
import CompanyContactsSection from "./CompanyContactsSection";
import AccountActionsSection from "./AccountActionsSection";

import BillingPaymentsSection from "./BillingPaymentsSection";
import PasswordSecuritySection from "./PasswordSecuritySection";
import TeamsMembersSection from "./TeamsMembersSection";
import NotificationSection from "./NotificationSection";
import ProfileImageModal from "./ProfileImageModal";

import AppearanceSection from "./AppearanceSection";

const SettingsPage = () => {

    const [active, setActive] = useState("info");
    const [showProfileImageModal, setShowProfileImageModal] = useState(false);
    const [tempAvatar, setTempAvatar] = useState(null);

    const handleAvatarUpdate = (url) => {
        setTempAvatar(url);
    };

    return (
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="mb-6 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-white/40 text-xs sm:text-sm mt-1 font-medium">Manage your account settings, security, and team preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-14">

                {/* Sidebar — horizontal scroll on mobile, sticky sidebar on desktop */}
                <aside className="lg:sticky lg:top-32 lg:self-start z-20 w-full lg:w-auto">
                    <SettingsSidebar active={active} setActive={setActive} />
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

                    {active === "appearance" && <AppearanceSection />}
                    {active === "billing" && <BillingPaymentsSection />}
                    {active === "password" && <PasswordSecuritySection />}
                    {active === "team" && <TeamsMembersSection />}
                    {active === "notification" && <NotificationSection />}

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