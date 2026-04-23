import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getFreelancers } from "../services/apiService";
import Avatar from "./Avatar";
import Skeleton from "./ui/Skeleton";

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const avatarVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const ExperiencedFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          console.error("Failed to fetch freelancers for home page:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFreelancers();
    }, []);
  
  // Return null only if no real freelancers exist in the system
  // Return null ONLY if fetching is done and still no freelancers exist
  if (!loading && freelancers.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative bg-primary py-16 sm:py-24 px-6 overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">

        {/* LEFT SIDE - Avatar Grid */}
        <div className="relative order-2 lg:order-1">

          {/* RATING BADGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 sm:mb-12 flex justify-center"
          >
            <div className="bg-secondary px-6 sm:px-10 py-2 sm:py-3 rounded-full flex gap-2 sm:gap-3 shadow-lg">
              {Array(5).fill().map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-accent text-base sm:text-lg"
                >
                  ★
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* AVATAR GRID */}
          <motion.div
            variants={containerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 justify-items-center"
          >
            {loading ? (
              [...Array(15)].map((_, i) => (
                <Skeleton key={i} variant="circular" className="w-16 h-16 sm:w-20 sm:h-20 shadow-2xl border-2 border-secondary" />
              ))
            ) : (
              freelancers.slice(0, 15).map((f, index) => (
                <motion.div
                  key={f.id || index}
                  variants={avatarVariant}
                  whileHover={{ scale: 1.15 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                >
                  <Avatar 
                    src={f.avatar_url} 
                    name={f.name || f.full_name} 
                    size="2xl" 
                    className="w-16 h-16 sm:w-20 sm:h-20 shadow-2xl border-2 border-secondary" 
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* RIGHT SIDE - Content */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-[650px] text-center lg:text-left order-1 lg:order-2"
        >
          <h2 className="text-3xl sm:text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            EXPERIENCED <br className="hidden sm:block" /> FREELANCERS
          </h2>

          <p className="text-gray-400 text-sm sm:text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
            Experienced freelancers possess a deep understanding of their craft,
            delivering top-quality work that exceeds client expectations.
          </p>

          <Link to="/find-freelancers">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg cursor-pointer font-semibold shadow-lg"
            >
              Start Finding
            </motion.button>
          </Link>
        </motion.div>

      </div>

      {/* DECORATIVE BURST */}
      <motion.img
        src="/LeftWhyCUs.png"
        alt="decoration"
        className="absolute bottom-[-100px] sm:bottom-[-240px] right-[-50px] w-48 sm:w-78 opacity-40 pointer-events-none"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

    </motion.section>
  );
};

export default ExperiencedFreelancers;