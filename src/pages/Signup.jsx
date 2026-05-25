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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <div 
            onClick={() => setSelectedRole('client')}
            className={`cursor-pointer p-4 sm:p-8 rounded-2xl border transition-all flex flex-col items-center text-center ${
              selectedRole === 'client' 
                ? 'bg-primary/50 border-accent' 
                : 'bg-primary/50 border-white/10 hover:border-accent'
            }`}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-2 sm:mb-6">
              <img src="/Icons/icons8-user-100.png" alt="Client" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-light-text mb-1 sm:mb-2">I'm a Client</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">I want to hire expert talent for my projects and grow my business</p>
          </div>

          <div 
            onClick={() => setSelectedRole('freelancer')}
            className={`cursor-pointer p-4 sm:p-8 rounded-2xl border transition-all flex flex-col items-center text-center ${
              selectedRole === 'freelancer' 
                ? 'bg-primary/50 border-accent' 
                : 'bg-primary/50 border-white/10 hover:border-accent'
            }`}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-2 sm:mb-6">
              <img src="/Icons/icons8-bag-100.png" alt="Freelancer" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-light-text mb-1 sm:mb-2">I'm a Freelancer</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">I want to find rewarding work and offer my professional services</p>
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
