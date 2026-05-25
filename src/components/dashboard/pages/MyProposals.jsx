import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProposals } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import { useRealtimeProposals } from '../../../context/RealtimeContext';
import { useDashboardCache } from '../../../context/DashboardCacheContext';
import { RefreshCw, FileText, ChevronRight, Clock, IndianRupee, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../../utils/currencyUtils';

const MyProposals = () => {
  const navigate = useNavigate();
  const { proposals: cachedProposals, updateProposals, isFresh, clearCache } = useDashboardCache();

  const [proposals, setProposals] = React.useState(cachedProposals || []);
  const [loading, setLoading] = React.useState(!isFresh('proposals'));
  const [activeTab, setActiveTab] = React.useState('Active');

  React.useEffect(() => {
    if (!isFresh('proposals')) {
      fetchProposals();
    }
  }, [isFresh]);

  const fetchProposals = async (force = false) => {
    try {
      setLoading(true);
      const res = await getMyProposals();
      if (res.success) {
        setProposals(res.data || []);
        updateProposals(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  // ── Real-time Status Change ────────────────────────────────────────────────
  const handleStatusChanged = React.useCallback(({ proposal_id, status }) => {
    setProposals(prev =>
      prev.map(p => p.id === proposal_id ? { ...p, status } : p)
    );
  }, []);

  useRealtimeProposals({
    onStatusChanged: handleStatusChanged,
  });

  const filteredProposals = proposals.filter(p => {
    if (activeTab === 'Active') return p.status === 'PENDING' || p.status === 'ACCEPTED';
    if (activeTab === 'Archived') return p.status === 'REJECTED' || p.status === 'WITHDRAWN';
    if (activeTab === 'Offers') return p.status === 'OFFER';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'text-white bg-emerald-500';
      case 'PENDING':  return 'text-white bg-yellow-500';
      case 'REJECTED': return 'text-white bg-red-500';
      case 'OFFER':    return 'text-white bg-accent';
      default:         return 'text-white bg-slate-400';
    }
  };

  const handleManualRefresh = () => {
    clearCache();
    fetchProposals(true);
  };

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-8">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">My Proposals</h1>
          <p className="text-slate-500 dark:text-light-text/60 text-[11px] sm:text-[13px] line-clamp-1">Track and manage your submitted applications.</p>
        </div>
      </div>

      {/* Tabs - Minimal with Blue Underline & All-Caps */}
      <div className="flex max-sm:justify-between sm:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar mb-8">
        {['Active', 'Archived', 'Offers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none pb-4 transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-accent' : 'text-slate-400 dark:text-light-text/20 hover:text-slate-950 dark:hover:text-white'
              }`}
          >
            {tab.toUpperCase()}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabProposals"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl divide-y divide-slate-100 dark:divide-white/5 animate-pulse overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24" />
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-20 bg-transparent">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img src="/Icons/icons8-empty-box-80.png" alt="No proposals" className="w-[100px] h-[100px] object-contain" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab.toLowerCase()} proposals</h3>
            <p className="text-[14px] text-light-text/40 max-w-sm mx-auto mb-8 leading-relaxed">
              {activeTab === 'Active'
                ? "You haven't submitted any proposals yet. Browse jobs and start applying to see them here!"
                : `You don't have any ${activeTab.toLowerCase()} proposals at the moment.`}
            </p>
            {activeTab === 'Active' && (
              <button
                onClick={() => navigate("/freelancer/find-work")}
                className="inline-flex items-center gap-2 px-5 h-9 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-accent/90 transition active:scale-95"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group border border-slate-200 dark:border-white/10 rounded-xl bg-transparent hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/freelancer/jobs/${proposal.job_id}`)}
              >
                {/* Top accent bar on hover */}

                <div className="p-4 sm:p-5">
                  {/* Row 1: Status + Category + Date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full whitespace-nowrap ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      {proposal.job?.category && (
                        <span className="text-[9px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {proposal.job.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-light-text/20 font-medium shrink-0 mt-0.5">
                      {new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Row 2: Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-accent transition-colors tracking-tight line-clamp-1 mb-3">
                    {proposal.job?.title || 'Job Application'}
                  </h3>

                  {/* Row 3: Client left | level + duration right */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Left: client */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {proposal.job?.client?.avatar_url && (
                        <img src={proposal.job.client.avatar_url} className="w-4 h-4 rounded-full object-cover shrink-0" alt="" />
                      )}
                      <span className="text-[10px] text-slate-500 dark:text-light-text/40 font-medium truncate">
                        {proposal.job?.client?.name || 'Private Client'}
                      </span>
                    </div>
                    {/* Right: level + duration chips */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {proposal.job?.experience_level && (
                        <span className="text-[8px] text-slate-400 dark:text-light-text/30 font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full capitalize">
                          {proposal.job.experience_level}
                        </span>
                      )}
                      {(proposal.estimated_duration || proposal.job?.duration) && (
                        <span className="flex items-center gap-1 text-[8px] text-slate-400 dark:text-light-text/30 font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          <Clock size={8} />
                          {proposal.estimated_duration || proposal.job.duration}
                        </span>
                      )}
                      {proposal.connects_used > 0 && (
                        <span className="text-[8px] text-slate-400 dark:text-light-text/30 font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          {proposal.connects_used}c
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cover letter */}
                  {proposal.cover_letter && (
                    <p className="text-[10px] text-slate-400 dark:text-light-text/30 line-clamp-1 italic mb-3 leading-relaxed">
                      "{proposal.cover_letter}"
                    </p>
                  )}

                  {/* Row 5: Bid / Budget / Deadline — justify-between */}
                  <div className="flex items-end justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-start justify-between w-full sm:w-auto sm:justify-start sm:gap-4">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/20 mb-0.5">Your Bid</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-0.5">
                          <IndianRupee size={10} className="text-accent/60" />
                          {formatINR(proposal.proposed_rate || proposal.bid_amount).replace('₹', '')}
                        </p>
                      </div>
                      {proposal.job?.budget_amount && (
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/20 mb-0.5">Budget</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-light-text/40 flex items-center gap-0.5">
                            <IndianRupee size={9} className="text-slate-400 dark:text-light-text/20" />
                            {formatINR(proposal.job.budget_amount).replace('₹', '')}
                            {proposal.job.budget_type === 'hourly' ? '/hr' : ''}
                          </p>
                        </div>
                      )}
                      {proposal.job?.bid_deadline && (
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/20 mb-0.5">Deadline</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-light-text/40">
                            {new Date(proposal.job.bid_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                      <ChevronRight size={16} className="text-accent" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProposals;