import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, ShoppingBag, ArrowUpRight,
  Star, Clock, CheckCircle2, SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllServices } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";
import InfinityLoader from "../components/common/InfinityLoader";
import ClientTopbar from "../layouts/components/ClientTopbar";
import FreelancerTopbar from "../layouts/components/FreelancerTopbar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile App",
  "UI/UX Design",
  "Graphic Design",
  "Digital Marketing",
  "Content Writing",
  "AI Services"
];

const ServicesMarketplace = () => {
  const { user, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const loadServices = useCallback(async () => {
    setIsFetching(true);
    try {
      const filters = {};
      if (activeCategory !== "All") filters.category = activeCategory;
      if (search) filters.search = search;

      const res = await getAllServices(filters);
      setServices(res?.data || []);
    } catch (err) {
      logger.error("Failed to fetch services", err);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(loadServices, 300);
    return () => clearTimeout(timer);
  }, [loadServices]);

  return (
    <div className="min-h-screen bg-primary text-light-text font-sans tracking-tight">
      {user ? (
        role === "CLIENT" ? <ClientTopbar /> : <FreelancerTopbar />
      ) : (
        <Navbar />
      )}

      <main className="max-w-[1580px] mx-auto px-6 md:px-10 py-8">

        {/* HEADER SECTION */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">
                Browse Services
              </h1>
              <p className="text-[11px] sm:text-sm text-light-text/70 mt-1">
                Discover pre-packaged custom services created by top-tier freelancers.
              </p>
            </div>

            {/* SEARCH */}
            <div className="w-full md:w-auto">
              <div className="relative w-full sm:w-96 md:w-[420px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/10 rounded-full py-2 sm:py-2.5 pl-11 pr-4 text-[13px] sm:text-sm text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all outline-none"
                />
              </div>
            </div>
          </motion.div>

          {/* CATEGORY TABS - Dashboard Pill Style */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${activeCategory === cat
                  ? "bg-accent text-white"
                  : "text-white/50 border border-transparent hover:text-white hover:bg-white/5"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* SERVICES GRID */}
        {loading ? (
          <div className="py-40">
            <InfinityLoader/>
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center text-center bg-transparent rounded-3xl border-none sm:border sm:border-dashed sm:border-white/10 backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No services found</h3>
            <p className="text-light-text/50 max-w-sm">
              We couldn't find any services matching your search or category. Try a different term or clear filters.
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-8 text-accent font-bold uppercase text-[10px] tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 transition-opacity duration-300 opacity-100`}
          >
            {services.map((service, idx) => (
              <ServiceCard key={service.id || idx} service={service} index={idx} />
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const ServiceCard = ({ service, index }) => {
  const image = service.images?.[0] || service.image || "/service1.jpeg";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer group h-full flex flex-col"
      onClick={() => window.location.href = `/service/${service.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-accent font-semibold text-sm font-sans tracking-tight">₹{service.price}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
              {service.category || "Service"}
            </span>
            <div className="text-light-text/30 text-xs font-medium flex items-center gap-1.5">
              <Clock size={12} className="text-accent/60" />
              {service.delivery_time || "3 days"}
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors leading-snug line-clamp-2">
            {service.title}
          </h3>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 group/freelancer">
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              <img src={service.freelancer?.avatar_url || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest group-hover/freelancer:text-white transition-colors">By {service.freelancer?.name || "Expert"}</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold text-white">
              {service.rating || service.freelancer?.rating || "5.0"} 
              <span className="text-white/40 font-normal ml-1">
                ({service.reviews_count || service.freelancer?.reviews_count || 0})
              </span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesMarketplace;
