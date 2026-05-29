import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { profileApi } from "../../../services/profileApi";
import toast from "react-hot-toast";
import AIRewriteButton from '../../ui/AIRewriteButton';
import InfinityLoader from "../../common/InfinityLoader";

export default function StepPersonal({ next, back }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    bio: "",
    experience: ""
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
            bio: d.bio || d.step_data?.personal_info?.bio || "",
            experience: d.step_data?.personal_info?.experience || ""
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
    if (!formData.bio.trim()) newErrors.bio = "Mission statement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await profileApi.updateStepStatus("personal_info", formData);
      next();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save progress");
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
        <h2 className="text-xl font-bold text-white mb-0 sm:mb-1">Your Mission</h2>
        <p className="text-white/40 text-xs sm:text-sm">Describe what you're looking to achieve and the quality of talent you seek.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-8 gap-y-3 sm:gap-y-5">
        {/* Mission Statement — full width */}
        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-medium text-white/50">Mission Statement / Bio</label>
            <AIRewriteButton
              field="mission"
              value={formData.bio}
              context={{ mission: formData.bio }}
              onApply={(val) => setFormData({ ...formData, bio: val })}
            />
          </div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="e.g. We are building the next generation of fintech tools and need high-velocity developers..."
            className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-sm leading-tight sm:leading-relaxed h-20 sm:h-24 resize-none"
          />
          {errors.bio && <p className="text-red-400 text-xs mt-1 px-1">{errors.bio}</p>}
        </div>

        {/* Projects completed */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Projects Completed (Estimated)</label>
          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g. 50+ projects"
            className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base"
          />
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
