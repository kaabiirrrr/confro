import React, { useState, useRef } from "react";
import { Pencil, Camera, X, Upload, Mail, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { updateMyProfile } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import ProfileImageModal from "./ProfileImageModal";
import Avatar from "../../../Avatar";
import axios from "axios";
import { supabase } from "../../../../lib/supabase";

const AccountSection = ({ onOpenImageModal, updatedAvatar }) => {
  const { profile } = useAuth();

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName:  profile?.name?.split(' ').slice(1).join(' ') || '',
    email:     profile?.email || '',
  });

  // Sync form state when profile data loads or changes
  React.useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.name?.split(' ')[0] || '',
        lastName:  profile.name?.split(' ').slice(1).join(' ') || '',
        email:     profile.email || '',
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
    <div className="glass-card rounded-2xl p-5 sm:p-8 lg:p-10 relative overflow-hidden group">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12">
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
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Avatar Section */}
          <div className="relative shrink-0 flex flex-col items-center lg:items-start gap-4 mx-auto lg:mx-0">
            <div
              onClick={onOpenImageModal}
              className="cursor-pointer group/avatar relative"
            >
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

          {/* Content Section */}
          <div className="flex-1">
            {!edit ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {profile?.name || "User"}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Client Account
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-4">
                  <div className="space-y-1.5">
                    <p className="text-white/30 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Full Name</p>
                    <p className="text-white text-base sm:text-lg font-medium tracking-tight">{profile?.name || "Not provided"}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-white/30 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Email Address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-base sm:text-lg font-medium tracking-tight underline decoration-white/10 underline-offset-4">{form.email || "No email provided"}</p>
                      <CheckCircle2 size={14} className="text-green-500/50" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="mb-8 text-white/50 text-sm leading-relaxed max-w-lg">
                  To ensure platform safety, we review name changes. Please read our <span className="text-accent hover:underline cursor-pointer font-semibold">policy</span> before updating.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">First Name</label>
                    <input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Last Name</label>
                    <input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10" 
                    />
                  </div>
                </div>
                
                <div className="mb-10 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                  <div className="relative group">
                    <input 
                      name="email" 
                      value={form.email} 
                      disabled
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/30 cursor-not-allowed italic" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-widest">Locked</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-12 px-8 rounded-xl bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                  >
                    {saving ? 'Processing...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setEdit(false)} 
                    className="text-white/40 hover:text-white text-sm font-bold transition-colors"
                  >
                    Discard
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
