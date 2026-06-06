import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `star-${Date.now()}-${i}-${Math.random()}`,
    size: Math.random() * 2 + 1, // 1-3px
    top: `${Math.random() * 50}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 4,
    direction: Math.random() > 0.5 ? "topLeft" : "topRight",
  }));
};

export default function NotFound() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(generateStars(35));

    const interval = setInterval(() => {
      setStars((prev) => [...prev.slice(-20), ...generateStars(15)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-space opacity-90"></div>

      {/* Falling Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${star.direction === "topLeft" ? "animate-fall-topLeft" : "animate-fall-topRight"}`}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          >
            <div className="h-full w-full rounded-full bg-white opacity-80" />
          </div>
        ))}
      </div>

      {/* UFO */}
      <div className="ufo select-none pointer-events-none z-10">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8794272-p5k6GdbD8O2RIat5GWtUGJGkDgXoxf.png"
          alt="UFO"
          width={300}
          height={150}
          className="max-w-[200px] md:max-w-[300px]"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full"
        >
          <h1 className="mb-2 text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_5px_15px_rgba(147,51,234,0.4)]">
            404
          </h1>
          <p className="mb-8 text-lg md:text-xl text-gray-300 font-medium">
            Oops! Looks like this page got lost in space
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-3 text-white bg-accent hover:bg-accent rounded-full font-semibold hover:-translate-y-0.5 transition-all duration-200"
            >
              Return Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-semibold hover:-translate-y-0.5 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

