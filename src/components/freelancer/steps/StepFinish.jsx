import { motion } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";

export default function StepFinish({ finish }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10"
    >
      <div className="ml-10 flex justify-center items-center">
        <img
          src="/ChatGPT%20Image%20May%2022,%202026,%2009_15_28%20PM.png"
          alt="Success"
          className="w-84 h-84 sm:w-92 sm:h-92 object-contain"
        />
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
          className="bg-accent text-white font-bold px-12 py-2.5 rounded-full hover:bg-accent/90 flex items-center justify-center transition-all"
        >
          Explore Dashboard
        </button>
      </div>
    </motion.div>
  );
}