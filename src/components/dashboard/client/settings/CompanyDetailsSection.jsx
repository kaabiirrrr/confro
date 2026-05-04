import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Building2, Pencil, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import { profileApi } from "../../../../services/profileApi";

const CompanyDetailsSection = () => {
  const { profile } = useAuth();

  const [edit, setEdit] = useState(false);

  const [form, setForm] = useState({
    companyName: profile?.company_name || "",
    size: profile?.company_size || "",
    description: profile?.bio || ""
  });

  // Sync form when profile loads
  React.useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.company_name || "",
        size: profile.company_size || "",
        description: profile.bio || ""
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await profileApi.updateClientProfile({
        company_name: form.companyName,
        company_size: parseInt(form.size),
        bio: form.description,
      });
      toast.success('Company details saved');
      setEdit(false);
    } catch (err) {
      toastApiError(err, 'Failed to save company details');
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
              <Building2 size={20} className="text-accent" />
              Company details
            </h2>
            <p className="text-white/40 text-sm mt-1">Information about your organization and industry</p>
          </div>

          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto px-2 py-2 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <Pencil size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">Edit Details</span>
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Company Icon */}
          <div className="relative shrink-0 hidden sm:flex items-center justify-center w-24 h-24">
            <Building2 size={48} className="text-accent" />
          </div>

          <div className="flex-1">
            {!edit ? (
              <div className="flex flex-col gap-6 sm:gap-10 w-full">
                <div className="w-full text-center sm:text-left">
                  <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                    {form.companyName || "No Company Added"}
                  </h3>
                  {form.tagline ? (
                    <p className="text-accent text-[12px] sm:text-[14px] font-semibold tracking-wide uppercase inline-block">
                      {form.tagline}
                    </p>
                  ) : (
                    <p className="text-white/20 text-xs sm:text-sm italic">Add a tagline to define your brand</p>
                  )}
                </div>

                <div className="py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-1 sm:gap-4 border-t border-white/5 w-full min-w-0 text-center sm:text-left">
                  <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Company Size</p>
                  <p className="text-white text-xs sm:text-base font-medium tracking-tight text-center sm:text-right break-words min-w-0 flex-1">{form.size ? `${form.size} employees` : "Not specified"}</p>
                </div>

                {form.description && (
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Company Overview</p>
                    <p className="text-white/70 leading-relaxed text-sm lg:text-base max-w-3xl">
                      {form.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* COMPANY NAME */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Company Name</label>
                    <div className="relative group">
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Company Inc."
                        className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                      />
                      {form.companyName && (
                        <X
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-white/20 hover:text-white transition-colors"
                          onClick={() => setForm({ ...form, companyName: "" })}
                        />
                      )}
                    </div>
                  </div>

                </div>

                {/* COMPANY SIZE */}
                <div className="mt-8">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-4">Team Size</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "1-10 employees", value: 10 },
                      { label: "11-50 employees", value: 50 },
                      { label: "51-200 employees", value: 200 },
                      { label: "201-500 employees", value: 500 },
                      { label: "501-1000 employees", value: 1000 },
                      { label: "1000+ employees", value: 5000 },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setForm({ ...form, size: size.value })}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${parseInt(form.size) === size.value
                          ? "bg-accent/20 border-accent text-accent"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                          }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-8 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Description / Bio</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your company..."
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all resize-none"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-6 mt-10">
                  <button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-full bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    Save Details
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
      </div>
    </div>

  );

};

export default CompanyDetailsSection;