import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { profileApi } from "../../../services/profileApi";
import { toast } from "react-hot-toast";
import { FiCamera, FiUser, FiArrowRight } from "react-icons/fi";
import CustomDropdown from "../../ui/CustomDropdown";
import CustomDatePicker from "../../ui/CustomDatePicker";
import { countries } from "../../../utils/countries";

export default function StepBasic({ next }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    bio: "",
    country: "",
    city: "",
    dob: "",
    gender: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, avatar: "Only JPG, PNG, or WebP images are allowed" });
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setErrors({ ...errors, avatar: "Image must be less than 20MB" });
      return;
    }

    setAvatarFile(file);
    setErrors({ ...errors, avatar: null });

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    try {
      const res = await profileApi.uploadAvatar(avatarFile);
      if (res.success) {
        return res.data.avatar_url;
      }
      return null;
    } catch (err) {
      console.error("Avatar upload error:", err.message);
      toast.error("Photo upload failed");
      return null;
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!formData.title.trim())
      newErrors.title = "Role/Title is required";

    if (!formData.bio.trim())
      newErrors.bio = "Bio is required";

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

      // Upload avatar via backend (non-blocking)
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      // Save step data to backend
      const stepData = { ...formData };
      if (avatarUrl) stepData.avatar_url = avatarUrl;

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
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Basic Information</h2>
        <p className="text-white/40 text-sm">Introduce yourself to the talent pool.</p>
      </div>

      {/* Profile Photo Upload */}
      <div className="flex items-center gap-6 group">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/5 cursor-pointer hover:border-accent/40 transition-all flex-shrink-0 bg-white/[0.02] flex items-center justify-center"
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
            <FiCamera className="text-2xl text-white" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">Profile Photo</p>
          <p className="text-sm text-white/30">
            Professional photos build trust. Max 20MB.
          </p>
          {errors.avatar && (
            <p className="text-red-400 text-xs mt-2 font-medium">{errors.avatar}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Full Name</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="bg-transparent border border-white/10 p-3 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Job Title / Role</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Hiring Manager, CEO"
            className="bg-transparent border border-white/10 p-3 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
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
            className="bg-transparent border border-white/10 p-3 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
          />
          {errors.city && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.city}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Professional Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself and what you're looking to build..."
            className="bg-transparent border border-white/10 p-4 rounded-xl w-full h-32 resize-none focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm leading-relaxed"
          />
          {errors.bio && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.bio}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={uploading}
          className="bg-accent text-white font-bold px-10 py-4 rounded-full hover:bg-accent/90 disabled:opacity-50 flex items-center gap-3 transition-all shadow-xl shadow-accent/10"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              Saving...
            </>
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

