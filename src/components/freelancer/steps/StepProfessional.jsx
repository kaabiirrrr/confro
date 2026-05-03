import { useState, useEffect } from "react";
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

  const [loading, setLoading] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setLoading(true);
        const status = await profileApi.getStatus();
        if (status.success && status.data?.step_data?.professional_info) {
          const info = status.data.step_data.professional_info;
          setFormData({
            experience: info.experience || "",
            rate: info.rate || "",
            phone: info.phone || status.data.phone || "",
            website: info.website || status.data.website || ""
          });
        } else if (status.success && status.data) {
           // Fallback to top-level fields if step_data is missing
           setFormData(prev => ({
             ...prev,
             rate: status.data.hourly_rate ? String(status.data.hourly_rate) : "",
             experience: status.data.experience ? String(status.data.experience) : "",
             phone: status.data.phone || "",
             website: status.data.website || ""
           }));
        }
      } catch (error) {
        console.error("Error loading existing professional info:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExistingData();
  }, []);

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
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Professional Details</h2>
            <p className="text-white/40 text-sm">Nearly done! Add your professional rate and experience to complete your profile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 px-1">Years of Experience</label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full bg-secondary/20 border border-white/10 p-4 rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20"
              />
              {errors.experience && (
                <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.experience}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 px-1">Hourly Rate ($)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="e.g. 50"
                min="0"
                className="w-full bg-secondary/20 border border-white/10 p-4 rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20"
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
                className="w-full bg-secondary/20 border border-white/10 p-4 rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20"
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
                className="w-full bg-secondary/20 border border-white/10 p-3.5 rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-sm"
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
        </div>
      )}
    </motion.div>
  );
}
