import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { profileApi } from "../../../services/profileApi";

export default function StepProfessional({ next, back }) {

  const [formData, setFormData] = useState({
    experience: "",
    rate: "",
    phone: "",
    website: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.experience.trim()) newErrors.experience = "Years of experience is required";
    if (!formData.rate.trim()) newErrors.rate = "Hourly rate is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.additionalInfo = formData;
      localStorage.setItem("user", JSON.stringify(user));
      await profileApi.updateStepStatus('professional_info', formData);
      next();
    } catch (error) {
      console.error("Failed to update profile step:", error);
      toast.error("Failed to save professional info: " + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Professional Details</h2>
        <p className="text-white/40 text-sm">Nearly done! Add your professional rate and experience to complete your profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Years of Experience</label>
          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g. 5"
            className="w-full bg-transparent border border-white/10 p-4 rounded-xl text-white focus:border-accent outline-none transition-all placeholder:text-white/20"
          />
          {errors.experience && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.experience}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Hourly Rate ($)</label>
          <input
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            placeholder="e.g. 50"
            className="w-full bg-transparent border border-white/10 p-4 rounded-xl text-white focus:border-accent outline-none transition-all placeholder:text-white/20"
          />
          {errors.rate && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.rate}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Phone Number</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1 234 567 890"
            className="w-full bg-transparent border border-white/10 p-4 rounded-xl text-white focus:border-accent outline-none transition-all placeholder:text-white/20"
          />
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Website (Optional)</label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="e.g. https://portfolio.com"
            className="w-full bg-transparent border border-white/10 p-3 rounded-xl text-white focus:border-accent outline-none transition-all placeholder:text-white/20 text-sm"
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
          onClick={handleNext}
          className="bg-accent text-white font-bold px-10 py-4 rounded-full hover:bg-accent/90 flex items-center gap-3 transition-all shadow-xl shadow-accent/10"
        >
          Continue
          <FiArrowRight />
        </button>
      </div>
    </motion.div>
  );
}
