import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Briefcase, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { findWorkJobs, toggleSaveJob } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import JobFilterSidebar from './JobFilterSidebar';
import JobCard from '../components/JobCard';
import { useRealtimeJobs } from '../../../context/RealtimeContext';

const TABS = [
  { key: 'best_matches', label: 'Best Matches' },
  { key: 'most_recent', label: 'Most Recent' },
  { key: 'saved', label: 'Saved Jobs' },
];

export default function FreelancerFindWork() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('best_matches');
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    expLevel: '',
    budgetType: '',
    minBudget: '',
    maxBudget: '',
    skills: []
  });

  const debounceRef = useRef(null);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await findWorkJobs(params);
      setJobs(res?.data ?? []);
      setPagination(res?.pagination ?? { total: res?.data?.length || 0, page: 1, pages: 1 });
    } catch (err) {
      toastApiError(err, 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load({
        tab,
        page,
        search,
        category: filters.category,
        experience_level: filters.expLevel,
        budget_type: filters.budgetType,
        min_budget: filters.minBudget,
        max_budget: filters.maxBudget,
        skill: filters.skills.join(','),
        limit: 20
      });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [tab, page, search, filters, load]);

  useEffect(() => { setPage(1); }, [tab, search, filters]);

  // ── Real-time job updates ─────────────────────────────────────────────────
  const handleNewJob = useCallback((job) => {
    // Only inject into best_matches / most_recent tabs, not saved
    if (tab === 'saved') return;
    setJobs(prev => {
      if (prev.some(j => j.id === job.id)) return prev; // deduplicate
      return [job, ...prev];
    });
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  }, [tab]);

  const handleJobDeleted = useCallback(({ id }) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  }, []);

  const handleJobUpdated = useCallback((job) => {
    // Remove from list if bidding is closed or job is no longer active
    const isClosed = job.is_bidding_open === false || ['CLOSED', 'COMPLETED', 'CANCELLED'].includes((job.status || '').toUpperCase());
    
    if (isClosed) {
      setJobs(prev => prev.filter(j => j.id !== job.id));
    } else {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...job } : j));
    }
  }, []);

  useRealtimeJobs({
    onNewJob: handleNewJob,
    onJobDeleted: handleJobDeleted,
    onJobUpdated: handleJobUpdated,
  });

  const handleApplyFilters = () => {
    setShowFilters(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      expLevel: '',
      budgetType: '',
      minBudget: '',
      maxBudget: '',
      skills: []
    });
    setPage(1);
  };

  const handleToggleSave = async (jobId, nextIsSaved) => {
    if (savingId) return;
    setSavingId(jobId);
    try {
      const res = await toggleSaveJob(jobId);
      if (tab === 'saved' && !res.saved) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      } else {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: res.saved } : j));
      }
      toast.success(res.saved ? 'Job saved' : 'Job unsaved');
    } catch (err) {
      toastApiError(err, 'Could not save job');
      throw err; // Propagate to JobCard for optimistic UI revert
    } finally {
      setSavingId(null);
    }
  };

  const filterCount = [filters.category, filters.expLevel, filters.budgetType, filters.minBudget, filters.maxBudget, ...filters.skills].filter(Boolean).length;

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">

      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Find Work</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">Browse jobs that match your professional skills and experience</p>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="relative flex items-center justify-center w-10 h-10 rounded-full text-accent hover:bg-accent/10 transition-all flex-shrink-0"
        >
          <Filter size={18} className="text-accent" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] flex items-center justify-center rounded-full border-2 border-secondary font-bold">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text/20" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for jobs, skills, or keywords"
          className="w-full bg-secondary border border-border rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-light-text focus:outline-none focus:border-accent/40 shadow-sm transition-all placeholder:text-light-text/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex max-sm:justify-between sm:gap-10 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] border-b border-border overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 sm:flex-none pb-3 sm:pb-4 transition-all relative whitespace-nowrap ${tab === t.key ? 'text-accent' : 'text-light-text/40 hover:text-light-text'}`}
          >
            {t.label === 'Best Matches' ? 'BEST MATCHES' : t.label === 'Most Recent' ? 'MOST RECENT' : 'SAVED JOBS'}
            {tab === t.key && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {!loading && <p className="text-light-text/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{pagination.total} jobs found</p>}

      {/* Job list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-transparent border border-border rounded-2xl h-44" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-transparent border border-border rounded-2xl text-center">
          <Briefcase className="w-12 h-12 text-light-text/10 mb-3" />
          <h3 className="text-lg font-semibold text-light-text/60 mb-1">No jobs found</h3>
          <p className="text-light-text/30 text-sm">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={tab === 'saved' || job.is_saved}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-light-text/40 pt-8 border-t border-border">
          <span>{pagination.total} jobs</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-hover disabled:opacity-30 transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1 px-4 text-sm font-medium">
              Page {page} of {pagination.pages}
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
              className="p-2 rounded-xl border border-border bg-transparent text-light-text/40 hover:text-light-text hover:bg-hover disabled:opacity-30 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <JobFilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
}
