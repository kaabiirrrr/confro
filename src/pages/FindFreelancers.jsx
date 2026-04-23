import React, { useState, useEffect, useCallback } from "react";
import InfinityLoader from "../components/common/InfinityLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useLocation } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import {
  getFreelancers,
  getSavedFreelancers,
  saveFreelancer,
  removeSavedFreelancer,
} from "../services/apiService";
import FreelancerCard from "../components/FreelancerCard";
import FilterSidebar from "../components/FilterSidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import { toastApiError } from "../utils/apiErrorToast";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

const normalizeSavedIds = (payload) => {
  const list = payload?.data ?? payload;
  const arr = Array.isArray(list)
    ? list
    : Array.isArray(list?.freelancers)
      ? list.freelancers
      : Array.isArray(list?.data)
        ? list.data
        : [];
  const ids = new Set();
  arr.forEach((row) => {
    const f = row.freelancer || row;
    const id = f.id || row.freelancer_id || row.id;
    if (id) ids.add(String(id));
  });
  return ids;
};

const FindFreelancers = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/freelancer') || location.pathname.startsWith('/client');
  const queryParam = searchParams.get("q") || "";
  const { role } = useAuth();

  const [selectedSkill, setSelectedSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [saveBusyId, setSaveBusyId] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const isClient = role === "CLIENT";

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    fetchFreelancers();
  }, [selectedSkill, searchTerm]);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getSavedFreelancers();
        if (!cancelled) setSavedIds(normalizeSavedIds(res));
      } catch {
        if (!cancelled) setSavedIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const filters = { limit: 1000 };
      if (selectedSkill) filters.skill = selectedSkill;
      if (searchTerm) filters.search = searchTerm;

      const response = await getFreelancers(filters);
      if (response.success) {
        setFreelancers(response.data);
      }
    } catch (error) {
      logger.error("Failed to fetch freelancers", error);
      toast.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = useCallback(
    async (freelancer) => {
      const id = freelancer?.id;
      if (!id) return;
      const key = String(id);
      const wasSaved = savedIds.has(key);
      try {
        setSaveBusyId(key);
        if (wasSaved) {
          await removeSavedFreelancer(id);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          toast.success("Removed from saved");
        } else {
          await saveFreelancer(id);
          setSavedIds((prev) => new Set(prev).add(key));
          toast.success("Saved to your list");
        }
      } catch (err) {
        toastApiError(err, "Could not update saved talent");
      } finally {
        setSaveBusyId(null);
      }
    },
    [savedIds]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className={`relative ${isDashboard ? '' : 'bg-primary min-h-screen'}`}
    >
      {!isDashboard && <Navbar />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${isDashboard ? '' : 'max-w-[1500px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-2 w-full'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-3 tracking-tight text-white">
              Find Freelancers
            </h1>
            <p className="text-white/60 text-xs sm:text-base">
              Browse verified freelancers with proven track records.
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/70 text-sm"
            onClick={() => setShowMobileFilter(true)}
          >
            <SlidersHorizontal size={16} className="text-accent" />
            Filters
          </button>
        </div>
      </motion.div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/50 md:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full z-[201] w-[80vw] max-w-[300px] bg-primary border-l border-white/10 p-5 overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-sm">Filters</span>
                <button onClick={() => setShowMobileFilter(false)} className="text-white/50 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar
                selectedSkill={selectedSkill}
                setSelectedSkill={(s) => { setSelectedSkill(s); setShowMobileFilter(false); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex gap-10 ${isDashboard ? 'py-8' : 'px-4 sm:px-6 md:px-30 py-6 sm:py-14'} flex-1`}>

        {/* Sidebar — desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block w-[260px] sticky top-24 self-start"
        >
          <FilterSidebar
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
          />
        </motion.div>

        {/* Cards */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <InfinityLoader size={40} />
          ) : freelancers.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"
            >
              {freelancers?.map((freelancer) => {
                const fid = String(freelancer.id || freelancer.user_id || "");
                return (
                  <motion.div key={fid || Math.random()} variants={itemVariants} className="h-full">
                    <FreelancerCard
                      freelancer={freelancer}
                      showSave={isClient}
                      isSaved={fid && savedIds.has(fid)}
                      saveLoading={saveBusyId === fid}
                      onToggleSave={handleToggleSave}
                      showDirectContract={isClient}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-12 sm:py-20 bg-transparent border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-400 text-sm sm:text-lg">No freelancers found matching your criteria.</p>
            </div>
          )}
        </div>

      </div>

      {!isDashboard && <Footer />}
    </motion.div>
  );
};

export default FindFreelancers;