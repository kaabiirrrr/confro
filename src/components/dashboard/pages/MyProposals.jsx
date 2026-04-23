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
      case 'ACCEPTED': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'PENDING': return 'text-blue-600 dark:text-accent border-accent/20 bg-accent/5';
      case 'REJECTED': return 'text-rose-600 dark:text-red-400 border-red-500/20 bg-red-500/5';
      default: return 'text-slate-500 dark:text-white/20 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5';
    }
  };

  const handleManualRefresh = () => {
    clearCache();
    fetchProposals(true);
  };

  return (
    <div className="w-[1480px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-1 mb-4 sm:mb-8">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">My Proposals</h1>
          <p className="text-slate-500 dark:text-light-text/60 text-[11px] sm:text-[13px]">Track and manage your submitted job applications.</p>
        </div>
        <button onClick={handleManualRefresh}
          className="flex items-center justify-center gap-2 px-3 h-8 sm:h-9 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-[0.1em] text-slate-500 dark:text-white/40 hover:text-accent transition-all hover:bg-accent/5 uppercase bg-none group w-fit">
          <RefreshCw size={11} className={`transition-all duration-700 ${loading ? 'animate-spin text-accent' : 'text-slate-300 dark:text-white/20 group-hover:text-accent'}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs - Minimal with Blue Underline & All-Caps */}
      <div className="flex gap-10 text-[11px] font-bold uppercase tracking-[0.2em] border-b border-white/5 overflow-x-auto no-scrollbar mb-8">
        {['Active', 'Archived', 'Offers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-accent' : 'text-slate-400 dark:text-light-text/20 hover:text-slate-950 dark:hover:text-white'
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
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-200 dark:text-white/10" />
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
                className="inline-flex items-center gap-2 px-5 h-9 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-accent/90 transition shadow-lg shadow-accent/20 active:scale-95"
              >
                Browse Jobs
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            {filteredProposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group p-5 bg-transparent hover:bg-accent/[0.03] border-l-[3px] border-l-transparent hover:border-l-accent transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/freelancer/jobs/${proposal.job_id}`)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Left: Status + Title + Meta */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Status + Date */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] border rounded-lg ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-light-text/20 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={11} className="text-accent/40" />
                        {new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-accent transition-colors tracking-tight line-clamp-1">
                      {proposal.job?.title || 'Job Application'}
                    </h3>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                      {/* Client */}
                      <div className="flex items-center gap-1.5">
                        {proposal.job?.client?.avatar_url && (
                          <img src={proposal.job.client.avatar_url} className="w-4 h-4 rounded-full object-cover" alt="" />
                        )}
                        <span className="text-[10px] text-light-text/30 font-bold uppercase tracking-widest">Client:</span>
                        <span className="text-[11px] text-light-text/60 font-medium">{proposal.job?.client?.name || 'Private Client'}</span>
                      </div>
                      {/* Category */}
                      {proposal.job?.category && (
                        <span className="text-[10px] text-light-text/30 font-bold uppercase tracking-widest">{proposal.job.category}</span>
                      )}
                      {/* Experience */}
                      {proposal.job?.experience_level && (
                        <span className="text-[10px] text-light-text/30 font-bold uppercase tracking-widest capitalize">{proposal.job.experience_level}</span>
                      )}
                      {/* Duration */}
                      {proposal.estimated_duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-accent/30" />
                          <span className="text-[10px] text-light-text/40 font-medium">{proposal.estimated_duration}</span>
                        </div>
                      )}
                      {/* Bid Deadline */}
                      {proposal.job?.bid_deadline && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-light-text/20 font-bold uppercase tracking-widest">Deadline:</span>
                          <span className="text-[10px] text-light-text/50">{new Date(proposal.job.bid_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Cover letter preview */}
                    {proposal.cover_letter && (
                      <p className="text-[11px] text-light-text/30 line-clamp-1 italic">
                        "{proposal.cover_letter}"
                      </p>
                    )}
                  </div>

                  {/* Right: Bid + Job Budget */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[9px] text-light-text/20 font-bold uppercase tracking-[0.2em]">Your Bid:</span>
                      <span className="text-xl font-bold text-white tracking-tight flex items-center gap-0.5">
                        <IndianRupee size={14} className="text-accent/60" />
                        {formatINR(proposal.proposed_rate || proposal.bid_amount).replace('₹', '')}
                      </span>
                    </div>
                    {proposal.job?.budget_amount && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[9px] text-light-text/20 font-bold uppercase tracking-[0.2em]">Budget:</span>
                        <span className="text-sm font-semibold text-light-text/40 flex items-center gap-0.5">
                          <IndianRupee size={11} className="text-light-text/20" />
                          {formatINR(proposal.job.budget_amount).replace('₹', '')}
                          {proposal.job.budget_type === 'hourly' ? '/hr' : ''}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-all duration-300 mt-1">
                      <div className="w-7 h-7 flex items-center justify-center bg-accent/10 rounded-lg text-accent">
                        <ChevronRight size={14} />
                      </div>
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