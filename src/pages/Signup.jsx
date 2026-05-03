import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiBriefcase, FiArrowRight } from "react-icons/fi";

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === 'client') navigate('/signup-client');
    else if (selectedRole === 'freelancer') navigate('/signup-freelancer');
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl p-4 sm:p-8 md:p-12 text-center"
      >
        <Link to="/" className="inline-block mb-4 sm:mb-8">
          {/* Light Mode Logo */}
          <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-8 sm:h-10 mx-auto dark:hidden" />
          {/* Dark Mode Logo */}
          <img src="/Logo2.png" alt="Connect" className="h-8 sm:h-10 mx-auto hidden dark:block" />
        </Link>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">Join as a client or freelancer</h2>
        <p className="text-white/60 mb-4 sm:mb-10 text-sm sm:text-base max-w-md mx-auto">Select how you want to use the platform to get started with your account</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('client')}
            className={`cursor-pointer p-4 sm:p-8 rounded-2xl border transition-all flex flex-col items-center text-center ${
              selectedRole === 'client' 
                ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                : 'bg-primary/50 border-[var(--color-border)] hover:border-accent/30'
            }`}
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-6 transition-colors ${
              selectedRole === 'client' ? 'bg-accent text-white' : 'bg-secondary text-text-muted'
            }`}>
              <FiUsers className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-light-text mb-1 sm:mb-2">I'm a Client</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">I want to hire expert talent for my projects and grow my business</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('freelancer')}
            className={`cursor-pointer p-4 sm:p-8 rounded-2xl border transition-all flex flex-col items-center text-center ${
              selectedRole === 'freelancer' 
                ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                : 'bg-primary/50 border-[var(--color-border)] hover:border-accent/30'
            }`}
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-6 transition-colors ${
              selectedRole === 'freelancer' ? 'bg-accent text-white' : 'bg-secondary text-text-muted'
            }`}>
              <FiBriefcase className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-light-text mb-1 sm:mb-2">I'm a Freelancer</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">I want to find rewarding work and offer my professional services</p>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!selectedRole}
          className="bg-accent hover:bg-accent/90 disabled:opacity-30 text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-8 sm:px-12 rounded-full transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mx-auto w-auto"
        >
          {selectedRole === 'client' ? 'Join as a Client' : selectedRole === 'freelancer' ? 'Apply as a Freelancer' : 'Select a role'}
          <FiArrowRight />
        </motion.button>

        <p className="mt-4 sm:mt-8 text-text-muted text-xs sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
