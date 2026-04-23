import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="bg-primary px-6">
      <div className="max-w-[1500px] mx-auto">

        <motion.div
          
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-3xl px-6 sm:px-12 py-12 sm:py-20 text-center overflow-hidden
                    bg-gradient-to-r from-secondary via-primary to-secondary"
        >

          {/* Accent Glow */}
          <div className="absolute w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full top-[-150px] left-[-150px]" />
          <div className="absolute w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

          {/* Content */}
          <div className="relative z-10">

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white mb-8 sm:mb-10 leading-tight">
              Find your next hire for a short task or long-term growth
            </h2>

            <Link to="/find-freelancers">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto bg-accent text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl cursor-pointer text-base sm:text-lg font-medium shadow-lg transition-all duration-300"
              >
                Explore Freelancers
              </motion.button>
            </Link>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default CTASection;