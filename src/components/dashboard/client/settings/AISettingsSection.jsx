import React, { useState, useEffect } from "react";
import AIAssistant from "../../../shared/AIAssistant";
import { Sparkles, Check, Loader2 } from "lucide-react";
import api from "../../../../lib/api";
import { toast } from "react-hot-toast";

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer group/check w-fit">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
        checked ? "border-accent bg-accent/20" : "border-white/20 bg-white/5"
    } group-hover/check:border-accent`}>
        <Check size={12} className={`text-accent transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
    </div>
    <span className="text-white/60 text-[11px] sm:text-sm font-bold uppercase tracking-widest group-hover/check:text-white transition-colors">{label}</span>
    <input 
        type="checkbox" 
        className="hidden" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

const AISettingsSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
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
        console.error("Failed to fetch AI preferences", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleChange = async (field, value) => {
    const newPrefs = {
      ...prefs,
      email_intelligence: {
        ...prefs.email_intelligence,
        [field]: value
      }
    };
    setPrefs(newPrefs);
    setSaving(true);
    try {
      await api.put('/api/account/notifications', { preferences: newPrefs });
    } catch (err) {
      toast.error("Failed to sync AI protocol");
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-3 flex items-center gap-3">
            <Sparkles className="text-accent" size={24} />
            Connect AI Intelligence
          </h2>
          <p className="text-white/40 text-[11px] sm:text-sm font-medium max-w-2xl">
            Leverage advanced neural networks to optimize your recruiting workflow, 
            automate job descriptions, and analyze talent patterns in real-time.
          </p>
        </div>
        {saving && (
           <div className="flex items-center gap-2 text-[10px] text-accent font-black uppercase tracking-widest px-4 py-2 bg-accent/10 rounded-full border border-accent/20 shrink-0">
              <Loader2 className="animate-spin" size={12} />
              Optimizing Neural Flow
           </div>
        )}
      </div>

      <div className="glass-card rounded-[2rem] p-6 sm:p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <h3 className="text-lg font-bold text-white mb-8 relative z-10">Recruiting Intelligence Relay</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
            {[
                { key: "proposals", label: "Smart Proposal Analysis" },
                { key: "sessions", label: "Interview Sentiment Sync" },
                { key: "offers", label: "Offer Acceptance Prediction" },
                { key: "contracts", label: "Milestone Risk Detection" },
                { key: "expirations", label: "Market Drift Alerts" },
                { key: "flow", label: "Talent Liquidity Reports" }
            ].map((item, i) => (
                <Checkbox 
                    key={i} 
                    label={item.label} 
                    checked={prefs.email_intelligence?.[item.key]} 
                    onChange={(val) => handleChange(item.key, val)} 
                />
            ))}
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] relative">
        <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Live Engine</span>
        </div>
        <div className="p-1 sm:p-2">
            <AIAssistant 
                userRole="client" 
                externalOpen 
                hideClose 
                fullHeight 
            />
        </div>
      </div>
    </div>
  );
};

export default AISettingsSection;
