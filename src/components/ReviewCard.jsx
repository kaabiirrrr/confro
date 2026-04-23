import React from "react";
import { motion } from "framer-motion";

const ReviewCard = ({ review }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-secondary border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={review.image}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <h3 className="font-semibold">{review.name}</h3>
          <p className="text-white/60 text-sm">{review.role}</p>
        </div>
      </div>

      <p className="text-white/70 text-sm mb-3">
        {review.review}
      </p>

      <div className="text-accent">⭐⭐⭐⭐⭐</div>
    </motion.div>
  );
};

export default ReviewCard;