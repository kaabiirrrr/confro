import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFreelancers } from "../../../../services/apiService";
import FreelancerCard from "../../../FreelancerCard";
import SectionHeader from '../../../ui/SectionHeader';
import Button from '../../../ui/Button';
import EmptyState from '../../../ui/EmptyState';
import {
  Search,
  X,
  Loader2,
  Users,
} from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Development & IT", value: "development" },
  { label: "AI Services", value: "ai" },
  { label: "Marketing", value: "marketing" },
  { label: "Design", value: "design" },
  { label: "Writing & Translation", value: "writing" },
  { label: "Administration", value: "admin" },
];

const FindTalent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillInput, setSkillInput] = useState("");

  // Read BOTH category and skill from URL query params
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get("category") || "";
  const activeSkill = searchParams.get("skill") || "";

  // Sync input field with URL on navigation (e.g. back button)
  useEffect(() => {
    setSkillInput(activeSkill);
  }, [activeSkill]);

  // Derived: label for the active category
  const activeCategoryLabel =
    CATEGORIES.find((c) => c.value === activeCategory)?.label || "All";

  // Fetch whenever category OR skill in URL changes
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = {};
        if (activeCategory) filters.category = activeCategory;
        if (activeSkill) filters.skill = activeSkill;

        const response = await getFreelancers(filters);
        setFreelancers(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch freelancers:", err);
        const msg =
          err?.response?.data?.message ||
          "Failed to load freelancers. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [activeCategory, activeSkill]);  // ← now reacts to BOTH

  // Navigate helper — preserves both category and skill in URL
  const buildUrl = (category, skill) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (skill) params.set("skill", skill);
    return `/client/find-talent?${params.toString()}`;
  };

  const handleCategoryChange = (value) => {
    // Keep current skill when switching category
    navigate(buildUrl(value, activeSkill));
  };

  const handleSkillSearch = (e) => {
    e?.preventDefault();
    // Put the typed skill into the URL → triggers useEffect → re-fetch
    navigate(buildUrl(activeCategory, skillInput.trim()));
  };

  const handleClearSkill = () => {
    setSkillInput("");
    navigate(buildUrl(activeCategory, ""));
  };

  return (
    <div className="max-w-[1500px] mx-auto py-6 sm:py-8 text-light-text font-sans tracking-tight animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Find Talent</h1>
          <p className="text-sm sm:text-base text-light-text/70">Browse top freelancers by category and skills</p>
        </div>
      </div>

      {/* CATEGORY TABS - Premium Underlined Style */}
      <Tabs
        tabs={CATEGORIES.map(cat => ({
          key: cat.value,
          label: cat.label
        }))}
        activeTab={activeCategory}
        onChange={handleCategoryChange}
        className="mb-8"
      />

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form
          onSubmit={handleSkillSearch}
          className="flex-1 flex items-center gap-3 bg-transparent border border-white/10 rounded-2xl px-5 py-3 hover:border-white/20 transition-all focus-within:border-accent/40 shadow-sm"
        >
          <Search size={18} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Search by skill (e.g. React, Python, Figma)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none font-medium"
          />
          {skillInput && (
            <button type="button" onClick={handleClearSkill} className="text-white/20 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
              <X size={16} />
            </button>
          )}
        </form>
        <Button 
          onClick={handleSkillSearch} 
          className="rounded-full px-8 h-[52px] text-sm font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
          icon={Search}
        >
          Search Talent
        </Button>
      </div>

      {/* ACTIVE FILTER INDICATORS */}
      {(activeCategory || activeSkill) && (
        <div className="flex items-center flex-wrap gap-2 mb-6">
          <span className="text-light-text/40 text-sm">Filtered by:</span>
          {activeCategory && (
            <span className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-1 rounded-full">
              {activeCategoryLabel}
              <button onClick={() => handleCategoryChange("")} className="hover:text-white transition ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {activeSkill && (
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/20 text-light-text/70 text-sm px-3 py-1 rounded-full">
              Skill: {activeSkill}
              <button onClick={handleClearSkill} className="hover:text-white transition ml-1">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* RESULTS COUNT */}
      {!loading && !error && (
        <p className="text-light-text/40 text-sm mb-6">
          {freelancers.length === 0
            ? "No freelancers found"
            : `${freelancers.length} freelancer${freelancers.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-64" />
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center shadow-lg">
          <p className="text-red-400 font-semibold text-lg mb-2">Something went wrong</p>
          <p className="text-light-text/50 text-base mb-6 max-w-md mx-auto">{error}</p>
          <Button
            onClick={() => handleCategoryChange(activeCategory)}
            variant="secondary"
            className="rounded-full px-8"
          >
            Retry Loading
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && freelancers.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-transparent border border-white/10 rounded-2xl text-center shadow-lg">
          <Users className="w-12 h-12 text-light-text/20 mb-6" />
          <h3 className="text-lg font-semibold text-white mb-2">No freelancers found</h3>
          <p className="text-light-text/50 text-base mb-8 max-w-md mx-auto">
            {activeCategory
              ? `No freelancers are listed under "${activeCategoryLabel}" yet. Try a different category or check back later.`
              : "No freelancers are available yet. Check back soon!"}
          </p>
          {activeCategory && (
            <Button onClick={() => handleCategoryChange("")} variant="secondary" className="rounded-full px-8">
              Browse All Talent
            </Button>
          )}
        </div>
      )}

      {/* FREELANCER GRID */}
      {!loading && !error && freelancers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {freelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTalent;
