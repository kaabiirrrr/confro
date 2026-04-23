import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  IndianRupee,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Edit2,
  Trash2,
  Crown,
  Zap,
  Video,
  Layers,
  CircleDot,
  DollarSign,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Cpu,
  Plus,
  Terminal,
  Box
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { 
  getMyContracts, 
  getJobWorkspace, 
  updateJobMember, 
  removeJobMember, 
  getSkimmerOverview, 
  getSkimmerTasks, 
  getSkimmerInsights, 
  regenerateSkimmerPlan,
  fundFakeEscrow,
  releaseFakeEscrow,
  getFakeEscrowTransactions
} from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import { useAuth } from '../../../context/AuthContext';
import DeadlineRiskCard from '../common/DeadlineRiskCard';
import WorkDeliverySystem from '../deliveries/WorkDeliverySystem';
import EditMemberModal from '../client/pages/EditMemberModal';
import NotificationModal from '../../ui/NotificationModal';
import InputModal from '../../common/InputModal';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role: userRole } = useAuth();
  const isClient = userRole === 'CLIENT';

  const [contract, setContract] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [editModal, setEditModal] = useState({ isOpen: false, member: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null });

  // Skimmer Co-Pilot State
  const [skimmer, setSkimmer] = useState({
    overview: null,
    tasks: [],
    insights: null,
    loading: true
  });
  const { wallet, refreshWallet } = useAuth();
  const [fakeEscrow, setFakeEscrow] = useState({
    transactions: [],
    loading: true
  });

  const [fundModal, setFundModal] = useState({ isOpen: false });
  const [releaseModal, setReleaseModal] = useState({ isOpen: false, tx: null });

  const fetchFakeEscrow = useCallback(async () => {
    if (import.meta.env.VITE_ESCROW_MODE !== 'FAKE') return;
    try {
      const res = await getFakeEscrowTransactions(id);
      if (res.success) {
        setFakeEscrow({ transactions: res.data, loading: false });
      }
    } catch (err) {
      console.error("Fake escrow fetch error:", err);
      setFakeEscrow(prev => ({ ...prev, loading: false }));
    }
  }, [id]);

  const fetchWorkspaceData = useCallback(async (jobId) => {
    try {
      const res = await getJobWorkspace(jobId);
      if (res.success) setWorkspace(res.data);
      
      // Fetch Skimmer Analytics
      const [overview, tasks, insights] = await Promise.all([
        getSkimmerOverview(jobId),
        getSkimmerTasks(jobId),
        getSkimmerInsights(jobId)
      ]);

      setSkimmer({
        overview: overview?.data ?? overview ?? null,
        tasks: tasks?.data ?? tasks ?? [],
        insights: insights?.data ?? insights ?? null,
        loading: false
      });
    } catch (err) {
      console.error("Workspace fetch error:", err);
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
          toast.error("Contract not found");
          navigate(isClient ? '/client/contracts' : '/freelancer/contracts');
        }
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const handleMemberUpdate = async (memberId, updates) => {
    try {
      const res = await updateJobMember(contract.job_id, memberId, updates);
      if (res.success) {
        toast.success("Member updated successfully");
        fetchWorkspaceData(contract.job_id);
        return res;
      }
    } catch (err) {
      toast.error("Failed to update member");
      return { success: false };
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const res = await removeJobMember(contract.job_id, memberId);
      if (res.success) {
        toast.success("Member removed");
        fetchWorkspaceData(contract.job_id);
      }
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setDeleteModal({ isOpen: false, memberId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader size={20} />
        <p className="text-light-text/60 animate-pulse">Initializing workspace...</p>
      </div>
    );
  }

  if (!contract) return null;

  const freelancers = workspace?.members || [];
  const analytics = workspace?.analytics || [];
  const activity = workspace?.activity || [];

  return (
    <div className="max-w-[1630px] mx-auto space-y-6 pb-10 animate-in ml-10 mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">

      {/* Header */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-light-text/30 hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] transition group w-fit mb-4">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 mb-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-widest border uppercase bg-secondary/60 ${contract.status === 'COMPLETED' ? 'border-blue-500/20 text-blue-400' : 'border-emerald-500/20 text-emerald-400'
              }`}>
              {contract.status === 'IN_PROGRESS' ? 'ACTIVE WORKSPACE' : contract.status}
            </span>
            <span className="text-light-text/20 text-[10px] font-bold uppercase tracking-[0.2em]">JOB ID: {contract.job_id.split('-')[0].toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight leading-tight">{contract.jobs?.title || 'Project Workspace'}</h1>
          
          {/* Team Quick Stats */}
          {isClient && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Users size={14} className="text-accent" />
                    <span className="text-white text-xs font-semibold">{freelancers.length} / 10 Members</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" />
                    <span className="text-white text-xs font-semibold">Team Progress: {analytics.length > 0 ? Math.round(analytics.reduce((acc, curr) => acc + curr.progress, 0) / analytics.length) : 0}%</span>
                </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start shrink-0 mt-1">
          <div className="px-5 py-3 bg-transparent rounded-2xl flex items-center gap-4 backdrop-blur-md border border-white/5">
            <div className="bg-transparent rounded-xl">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] text-light-text/20 uppercase tracking-widest font-bold mb-0.5">Budget Allocation</p>
              <p className="text-xl font-bold text-white tracking-tight leading-none">
                {formatINR(contract.agreed_rate)} {contract.jobs?.project_type === 'HOURLY' ? '/hr' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/messages')}
            className="px-6 py-4.5 bg-transparent border border-white/5 hover:bg-white/5 transition rounded-2xl text-white text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95"
          >
            <MessageSquare size={16} className="text-accent" /> Team Chat
          </button>

          {['IN_PROGRESS', 'ACTIVE'].includes(contract.status) && (
            <button
              onClick={() => navigate(`/meeting/create?projectId=${contract.job_id}&clientId=${contract.client_id}&freelancerId=${contract.freelancer_id}`)}
              className="px-6 py-4.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition rounded-2xl text-blue-400 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95"
            >
              <Video size={16} /> Start Meeting
            </button>
          )}
        </div>
      </div>

      {/* FAKE ESCROW MANAGEMENT (DEMO MODE) */}
      {import.meta.env.VITE_ESCROW_MODE === 'FAKE' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-transparent border border-amber-500/20 rounded-[40px] p-8 mb-8 backdrop-blur-2xl relative overflow-hidden group shadow-lg shadow-amber-500/5"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
            <ShieldAlert size={100} className="text-amber-500" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <DollarSign size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Demo Escrow System</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Active</span>
                </div>
                <p className="text-light-text/40 text-xs font-medium max-w-md leading-relaxed">
                  This project is protected by Connect's Fake Escrow. Funds are held in a virtual vault and released upon task completion. No real payments are processed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-12 shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Funded Amount</span>
                <span className="text-3xl font-black text-white tracking-tighter">
                  {formatINR(fakeEscrow.transactions.reduce((acc, t) => t.status === 'FUNDED' ? acc + parseFloat(t.amount) : acc, 0))}
                </span>
                <span className="text-[10px] text-white/20 font-bold uppercase mt-1">Held in Escrow</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Released Amount</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tighter">
                  {formatINR(fakeEscrow.transactions.reduce((acc, t) => t.status === 'RELEASED' ? acc + parseFloat(t.amount) : acc, 0))}
                </span>
                <span className="text-[10px] text-white/20 font-bold uppercase mt-1">Paid to Freelancer</span>
              </div>

              <div className="flex flex-col gap-3">
                {isClient ? (
                  <>
                    <button 
                      onClick={() => setFundModal({ isOpen: true })}
                      className="px-6 h-11 bg-amber-500 text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <Plus size={16} /> Fund Escrow
                    </button>
                    <button 
                      disabled={!fakeEscrow.transactions.some(t => t.status === 'FUNDED')}
                      onClick={() => {
                        const fundedTx = fakeEscrow.transactions.find(t => t.status === 'FUNDED');
                        if (fundedTx) setReleaseModal({ isOpen: true, tx: fundedTx });
                      }}
                      className="px-6 h-11 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/10 hover:border-accent transition-all disabled:opacity-30 disabled:hover:scale-100 active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Release Payment
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 italic text-[11px] text-white/50">
                    <Clock size={16} /> Waiting for client action
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SKIMMER CO-PILOT ELITE DASHBOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        
        {/* Health & Probability Card */}
        <div className="xl:col-span-2 bg-transparent border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-accent/10" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-12">
                {/* Health Ring */}
                <div className="relative w-48 h-48 shrink-0">
                    <svg className="w-full h-full -rotate-90 transform">
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={552} strokeDashoffset={552 - (552 * (skimmer.overview?.health_score || 0)) / 100} strokeLinecap="round" className="text-accent transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-5xl font-black text-white tracking-tighter">{skimmer.overview?.health_score || 0}%</span>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-widest ${
                            (skimmer.overview?.change_value || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {(skimmer.overview?.change_value || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(skimmer.overview?.change_value || 0)} Last 24h
                        </div>
                    </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="flex-1 w-full space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Cpu size={24} className="text-accent" /> Skimmer Co-Pilot
                            </h2>
                            <p className="text-[10px] text-light-text/30 font-bold uppercase tracking-[0.2em] mt-1">Autonomous Execution Analytics Engine</p>
                        </div>
                        {isClient && (
                            <button 
                                onClick={async () => {
                                    setRefreshing(true);
                                    await regenerateSkimmerPlan(contract.job_id);
                                    await fetchWorkspaceData(contract.job_id);
                                    setRefreshing(false);
                                    toast.success("AI Mission Plan Regenerated");
                                }}
                                disabled={refreshing}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white border border-white/10 transition flex items-center gap-2"
                            >
                                <Terminal size={14} /> {refreshing ? 'Regenerating...' : 'Regenerate Plan'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-light-text/40">Success Probability</span>
                                <span className="text-white">{Math.round((skimmer.overview?.success_probability || 0) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(skimmer.overview?.success_probability || 0) * 100}%` }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-light-text/40">Resource Efficiency</span>
                                <span className="text-white">{Math.round((skimmer.overview?.team_efficiency || 0) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(skimmer.overview?.team_efficiency || 0) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Suggestions Card */}
        <div className="bg-transparent border border-white/5 rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-transparent rounded-lg">
                        <Layers size={20} className="text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Contextual Advice</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                    {skimmer.insights?.summary || "Analyzing project patterns for optimal workflow suggestions..."}
                </p>
            </div>

            <div className="space-y-3">
                <div className="p-4 bg-accent/5 border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Recommended for You</p>
                    <p className="text-xs text-white/90 font-medium">
                        {isClient ? skimmer.insights?.client_action : skimmer.insights?.freelancer_action || "Continue maintaining current momentum."}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Team Mission Progress (Weighted) */}
      <div className="bg-transparent border border-white/5 rounded-[40px] p-8 mb-8 backdrop-blur-2xl">
           <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Mission Breakdown & Weights</h3>
                    <p className="text-[10px] text-light-text/30 font-bold uppercase tracking-[0.2em] mt-1">Autonomous Role-Based Task Evaluation</p>
                </div>
                <div className="px-4 py-2 bg-accent/10 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Live Sync v{skimmer.tasks[0]?.version || 1}</span>
                </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Group tasks by Role */}
                {Object.entries(skimmer.tasks.reduce((acc, t) => {
                    const role = t.role || 'Unassigned';
                    if (!acc[role]) acc[role] = [];
                    acc[role].push(t);
                    return acc;
                }, {})).map(([role, roleTasks]) => (
                    <div key={role} className="p-6 rounded-3xl border border-white/5 hover:border-accent/20 transition-all group bg-transparent">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">{role}</h4>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-bold text-white/50">{roleTasks.length} {roleTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                         </div>
                         <div className="space-y-3">
                            {roleTasks.map(t => (
                                <div key={t.id} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full border-2 ${
                                        t.status === 'completed' ? 'bg-emerald-500 border-emerald-400/20' : 'bg-transparent border-white/10'
                                    }`} />
                                    <span className={`text-[11px] font-medium transition-colors ${
                                        t.status === 'completed' ? 'text-white/30 line-through' : 'text-white/80'
                                    }`}>{t.title}</span>
                                    <span className="text-[8px] font-bold text-white/10 ml-auto uppercase tracking-tighter">W:{t.weight}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                ))}
                {skimmer.tasks.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Box size={32} className="text-white/10 mb-4" />
                        <p className="text-light-text/20 text-xs font-black uppercase tracking-widest">Initializing AI Planning Phase...</p>
                    </div>
                )}
           </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Deliveries & Submissions */}
        <div className="lg:col-span-8 space-y-6">
          <WorkDeliverySystem 
            contractId={id} 
            jobId={contract.job_id} 
            isClient={isClient} 
          />
          
          {/* Activity Log (Client Only) */}
          {isClient && activity.length > 0 && (
            <div className="border border-white/5 bg-transparent rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-accent" /> Workspace Activity
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
                    {activity.map(log => (
                        <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-white text-xs font-medium">
                                    <span className="text-accent font-bold uppercase tracking-tighter mr-1">{log.actor?.name}:</span>
                                    {log.action_type.replace('_', ' ')} {log.new_value ? `to "${log.new_value}"` : ''}
                                </p>
                                <p className="text-[10px] text-light-text/20 font-bold mt-1 uppercase tracking-widest">
                                    {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Right: Team & Progress */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Team List */}
          <div className="border border-white/5 bg-transparent rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/5 flex items-center justify-between">
                <span>Active Team</span>
                <Users size={14} className="text-accent/40" />
            </h3>

            <div className="space-y-6">
              {freelancers.map(member => {
                const stats = analytics.find(a => a.user_id === member.user_id);
                return (
                    <div key={member.id} className="group p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all bg-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                                {member.profile?.avatar_url ? (
                                    <img src={member.profile.avatar_url} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold uppercase">
                                        {member.profile?.name?.[0] || 'F'}
                                    </div>
                                )}
                                {member.is_lead && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-[#0B0C10]">
                                        <Crown size={8} className="text-black" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate tracking-tight">{member.profile?.name}</p>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest truncate">{member.role}</p>
                                    {isClient && (
                                        <button 
                                            onClick={() => setEditModal({ isOpen: true, member })} 
                                            className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white transition"
                                        >
                                            <Edit2 size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isClient && !member.is_lead && (
                                <button 
                                    onClick={() => setDeleteModal({ isOpen: true, memberId: member.id })} 
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        {/* Mission Scope (Client Only / Visible for Self) */}
                        {(isClient || member.user_id === useAuth().user?.id) && member.scope && (
                            <div className="mb-4 p-3 bg-transparent rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Assigned Mission</span>
                                    {isClient && (
                                        <button 
                                            onClick={() => setEditModal({ isOpen: true, member })}
                                            className="text-[8px] text-accent font-bold uppercase hover:underline"
                                        >
                                            Edit Scope
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-white/50 leading-relaxed italic line-clamp-3">"{member.scope}"</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                    <span className="text-[8px] text-white/20 font-bold uppercase">v{member.scope_version}</span>
                                    <span className={`text-[8px] font-bold uppercase ${member.scope_acknowledged ? 'text-emerald-400/50' : 'text-amber-400/50'}`}>
                                        {member.scope_acknowledged ? 'Acknowledged' : 'Pending Review'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest">Progress</span>
                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">{stats?.progress || 0}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats?.progress || 0}%` }} />
                            </div>
                            <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mt-1">
                                {stats?.approved_deliveries || 0} / {stats?.total_deliveries || 0} Approved
                            </p>
                        </div>
                    </div>
                );
              })}
            </div>
          </div>

          <div className="border border-white/5 rounded-2xl p-6 bg-transparent">
            <h3 className="text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/5">Project Info</h3>
            <div className="space-y-6">
              {isClient && contract.status === 'IN_PROGRESS' && (
                <DeadlineRiskCard contractId={id} />
              )}
              <div>
                <p className="text-[10px] text-light-text/20 font-bold uppercase tracking-[0.2em] mb-1.5">Established</p>
                <p className="text-white font-bold text-[14px] tracking-tight">{new Date(contract.start_date || contract.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-light-text/20 font-bold uppercase tracking-[0.2em] mb-1.5">Collaboration Type</p>
                <p className="text-white font-bold text-[14px] tracking-tight capitalize">Team {contract.jobs?.project_type?.toLowerCase() || 'fixed'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <EditMemberModal 
        isOpen={editModal.isOpen}
        member={editModal.member}
        jobId={contract.job_id}
        onClose={() => setEditModal({ isOpen: false, member: null })}
        onUpdate={handleMemberUpdate}
      />

      <NotificationModal 
        isOpen={deleteModal.isOpen}
        type="warning"
        title="Remove Team Member?"
        message="This will immediately revoke their access to this project workspace."
        retryLabel="Remove Member"
        cancelLabel="Keep Member"
        onRetry={() => handleRemoveMember(deleteModal.memberId)}
        onClose={() => setDeleteModal({ isOpen: false, memberId: null })}
      />

      {/* CUSTOM UI MODALS FOR ESCROW */}
      <InputModal
        isOpen={fundModal.isOpen}
        onClose={() => setFundModal({ isOpen: false })}
        title="Fund Project Escrow"
        subtitle="Demo/Sandbox Mode"
        placeholder="Enter amount (e.g. 5000)"
        defaultValue={contract.agreed_rate.toString()}
        type="number"
        confirmLabel="Fund Now"
        icon={DollarSign}
        onSubmit={async (amount) => {
          try {
            const res = await fundFakeEscrow({
              contract_id: id,
              freelancer_id: contract.freelancer_id,
              amount: amount
            });
            if (res.success) {
              toast.success("Funds held in escrow!");
              fetchFakeEscrow();
              refreshWallet();
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Funding failed");
            throw err;
          }
        }}
      />

      <NotificationModal
        isOpen={releaseModal.isOpen}
        type="warning"
        title="Release Payment?"
        message={`Are you sure you want to release ${formatINR(releaseModal.tx?.amount || 0)} to the freelancer? This action cannot be undone.`}
        retryLabel="Release Funds"
        cancelLabel="Cancel"
        onRetry={async () => {
          try {
            const res = await releaseFakeEscrow(releaseModal.tx.id);
            if (res.success) {
              toast.success("Payment released successfully!");
              fetchFakeEscrow();
              refreshWallet();
            }
          } catch (err) {
            toast.error("Release failed");
          } finally {
            setReleaseModal({ isOpen: false, tx: null });
          }
        }}
        onClose={() => setReleaseModal({ isOpen: false, tx: null })}
      />
    </div>
  );
};

export default ContractDetails;
