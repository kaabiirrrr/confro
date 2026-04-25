import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getAllServices } from "../services/apiService";
import Skeleton from './ui/Skeleton';
import { formatINR } from "../utils/currencyUtils";

const secondSlide = [
  {
    title: "WEB DEVELOPMENT",
    tags: ["React", "Node.js", "Full Stack", "E-commerce"],
    image: "service5.jpeg",
  },
  {
    title: "MOBILE APP",
    tags: ["iOS", "Android", "Flutter", "React Native"],
    image: "service6.jpeg",
  },
  {
    title: "UI/UX DESIGN",
    tags: ["Figma", "Research", "Wireframes", "Prototype"],
    image: "service7.jpeg",
  },
  {
    title: "CONTENT WRITING",
    tags: ["Blog Writing", "SEO Content", "Copywriting", "Technical Writing"],
    image: "service8.jpeg",
  },
];

const PopularServices = () => {
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const scrollRef = useRef(null);

  React.useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getAllServices({ limit: 50 });
        setServices(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const scroll = (dir) => {
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  const displayItems = services;

  if (displayItems.length === 0 && !loading) return null;


  return (
    <motion.section
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-primary py-8 sm:py-12 md:py-20 text-light-text overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">POPULAR SERVICES</h2>
            <p className="text-light-text/60 mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm md:text-base">
              Writing, catering to various clients' needs.
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-accent transition"
            >
              <FiArrowLeft size={16} className="sm:w-5 sm:h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-accent transition"
            >
              <FiArrowRight size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* SLIDER / GRID */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-secondary rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[240px] md:h-[280px]">
                  <div className="w-full sm:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-5/6 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2 h-40 sm:h-full">
                    <Skeleton className="h-full w-full rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth no-scrollbar"
            >
              <div className="flex-shrink-0 w-full lg:w-[calc(100%-2rem)] grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {displayItems.map((item, index) => {
                  const title = item.title;
                  const tags = item.tags || [];
                  const image = (item.images && item.images[0]) || (item.image) || "/service1.jpeg";
                  const price = item.price;
                  
                  return (
                    <div
                      key={item.id || index}
                      className="bg-transparent rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[240px] md:h-[280px] transition-all duration-300 shadow-lg shadow-black/10"
                    >
                      <div className={`w-full sm:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between order-2 sm:order-none ${(index === 1 || index === 2) ? 'sm:order-2' : ''}`}>
                        <div>
                          <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold line-clamp-2">{title}</h3>
                            {price && <span className="text-accent font-bold text-xs sm:text-sm md:text-base ml-2 flex-shrink-0">{formatINR(price)}</span>}
                          </div>
                          <p className="text-[10px] sm:text-[11px] md:text-xs text-light-text/50 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                            {item.description || "Premium expert services tailored to your specific project needs and business requirements."}
                          </p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                            {tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-xs border border-white/10 rounded-full text-light-text/60 truncate max-w-[100px] sm:max-w-[120px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-6 md:mt-0 flex items-center justify-between">
                          <Link 
                            to={item.id && typeof item.id === 'string' ? `/service/${item.id}` : "/signup"} 
                            className="text-[10px] sm:text-xs text-white/40 hover:text-accent transition font-medium"
                          >
                            View details
                          </Link>
                          <Link to={item.id && typeof item.id === 'string' ? `/service/${item.id}` : "/signup"} className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-accent text-primary rounded-full flex items-center justify-center hover:scale-110 transition flex-shrink-0">
                            <FiArrowUpRight size={16} className="sm:w-5 sm:h-5" />
                          </Link>
                        </div>
                      </div>

                      <div className={`w-full sm:w-1/2 h-40 sm:h-full overflow-hidden order-1 sm:order-none ${(index === 1 || index === 2) ? 'sm:order-1' : ''}`}>
                        <img src={image} className="w-full h-full object-cover transition-transform duration-500" alt={title} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>


      </div>
    </motion.section>
  );
};

export default PopularServices;