import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPhone, FiGlobe } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import toast from "react-hot-toast";
import InfinityLoader from "../../common/InfinityLoader";

export default function StepContact({ next, back }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    phone: "",
    website: ""
  });
  const [errors, setErrors] = useState({});

  // Pre-fill from existing profile data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileApi.getClientProfile();
        if (res?.data) {
          const d = res.data;
          setFormData({
            phone: d.phone || d.mobile_number || d.step_data?.contact_info?.phone || "",
            website: d.company_website || d.website || d.step_data?.contact_info?.website || ""
          });
        }
      } catch (_) {}
      finally { setInitialLoading(false); }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await profileApi.updateStepStatus("contact_info", formData);
      next();
    } catch (error) {
      toast.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="py-12"><InfinityLoader text="Loading..." /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-3 sm:space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-0 sm:mb-1">Contact Information</h2>
        <p className="text-white/40 text-xs sm:text-sm">How should freelancers reach you for coordination?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-8 gap-y-3 sm:gap-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Phone Number</label>
          <div className="relative">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 000-0000"
              className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base pl-8 sm:pl-10"
            />
            <FiPhone className="absolute left-2.5 sm:left-3 top-2.5 sm:top-4 text-white/20 text-xs sm:text-base" />
          </div>
          {errors.phone && <p className="text-red-400 text-xs mt-1 px-1">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Professional Website / LinkedIn</label>
          <div className="relative">
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g. linkedin.com/in/username"
              className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base pl-8 sm:pl-10"
            />
            <FiGlobe className="absolute left-2.5 sm:left-3 top-2.5 sm:top-4 text-white/20 text-xs sm:text-base" />
          </div>
        </div>
      </div>

      {/* Buttons — fixed bottom on mobile, inline on desktop */}
      <div className="fixed sm:relative bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto z-40 bg-primary sm:bg-transparent border-t border-white/5 sm:border-none px-4 sm:px-0 py-3 sm:py-0 sm:pt-4 flex justify-between gap-3 sm:gap-5">
        <button
          onClick={back}
          className="flex-1 sm:flex-none flex items-center justify-center px-6 sm:px-8 py-2 sm:py-2.5 border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs sm:text-sm font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex-1 sm:flex-none bg-accent text-white font-bold px-6 sm:px-10 py-2 sm:py-2.5 rounded-full hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center transition-all text-sm sm:text-base"
        >
          {loading ? <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary border-t-transparent" /> : "Continue"}
        </button>
      </div>
      <div className="h-16 sm:hidden" />
    </motion.div>
  );
}
