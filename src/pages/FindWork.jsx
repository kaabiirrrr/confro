import React, { useState, useEffect } from "react";
import InfinityLoader from "../components/common/InfinityLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useLocation } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/Navbar";
import ClientTopbar from "../layouts/components/ClientTopbar";
import FreelancerTopbar from "../layouts/components/FreelancerTopbar";
import Footer from "../components/Footer";
import TalentFilterSidebar from "../components/filters/TalentFilterSidebar";
import { getAllJobs } from "../services/apiService";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logger from "../utils/logger";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

const FindWork = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/freelancer');
  const queryParam = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const { user, role, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Direct check for token to prevent flicker if auth state hasn't fully hydrated
  const hasToken = !!localStorage.getItem('token');
  const isUserAuthenticated = isAuthenticated || hasToken;

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, searchTerm]);


  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = { status: 'OPEN' };
      if (selectedCategory && selectedCategory !== "All Categories") filters.category = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await getAllJobs(filters);
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      logger.error("Failed to fetch jobs", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className={`relative ${isDashboard ? '' : 'bg-primary min-h-screen'}`}
    >
      {!isDashboard && !authLoading && (
        isUserAuthenticated ? (
          role === 'CLIENT' ? <ClientTopbar /> : <FreelancerTopbar />
        ) : (
          <Navbar />
        )
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${isDashboard ? '' : 'max-w-[1500px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-2 w-full'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isDashboard ? 'text-3xl font-bold mb-2' : 'text-lg sm:text-2xl font-semibold mb-1 sm:mb-3 tracking-tight'} text-white`}>
              Find Jobs
            </h1>
            <p className="text-white/60 text-xs sm:text-base">
              Browse open jobs and submit proposals to clients.
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-full text-accent hover:bg-accent/10 transition-all"
            onClick={() => setShowMobileFilter(true)}
          >
            <SlidersHorizontal size={20} className="text-accent" />
          </button>
        </div>
      </motion.div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[4999] bg-black/50 md:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full z-[5000] w-[80vw] max-w-[300px] bg-primary border-l border-white/10 p-5 overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-sm">Filters</span>
                <button onClick={() => setShowMobileFilter(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
              </div>
              <TalentFilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={(c) => { setSelectedCategory(c); setShowMobileFilter(false); }}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className={`flex gap-10 ${isDashboard ? 'py-8' : 'px-4 sm:px-6 md:px-30 py-6 sm:py-14'} flex-1`}>

        {/* Sidebar — desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block w-[260px] sticky top-24 self-start"
        >
          <TalentFilterSidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </motion.div>

        {/* Job Cards */}
        <div className="flex-1 min-w-0">
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <InfinityLoader size={40} />
             </div>
          ) : jobs.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:gap-6"
            >
              {jobs?.map((job) => (
                <motion.div
                  key={job?.id || Math.random()}
                  variants={itemVariants}
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    if (role === 'CLIENT') { toast.error("Job details are accessible to freelancers."); return; }
                    navigate(`/freelancer/jobs/${job.id}`);
                  }}
                  className="bg-transparent border border-white/10 rounded-2xl p-5 sm:p-8 hover:border-accent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-accent/5 group"
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors">
                      {job.title}
                    </h3>
                    <span className="text-accent font-bold text-sm sm:text-lg flex-shrink-0">
                      ₹{job.budget_amount || job.budget} {job.budget_type === 'fixed' ? 'Fixed' : '/hr'}
                    </span>
                  </div>

                  <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="text-white/40 text-xs bg-white/5 px-3 sm:px-4 py-1.5 rounded-lg border border-white/5 capitalize tracking-wide">
                        {job.experience_level || job.level}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 sm:py-24 bg-transparent rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-400 text-sm sm:text-lg font-light">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>

      </div>

      {!isDashboard && <Footer />}
    </motion.div>

  );
};

export default FindWork;