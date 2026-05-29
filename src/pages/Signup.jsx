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
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative">
      {/* Logo aligned exactly with Navbar position */}
      <div className="absolute top-0 left-0 w-full">
        <div className="max-w-[1630px] mx-auto h-14 md:h-20 px-4 md:px-8 flex items-center">
          <Link to="/" className="flex items-center group">
            <img 
              src="/Logo-LightMode-trimmed.png" 
              alt="Connect" 
              className="h-9 md:h-12 object-contain block dark:hidden transition-all duration-300" 
            />
            <img 
              src="/Logo2.png" 
              alt="Connect" 
              className="h-8 md:h-10 object-contain hidden dark:block transition-all duration-300" 
            />
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl p-4 sm:p-8 md:p-12 text-center mt-10 md:mt-0"
      >
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">Join as a client or freelancer</h2>
        <p className="text-white/60 mb-4 sm:mb-10 text-sm sm:text-base max-w-md mx-auto">Select how you want to use the platform to get started with your account</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
          {/* Client */}
          <div 
            onClick={() => setSelectedRole('client')}
            className={`cursor-pointer flex flex-col items-center text-center rounded-[10px] border-2 p-4 sm:p-6 transition-all duration-300 ${
              selectedRole === 'client'
                ? 'border-accent opacity-100'
                : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-90'
            }`}
          >
            <img 
              src="/ChatGPT Image May 28, 2026, 12_38_33 AM.png" 
              alt="Client" 
              className="block w-full h-auto object-contain mx-auto mb-4"
            />
            <h3 className={`text-base sm:text-xl font-bold transition-colors w-full ${
              selectedRole === 'client' ? 'text-accent' : 'text-light-text'
            }`}>I'm a Client</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed mt-1 hidden sm:block">I want to hire expert talent for my projects and grow my business</p>
          </div>

          {/* Freelancer */}
          <div 
            onClick={() => setSelectedRole('freelancer')}
            className={`cursor-pointer flex flex-col items-center text-center rounded-[10px] border-2 p-4 sm:p-6 transition-all duration-300 ${
              selectedRole === 'freelancer'
                ? 'border-accent opacity-100'
                : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-90'
            }`}
          >
            <img 
              src="/ChatGPT Image May 28, 2026, 12_36_02 AM.png" 
              alt="Freelancer" 
              className="block w-full h-auto object-contain mx-auto mb-4"
            />
            <h3 className={`text-base sm:text-xl font-bold transition-colors w-full ${
              selectedRole === 'freelancer' ? 'text-accent' : 'text-light-text'
            }`}>I'm a Freelancer</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed mt-1 hidden sm:block">I want to find rewarding work and offer my professional services</p>
          </div>
        </div>

        <motion.button
          whileHover={selectedRole ? { scale: 1.02 } : {}}
          whileTap={selectedRole ? { scale: 0.98 } : {}}
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-[280px] sm:w-[320px] mx-auto py-2 sm:py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 mb-4 sm:mb-8 text-sm sm:text-base ${
            selectedRole 
              ? 'bg-accent text-white' 
              : 'bg-secondary text-text-muted cursor-not-allowed opacity-70'
          }`}
        >
          {selectedRole === 'client' ? 'Join as a Client' : selectedRole === 'freelancer' ? 'Apply as a Freelancer' : 'Select a role'}
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
