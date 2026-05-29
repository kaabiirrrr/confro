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
    industry: profile?.industry || "",
    website: profile?.company_website || profile?.website || "",
    description: profile?.bio || ""
  });

  // Sync form when profile loads — also pull from step_data as fallback
  React.useEffect(() => {
    if (profile) {
      const sd = profile.step_data?.company_info || {};
      setForm({
        companyName: profile.company_name || sd.companyName || "",
        size: profile.company_size ? String(profile.company_size) : sd.companySize || "",
        industry: profile.industry || sd.industry || "",
        website: profile.company_website || profile.website || sd.website || "",
        description: profile.bio || sd.description || ""
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
        industry: form.industry,
        company_website: form.website,
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

    <div className="glass-card rounded-2xl p-4 sm:p-10 relative overflow-hidden w-full">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 size={20} className="text-accent" />
              Company details
            </h2>
            <p className="text-white/40 text-sm mt-1">Information about your organization and industry</p>
          </div>

          {!edit && (
            <button
              onClick={() => setEdit(true)}
              className="text-white/40 hover:text-accent transition-colors p-1 mt-1"
              aria-label="Edit Details"
            >
              <Pencil size={18} />
            </button>
          )}
          {edit && (
            <button
              onClick={() => setEdit(false)}
              className="text-white/40 hover:text-accent transition-colors p-1 mt-1"
              aria-label="Cancel Edit"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="relative shrink-0 hidden sm:flex items-center justify-center w-30 h-30">
            <img
              src="/company-icon.png"
              alt="Company"
              className="w-44 h-44 object-contain"
            />
          </div>

          <div className="flex-1">
            {!edit ? (
              <div className="flex flex-col gap-0 w-full divide-y divide-white/5">
                <div className="pb-4">
                  <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                    {form.companyName || "No Company Added"}
                  </h3>
                  {form.tagline ? (
                    <p className="text-accent text-[12px] sm:text-[14px] font-semibold tracking-wide uppercase mt-1">
                      {form.tagline}
                    </p>
                  ) : (
                    <p className="text-white/20 text-xs sm:text-sm italic mt-1">Add a tagline to define your brand</p>
                  )}
                </div>

                <div className="py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 w-full min-w-0 text-center sm:text-left">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Company Size</p>
                  <p className="text-white text-sm sm:text-base font-medium tracking-tight text-center sm:text-right break-words min-w-0 flex-1">{form.size ? `${form.size} employees` : "Not specified"}</p>
                </div>

                {form.industry && (
                  <div className="py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 w-full min-w-0 text-center sm:text-left">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Industry</p>
                    <p className="text-white text-sm sm:text-base font-medium tracking-tight text-center sm:text-right break-words min-w-0 flex-1">{form.industry}</p>
                  </div>
                )}

                {form.website && (
                  <div className="py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 w-full min-w-0 text-center sm:text-left">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Website</p>
                    <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-accent text-sm sm:text-base font-medium tracking-tight text-center sm:text-right break-words min-w-0 flex-1 hover:underline">{form.website}</a>
                  </div>
                )}

                {form.description && (
                  <div className="py-4">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Company Overview</p>
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Company Name</label>
                    <div className="relative group">
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Company Inc."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
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

                  {/* INDUSTRY */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Industry</label>
                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      placeholder="e.g. Technology & Software"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                    />
                  </div>

                  {/* WEBSITE */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Website</label>
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                    />
                  </div>

                </div>

                {/* COMPANY SIZE */}
                <div className="mt-8">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1 mb-4">Team Size</p>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
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
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Description / Bio</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your company..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all resize-none"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 mt-10">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto h-12 px-6 rounded-full border border-white/10 text-white/40 hover:text-white text-sm font-bold transition-colors flex items-center justify-center"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto h-11 px-8 rounded-full bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    Save Details
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