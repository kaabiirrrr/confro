import { motion } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";

export default function StepFinish({ finish }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10"
    >
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
          <FiCheck className="text-5xl" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">
        You're all set! 🎉
      </h2>

      <p className="text-white/40 max-w-md mx-auto mb-10 leading-relaxed">
        Your professional freelancer profile has been successfully completed. 
        You're now ready to discover opportunities and grow your career.
      </p>

      <div className="flex justify-center">
        <button
          onClick={finish}
          className="bg-accent text-white font-bold px-12 py-4 rounded-full hover:bg-accent/90 flex items-center gap-3 transition-all shadow-2xl shadow-accent/20"
        >
          Explore Dashboard
          <FiArrowRight />
        </button>
      </div>
    </motion.div>
  );
}