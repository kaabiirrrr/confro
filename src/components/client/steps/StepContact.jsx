import { useState } from "react";
import { motion } from "framer-motion";
import { FiPhone, FiArrowLeft, FiArrowRight, FiGlobe } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import toast from "react-hot-toast";

export default function StepContact({ next, back }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    website: ""
  });
  const [errors, setErrors] = useState({});

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Contact Information</h2>
        <p className="text-white/40 text-sm">How should freelancers reach you for coordination?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Phone Number</label>
          <div className="relative">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 000-0000"
              className="bg-transparent border border-white/10 p-3 pl-10 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
            />
            <FiPhone className="absolute left-3 top-3.5 text-white/20" />
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
              className="bg-transparent border border-white/10 p-3 pl-10 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
            />
            <FiGlobe className="absolute left-3 top-3.5 text-white/20" />
          </div>
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

