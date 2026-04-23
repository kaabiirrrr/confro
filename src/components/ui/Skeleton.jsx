import React from "react";
import { motion } from "framer-motion";

/**
 * Premium Skeleton component with shimmer effect
 * @param {string} className - Additional CSS classes
 * @param {string} variant - 'text', 'circular', 'rectangular'
 * @param {string} width - Custom width
 * @param {string} height - Custom height
 */
const Skeleton = ({ className = "", variant = "rectangular", width, height }) => {
  const baseClasses = "relative overflow-hidden bg-white/5";
  
  const variantClasses = {
    text: "h-3 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
};

export default Skeleton;
