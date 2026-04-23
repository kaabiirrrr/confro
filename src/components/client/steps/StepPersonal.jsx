import { useState } from "react";
import { motion } from "framer-motion";
import { FiTarget, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import toast from "react-hot-toast";

export default function StepPersonal({ next, back }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    experience: "" // How many projects/years they've been hiring
  });
  const [errors, setErrors] = useState({});

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
      console.error("StepPersonal save error:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Your Mission</h2>
        <p className="text-white/40 text-sm">Describe what you're looking to achieve and the quality of talent you seek.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Mission Statement / Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="e.g. We are building the next generation of fintech tools and need high-velocity developers..."
            className="bg-transparent border border-white/10 p-4 rounded-xl w-full h-40 resize-none focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm leading-relaxed"
          />
          {errors.bio && <p className="text-red-400 text-xs mt-1 px-1">{errors.bio}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Projects Completed (Estimated)</label>
          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g. 50+ projects"
            className="bg-transparent border border-white/10 p-3 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-5 pt-4">
        <button
          onClick={back}
          className="flex items-center gap-2 px-8 py-4 text-white/40 hover:text-white transition-colors text-sm font-semibold"
        >
          <FiArrowLeft />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="bg-accent text-white font-bold px-10 py-4 rounded-full hover:bg-accent/90 disabled:opacity-50 flex items-center gap-3 transition-all shadow-xl shadow-accent/10"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          ) : (
            <>
              Continue
              <FiArrowRight />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

