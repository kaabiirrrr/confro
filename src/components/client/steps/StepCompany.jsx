import { useState } from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiArrowLeft, FiArrowRight, FiGlobe } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import toast from "react-hot-toast";
import CustomDropdown from "../../ui/CustomDropdown";

const INDUSTRIES = [
  "Technology & Software",
  "Design & Creative",
  "Marketing & Sales",
  "Writing & Translation",
  "Admin & Customer Support",
  "Finance & Legal",
  "Engineering & Architecture",
  "Other"
];

const COMPANY_SIZES = [
  { label: "1-10 employees", value: "10" },
  { label: "11-50 employees", value: "50" },
  { label: "51-200 employees", value: "200" },
  { label: "201-500 employees", value: "500" },
  { label: "501-1000 employees", value: "1000" },
  { label: "1000+ employees", value: "5000" },
];

export default function StepCompany({ next, back }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    industry: "",
    website: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.companySize) newErrors.companySize = "Company size is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await profileApi.updateStepStatus("company_info", formData);
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
        <h2 className="text-xl font-bold text-white mb-1">Company Details</h2>
        <p className="text-white/40 text-sm">Tell freelancers about the organization they'll be working with.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1 text-premium-label">Company Name</label>
          <input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Acme Innovations"
            className="bg-transparent border border-white/10 p-3 rounded-xl w-full focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-sm"
          />
          {errors.companyName && <p className="text-red-400 text-xs mt-1 px-1">{errors.companyName}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1 text-premium-label">Industry</label>
          <CustomDropdown
            options={INDUSTRIES}
            value={formData.industry}
            onChange={(val) => setFormData({ ...formData, industry: val })}
            placeholder="Select Industry"
            error={errors.industry}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1 text-premium-label">Company Size</label>
          <CustomDropdown
            options={COMPANY_SIZES}
            value={formData.companySize}
            onChange={(val) => setFormData({ ...formData, companySize: val })}
            placeholder="Select Company Size"
            error={errors.companySize}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1 text-premium-label text-premium-heading">Website (Optional)</label>
          <div className="relative">
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g. https://acme.com"
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

