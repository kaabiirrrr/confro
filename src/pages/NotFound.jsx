import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-[120px] font-black leading-none bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">Page Not Found</h1>
        <p className="text-white/50 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-all hover:scale-105"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-white/20 text-white/70 rounded-lg font-medium hover:bg-white/5 transition-all"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
