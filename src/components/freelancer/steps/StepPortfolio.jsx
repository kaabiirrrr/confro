import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { profileApi } from "../../../services/profileApi";

export default function StepPortfolio({ next, back }) {

  const [portfolio, setPortfolio] = useState({
    title: "",
    description: "",
    file: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setPortfolio({ ...portfolio, file: files[0] });
    } else {
      setPortfolio({ ...portfolio, [name]: value });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!portfolio.title.trim()) newErrors.title = "Project title is required";
    if (!portfolio.description.trim()) newErrors.description = "Project description is required";
    if (!portfolio.file) newErrors.file = "Please upload a project file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const uploadRes = await profileApi.uploadPortfolioItem(portfolio.file);
      if (!uploadRes.success) throw new Error(uploadRes.message || "File upload failed");
      const fileUrl = uploadRes.data.url;
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.portfolio = { ...portfolio, url: fileUrl, file: undefined };
      localStorage.setItem("user", JSON.stringify(user));
      await profileApi.updateStepStatus('portfolio', {
          title: portfolio.title,
          description: portfolio.description,
          url: fileUrl
      });
      next();
    } catch (error) {
      console.error("Failed to update profile step:", error);
      toast.error("Failed to upload portfolio: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-2 sm:space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Showcase your work</h2>
        <p className="text-white/40 text-sm">Add your best projects to demonstrate your expertise to clients.</p>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Project Title</label>
          <input
            name="title"
            value={portfolio.title}
            onChange={handleChange}
            placeholder="e.g. E-commerce Mobile App"
            className="w-full bg-transparent border border-white/10 p-2 sm:p-3 rounded-xl text-white focus:border-accent outline-none transition-all placeholder:text-white/20 text-xs sm:text-sm"
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Project Description</label>
          <textarea
            name="description"
            rows="2"
            value={portfolio.description}
            onChange={handleChange}
            placeholder="Project tech & scope..."
            className="w-full bg-transparent border border-white/10 p-2 sm:p-3 rounded-xl text-white focus:border-accent outline-none transition-all resize-none placeholder:text-white/20 text-xs sm:text-sm leading-tight sm:leading-relaxed sm:rows-[4]"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1 font-medium px-1">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/50 px-1">Project Asset</label>
          <div className="relative">
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-2 sm:p-4 cursor-pointer transition-all group ${
              portfolio.file ? 'border-accent/40 bg-accent/5' : 'border-white/5 hover:border-white/20 bg-white/[0.01]'
            }`}>
              <div className="flex flex-col items-center gap-3">
                {portfolio.file ? (
                  <>
                    <FiCheckCircle className="text-3xl text-accent" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">{portfolio.file.name}</p>
                      <p className="text-xs text-white/40">File selected</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      <FiUploadCloud className="text-xl sm:text-2xl" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">Click to upload file</p>
                      <p className="text-[10px] sm:text-xs text-white/20 mt-1">Images, PDFs (Max 50MB)</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                name="file"
                className="hidden"
                onChange={handleChange}
              />
            </label>
            {errors.file && (
              <p className="text-red-400 text-xs mt-2 font-medium px-1">{errors.file}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 sm:gap-5 pt-2 sm:pt-4">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-white/40 hover:text-white transition-colors text-xs sm:text-sm font-semibold"
        >
          <FiArrowLeft />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-accent text-white font-bold px-6 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 sm:gap-3 transition-all shadow-xl shadow-accent/10 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary border-t-transparent" />
              Uploading...
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