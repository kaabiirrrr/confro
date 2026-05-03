import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Edit2, Trash2, ChevronRight, Clock, Users, IndianRupee, AlertCircle, Search, Lock } from 'lucide-react';
import { formatINR } from '../../../../utils/currencyUtils';
import { getMyJobs, deleteJob } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Tabs from '../../../ui/Tabs';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';
import InfinityLoader from '../../../common/InfinityLoader';
import { useRealtimeJobs } from '../../../../context/RealtimeContext';

const STATUS_TABS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'OPEN', label: 'Open' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

const STATUS_BADGE = {
  OPEN: 'bg-green-500/10 text-green-400 border-green-500/20',
  DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-white/5 text-white/40 border-white/10',
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const MyJobs = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    confirmText: 'Confirm', 
    type: 'danger',
    onConfirm: () => {} 
  });
  const navigate = useNavigate();


  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const res = await getMyJobs();
      if (res.success) setJobs(res.data || []);
    } catch (err) {
      toastApiError(err, 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (job) => {
    setConfirmModal({
        isOpen: true,
        title: 'Delete Job Posting',
        message: `Are you absolute sure you want to delete "${job.title}"? This action is permanent and cannot be undone.`,
        confirmText: 'Delete Permanently',
        type: 'danger',
        onConfirm: async () => {
            setDeletingId(job.id);
            try {
              await deleteJob(job.id);
              setJobs(prev => prev.filter(j => j.id !== job.id));
              toast.success('Job deleted');
            } catch (err) {
              toastApiError(err, 'Failed to delete job');
            } finally {
              setDeletingId(null);
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        }
    });
  };


  // ── Real-time updates: reflect status changes (e.g. IN_PROGRESS after proposal accepted)
  const handleJobUpdated = useCallback((job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...job } : j));
  }, []);

  const handleJobDeleted = useCallback(({ id }) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  useRealtimeJobs({
    onJobUpdated: handleJobUpdated,
    onJobDeleted: handleJobDeleted,
  });

  const filtered = jobs.filter(j => {
    const matchesTab = activeTab === 'all' || (j.status || '').toUpperCase() === activeTab.toUpperCase();
    const matchesSearch = !searchTerm || 
      (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (j.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });


  const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatBudget = job => {
    if (!job.budget_amount && !job.budget) return '—';
    const amount = job.budget_amount || job.budget;
    return formatINR(amount) + (job.budget_type === 'hourly' ? '/hr' : '');
  };

  return (
    <div className="max-w-[1500px] mx-auto py-6 sm:py-8 text-light-text font-sans tracking-tight">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">My Jobs</h1>
          <p className="text-sm sm:text-base text-light-text/70">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Button 
          onClick={() => navigate('/client/post-job')} 
          className="rounded-full px-6 h-10 text-sm font-semibold shadow-lg shadow-accent/20 hover:scale-105 transition-all w-full sm:w-fit"
          icon={Plus}
        >
          Post New Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 sm:gap-10 border-b border-white/5 mb-8 sm:mb-10 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(t => {
          const isActive = activeTab === t.key;
          const count = t.key === 'all' ? jobs.length : jobs.filter(j => (j.status || '').toLowerCase() === t.key.toLowerCase()).length;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-3 sm:pb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${
                isActive ? 'text-accent' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {t.label}
                {count > 0 && <span className={`text-[10px] opacity-60 font-medium ${isActive ? 'text-accent' : ''}`}>({count})</span>}
              </div>
              {isActive ? (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent rounded-full" />
              ) : (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent/0 hover:bg-accent/20 transition-all duration-300 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-transparent border border-white/10 rounded-2xl text-center">
          <Briefcase className="w-12 h-12 text-light-text/20 mb-6" />
          <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
          <p className="text-light-text/50 text-base mb-8 max-w-md mx-auto">
            {activeTab === 'all' ? "You haven't posted any jobs yet. Get started by posting your first job." : `No jobs found with status "${activeTab.toLowerCase().replace(/_/g, ' ')}".`}
          </p>
          <Button onClick={() => navigate('/client/post-job')} variant="secondary" className="rounded-full px-8">
            Post your first job →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-transparent border border-white/10 rounded-2xl p-6 hover:border-accent/40 transition-all shadow-sm group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg truncate group-hover:text-accent transition-colors tracking-tight">{job.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shrink-0 ${STATUS_BADGE[job.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                      {(job.status || 'open').replace(/_/g, ' ')}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-light-text/60 text-sm line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Budget</span>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-emerald-500/50" />
                        <span className="text-sm font-bold text-white/90">
                          {formatBudget(job).replace('₹', '')}
                          {job.budget_type && <span className="text-light-text/30 font-medium ml-1.5 text-[10px]">({job.budget_type.toUpperCase()})</span>}
                        </span>
                      </div>
                    </div>
                    {job.duration && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Duration</span>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-white/20" />
                          <span className="text-sm font-bold text-white/90">{job.duration}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Activity</span>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-white/20" />
                        <span className="text-sm font-bold text-white/90">{job.proposal_count || 0} Proposals</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {job.skills.slice(0, 5).map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 bg-white/5 text-white/50 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider">{skill}</span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="px-2.5 py-0.5 text-light-text/30 text-[10px] font-bold tracking-widest">+{job.skills.length - 5} MORE</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-start">
                    {(job.proposal_count || 0) > 0 && (
                      <button
                        onClick={() => navigate(`/client/proposals?job=${job.id}`)}
                        className="h-10 px-5 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 active:scale-95 whitespace-nowrap"
                      >
                        Proposals <ChevronRight size={14} />
                      </button>
                    )}
                    <div className="flex items-center gap-1 bg-white/5 rounded-full px-1 py-1 border border-white/5">
                      {job.is_bidding_open !== false && (job.status === 'OPEN' || job.status === 'IN_PROGRESS') && (
                        <button
                            onClick={() => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Stop Hiring Process',
                                    message: 'Are you sure you want to stop hiring for this job? This will immediately remove it from the public marketplace and lock the team.',
                                    confirmText: 'Stop Hiring',
                                    type: 'primary',
                                    onConfirm: async () => {
                                        try {
                                            const { closeJobBidding } = await import('../../../../services/apiService');
                                            const res = await closeJobBidding(job.id);
                                            if (res.success) {
                                                toast.success("Bidding closed. Team is now locked.");
                                                loadJobs();
                                            }
                                        } catch (err) {
                                            toast.error("Failed to close bidding");
                                        } finally {
                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                        }
                                    }
                                });
                            }}
                            className="p-2 text-white/40 hover:text-accent transition-all rounded-full"
                            title="Stop Hiring"
                        >
                            <Lock size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/client/post-job?edit=${job.id}`)}
                        className="p-2 text-white/40 hover:text-white transition-all rounded-full"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        disabled={deletingId === job.id}
                        className="p-2 text-white/40 hover:text-red-400 transition-all rounded-full"
                        title="Delete"
                      >
                        {deletingId === job.id ? <InfinityLoader size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`mb-6 ${confirmModal.type === 'danger' ? 'text-red-500' : 'text-accent'}`}>
                        <AlertCircle size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-8">{confirmModal.message}</p>
                    
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button 
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="px-6 py-4 rounded-full border border-white/5 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmModal.onConfirm}
                            className={`px-6 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all ${
                                confirmModal.type === 'danger' 
                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20' 
                                : 'bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/20'
                            }`}
                        >
                            {confirmModal.confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;