import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center text-light-text">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl px-6"
      >

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-28 h-28 mx-auto mb-10 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-3xl font-bold">
            ✓
          </div>
        </motion.div>

        {/* BIG Upwork Style Heading */}
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
          Congratulations, your account
          <br />
          has been created.
        </h1>

        {/* Subtext */}
        <p className="text-light-text/60 text-lg mb-8">
          Let’s get started.
        </p>

        {/* Redirect Animation */}
        <div className="flex items-center justify-center gap-2 text-light-text/40 text-base">
          Redirecting
          <span className="animate-pulse">.</span>
          <span className="animate-pulse delay-200">.</span>
          <span className="animate-pulse delay-400">.</span>
        </div>

      </motion.div>
    </div>
  );
};

export default SuccessPage;