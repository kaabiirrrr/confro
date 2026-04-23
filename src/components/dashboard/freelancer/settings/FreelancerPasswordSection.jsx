import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../../../services/apiService";
import { toastApiError } from "../../../../utils/apiErrorToast";
import { toast } from "react-hot-toast";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../context/AuthContext";
import SettingsCard from "../../../ui/SettingsCard";
import InfinityLoader from '../../../common/InfinityLoader';

const FreelancerPasswordSection = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await changePassword({ current_password: passwords.current, new_password: passwords.new });
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toastApiError(err, 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) { toast.error('No email found for this account'); return; }
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`Recovery link sent to ${email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send recovery link');
    } finally {
      setSendingReset(false);
    }
  };

  const inputCls = "w-full h-14 px-5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10";

  return (
    <SettingsCard 
      title="Password & Security" 
      subtitle="Manage your account access and security credentials" 
      icon="/Icons/icons8-privacy-100.png"
      iconClassName="w-[30px] h-[30px]"
    >
      <div className="max-w-xl space-y-8">
        {[
          { key: 'current', label: 'Current Password' },
          { key: 'new',     label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">
              {label}
            </label>
            <div className="relative group">
              <input
                type={show[key] ? 'text' : 'password'}
                value={passwords[key]}
                onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
                className={`${inputCls} pr-14 group-hover:border-white/20`}
              />
              <button 
                type="button" 
                onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
              >
                {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        ))}

        <div className="pt-4 flex flex-col sm:flex-row gap-6 items-center">
          <button 
            onClick={handlePasswordChange} 
            disabled={saving || !passwords.current || !passwords.new}
            className="h-14 px-10 rounded-xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-accent/20 flex items-center gap-3"
          >
            {saving ? <InfinityLoader size={20} /> : <Lock size={18} />}
            {saving ? 'Processing...' : 'Apply Password Change'}
          </button>
          
          <button className="text-accent text-[11px] font-black uppercase tracking-widest hover:underline px-1 disabled:opacity-50 flex items-center gap-1"
            onClick={handleForgotPassword}
            disabled={sendingReset}
          >
            {sendingReset ? <InfinityLoader size={12} /> : null}
            {sendingReset ? 'Sending…' : 'Forgot Credentials?'}
          </button>
        </div>
      </div>
    </SettingsCard>
  );
};

export default FreelancerPasswordSection;
