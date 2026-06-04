import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, MessageSquare, Clock, CheckCircle,
  AlertCircle, Users, Activity, Edit2, Trash2, Crown, Zap,
  Video, Layers, DollarSign, TrendingUp, TrendingDown, Cpu,
  Terminal, Box, FileText, Star, CheckCircle2, XCircle
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import {
  getMyContracts, getJobWorkspace, updateJobMember, removeJobMember,
  getSkimmerOverview, getSkimmerTasks, getSkimmerInsights, regenerateSkimmerPlan,
  fundFakeEscrow, releaseFakeEscrow, getFakeEscrowTransactions,
  createProjectReview, getContractReviews
} from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import { useAuth } from '../../../context/AuthContext';
import DeadlineRiskCard from '../common/DeadlineRiskCard';
import WorkDeliverySystem from '../deliveries/WorkDeliverySystem';
import EditMemberModal from '../client/pages/EditMemberModal';
import NotificationModal from '../../ui/NotificationModal';
import InputModal from '../../common/InputModal';

/* ─── Status badge ─── */
const STATUS_CONFIG = {
  ACTIVE:      { label: 'Active',      cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  COMPLETED:   { label: 'Completed',   cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      Icon: CheckCircle2 },
  PENDING:     { label: 'Pending',     cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
  DISPUTED:    { label: 'Disputed',    cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: AlertCircle },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-white/60 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${cfg.cls}`}>
      <cfg.Icon size={13} />{cfg.label}
    </span>
  );
};

/* ─── Info Row (matches DirectContractDetailPage) ─── */
const InfoRow = ({ icon: Icon, imgSrc, label, value }) => (
  <div className="flex items-center gap-2.5">
    {imgSrc ? (
      <img src={imgSrc} alt={label} className="w-4 h-4 object-contain shrink-0" />
    ) : Icon ? (
      <Icon size={13} className="text-white/30 shrink-0" />
    ) : null}
    <div className="min-w-0 flex-1">
      <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">{label}</p>
      <p className="text-white text-xs font-medium mt-0.5 break-all sm:break-normal">{value || '—'}</p>
    </div>
  </div>
);

/* ─── Main Component ─── */
const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role: userRole, user, wallet, refreshWallet } = useAuth();
  const isClient = userRole === 'CLIENT';

  const [contract, setContract]   = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editModal, setEditModal]   = useState({ isOpen: false, member: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null });

  const [skimmer, setSkimmer] = useState({ overview: null, tasks: [], insights: null, loading: true });
  const [fakeEscrow, setFakeEscrow] = useState({ transactions: [], loading: true });
  const [fundModal, setFundModal]     = useState({ isOpen: false });
  const [releaseModal, setReleaseModal] = useState({ isOpen: false, tx: null });

  const [reviewState, setReviewState] = useState({
    existingReviews: [], rating: 0, hoverRating: 0,
    comment: '', submitting: false, submitted: false, loaded: false
  });

  const fetchContractReviews = useCallback(async () => {
    try {
      const res = await getContractReviews(id);
      if (res.success) {
        const myReview = (res.data || []).find(r => r.reviewer_id === user?.id);
        setReviewState(prev => ({
          ...prev,
          existingReviews: res.data || [],
          submitted: !!myReview,
          rating: myReview?.rating || 0,
          comment: myReview?.comment || '',
          loaded: true
        }));
      }
    } catch {
      setReviewState(prev => ({ ...prev, loaded: true }));
    }
  }, [id, user?.id]);

  const handleSubmitReview = async () => {
    if (reviewState.rating < 1) { toast.error('Please select a rating'); return; }
    setReviewState(prev => ({ ...prev, submitting: true }));
    try {
      const res = await createProjectReview({ contract_id: id, rating: reviewState.rating, comment: reviewState.comment });
      if (res.success) {
        toast.success('Review submitted successfully!');
        setReviewState(prev => ({ ...prev, submitted: true, submitting: false }));
        fetchContractReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
      setReviewState(prev => ({ ...prev, submitting: false }));
    }
  };

  const fetchFakeEscrow = useCallback(async () => {
    if (import.meta.env.VITE_ESCROW_MODE !== 'FAKE') return;
    try {
      const res = await getFakeEscrowTransactions(id);
      if (res.success) setFakeEscrow({ transactions: res.data, loading: false });
    } catch { setFakeEscrow(prev => ({ ...prev, loading: false })); }
  }, [id]);

  const fetchWorkspaceData = useCallback(async (jobId) => {
    try {
      const res = await getJobWorkspace(jobId);
      if (res.success) setWorkspace(res.data);
    } catch (err) {
      console.error('Failed to load job workspace:', err);
    }

    try {
      const [overview, tasks, insights] = await Promise.all([
        getSkimmerOverview(jobId).catch(err => {
          console.error('Failed to fetch skimmer overview:', err);
          return null;
        }),
        getSkimmerTasks(jobId).catch(err => {
          console.error('Failed to fetch skimmer tasks:', err);
          return [];
        }),
        getSkimmerInsights(jobId).catch(err => {
          console.error('Failed to fetch skimmer insights:', err);
          return null;
        })
      ]);
      setSkimmer({
        overview: overview?.data ?? overview ?? null,
        tasks: tasks?.data ?? tasks ?? [],
        insights: insights?.data ?? insights ?? null,
        loading: false
      });
    } catch {
      setSkimmer(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await getMyContracts();
      if (response.success) {
        const foundContract = response.data.find(c => c.id === id);
        if (foundContract) {
          setContract(foundContract);
          fetchWorkspaceData(foundContract.job_id);
          fetchFakeEscrow();
        } else {
          toast.error('Contract not found');
          navigate(isClient ? '/client/contracts' : '/freelancer/contracts');
        }
      }
    } catch { toast.error('Failed to load project details'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContractDetails(); }, [id]);
  useEffect(() => { if (contract?.status === 'COMPLETED') fetchContractReviews(); }, [contract?.status, fetchContractReviews]);

  const handleMemberUpdate = async (memberId, updates) => {
    try {
      const res = await updateJobMember(contract.job_id, memberId, updates);
      if (res.success) { toast.success('Member updated'); fetchWorkspaceData(contract.job_id); return res; }
    } catch { toast.error('Failed to update member'); return { success: false }; }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const res = await removeJobMember(contract.job_id, memberId);
      if (res.success) { toast.success('Member removed'); fetchWorkspaceData(contract.job_id); }
    } catch { toast.error('Failed to remove member'); }
    finally { setDeleteModal({ isOpen: false, memberId: null }); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader />
        <p className="text-white/40 animate-pulse text-xs font-bold uppercase tracking-widest">Loading workspace...</p>
      </div>
    );
  }
  if (!contract) return null;

  const contractJob      = contract.job || contract.jobs?.[0] || contract.jobs || {};
  const freelancers = workspace?.members || [];
  const analytics   = workspace?.analytics || [];
  const activity    = workspace?.activity || [];

  const freelancerName   = contract.freelancer?.name || contract.profiles?.name || 'Freelancer';
  const freelancerAvatar = contract.freelancer?.avatar_url || contract.profiles?.avatar_url || null;
  const freelancerTitle  = contract.freelancer?.title || contract.profiles?.title || null;
  const contractTitle    = contractJob.title || contract.title || 'Project Workspace';
  const isActive = ['ACTIVE', 'IN_PROGRESS'].includes(contract.status);
  const canAct   = contract && !['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(contract.status);

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors mb-2 sm:mb-4"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">{contractTitle}</h1>
          <div className="flex items-center justify-between mt-1 md:block">
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">
              {contractJob.project_type === 'HOURLY' ? 'Hourly Project' : 'Fixed Price Project'}
              {' · '}ID: {contract.id?.substring(0, 8).toUpperCase()}
            </p>
            <span className="md:hidden transform scale-90 origin-right"><StatusBadge status={contract.status} /></span>
          </div>
        </div>
        <span className="hidden md:inline-flex"><StatusBadge status={contract.status} /></span>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* ── LEFT (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Freelancer Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              {freelancerAvatar ? (
                <img src={freelancerAvatar} alt={freelancerName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white/5" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-bold ring-2 ring-white/5">
                  {freelancerName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-white text-sm">{freelancerName}</p>
                {freelancerTitle && <p className="text-white/40 text-[10px] font-medium mt-0.5">{freelancerTitle}</p>}
                {isClient && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
                      <Users size={10} className="text-accent/60" /> {freelancers.length}/10 members
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/messages')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition"
              >
                Message
              </button>
              {isActive && (
                <button
                  onClick={() => navigate(`/meeting/create?projectId=${contract.job_id}&clientId=${contract.client_id}&freelancerId=${contract.freelancer_id}`)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest hover:bg-blue-600/20 transition"
                >
                  Meeting
                </button>
              )}
            </div>
          </div>

          {/* Skimmer Co-Pilot */}
          <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Cpu size={15} className="text-accent" />
                  <h3 className="text-sm font-bold text-white">Skimmer Co-Pilot</h3>
                </div>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">Autonomous Execution Analytics Engine</p>
              </div>
              {isClient && (
                <button
                  onClick={async () => {
                    setRefreshing(true);
                    await regenerateSkimmerPlan(contract.job_id);
                    await fetchWorkspaceData(contract.job_id);
                    setRefreshing(false);
                    toast.success('AI Mission Plan Regenerated');
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent/90 rounded-full text-[9px] font-black uppercase tracking-widest transition shrink-0"
                >
                  {refreshing ? 'Generating...' : skimmer.overview?.health_score ? 'Regenerate Plan' : 'Generate AI Plan'}
                </button>
              )}
            </div>

            {/* Health ring + metrics */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="64" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                  <circle cx="72" cy="72" r="64" fill="transparent" stroke="currentColor" strokeWidth="10"
                    strokeDasharray={402} strokeDashoffset={402 - (402 * (skimmer.overview?.health_score || 0)) / 100}
                    strokeLinecap="round" className="text-accent transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white tracking-tighter">{skimmer.overview?.health_score || 0}%</span>
                  <div className={`flex items-center gap-1 mt-0.5 text-[9px] font-black uppercase tracking-widest ${(skimmer.overview?.change_value || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(skimmer.overview?.change_value || 0) >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(skimmer.overview?.change_value || 0)} last 24h
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full space-y-5">
                {!skimmer.overview?.health_score && !skimmer.loading ? (
                  <div className="py-6 text-center border border-dashed border-white/5 rounded-xl">
                    <Cpu size={24} className="text-white/10 mx-auto mb-2" />
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No AI data yet</p>
                    <p className="text-white/10 text-[10px] mt-1">Click "Generate AI Plan" to initialize</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Success Probability', value: (skimmer.overview?.success_probability || 0) * 100, color: 'bg-emerald-500' },
                      { label: 'Resource Efficiency', value: (skimmer.overview?.team_efficiency || 0) * 100, color: 'bg-blue-500' },
                    ].map(m => (
                      <div key={m.label} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white/40">{m.label}</span>
                          <span className="text-white">{Math.round(m.value)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {skimmer.insights && (
                  <p className="text-xs text-white/50 leading-relaxed border-t border-white/5 pt-4">
                    {skimmer.insights.summary || 'Analyzing project patterns for optimal workflow suggestions...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mission Breakdown */}
          <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 gap-3">
              <div className="min-w-0">
                <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">Mission Breakdown & Weights</h3>
                <p className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em] mt-0.5">Autonomous Role-Based Task Evaluation</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-black text-accent uppercase tracking-widest whitespace-nowrap">Live Sync v{skimmer.tasks[0]?.version || 1}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(skimmer.tasks.reduce((acc, t) => {
                const role = t.role || 'Unassigned';
                if (!acc[role]) acc[role] = [];
                acc[role].push(t);
                return acc;
              }, {})).map(([role, roleTasks]) => (
                <div key={role} className="p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{role}</h4>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-white/40">{roleTasks.length} tasks</span>
                  </div>
                  <div className="space-y-2">
                    {roleTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-400/20' : 'bg-transparent border-white/10'}`} />
                        <span className={`text-[11px] font-medium flex-1 ${t.status === 'completed' ? 'text-white/30 line-through' : 'text-white/70'}`}>{t.title}</span>
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-tighter">W:{t.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {skimmer.tasks.length === 0 && (
                <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                  <Box size={28} className="text-white/10 mb-3" />
                  <p className="text-white/20 text-xs font-black uppercase tracking-widest text-center">No tasks yet — AI plan will generate once work begins</p>
                </div>
              )}
            </div>
          </div>

          {/* Work Delivery System */}
          <WorkDeliverySystem contractId={id} jobId={contract.job_id} isClient={isClient} />

          {/* Activity Log (Client Only) */}
          {isClient && activity.length > 0 && (
            <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm">
              <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                <Activity size={12} className="text-accent" /> Workspace Activity
              </h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                {activity.map(log => (
                  <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">
                        <span className="text-accent font-bold uppercase tracking-tighter mr-1">{log.actor?.name}:</span>
                        {log.action_type.replace('_', ' ')} {log.new_value ? `to "${log.new_value}"` : ''}
                      </p>
                      <p className="text-[10px] text-white/20 font-bold mt-0.5 uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Panel (Completed contracts) */}
          {contract.status === 'COMPLETED' && (
            <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    <h3 className="text-sm font-bold text-white">Project Feedback</h3>
                  </div>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] mt-0.5">Rate your experience</p>
                </div>
                {reviewState.submitted && (
                  <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle size={11} /> Review Submitted
                  </span>
                )}
              </div>

              {reviewState.submitted ? (
                <div className="space-y-3">
                  {reviewState.existingReviews.map(review => (
                    <div key={review.id} className="p-4 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        {review.reviewer?.avatar_url ? (
                          <img src={review.reviewer.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                            {review.reviewer?.name?.[0] || '?'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white font-semibold">{review.reviewer?.name || 'User'}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />)}
                        </div>
                      </div>
                      {review.comment && <p className="text-xs text-white/50 italic pl-10">"{review.comment}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">How was your experience?</p>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button"
                          onMouseEnter={() => setReviewState(p => ({ ...p, hoverRating: star }))}
                          onMouseLeave={() => setReviewState(p => ({ ...p, hoverRating: 0 }))}
                          onClick={() => setReviewState(p => ({ ...p, rating: star }))}
                          className="transition-all duration-200 hover:scale-125 active:scale-95"
                        >
                          <Star size={28} className={`transition-all duration-200 ${star <= (reviewState.hoverRating || reviewState.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
                        </button>
                      ))}
                    </div>
                    {reviewState.rating > 0 && (
                      <p className="text-xs text-yellow-400/80 font-bold uppercase tracking-widest">
                        {['', 'Poor', 'Below Average', 'Good', 'Very Good', 'Excellent'][reviewState.rating]}
                      </p>
                    )}
                  </div>
                  <textarea
                    value={reviewState.comment}
                    onChange={e => setReviewState(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience working on this project..."
                    rows={3} maxLength={500}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-accent/30 outline-none resize-none transition-all"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewState.submitting || reviewState.rating < 1}
                    className={`w-full py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewState.rating >= 1 ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 active:scale-[0.98]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                  >
                    {reviewState.submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <>Submit Review</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT (1/3) ── */}
        <div className="space-y-6">

          {/* Deadline Risk */}
          {isClient && isActive && <DeadlineRiskCard contractId={id} />}

          {/* Contract Terms */}
          <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm space-y-6">
            <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-3 mb-2">Contract Terms</h3>
            <div className="space-y-5">
              <InfoRow imgSrc="/Icons/icons8-bag-100.png" label="Contract ID" value={contract.id?.substring(0, 8).toUpperCase()} />
              <InfoRow imgSrc="/Icons/icons8-bag-100.png" label="Contract Type" value={contractJob.project_type === 'HOURLY' ? 'Hourly Project' : 'Fixed Price Project'} />
              <InfoRow imgSrc="/Icons/icons8-rupee-64.png" label="Agreed Budget"
                value={contract.agreed_rate ? `${formatINR(contract.agreed_rate)}${contractJob.project_type === 'HOURLY' ? '/hr' : ' fixed'}` : null} />
              <InfoRow imgSrc="/Icons/icons8-desk-calender-96.png" label="Start Date"
                value={fmtDate(contract.start_date || contract.created_at) || 'Immediate'} />
              {contract.end_date && (
                <InfoRow imgSrc="/Icons/icons8-desk-calender-96.png" label="Target End" value={fmtDate(contract.end_date)} />
              )}
            </div>
          </div>

          {/* Management */}
          {canAct && isClient && (
            <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm space-y-4">
              <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-3 mb-2">Management</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    // TODO: add confirm dialog if desired
                    toast.success('Contract completed');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-green-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full hover:bg-green-500 transition-all active:scale-95"
                >
                  Complete Contract
                </button>
                <button
                  onClick={() => toast('Contact support to terminate')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full hover:bg-red-500 transition-all active:scale-95"
                >
                  Terminate Contract
                </button>
              </div>
            </div>
          )}

          {/* Active Team */}
          {freelancers.length > 0 && (
            <div className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-white/15 transition-all shadow-sm">
              <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                Active Team <Users size={12} className="text-accent/40" />
              </h3>
              <div className="space-y-4">
                {freelancers.map(member => {
                  const stats = analytics.find(a => a.user_id === member.user_id);
                  return (
                    <div key={member.id} className="group p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all">
                      {/* Top: Avatar + Name + Role */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                          {member.profile?.avatar_url ? (
                            <img src={member.profile.avatar_url} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold uppercase">
                              {member.profile?.name?.[0] || 'F'}
                            </div>
                          )}
                          {member.is_lead && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-[#0B0C10]">
                              <Crown size={7} className="text-black" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-bold truncate">{member.profile?.name}</p>
                          <p className="text-[10px] text-accent font-bold uppercase tracking-widest truncate mt-0.5">{member.role}</p>
                        </div>
                      </div>

                      {/* Middle: Progress */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Progress</span>
                          <span className="text-[9px] text-emerald-400 font-bold">{stats?.progress || 0}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats?.progress || 0}%` }} />
                        </div>
                      </div>

                      {/* Bottom: Approved count + action buttons */}
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                          {stats?.approved_deliveries || 0}/{stats?.total_deliveries || 0} approved
                        </p>
                        {isClient && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditModal({ isOpen: true, member })}
                              className="p-1 text-white/30 hover:text-accent transition"
                              title="Edit member"
                            >
                              <Edit2 size={12} />
                            </button>
                            {!member.is_lead && (
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, memberId: member.id })}
                                className="p-1 text-red-500/30 hover:text-red-500 transition"
                                title="Remove member"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <EditMemberModal
        isOpen={editModal.isOpen} member={editModal.member}
        jobId={contract.job_id}
        onClose={() => setEditModal({ isOpen: false, member: null })}
        onUpdate={handleMemberUpdate}
      />
      <NotificationModal
        isOpen={deleteModal.isOpen} type="warning"
        title="Remove Team Member?"
        message="This will immediately revoke their access to this project workspace."
        retryLabel="Remove Member" cancelLabel="Keep Member"
        onRetry={() => handleRemoveMember(deleteModal.memberId)}
        onClose={() => setDeleteModal({ isOpen: false, memberId: null })}
      />
      <InputModal
        isOpen={fundModal.isOpen}
        onClose={() => setFundModal({ isOpen: false })}
        title="Fund Project Escrow" subtitle="Demo/Sandbox Mode"
        placeholder="Enter amount (e.g. 5000)"
        defaultValue={contract.agreed_rate?.toString()}
        type="number" confirmLabel="Fund Now" icon={DollarSign}
        onSubmit={async (amount) => {
          try {
            const res = await fundFakeEscrow({ contract_id: id, freelancer_id: contract.freelancer_id, amount });
            if (res.success) { toast.success('Funds held in escrow!'); fetchFakeEscrow(); refreshWallet(); }
          } catch (err) { toast.error(err.response?.data?.message || 'Funding failed'); throw err; }
        }}
      />
      <NotificationModal
        isOpen={releaseModal.isOpen} type="warning"
        title="Release Payment?"
        message={`Are you sure you want to release ${formatINR(releaseModal.tx?.amount || 0)} to the freelancer? This action cannot be undone.`}
        retryLabel="Release Funds" cancelLabel="Cancel"
        onRetry={async () => {
          try {
            const res = await releaseFakeEscrow(releaseModal.tx.id);
            if (res.success) { toast.success('Payment released!'); fetchFakeEscrow(); refreshWallet(); }
          } catch { toast.error('Release failed'); }
          finally { setReleaseModal({ isOpen: false, tx: null }); }
        }}
        onClose={() => setReleaseModal({ isOpen: false, tx: null })}
      />
    </div>
  );
};

export default ContractDetails;
