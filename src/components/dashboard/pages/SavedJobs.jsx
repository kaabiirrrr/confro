import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight } from 'lucide-react';
import { findWorkJobs, toggleSaveJob } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import JobCard from '../components/JobCard';

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findWorkJobs({ tab: 'saved', limit: 50 });
      setJobs(res?.data ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleSave = async (jobId, nextIsSaved) => {
    if (savingId) return;
    setSavingId(jobId);
    try {
      const res = await toggleSaveJob(jobId);
      // Since this is the SavedJobs page, if it's unsaved, we remove it from the list
      if (!res.saved) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      }
      toast.success(res.saved ? 'Job saved' : 'Job unsaved');
    } catch (err) {
      toastApiError(err, 'Could not update saved job');
      throw err; // Propagate to JobCard for optimistic UI revert
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Saved Jobs</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">Jobs you've bookmarked to apply to later.</p>
        </div>
      </div>

      {!loading && (
        <p className="text-light-text/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
        </p>
      )}

      {/* Job list */}
      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-transparent border border-white/10 rounded-2xl sm:rounded-[32px] h-36 sm:h-48" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 sm:py-24 bg-transparent border border-white/5 rounded-[24px] sm:rounded-[40px] text-center px-4">
          <div className="mx-auto mb-5 sm:mb-8 text-white/20">
            <Briefcase className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white/30 mb-2 uppercase tracking-widest leading-none">No saved jobs yet</h3>
          <p className="text-white/20 text-xs sm:text-sm mb-6 sm:mb-10 max-w-xs mx-auto font-medium">Browse jobs and save the ones you're interested in to see them here.</p>
          <button
            onClick={() => navigate('/freelancer/find-work')}
            className="flex items-center h-9 sm:h-10 gap-2 sm:gap-3 px-5 sm:px-6 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition"
          >
            Browse Jobs <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-8">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
