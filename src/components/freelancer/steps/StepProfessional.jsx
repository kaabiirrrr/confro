import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { profileApi } from "../../../services/profileApi";
import InfinityLoader from "../../common/InfinityLoader";

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
      className="space-y-3 sm:space-y-6"
    >
      {loading ? (
        <div className="py-12">
          <InfinityLoader text="Loading your info..." />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-0 sm:mb-1">Professional Details</h2>
            <p className="text-white/40 text-xs sm:text-sm">Add your professional rate and experience to complete your profile.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-8 gap-y-3 sm:gap-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 px-1">Years of Experience</label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base"
              />
              {errors.experience && (
                <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.experience}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 px-1">Hourly Rate (₹)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="e.g. 50"
                min="0"
                className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base"
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
                className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-base"
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
                className="w-full bg-secondary/20 border border-white/10 p-2 sm:p-3.5 rounded-lg sm:rounded-xl text-light-text focus:border-accent outline-none transition-all placeholder:text-white/20 text-[10px] sm:text-sm"
              />
            </div>
          </div>

          <div className="hidden sm:flex justify-between gap-3 sm:gap-5 pt-2 sm:pt-4">
            <button onClick={back} className="flex items-center justify-center px-6 sm:px-8 py-2 sm:py-2.5 border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs sm:text-sm font-semibold">Back</button>
            <button onClick={handleNext} className="bg-accent text-white font-bold px-6 sm:px-10 py-2 sm:py-2.5 rounded-full hover:bg-accent/90 flex items-center justify-center transition-all text-sm sm:text-base">Continue</button>
          </div>

          {/* Mobile fixed bottom buttons */}
          <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-primary border-t border-white/5 px-4 py-3 flex gap-3">
            <button onClick={back} className="flex-1 flex items-center justify-center py-2.5 border border-white/20 rounded-full text-white/60 text-xs font-semibold">Back</button>
            <button onClick={handleNext} className="flex-1 bg-accent text-white font-bold py-2.5 rounded-full hover:bg-accent/90 flex items-center justify-center text-sm">Continue</button>
          </div>
          <div className="h-16 sm:hidden" />
        </div>
      )}
    </motion.div>
  );
}
