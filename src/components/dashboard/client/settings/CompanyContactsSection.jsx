import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { User, Pencil, Phone, Clock, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import { supabase } from "../../../../lib/supabase";
import { profileApi } from "../../../../services/profileApi";
import CustomDropdown from "../../../ui/CustomDropdown";

const CompanyContactsSection = () => {
  const { profile: contextProfile, refreshProfile, user: authUser } = useAuth();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(contextProfile);

  // Always fetch fresh data on mount
  useEffect(() => {
    const loadFresh = async () => {
      try {
        const res = await profileApi.getClientProfile();
        if (res?.data) setProfile(res.data);
      } catch {
        setProfile(contextProfile);
      }
    };
    loadFresh();
  }, []);

  const getLocation = (p) => {
    if (p?.location) return p.location;
    const si = p?.step_data?.location_info;
    if (si?.city && si?.country) return `${si.city}, ${si.country}`;
    if (si?.city) return si.city;
    if (si?.country) return si.country;
    return "";
  };

  const getPhone = (p) =>
    p?.phone || p?.mobile_number || p?.step_data?.contact_info?.phone || "";

  const [form, setForm] = useState({
    owner: "",
    phone: "",
    email: "",
    timezone: "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi",
    location: ""
  });

  useEffect(() => {
    if (profile) {
      setForm({
        owner: profile.name || "User",
        phone: getPhone(profile),
        email: profile.contact_email || authUser?.email || "",
        timezone: "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi",
        location: getLocation(profile)
      });
    }
  }, [profile, authUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await profileApi.updateClientProfile({
        phone: form.phone,
        mobile_number: form.phone,
        contact_email: form.email,
        location: form.location
      });
      await refreshProfile();
      // Refresh local state too
      const res = await profileApi.getClientProfile();
      if (res?.data) setProfile(res.data);
      toast.success('Contacts updated');
      setEdit(false);
    } catch (error) {
      toast.error('Failed to save contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEdit(false);
  };

  return (

    <div className="glass-card rounded-3xl p-4 sm:p-10 relative overflow-hidden group w-full">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 relative">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <User size={20} className="text-accent" />
              Company contacts
            </h2>
            <p className="text-white/40 text-sm mt-1">Primary contact points and location data</p>
          </div>

          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto px-2 py-2 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <Pencil size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">Edit Contacts</span>
            </button>
          )}
        </div>

        {!edit ? (
          /* NORMAL VIEW */
          <div className="space-y-0 divide-y divide-white/5">
            <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 first:border-none w-full min-w-0 text-center sm:text-left">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Account Owner</p>
              <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-1 min-w-0 w-full">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <User size={12} className="text-white/60" />
                </div>
                <p className="text-white text-xs sm:text-base font-medium tracking-tight truncate">{form.owner || "Not specified"}</p>
              </div>
            </div>

            <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Contact Phone</p>
              <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-1 min-w-0 w-full">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone size={12} className="text-white/60" />
                </div>
                <p className="text-white text-xs sm:text-base font-medium tracking-tight truncate">{form.phone || "No phone added"}</p>
              </div>
            </div>

            <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Contact Email</p>
              <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-1 min-w-0 w-full overflow-hidden">
                <p className="text-white text-xs sm:text-base font-medium tracking-tight truncate">{form.email || "No email added"}</p>
              </div>
            </div>

            <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Time Zone</p>
              <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-1 min-w-0 w-full">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Clock size={12} className="text-white/60" />
                </div>
                <p className="text-white text-xs sm:text-base font-medium tracking-tight truncate">{form.timezone || "Not specified"}</p>
              </div>
            </div>

            <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Location</p>
              <div className="flex items-start justify-center sm:justify-end gap-2.5 flex-1 min-w-0 w-full">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={12} className="text-white/60" />
                </div>
                <p className="text-white text-xs sm:text-base font-medium tracking-tight text-center">{form.location || "No location specified"}</p>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 Enter number"
                  className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Time Zone</label>
                <CustomDropdown
                  options={[
                    { label: "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi", value: "UTC+05:30 Mumbai, Kolkata, Chennai, New Delhi" },
                    { label: "UTC+00:00 Central European Time", value: "UTC+00:00 Central European Time" },
                    { label: "UTC-05:00 Eastern Time (US & Canada)", value: "UTC-05:00 Eastern Time (US & Canada)" }
                  ]}
                  value={form.timezone}
                  onChange={(val) => setForm({ ...form, timezone: val })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>


            <div className="flex items-center gap-6 mt-10 pt-6 border-t border-white/5">
              <button
                onClick={handleSave}
                className="h-12 px-8 rounded-full bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                Save Contacts
              </button>
              <button
                onClick={handleCancel}
                className="text-white/40 hover:text-white text-sm font-bold transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  );

};

export default CompanyContactsSection;