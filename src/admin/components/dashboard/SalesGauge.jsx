import React from 'react';
import { motion } from 'framer-motion';

const SalesGauge = ({ percentage = 70.8, label = "Sales Growth" }) => {
  const segments = 15;
  const radius = 80;
  const strokeWidth = 14;
  const gap = 4; // degrees between segments
  const totalAngle = 180;
  
  // Calculate how many segments should be highlighted
  const highlightedCount = Math.round((percentage / 100) * segments);

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <svg
        width="220"
        height="120"
        viewBox="0 0 200 110"
        className="transform transition-transform duration-500 hover:scale-105"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
        </defs>
        
        {Array.from({ length: segments }).map((_, i) => {
          const startAngle = 180 - (i * (totalAngle / segments));
          const endAngle = 180 - ((i + 1) * (totalAngle / segments)) + (gap / 2);
          
          // Polar to Cartesian
          const describeArc = (x, y, radius, startAngle, endAngle) => {
            const start = polarToCartesian(x, y, radius, endAngle);
            const end = polarToCartesian(x, y, radius, startAngle);
            const arcSweep = startAngle - endAngle <= 180 ? "0" : "1";
            return [
              "M", start.x, start.y, 
              "A", radius, radius, 0, arcSweep, 0, end.x, end.y
            ].join(" ");
          };

          const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
            const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
            return {
              x: centerX + (radius * Math.cos(angleInRadians)),
              y: centerY + (radius * Math.sin(angleInRadians))
            };
          };

          const isHighlighted = i < highlightedCount;
          
          return (
            <motion.path
              key={i}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              d={describeArc(100, 100, radius, startAngle - (gap/2), endAngle + (gap/2))}
              fill="none"
              stroke={isHighlighted ? "url(#gaugeGradient)" : "rgba(255,255,255,0.05)"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Center Labels */}
      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white tracking-tighter"
        >
          {percentage}%
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1"
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
};

export default SalesGauge;
