import React, { useState } from "react";
import FreelancerSettingsSidebar from "../freelancer/settings/FreelancerSettingsSidebar";
import FreelancerAccountSection from "../freelancer/settings/FreelancerAccountSection";
import FreelancerAccountActionsSection from "../freelancer/settings/FreelancerAccountActionsSection";
import FreelancerBillingSection from "../freelancer/settings/FreelancerBillingSection";
import FreelancerPasswordSection from "../freelancer/settings/FreelancerPasswordSection";
import FreelancerNotificationSection from "../freelancer/settings/FreelancerNotificationSection";
import ProfileImageModal from "../client/settings/ProfileImageModal";
import AppearanceSection from "../client/settings/AppearanceSection";

const FreelancerSettings = () => {
    const [active, setActive] = useState("info");
    const [showProfileImageModal, setShowProfileImageModal] = useState(false);
    const [tempAvatar, setTempAvatar] = useState(null);

    const handleAvatarUpdate = (url) => {
        setTempAvatar(url);
    };

    return (
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">
            <div className="mb-6 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-white/40 text-xs sm:text-sm mt-1 font-medium">Manage your professional profile, security, and notification preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-14 w-full min-w-0 items-start">
                <aside className="sticky top-[56px] sm:top-[70px] lg:sticky lg:top-32 lg:self-start z-[30] w-full lg:w-auto shrink-0 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none py-1 lg:py-0">
                    <FreelancerSettingsSidebar active={active} setActive={setActive} />
                </aside>

                <div className="flex-1 min-w-0 space-y-6 sm:space-y-10">

                    {active === "info" && (
                        <>
                            <FreelancerAccountSection
                                onOpenImageModal={() => setShowProfileImageModal(true)}
                                updatedAvatar={tempAvatar}
                            />
                            <FreelancerAccountActionsSection />
                        </>
                    )}

                    {active === "appearance" && <AppearanceSection />}
                    {active === "billing" && <FreelancerBillingSection />}
                    {active === "password" && <FreelancerPasswordSection />}
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

export default FreelancerSettings;
