import React, { useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { updateMyProfile } from "../../../../services/apiService";
import { toastApiError } from "../../../../utils/apiErrorToast";
import { toast } from "react-hot-toast";
import SettingsCard from "../../../ui/SettingsCard";

const FreelancerNotificationSection = () => {
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState("email");
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState(profile?.notification_preferences || {
    email_proposals: true, email_messages: true, email_contracts: true,
    push_messages: true,
  });

  const togglePreference = async (key) => {
    const newValue = !notifications[key];
    const newPrefs = { ...notifications, [key]: newValue };
    setNotifications(newPrefs);
    
    try {
      await updateMyProfile({ notification_preferences: newPrefs });
      if (refreshProfile) refreshProfile();
      toast.success('Preference updated');
    } catch (err) {
      setNotifications(notifications);
      toastApiError(err, 'Failed to update preference');
    }
  };

  const tabs = [
    { id: "email", label: "Email Intelligence" },
    { id: "push", label: "Real-time Alerts" },
  ];

  return (
    <div className="space-y-10">
      <div className="mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-2 sm:mb-4">
          Communication Preferences
        </h2>
        <p className="text-white/40 text-xs sm:text-sm font-medium">
          Control how and when you receive intelligence updates, alerts, and system notifications.
        </p>
      </div>

      {/* TABS */}
      <div className="flex max-sm:justify-between sm:gap-10 border-b border-white/5 mb-6 sm:mb-12">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 sm:flex-none pb-3 sm:pb-4 text-[11px] sm:text-sm font-bold uppercase tracking-widest transition-all relative ${
              tab === t.id ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.div
                layoutId="activeTabNote"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-8"
        >
          <SettingsCard 
            title={tab === "email" ? "Email Relay System" : "Push Architecture"} 
            subtitle="Configure granular alerts for your professional workflow"
            icon={Bell}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {tab === "email" ? (
                <>
                  {[
                    { key: 'email_proposals', label: 'Proposal & Invitation Feed' },
                    { key: 'email_messages',  label: 'Direct Correspondence' },
                    { key: 'email_contracts', label: 'Contract Milestone Updates' },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      onClick={() => togglePreference(item.key)}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer group hover:border-accent/30 transition-all"
                    >
                      <div>
                        <p className="text-white font-bold text-xs sm:text-sm">{item.label}</p>
                        <p className="text-white/30 text-[9px] sm:text-xs mt-0.5 uppercase tracking-tighter">Primary Relay</p>
                      </div>
                      <button 
                        type="button"
                        className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-white/10'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[item.key] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { key: 'push_messages', label: 'Real-time Message Desktop Alert' },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      onClick={() => togglePreference(item.key)}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-tr from-accent/5 to-transparent border border-white/10 cursor-pointer group hover:border-accent/30 transition-all col-span-full"
                    >
                       <div>
                        <p className="text-white font-bold text-sm sm:text-lg mb-0.5 sm:mb-1">{item.label}</p>
                        <p className="text-white/40 text-[10px] sm:text-sm">Instant visual alerts for incoming professional communication.</p>
                      </div>
                      <button 
                        type="button"
                        className={`relative w-14 h-7 rounded-full transition-colors ${notifications[item.key] ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-white/10'}`}
                      >
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[item.key] ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </>
              )}

            </div>
          </SettingsCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FreelancerNotificationSection;
