import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../../lib/api';
import {
  FileText, CheckCircle, XCircle, Clock, MessageCircle, User, IndianRupee,
  ChevronDown, ChevronUp, Briefcase, Edit2, ChevronRight, ShieldCheck,
  Zap, AlertTriangle, AlertCircle, ShieldCheck as LowRiskIcon, Star,
  TrendingUp, Info, X, Shield, Lock
} from 'lucide-react';
import { formatINR } from '../../../../utils/currencyUtils';
import { getMyJobs, getMyProposals, updateProposalStatus } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Tabs from '../../../ui/Tabs';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';
import InfinityLoader from '../../../common/InfinityLoader';
import CustomDropdown from '../../../ui/CustomDropdown';
import { useRealtimeProposals } from '../../../../context/RealtimeContext';
import { useAuth } from '../../../../context/AuthContext';
import EscrowFundingModal from '../components/EscrowFundingModal';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
];

const USD_TO_INR = 92.74;

const Proposals = () => {

  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [matchData, setMatchData] = useState({});
  const [sortBy, setSortBy] = useState('match'); // 'match', 'price', 'date'
  const { wallet, refreshWallet } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const focusJobId = searchParams.get('job');

  // Escrow funding modal — auto-pops after hire
  const [escrowModal, setEscrowModal] = useState({ open: false, contractId: null, jobTitle: '', amount: 0, freelancerName: '', isTeam: false, teamMembers: [] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, proposalsRes] = await Promise.all([
        getMyJobs(),
        getMyProposals()
      ]);

      if (jobsRes.success) setJobs(jobsRes.data || []);
      if (proposalsRes.success) setProposals(proposalsRes.data || []);

      if (focusJobId) setExpandedJob(focusJobId);
      else if (jobsRes.data?.length > 0) setExpandedJob(jobsRes.data[0].id);

      // Fetch matches for all proposals
      if (proposalsRes.data?.length > 0) {
        proposalsRes.data.forEach(p => fetchMatch(p.id));
      }
    } catch (err) {
      toastApiError(err, 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatch = async (proposalId) => {
    try {
      const { data: res } = await api.get(`/api/proposals/${proposalId}/match`);
      if (res.success && res.data) {
        setMatchData(prev => ({ ...prev, [proposalId]: res.data }));
      }
    } catch (err) {
      console.error('Match fetch error', err);
    }
  };


  const handleStatusUpdate = async (proposalId, status, role = 'Freelancer', scope = '') => {
    setUpdatingId(proposalId);
    try {
      const res = await updateProposalStatus(proposalId, status, role, scope);
      if (res.success) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
        toast.success(status === 'ACCEPTED' ? `Hired as ${role}! Workspace mission assigned.` : 'Proposal rejected');

        if (status === 'ACCEPTED') {
          // Find the proposal to get contract details for escrow popup
          const hired = proposals.find(p => p.id === proposalId);
          const job = jobs.find(j => j.id === hired?.job_id);
          const jobTitle = job?.title || 'Project';
          const isTeam = job?.job_mode === 'team';

          const isFakeMode = import.meta.env.VITE_ESCROW_MODE === 'FAKE';
          if (!isFakeMode) {
            try {
              const contractRes = await api.get(`/api/contracts/by-job/${hired?.job_id}`);
              const contract = contractRes.data?.data || contractRes.data;

              if (isTeam) {
                // For team jobs: collect all accepted proposals for this job
                const acceptedProposals = proposals
                  .filter(p => p.job_id === hired?.job_id && (p.id === proposalId || p.status === 'ACCEPTED'))
                  .map(p => ({ name: p.freelancer?.name || 'Freelancer', amount: p.proposed_rate || 0, role: p.role?.title || 'Team Member' }));
                setEscrowModal({
                  open: true,
                  contractId: contract?.id || null,
                  jobTitle,
                  amount: acceptedProposals.reduce((sum, p) => sum + p.amount, 0),
                  freelancerName: null,
                  isTeam: true,
                  teamMembers: acceptedProposals,
                });
              } else {
                setEscrowModal({
                  open: true,
                  contractId: contract?.id || null,
                  jobTitle,
                  amount: hired?.proposed_rate || 0,
                  freelancerName: hired?.freelancer?.name || 'Freelancer',
                  isTeam: false,
                  teamMembers: [],
                });
              }
            } catch {
              // non-critical — just skip the modal
            }
          } else {
            logger.log('[Proposals] Skipping escrow modal — Auto-funding handled by backend in FAKE mode');
          }
        }

        // Refresh job counts and status after a successful hire
        await refreshWallet();
        loadData();
      }

    } catch (err) {
      toastApiError(err, 'Failed to update proposal');
    } finally {
      setUpdatingId(null);
      setRoleModal({ isOpen: false, proposal: null, role: '', scope: '' });
    }
  };

  const [roleModal, setRoleModal] = useState({ isOpen: false, proposal: null, role: '', scope: '' });
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const handleAIOptimize = async (currentRole, currentScope) => {
    if (!currentScope || currentScope.length < 5) {
      toast.error("Please enter a rough scope first");
      return;
    }
    setIsValidatingAI(true);
    try {
      const { data: aiRes } = await api.post('/api/ai/optimize-mission', {
        role: currentRole,
        category: roleModal.proposal?.job?.category,
        roughScope: currentScope
      });
      if (aiRes.success && aiRes.data) {
        setRoleModal(prev => ({ ...prev, scope: aiRes.data, role: currentRole }));
        toast.success("Mission optimized by AI");
      }
    } catch (err) {
      toast.error("AI service temporarily unavailable");
    } finally {
      setIsValidatingAI(false);
    }
  };


  // ── Real-time: new proposal arrives while client is on this page ───────────
  const handleNewProposal = useCallback((proposal) => {
    setProposals(prev => {
      if (prev.some(p => p.id === proposal.id)) return prev; // deduplicate
      return [proposal, ...prev];
    });
  }, []);

  const handleStatusChanged = useCallback(({ proposal_id, status }) => {
    setProposals(prev =>
      prev.map(p => p.id === proposal_id ? { ...p, status } : p)
    );
  }, []);

  useRealtimeProposals({
    onNewProposal: handleNewProposal,
    onStatusChanged: handleStatusChanged,
  });

  const filtered = proposals.filter(p => activeTab === 'all' || p.status === activeTab);

  // Group by Job, then by Role
  const grouped = {};
  const groupedByJob = {};
  filtered.forEach(p => {
    if (!grouped[p.job_id]) grouped[p.job_id] = [];
    grouped[p.job_id].push(p);

    if (!groupedByJob[p.job_id]) groupedByJob[p.job_id] = { job: p.job, roles: {} };
    const roleId = p.role_id || 'unassigned';
    if (!groupedByJob[p.job_id].roles[roleId]) {
      groupedByJob[p.job_id].roles[roleId] = { proposals: [] };
    }
    groupedByJob[p.job_id].roles[roleId].proposals.push(p);
  });


  // Calculate Best Bid / Avg per role for UI
  Object.keys(groupedByJob).forEach(jobId => {
    Object.keys(groupedByJob[jobId].roles).forEach(roleId => {
      const roleProps = groupedByJob[jobId].roles[roleId].proposals;

      // ENTERPRISE SORTING LOGIC
      roleProps.sort((a, b) => {
        if (sortBy === 'price') return (a.proposed_rate || 0) - (b.proposed_rate || 0);
        if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);

        // Default: Sort by Match Score
        const matchA = matchData[a.id]?.match_score || 0;
        const matchB = matchData[b.id]?.match_score || 0;
        if (matchA !== matchB) return matchB - matchA;

        // Fallback to reliability if scores tied
        return (b.freelancer?.reliability_score || 0) - (a.freelancer?.reliability_score || 0);
      });
    });
  });


  const getRiskLabel = (proposal, roleBudget) => {
    if (!roleBudget) return { label: 'Fair Bid', cls: 'bg-green-500/10 text-green-400 border-green-500/20' };
    const bid = Number(proposal.proposed_rate);
    const ratio = bid / roleBudget;
    if (ratio < 0.4) return { label: '🚨 Suspicious Bid (Low)', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    if (ratio > 1.5) return { label: '⚠ Overpriced', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    return { label: '✅ Fair Bid', cls: 'bg-green-500/10 text-green-400 border-green-500/20' };
  };

  const ProposalBadges = ({ match }) => {
    if (!match) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {match?.match_score >= 90 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-wider">
            <Star size={10} className="fill-amber-500" /> BEST MATCH
          </span>
        )}
        {match?.price_score >= 95 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-wider">
            <IndianRupee size={10} /> BEST PRICE
          </span>
        )}
        {match?.reliability_score >= 80 && (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black tracking-widest uppercase">
            <Zap size={10} className="fill-blue-500" /> CONNECT AI
          </span>
        )}
      </div>
    );
  };

  const MatchScoreDisplay = ({ proposalId }) => {
    const match = matchData[proposalId];
    if (!match) return null;

    return (
      <div className="relative group/score">
        <div className="w-12 h-12 rounded-full bg-accent/5 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
          <span className="text-lg font-black text-accent relative z-10 leading-none">{match.match_score}%</span>
          <span className="text-[7px] text-accent/40 font-bold uppercase tracking-tighter relative z-10 mt-0.5">Match</span>
        </div>

        {/* Tooltip breakdown */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-secondary border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all duration-300 z-50">
          <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <Zap size={12} className="text-accent" /> Score Breakdown
          </p>
          <div className="space-y-2">
            {[
              { label: 'Reliability Score', val: match.reliability_score, color: 'bg-blue-500', weight: '30%' },
              { label: 'Completion', val: match.completion_rate, color: 'bg-indigo-500', weight: '20%' },
              { label: 'Skills Match', val: Math.round(match.skills_match), color: 'bg-purple-500', weight: '20%' },
              { label: 'Risk Inverted', val: 100 - match.risk_score, color: 'bg-red-500', weight: '20%' },
              { label: 'Pricing Plan', val: match.price_score, color: 'bg-green-500', weight: '10%' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[9px] font-medium">
                  <span className="text-slate-900/50 dark:text-white/50">{item.label} <span className="text-slate-900/20 dark:text-white/20">({item.weight})</span></span>
                  <span className="text-slate-950/80 dark:text-white/80">{item.val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] text-slate-900/40 dark:text-white/40 font-bold uppercase tracking-wider">Data Confidence</span>
            <span className="text-xs font-black text-accent">{Math.round(match.confidence_score * 100)}%</span>
          </div>
        </div>
      </div>
    );
  };





  const STATUS_CONFIG = {
    PENDING: { icon: <Clock size={12} />, cls: 'bg-amber-500/10 text-amber-500' },
    ACCEPTED: { icon: <CheckCircle size={12} />, cls: 'bg-emerald-500/10 text-emerald-500' },
    REJECTED: { icon: <XCircle size={12} />, cls: 'bg-rose-500/10 text-rose-500' },
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6 pb-12 space-y-6">
      <SectionHeader
        title="Proposals"
        subtext={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} received`}
      />

      {/* Tabs and Global Sort */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-4 mb-6">
        <Tabs
          tabs={STATUS_TABS.map(tab => ({
            ...tab,
            count: tab.key === 'all' ? proposals.length : proposals.filter(p => p.status === tab.key).length
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="-mx-4 px-4 sm:mx-0 sm:px-0 sm:w-auto"
        />

        <div className="self-start sm:self-auto shrink-0 w-[140px]">
          <CustomDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { label: 'Best Match', value: 'match' },
              { label: 'Price', value: 'price' },
              { label: 'Recent', value: 'date' }
            ]}
            variant="glass"
            fullWidth={true}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><InfinityLoader/></div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No jobs posted yet"
          action={
            <Button onClick={() => navigate('/client/post-job')} variant="ghost" className="text-accent hover:text-accent mt-2">
              Post a job to get proposals →
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {jobs.map(job => {
              const jobProposals = (grouped[job.id] || []).filter(p => activeTab === 'all' || p.status === activeTab);
              if (activeTab !== 'all' && jobProposals.length === 0) return null;
              const isExpanded = expandedJob === job.id;
              return (
                <Card key={job.id} padding="p-0" className="bg-transparent overflow-hidden">
                  <button onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-accent/5 transition gap-4 text-left">
                    <p className="text-slate-950 dark:text-white font-medium truncate flex-1">{job?.title || 'Job'}</p>
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <span className="shrink-0 bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold">{jobProposals.length} proposals</span>
                      <div className="shrink-0 flex items-center justify-center">
                        {isExpanded ? <ChevronUp size={18} className="text-slate-900/40 dark:text-white/40" /> : <ChevronDown size={18} className="text-slate-900/40 dark:text-white/40" />}
                      </div>
                    </div>
                  </button>


                  {isExpanded && (
                    <>
                      <div className="border-t border-white/10">
                        {Object.keys(groupedByJob[job.id]?.roles || {}).length === 0 ? (


                          <div className="px-5 py-8 text-center text-slate-900/40 dark:text-white/40 text-sm">No proposals received.</div>
                        ) : (
                          Object.keys(groupedByJob[job.id].roles).map(roleId => {
                            const group = groupedByJob[job.id].roles[roleId];
                            const roleInfo = group.proposals[0]?.role || job.roles?.find(r => r.id === roleId) || { title: 'General Role', budget: job.budget_amount };
                            const bestBid = Math.min(...group.proposals.map(p => Number(p.proposed_rate)));
                            const avgBid = group.proposals.reduce((a, b) => a + Number(b.proposed_rate), 0) / group.proposals.length;


                            return (
                              <div key={roleId} className="border-b border-white/5 last:border-0">
                                <div className="bg-white/[0.01] px-4 sm:px-6 py-2 sm:py-3 flex flex-row items-center justify-between gap-2 sm:gap-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                                    <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-accent truncate">{roleInfo.title}</h4>
                                    <span className="w-fit bg-slate-900/5 dark:bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[8px] font-bold text-slate-900/40 dark:text-white/40 uppercase tracking-widest whitespace-nowrap">
                                      {roleInfo.filled_positions || 0} / {roleInfo.positions || 1} Hired
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                                    <div className="text-right">
                                      <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-slate-900/30 dark:text-white/20 block">Best Offer</span>
                                      <span className="text-[9px] sm:text-xs font-bold text-green-500 dark:text-green-400">₹{formatINR(bestBid).replace('₹', '')}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-slate-900/30 dark:text-white/20 block">Avg. Bid</span>
                                      <span className="text-[9px] sm:text-xs font-bold text-slate-950/60 dark:text-white/60">₹{formatINR(avgBid).replace('₹', '')}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Role Proposals */}
                                <div className="divide-y divide-white/5">
                                  {group.proposals.map(proposal => {
                                    const sc = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.PENDING;
                                    const risk = getRiskLabel(proposal, roleInfo.budget);

                                    return (
                                      <div key={proposal.id} className="group/card px-6 py-6 flex flex-col gap-6 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] relative overflow-hidden">

                                        {/* TOP SECTION: Freelancer Profile & Match */}
                                        <div className="flex items-center justify-between gap-4 sm:gap-6">
                                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                            <div className="shrink-0 relative group/avatar">
                                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-black overflow-hidden relative">
                                                {proposal.freelancer?.avatar_url ? (
                                                  <img src={proposal.freelancer.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                  (proposal.freelancer?.name || '?')[0]
                                                )}
                                                {proposal.freelancer?.is_verified && (
                                                  <div className="absolute -bottom-1 -right-1 p-1 bg-accent rounded-full ring-2 ring-primary shadow-lg">
                                                    <ShieldCheck size={11} className="text-white fill-white/10" />
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                                <p onClick={() => navigate(`/freelancer/${proposal.freelancer_id}`)} className="text-slate-950 dark:text-white font-black text-base sm:text-lg hover:text-accent cursor-pointer transition-colors truncate tracking-tight">
                                                  {proposal.freelancer?.name || 'Freelancer'}
                                                </p>
                                                <div className="flex justify-end sm:block">
                                                  <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${sc.cls}`}>
                                                    {sc.icon} {proposal.status}
                                                  </span>
                                                </div>
                                              </div>
                                              <ProposalBadges match={matchData[proposal.id]} />
                                            </div>
                                          </div>

                                          <MatchScoreDisplay proposalId={proposal.id} />
                                        </div>

                                        {/* MIDDLE SECTION: Cover Letter (Full Width) */}
                                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
                                          <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03]">
                                            <MessageCircle size={12} className="text-accent shrink-0" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">Cover Letter</span>
                                          </div>
                                          <div className="px-5 py-5 max-h-64 overflow-y-auto scrollbar-none">
                                            <p className="text-slate-800 dark:text-white/90 text-sm leading-7 whitespace-pre-wrap">
                                              {proposal.cover_letter || <span className="text-slate-400 dark:text-white/30 italic">No message provided.</span>}
                                            </p>
                                          </div>
                                        </div>

                                        {/* BOTTOM SECTION: AI Insights & Bid Actions */}
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-1">
                                          <div className="flex-1 w-full lg:w-auto">
                                            {matchData[proposal.id]?.ai_summary && (
                                              <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl animate-in slide-in-from-left-2 duration-500 max-w-2xl">
                                                <div className="p-1.5 bg-accent/10 rounded-full shrink-0">
                                                  <Zap size={14} className="text-accent fill-accent/20" />
                                                </div>
                                                <div>
                                                  <p className="text-[13px] text-slate-700 dark:text-white/70 leading-relaxed font-medium">
                                                    {matchData[proposal.id].ai_summary}
                                                  </p>
                                                  <div className="flex items-center gap-2 mt-1.5">
                                                    <TrendingUp size={10} className="text-accent" />
                                                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">AI VERDICT: {matchData[proposal.id].ai_verdict}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full lg:w-auto justify-between lg:justify-end">
                                            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 border-b sm:border-0 border-white/5 pb-2 sm:pb-0">
                                              <span className="text-[8px] sm:text-[10px] text-slate-900/40 dark:text-white/30 uppercase font-black tracking-widest">Proposed Bid:</span>
                                              <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tighter">
                                                ₹{formatINR(proposal.proposed_rate).replace('₹', '')}
                                              </span>
                                            </div>

                                            {proposal.status === 'PENDING' && (
                                              <div className="flex items-center justify-end w-full sm:w-auto gap-1.5 sm:gap-3">
                                                <button
                                                  onClick={() => handleStatusUpdate(proposal.id, 'REJECTED')}
                                                  className="p-1.5 sm:p-2 text-slate-400 dark:text-white/20 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all duration-200"
                                                  title="Reject Proposal"
                                                >
                                                  <X size={18} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                </button>
                                                <button
                                                  onClick={() => navigate(`/client/messages?userId=${proposal.freelancer_id}`)}
                                                  className="px-3 sm:px-5 py-1.5 sm:py-2 bg-accent text-white border border-accent rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
                                                >
                                                  Message
                                                </button>
                                                <Button
                                                  onClick={() => setRoleModal({ isOpen: true, proposal: proposal, role: roleInfo.title, scope: '' })}
                                                  disabled={updatingId === proposal.id}
                                                  className="!rounded-full px-4 sm:px-6 py-1.5 sm:py-2 bg-green-500 text-white hover:bg-green-600 font-black text-[8px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                                                >
                                                  Fund Now
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="bg-transparent border-t border-white/5 px-5 py-5">
                        <div className="flex items-center justify-between mb-4 gap-2">
                          <h4 className="text-slate-950/70 dark:text-white/70 text-xs sm:text-sm font-semibold tracking-wide uppercase whitespace-nowrap">Job Posting Details</h4>
                          <button
                            onClick={() => navigate(`/client/jobs`)}
                            className="text-accent text-[10px] sm:text-xs hover:underline flex items-center gap-1 sm:gap-1.5 font-medium shrink-0"
                          >
                            Manage in My Jobs <ChevronRight size={14} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                        <div className="bg-transparent rounded-2xl sm:p-6 space-y-4">
                          {job?.description && (
                            <p className="text-slate-900/60 dark:text-white/50 text-sm leading-relaxed">{job.description}</p>
                          )}
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-y-4 gap-x-2 sm:gap-5 pt-2">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold tracking-wider">Budget</p>
                              <p className="text-slate-900/70 dark:text-white/70 text-xs flex items-center gap-1">
                                <IndianRupee size={12} className="text-accent shrink-0" />
                                {job?.budget_amount > 0
                                  ? formatINR(job.budget_amount)
                                  : formatINR(job.roles?.reduce((acc, r) => acc + (r.budget || 0), 0) || 0)}
                                <span className="opacity-50 font-normal">({job?.budget_type || 'fixed'})</span>
                              </p>
                            </div>
                            {job?.duration && (
                              <div className="space-y-1 text-right sm:text-left">
                                <p className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold tracking-wider">Duration</p>
                                <p className="text-slate-900/70 dark:text-white/70 text-xs flex items-center justify-end sm:justify-start gap-1">
                                  <Clock size={12} className="text-accent shrink-0" />
                                  {job.duration}
                                </p>
                              </div>
                            )}
                            {job?.category && (
                              <div className="space-y-1 col-span-2 sm:col-span-1">
                                <p className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold tracking-wider">Category</p>
                                <p className="text-slate-900/70 dark:text-white/70 text-xs">{job.category}</p>
                              </div>
                            )}
                            {job?.bid_deadline && (
                              <div className="space-y-1 col-span-2 sm:col-span-1">
                                <p className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold tracking-wider">Bidding Deadline</p>
                                <p className={`text-xs flex items-center gap-1 font-medium ${new Date() > new Date(job.bid_deadline) ? 'text-red-400' : 'text-slate-950 dark:text-white'}`}>
                                  <Clock size={12} className={`shrink-0 ${new Date() > new Date(job.bid_deadline) ? 'text-red-400' : 'text-accent'}`} />
                                  {new Date() > new Date(job.bid_deadline) ? 'Closed' : new Date(job.bid_deadline).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          {job?.skills?.length > 0 && (
                            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                              {job.skills.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-accent/5 text-accent/70 rounded-full text-[10px]">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          <RoleAssignmentModal
            isOpen={roleModal.isOpen}
            proposal={roleModal.proposal}
            role={roleModal.role}
            scope={roleModal.scope}
            setRole={(val) => setRoleModal(prev => ({ ...prev, role: val }))}
            setScope={(val) => setRoleModal(prev => ({ ...prev, scope: val }))}
            handleAIOptimize={handleAIOptimize}
            isValidatingAI={isValidatingAI}
            wallet={wallet}
            onClose={() => setRoleModal({ isOpen: false, proposal: null, role: '', scope: '' })}
            onConfirm={(role, scope) => handleStatusUpdate(roleModal.proposal.id, 'ACCEPTED', role, scope)}
            isSubmitting={updatingId === roleModal.proposal?.id}
          />

          <EscrowFundingModal
            isOpen={escrowModal.open}
            contractId={escrowModal.contractId}
            jobTitle={escrowModal.jobTitle}
            amount={escrowModal.amount}
            freelancerName={escrowModal.freelancerName}
            isTeam={escrowModal.isTeam}
            teamMembers={escrowModal.teamMembers}
            onClose={() => setEscrowModal(prev => ({ ...prev, open: false }))}
          />


          {/* Page Footer Navigation */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex justify-center sm:justify-end">
            <button
              onClick={() => navigate('/client/jobs')}
              className="group flex items-center gap-3 px-6 py-3 bg-transparent border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-950 dark:text-white rounded-full transition"
            >
              <div className="p-2 transition">
                <Briefcase size={20} className="text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Manage All Jobs</p>
                <p className="text-slate-900/40 dark:text-white/40 text-[10px]">View, edit, or close your other listings</p>
              </div>
              <ChevronRight size={18} className="ml-4 text-slate-900/20 dark:text-white/20 group-hover:text-slate-950 dark:group-hover:text-white transition" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RoleAssignmentModal = ({
  isOpen,
  onClose,
  proposal,
  onConfirm,
  isSubmitting,
  role,
  scope,
  setRole,
  setScope,
  handleAIOptimize,
  isValidatingAI,
  wallet
}) => {
  if (!isOpen) return null;

  const isDemo = import.meta.env.VITE_ESCROW_MODE === 'FAKE';
  const bidAmount = proposal?.proposed_rate || 0;
  const currentBalance = wallet?.balance || 0;
  const hasInsufficientFunds = isDemo && currentBalance < bidAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-secondary rounded-sm p-8 max-w-xl w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-y-auto max-h-[95vh] relative scrollbar-none">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="relative group/logo">
              <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover/logo:opacity-100 transition duration-1000"></div>
              <img
                src="/Icons/AI-Connect.png"
                className="w-14 h-14 object-contain block dark:hidden relative z-10"
                alt="Logo"
              />
              <img
                src="/Icons/White-AI-Connect.png"
                className="w-14 h-14 object-contain hidden dark:block relative z-10"
                alt="Logo"
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-0.5">AI Mission Control</h3>
              <p className="text-slate-500 dark:text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Operational parameters & scope</p>
            </div>
          </div>
          <div className="hidden sm:flex px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">
            v2.4 Secure
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 ml-1">Assigned Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. lead designer, full-stack dev..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-sm px-5 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none font-medium text-xs"
            />
          </div>

          <div className="space-y-3 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 ml-1">Mission Scope (Mandatory)</label>
              <button
                onClick={() => handleAIOptimize(role, scope)}
                disabled={isValidatingAI}
                className="text-[9px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2 bg-accent/5 hover:bg-accent/10 sm:px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              >
                {isValidatingAI ? <InfinityLoader/> : <Zap size={10} className="fill-accent" />}
                AI Optimize
              </button>
            </div>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={4}
              placeholder="Explicitly define the deliverables and responsibilities..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-sm px-5 py-5 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none leading-relaxed font-medium"
            />
          </div>

          {/* Connect Trust & Security Section (FAKE MODE ONLY) */}
          {isDemo && (
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-sm p-6 space-y-5 relative overflow-hidden group/security">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/security:opacity-[0.05] transition-opacity">
                <Shield size={80} />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Shield size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">Project Escrow Security</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-amber-500/10 text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                  Verified Protection
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-5 border-y border-slate-100 dark:border-white/5 relative z-10">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Escrow Deposit</p>
                  <p className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{formatINR(bidAmount)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Demo Balance</p>
                  <p className={`text-xl font-black tracking-tighter ${hasInsufficientFunds ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatINR(currentBalance)}
                  </p>
                </div>
              </div>

              <div className="relative z-10">
                {hasInsufficientFunds ? (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[9px] text-rose-500 font-bold uppercase tracking-wider">
                    <AlertCircle size={14} />
                    <span>Insufficient demo connects. Reset wallet via Dashboard.</span>
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500 dark:text-white/30 font-medium leading-relaxed italic opacity-80">
                    Connect will securely hold {formatINR(bidAmount)} in a restricted vault. Funds release only upon your explicit approval of milestones.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-full text-slate-500 dark:text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <Button
              onClick={() => {
                if (!scope.trim() || scope.trim().length < 10) {
                  toast.error("Mission scope must be at least 10 characters");
                  return;
                }
                onConfirm(role, scope);
              }}
              disabled={hasInsufficientFunds}
              isLoading={isSubmitting}
              className={`rounded-full h-auto py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${hasInsufficientFunds ? 'opacity-20 saturate-0 grayscale' : 'bg-green-500 text-black shadow-lg shadow-green-500/10'}`}
            >
              {isDemo ? <><Lock size={12} /> Fund & Launch Mission</> : "Launch Mission"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Proposals;