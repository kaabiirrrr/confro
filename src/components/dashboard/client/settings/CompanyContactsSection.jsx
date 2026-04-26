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
  const [edit,setEdit] = useState(false);
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

  const [form,setForm] = useState({
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

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
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

  const handleCancel = ()=>{
    setEdit(false);
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
              Company contacts
            </h2>
            <p className="text-white/40 text-sm mt-1">Primary contact points and location data</p>
          </div>
          
          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
              <Pencil size={14} />
              Edit Contacts
            </button>
          )}
        </div>

        {!edit ? (
          /* NORMAL VIEW */
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1.5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Account Owner</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <User size={14} className="text-white/60" />
                  </div>
                  <p className="text-white text-base font-medium tracking-tight">{form.owner || "Not specified"}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Contact Phone</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Phone size={14} className="text-white/60" />
                  </div>
                  <p className="text-white text-base font-medium tracking-tight">{form.phone || "No phone added"}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Contact Email</p>
                <p className="text-white text-base font-medium tracking-tight">{form.email || "No email added"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-8">
              <div className="space-y-1.5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Current Time Zone</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Clock size={14} className="text-white/60" />
                  </div>
                  <p className="text-white text-base font-medium tracking-tight">{form.timezone || "Not specified"}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-6 border-t border-white/5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Location</p>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                    <MapPin size={14} className="text-white/60" />
                  </div>
                  <p className="text-white text-base font-medium tracking-tight">{form.location || "No location specified"}</p>
                </div>
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
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
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
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>


            <div className="flex items-center gap-6 mt-10 pt-6 border-t border-white/5">
              <button
                onClick={handleSave}
                className="h-12 px-8 rounded-xl bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
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