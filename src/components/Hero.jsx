import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiMic, FiArrowRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFreelancers } from "../services/apiService";
import Avatar from "./Avatar";
import { useNotification } from "../hooks/useNotification";
import { formatINR } from "../utils/currencyUtils";
import SEO from "./SEO";

import Skeleton from "./ui/Skeleton";

const Hero = () => {
  const { user, role, profile, getDashboardRoute } = useAuth();
  const dashboardRoute = getDashboardRoute(role, profile);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await getFreelancers({ limit: 50 });
        if (response.success) {
          // Filter out dummy "User" accounts and prioritize real names/photos
          const realFreelancers = (response.data || []).filter(f => 
            f.full_name && 
            f.full_name.toLowerCase() !== 'user' && 
            f.full_name.toLowerCase() !== 'new user'
          );
          setFreelancers(realFreelancers.length > 0 ? realFreelancers : response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch freelancers for hero:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const featuredFreelancer = freelancers.find(f =>
    (f.full_name || f.name || "").toLowerCase().includes("kabir")
  ) || freelancers[0] || null;

  return (
    <section className="relative bg-primary text-light-text min-h-screen overflow-hidden flex items-center">
      <SEO 
        title="Connectfreelance - Hire Top Freelancers & Find Freelance Jobs in India"
        description="Connectfreelance is a freelance platform in India to hire freelancers and find remote work easily. Hire expert freelancers for web development, UI/UX design, content writing, and more."
        keywords="connectfreelance, hire freelancers India, find freelance jobs, remote work, web development, UI/UX design, content writing, freelance marketplace India, gig economy, work from home"
      />

      {/* Background Text */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute left-1/2 -translate-x-1/2 top-[20px]
        text-[60px] sm:text-[120px] md:text-[180px] lg:text-[260px] font-extrabold 
        tracking-wider whitespace-nowrap 
        select-none pointer-events-none z-0"
      >
        FREELANCE
      </motion.h1>

      <div
        className="max-w-[1630px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 
        relative z-10 pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-40 flex flex-col lg:flex-row 
        items-center justify-between gap-8 lg:gap-28"
      >

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:max-w-[620px] space-y-4 sm:space-y-6 text-center lg:text-left"
        >

          {/* Search */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center bg-secondary/80 backdrop-blur-md rounded-full px-3 sm:px-6 py-2.5 sm:py-3 border border-white/10 shadow-lg"
          >
            <FiSearch className="text-light-text/50 mr-2 sm:mr-3 flex-shrink-0" size={16} />

            <input
              type="text"
              placeholder="Search for any services..."
              className="bg-transparent flex-1 outline-none text-xs sm:text-sm placeholder:text-light-text/40 min-w-0"
            />

            <button className="mr-2 sm:mr-4 p-1.5 sm:p-2 rounded-full text-light-text/50 hover:text-accent transition flex-shrink-0">
              <FiMic size={16} />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-500 rounded-full flex-shrink-0"
            >
              <FiArrowRight className="text-white" size={14} />
            </motion.button>
          </motion.div>

          {/* Popular Skills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-light-text/70 text-xs sm:text-sm font-medium w-full sm:w-auto mb-1 sm:mb-0">
              Popular Skills:
            </span>

            {["web design", "UI/UX design", "databases", "business cards"].map(
              (skill, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}>
                  <Link
                    to="/login"
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs bg-secondary border border-white/10 rounded-full text-light-text/70 hover:border-accent hover:text-accent transition whitespace-nowrap"
                  >
                    {skill}
                  </Link>
                </motion.div>
              )
            )}
          </div>

          <p className="text-light-text/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
            <strong>Connectfreelance</strong> is a freelance platform in India to hire freelancers and find remote work easily.
            Connect businesses with talented freelancers, facilitating project collaboration and hiring. Find top talent or discover your next remote job opportunity.
          </p>



          {/* Trusted Card */}
          {loading ? (
            <div className="bg-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="circular" className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary" />
                  ))}
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ) : freelancers.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="bg-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10"
            >
              <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 font-medium">
                Trusted Freelancers
              </p>

              <div className="flex items-center justify-between gap-4">

                {/* PROFILE IMAGES */}
                <div className="flex -space-x-2 sm:-space-x-3">
                  {freelancers.slice(0, 5).map((f, i) => (
                    <Avatar
                      key={f.id || i}
                      src={f.avatar_url}
                      name={f.name || f.full_name}
                      size="md"
                      className="border-2 border-primary sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  ))}
                </div>

                {/* STARS */}
                <div className="flex text-accent text-sm sm:text-lg md:text-xl gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

              </div>

              <p className="text-[10px] sm:text-xs md:text-sm text-light-text/60 mt-3 sm:mt-4">
                Join our verified network of experts
              </p>
            </motion.div>
          )}

        </motion.div>
        {/* END LEFT SIDE */}

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex-1 flex justify-center w-full max-w-[280px] sm:max-w-[400px] lg:max-w-none mx-auto lg:mx-0"
        >

          <motion.img
            src="/Hero-image.png"
            alt="Professional"
            className="h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] lg:max-h-[800px] w-auto object-contain"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Floating Card */}
          {loading ? (
             <div className="absolute bottom-10 sm:bottom-20 right-0 translate-x-4 bg-secondary p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/10 w-max min-w-[220px] max-w-[420px] hidden sm:block">
               <div className="flex items-center gap-4 mb-6">
                 <Skeleton variant="circular" className="w-16 h-16 rounded-full" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-24" />
                 </div>
               </div>
               <div className="space-y-3">
                 <Skeleton className="h-4 w-40" />
                 <Skeleton className="h-4 w-32" />
               </div>
             </div>
          ) : featuredFreelancer && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-10 sm:bottom-20 right-0 translate-x-4 bg-secondary p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/10 w-max min-w-[220px] max-w-[420px] hidden sm:block"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Avatar
                  src={featuredFreelancer.avatar_url}
                  name={featuredFreelancer.full_name || featuredFreelancer.name}
                  size="xl"
                  className="rounded-full shadow-lg"
                />
                <div>
                  <Link
                    to={`/freelancer/${featuredFreelancer.id}`}
                    className="text-base sm:text-lg font-semibold text-white/90 hover:text-accent transition-colors"
                  >
                    {featuredFreelancer.full_name || featuredFreelancer.name}
                  </Link>
                  <p className="text-[10px] sm:text-xs text-light-text/60 line-clamp-1">
                    {featuredFreelancer.title || "Elite Professional"}
                  </p>
                </div>
              </div>

              <div className="text-sm sm:text-base text-light-text/70 space-y-2 sm:space-y-3">
                <p>{featuredFreelancer.total_completed_jobs || 10}+ projects completed</p>
                <p>{formatINR(featuredFreelancer.hourly_rate || 25)} per hour</p>
              </div>
            </motion.div>
          )}

        </motion.div>

      </div>
    </section>
  );
};

export default Hero;