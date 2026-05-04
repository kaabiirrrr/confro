import React, { useState, useRef } from "react";
import { Pencil, Camera, Mail, User, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { updateMyProfile } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import ProfileImageModal from "./ProfileImageModal";
import Avatar from "../../../Avatar";
import { supabase } from "../../../../lib/supabase";

const AccountSection = ({ onOpenImageModal, updatedAvatar }) => {
  const { profile } = useAuth();

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
    email: profile?.email || '',
  });

  React.useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const profileImage = updatedAvatar || profile?.avatar_url || null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({ name: `${form.firstName} ${form.lastName}`.trim() });
      toast.success('Profile saved');
      setEdit(false);
    } catch (err) {
      toastApiError(err, 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-10 relative overflow-hidden group w-full min-w-0">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">

        {/* ── Section Header (desktop only) ── */}
        <div className="hidden sm:flex justify-between items-start gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <User size={20} className="text-accent" />
              Account Settings
            </h2>
            <p className="text-white/40 text-sm mt-1">Manage your personal information and profile picture</p>
          </div>
          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
              <Pencil size={14} /> Edit Profile
            </button>
          )}
        </div>

        {/* ── MOBILE: Instagram-style Profile Header ── */}
        <div className="sm:hidden flex flex-col items-center text-center mb-6 gap-3 px-2 w-full min-w-0">
          {/* Avatar */}
          <div onClick={onOpenImageModal} className="cursor-pointer group/avatar relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-accent to-transparent rounded-full opacity-20 blur-sm" />
            <div className="relative rounded-full p-1 bg-white/5 border border-white/10">
              <Avatar
                src={profileImage}
                name={form.firstName || profile?.name || "U"}
                size="w-20 h-20"
                className="text-3xl font-bold rounded-full overflow-hidden"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-[#111827]">
              <Camera size={10} />
            </div>
          </div>

          <div className="min-w-0 w-full">
            <h3 className="text-lg font-bold tracking-tight text-white leading-tight break-words">
              {profile?.name || "User"}
            </h3>
            <div className="inline-flex items-center gap-1.5 text-accent text-[10px] font-black uppercase tracking-widest mt-1 px-3 py-0.5 bg-accent/5 rounded-full border border-accent/10">
              <CheckCircle2 size={10} /> Client
            </div>
          </div>

          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="w-full max-w-[160px] h-9 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-[11px] font-bold transition-all active:scale-95"
            >
              <Pencil size={10} className="inline mr-1" /> Edit Profile
            </button>
          )}
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Avatar (Desktop only) */}
          <div className="hidden sm:flex shrink-0 flex-col items-center lg:items-start gap-4 mx-auto lg:mx-0">
            <div onClick={onOpenImageModal} className="cursor-pointer group/avatar relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-accent to-transparent rounded-full opacity-20 blur-sm group-hover/avatar:opacity-40 transition-opacity" />
              <div className="relative rounded-full p-1 bg-white/5 border border-white/10">
                <Avatar
                  src={profileImage}
                  name={form.firstName || profile?.name || "U"}
                  size="w-28 h-28"
                  className="text-[40px] font-bold rounded-full overflow-hidden"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-[#111827] opacity-0 group-hover/avatar:opacity-100 transition-opacity scale-90 group-hover/avatar:scale-100">
                <Camera size={14} />
              </div>
            </div>
          </div>

          {/* Info / Edit Form */}
          <div className="flex-1 min-w-0">
            {!edit ? (
              <div className="space-y-0 divide-y divide-white/5">
                {/* Desktop name display */}
                <div className="hidden sm:block pb-6">
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {profile?.name || "User"}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-accent text-[11px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Client Account
                  </div>
                </div>

                {/* Info rows — Centered on Mobile, Justified on Desktop */}
                <div className="py-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 border-t border-white/5 first:border-none w-full min-w-0 text-center sm:text-left">
                  <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Full Name</p>
                  <p className="text-white text-[14px] sm:text-base font-medium tracking-tight text-center sm:text-right break-words min-w-0 flex-1">{profile?.name || "Not provided"}</p>
                </div>

                <div className="py-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
                  <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Email Address</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 min-w-0 flex-1 w-full overflow-hidden">
                    <p className="text-white text-[14px] sm:text-base font-medium tracking-tight truncate min-w-0">{form.email || "No email"}</p>
                    <CheckCircle2 size={12} className="text-green-500/50 shrink-0" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="mb-6 text-white/50 text-sm leading-relaxed max-w-lg">
                  To ensure platform safety, we review name changes. Please read our{' '}
                  <span className="text-accent hover:underline cursor-pointer font-semibold">policy</span> before updating.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="mb-8 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                  <div className="relative">
                    <input
                      name="email"
                      value={form.email}
                      disabled
                      className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white/30 cursor-not-allowed italic"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-widest">Locked</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto h-12 px-8 rounded-full bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                  >
                    {saving ? 'Processing...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEdit(false)}
                    className="w-full sm:w-auto h-12 px-6 rounded-full border border-white/10 text-white/40 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={14} /> Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;

