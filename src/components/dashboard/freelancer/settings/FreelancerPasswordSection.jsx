import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../context/AuthContext";
import SettingsCard from "../../../ui/SettingsCard";

// Small inline spinner — no full-page loader
const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white shrink-0" />
);

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current,
      });
      if (signInError) throw new Error('Incorrect current password');

      const { error: updateError } = await supabase.auth.updateUser({ password: passwords.new });
      if (updateError) throw updateError;

      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) { toast.error('No email found for this account'); return; }
    setSendingReset(true);
    try {
      // Use the production URL as redirect — Supabase requires it to be whitelisted
      // Add http://localhost:5173/reset-password to Supabase Dashboard > Auth > URL Configuration > Redirect URLs
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        // 500 usually means the redirect URL isn't whitelisted in Supabase
        if (error.status === 500) {
          toast.error('Recovery email failed. Please add your site URL to Supabase redirect URLs.');
        } else {
          throw error;
        }
        return;
      }
      toast.success(`Recovery link sent to ${email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send recovery link');
    } finally {
      setSendingReset(false);
    }
  };

  const inputCls = "w-full h-11 sm:h-14 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10";

  return (
    <SettingsCard
      title="Password & Security"
      subtitle="Manage your account access and security credentials"
      icon="/Icons/icons8-privacy-100.png"
      iconClassName="w-[30px] h-[30px]"
    >
      <div className="max-w-xl mx-auto space-y-8 py-4">
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

        <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
          <button
            onClick={handlePasswordChange}
            disabled={saving || !passwords.current || !passwords.new}
            className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-10 rounded-full bg-accent text-white font-bold text-xs sm:text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Spinner />}
            {saving ? 'Processing...' : 'Apply Password Change'}
          </button>

          <button
            onClick={handleForgotPassword}
            disabled={sendingReset}
            className="w-full sm:w-auto text-accent text-[11px] font-black uppercase tracking-widest px-4 py-2 h-10 sm:h-12 border border-accent rounded-full hover:bg-accent/10 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {sendingReset && <Spinner />}
            {sendingReset ? 'Sending…' : 'Forgot Credentials?'}
          </button>
        </div>
      </div>
    </SettingsCard>
  );
};

export default FreelancerPasswordSection;
