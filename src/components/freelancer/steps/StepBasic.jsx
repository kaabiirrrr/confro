import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { profileApi } from "../../../services/profileApi";
import { supabase } from "../../../lib/supabase";
import { toast } from "react-hot-toast";
import { FiCamera, FiUser, FiArrowRight } from "react-icons/fi";
import AIRewriteButton from '../../ui/AIRewriteButton';
import CustomDropdown from "../../ui/CustomDropdown";
import CustomDatePicker from "../../ui/CustomDatePicker";
import { countries } from "../../../utils/countries";
import ProfileImageModal from "../../dashboard/client/settings/ProfileImageModal";

export default function StepBasic({ next, status }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: status?.step_data?.basic_info?.fullName || status?.name || "",
    title: status?.step_data?.basic_info?.title || status?.title || "",
    bio: status?.step_data?.basic_info?.bio || status?.bio || "",
    country: status?.step_data?.basic_info?.country || "",
    city: status?.step_data?.basic_info?.city || "",
    dob: status?.step_data?.basic_info?.dob || "",
    gender: status?.step_data?.basic_info?.gender || ""
  });

  const [avatarPreview, setAvatarPreview] = useState(status?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!avatarPreview)
      newErrors.avatar = "Profile photo is required";

    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!formData.title.trim())
      newErrors.title = "Professional title is required";

    if (!formData.bio.trim())
      newErrors.bio = "Description (Bio) is required";

    if (!formData.country.trim())
      newErrors.country = "Country is required";

    if (!formData.city.trim())
      newErrors.city = "City is required";

    if (!formData.dob)
      newErrors.dob = "Date of birth is required";

    if (!formData.gender)
      newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Save to localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.basicInfo = formData;
      if (avatarPreview) user.avatar_url = avatarPreview;
      localStorage.setItem("user", JSON.stringify(user));

      // Save step data to backend
      const stepData = { ...formData };
      if (avatarPreview) stepData.avatar_url = avatarPreview;

      await profileApi.updateStepStatus("basic_info", stepData);

      next();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to save. Please try again.";
      console.error("Failed to update profile step:", error?.response?.data || error);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-3 sm:space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-white mb-0.5">Basic Information</h2>
        <p className="text-white/40 text-xs">Tell clients who you are and where you work from.</p>
      </div>

      {/* Profile Photo Upload */}
      <div className="flex items-center gap-3 sm:gap-6 group">
        <div
          onClick={() => setIsImageModalOpen(true)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-white/5 cursor-pointer hover:border-accent/40 transition-all flex-shrink-0 bg-white/[0.02] flex items-center justify-center"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser className="text-4xl text-white/10" />
          )}

          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FiCamera className="text-xl text-white" />
          </div>
        </div>

        <ProfileImageModal 
          isOpen={isImageModalOpen} 
          onClose={() => setIsImageModalOpen(false)} 
          onImageSelect={(url) => { setAvatarPreview(url); setErrors({ ...errors, avatar: null }); }} 
        />

        <div className="space-y-0">
          <p className="text-sm font-semibold text-white">Profile Photo <span className="text-red-400 text-xs">*</span></p>
          <p className="text-[10px] text-white/30">
            A clear photo builds trust with clients.
          </p>
          {errors.avatar && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.avatar}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/50 px-1">Full Name</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="bg-secondary/20 border border-white/10 p-2 sm:p-3.5 rounded-lg sm:rounded-xl w-full focus:border-accent outline-none transition-all text-light-text placeholder:text-white/20 text-xs sm:text-sm"
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Professional Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Senior Product Designer"
            className="bg-secondary/20 border border-white/10 p-2 sm:p-3.5 rounded-lg sm:rounded-xl w-full focus:border-accent outline-none transition-all text-light-text placeholder:text-white/20 text-xs sm:text-sm"
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Gender</label>
          <CustomDropdown
            options={[
              "Male",
              "Female",
              "Other",
              "Prefer not to say"
            ]}
            value={formData.gender}
            onChange={(val) => setFormData({ ...formData, gender: val })}
            placeholder="Select Gender"
            error={errors.gender}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Date of Birth</label>
          <CustomDatePicker
            value={formData.dob}
            onChange={(val) => setFormData({ ...formData, dob: val })}
            placeholder="Select Date"
            error={errors.dob}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Country</label>
          <CustomDropdown
            options={countries}
            value={formData.country}
            onChange={(val) => setFormData({ ...formData, country: val })}
            placeholder="Select Country"
            error={errors.country}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. New York"
            className="bg-secondary/20 border border-white/10 p-2 sm:p-3.5 rounded-lg sm:rounded-xl w-full focus:border-accent outline-none transition-all text-light-text placeholder:text-white/20 text-xs sm:text-sm"
          />
          {errors.city && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.city}</p>
          )}
        </div>

        {/* Bio Section - Refined for better alignment */}
        <div className="col-span-2 md:col-span-2 space-y-1 sm:space-y-3 pt-4 sm:pt-6">
          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-[11px] sm:text-xs text-white/40 uppercase tracking-widest font-medium px-1">
              Professional Bio
            </label>
            <div className="flex flex-col gap-2">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your background..."
                className="bg-secondary/20 border border-white/10 p-2 sm:p-4 rounded-lg sm:rounded-2xl w-full h-20 sm:h-24 resize-none focus:border-accent outline-none transition-all text-light-text placeholder:text-white/20 text-xs sm:text-sm leading-tight sm:leading-relaxed"
              />
              <div className="flex justify-end">
                <AIRewriteButton
                  field="bio"
                  value={formData.bio}
                  context={{ title: formData.title }}
                  onApply={(val) => setFormData({ ...formData, bio: val })}
                />
              </div>
            </div>
          </div>
          {errors.bio && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.bio}</p>
          )}
        </div>
      </div>

      <div className="w-full flex justify-end pt-4 mt-2 pb-20 sm:pb-0">
        <button
          onClick={handleNext}
          disabled={uploading}
          className="hidden sm:flex bg-accent text-white font-bold px-6 sm:px-8 py-2 sm:py-2.5 rounded-full hover:bg-accent/90 disabled:opacity-50 items-center gap-2 transition-all text-sm"
        >
          {uploading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />Saving Profile...</>
          ) : (
            <>Continue <FiArrowRight /></>
          )}
        </button>
      </div>

      {/* Mobile fixed bottom button */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-primary border-t border-white/5 px-4 py-3">
        <button
          onClick={handleNext}
          disabled={uploading}
          className="w-full bg-accent text-white font-bold py-2.5 rounded-full hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all text-sm"
        >
          {uploading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />Saving Profile...</>
          ) : (
            <>Continue <FiArrowRight /></>
          )}
        </button>
      </div>
    </motion.div>
  );
}
