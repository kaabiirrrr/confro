import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../lib/api";
import { toast } from "react-hot-toast";

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer group/check w-fit">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
        checked ? "border-accent bg-accent/20" : "border-white/20 bg-white/5"
    } group-hover/check:border-accent`}>
        <Check size={12} className={`text-accent transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
    </div>
    <span className="text-white/60 text-sm font-bold uppercase tracking-widest group-hover/check:text-white transition-colors">{label}</span>
    <input 
        type="checkbox" 
        className="hidden" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

const Dropdown = ({ options, value, onChange, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  const handleToggle = () => {
    const nextState = !open;
    setOpen(nextState);
    if (onOpenChange) onOpenChange(nextState);
  };

  return (
    <div className="relative w-full sm:w-[420px]">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between bg-primary border border-white/10 px-5 py-3 rounded-full text-[16px] text-white"
      >
        {selected.label}
        <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); if (onOpenChange) onOpenChange(false); }} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[100] mt-2 w-full bg-secondary border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    if (onOpenChange) onOpenChange(false);
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 flex gap-3 text-white"
                >
                  <div className="w-[20px] pt-1">
                    {value === option.value && <Check size={16} className="text-accent" />}
                  </div>
                  <div>
                    <div className="text-[16px]">{option.label}</div>
                    {option.desc && (
                      <div className="text-[14px] text-white/40">{option.desc}</div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationSection = () => {
  const [tab, setTab] = useState("messages");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // Track which card has an open dropdown
  const [prefs, setPrefs] = useState({
    desktop: { push: "all", acoustic: true, badge: "all" },
    mobile: { interface: "all", badge: "all" },
    email: { unread: "all", frequency: "60", inactivity_only: false },
    email_intelligence: { 
        proposals: true, tutorials: true, offers: true, 
        contracts: true, sessions: true, flow: true 
    }
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/api/account/notifications');
        if (res.data.success && res.data.data) {
          setPrefs(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch notification preferences", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  // Debounced Save
  const savePrefs = useCallback(async (newPrefs) => {
    setSaving(true);
    try {
      await api.put('/api/account/notifications', { preferences: newPrefs });
    } catch (err) {
      toast.error("Failed to sync preferences");
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  }, []);

  const handleChange = (category, field, value) => {
    const newPrefs = {
      ...prefs,
      [category]: {
        ...prefs[category],
        [field]: value
      }
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  };

  const messageOptions = [
    { value: "all", label: "All activity" },
    {
      value: "important",
      label: "Important activity only",
      desc: "(1:1 messages, interview rooms, @mentions)"
    },
    { value: "none", label: "Nothing" }
  ];

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-3">
            Communication Preferences
          </h2>
          <p className="text-white/40 text-sm font-medium">
            Control how and when you receive intelligence updates, alerts, and system notifications.
          </p>
        </div>
        {saving && (
           <div className="flex items-center gap-2 text-[10px] text-accent font-black uppercase tracking-widest px-4 py-2 shrink-0">
              <Loader2 className="animate-spin" size={12} />
              Syncing Protocol
           </div>
        )}
      </div>

      <div className="flex gap-6 sm:gap-10 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
        {[
          { id: "messages", label: "Instant Messaging" },
          { id: "email", label: "Email Intelligence" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0 ${
              tab === t.id ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.div
                layoutId="activeTabNote"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "messages" && (
          <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className={`glass-card rounded-[2rem] p-5 sm:p-8 lg:p-10 relative group transition-all duration-300 ${activeCard === 'desktop' ? 'z-50 shadow-2xl' : 'z-10'}`}>
              <h3 className="text-xl font-bold text-white tracking-tight mb-8 relative z-10 flex items-center gap-3">
                Desktop Architecture
                <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </h3>

              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Push Notifications</label>
                      <Dropdown 
                        options={messageOptions} 
                        value={prefs.desktop.push} 
                        onChange={(val) => handleChange('desktop', 'push', val)} 
                        onOpenChange={(open) => setActiveCard(open ? 'desktop' : null)}
                      />
                   </div>
                   <div className="pb-3">
                      <Checkbox label="Acoustic Alerts" checked={prefs.desktop.acoustic} onChange={(val) => handleChange('desktop', 'acoustic', val)} />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Badge Count Logic</label>
                   <Dropdown 
                    options={messageOptions} 
                    value={prefs.desktop.badge} 
                    onChange={(val) => handleChange('desktop', 'badge', val)} 
                    onOpenChange={(open) => setActiveCard(open ? 'desktop' : null)}
                   />
                </div>
              </div>
            </div>

            <div className={`glass-card rounded-[2rem] p-5 sm:p-8 lg:p-10 relative group transition-all duration-300 ${activeCard === 'mobile' ? 'z-50 shadow-2xl' : 'z-10'}`}>
              <h3 className="text-xl font-bold text-white tracking-tight mb-8 relative z-10 flex items-center gap-3">
                Mobile Environment
                <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Interface Alerts</label>
                    <Dropdown 
                        options={messageOptions} 
                        value={prefs.mobile.interface} 
                        onChange={(val) => handleChange('mobile', 'interface', val)} 
                        onOpenChange={(open) => setActiveCard(open ? 'mobile' : null)}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Icon Badge Setting</label>
                    <Dropdown 
                        options={messageOptions} 
                        value={prefs.mobile.badge} 
                        onChange={(val) => handleChange('mobile', 'badge', val)} 
                        onOpenChange={(open) => setActiveCard(open ? 'mobile' : null)}
                    />
                 </div>
              </div>
            </div>

            <div className={`glass-card rounded-[2rem] p-5 sm:p-8 lg:p-10 relative group transition-all duration-300 ${activeCard === 'relay' ? 'z-50 shadow-2xl' : 'z-10'}`}>
               <h3 className="text-xl font-bold text-white tracking-tight mb-4 relative z-10">Email Relay</h3>
               <p className="text-white/20 text-xs font-medium mb-8 italic">Configured for synchronization with primary account node</p>

               <div className="space-y-10 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Unread Sequence</label>
                       <Dropdown 
                        options={messageOptions} 
                        value={prefs.email.unread} 
                        onChange={(val) => handleChange('email', 'unread', val)} 
                        onOpenChange={(open) => setActiveCard(open ? 'relay' : null)}
                       />
                    </div>
                    <div className="flex-1 space-y-3">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Frequency</label>
                       <Dropdown
                        value={prefs.email.frequency}
                        onChange={(val) => handleChange('email', 'frequency', val)}
                        onOpenChange={(open) => setActiveCard(open ? 'relay' : null)}
                        options={[
                          { value: "15", label: "Every 15 minutes" },
                          { value: "60", label: "Every hour" },
                          { value: "daily", label: "Daily" },
                        ]}
                      />
                    </div>
                  </div>
                  <Checkbox label="Inactivity Trigger Only" checked={prefs.email.inactivity_only} onChange={(val) => handleChange('email', 'inactivity_only', val)} />
               </div>
            </div>
          </motion.div>
        )}

        {tab === "email" && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="glass-card rounded-[2rem] p-5 sm:p-8 lg:p-10 relative">
               <div className="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">Talent Acquisition</h3>
                    <p className="text-white/40 text-xs font-medium">Global recruiting and offer intelligence.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                  {[
                    { key: "proposals", label: "Incoming proposal alerts" },
                    { key: "sessions", label: "Interview session dynamics" },
                    { key: "offers", label: "Offer status modifications" },
                    { key: "contracts", label: "Contract acceptance triggers" },
                    { key: "expirations", label: "Job posting expiration" },
                    { key: "flow", label: "Talent flow inactivity alerts" }
                  ].map((item, i) => (
                    <Checkbox 
                        key={i} 
                        label={item.label} 
                        checked={prefs.email_intelligence[item.key]} 
                        onChange={(val) => handleChange('email_intelligence', item.key, val)} 
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSection;