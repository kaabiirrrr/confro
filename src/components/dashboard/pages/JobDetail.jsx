import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Clock, Briefcase, Bookmark,
  Send, X, AlertCircle, ThumbsDown
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { getJobDetail, toggleSaveJob, submitProposal } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import Avatar from '../../Avatar';
import InfinityLoader from '../../common/InfinityLoader';

const ExpBadge = ({ level }) => {
  const cfg = {
    beginner:     'bg-transparent text-accent border-accent/30',
    intermediate: 'bg-transparent text-accent border-accent/30',
    expert:       'bg-transparent text-accent border-accent/30',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cfg[level] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
      {level}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
      <Icon size={14} className="text-accent" />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">{label}</p>
      <p className="text-white text-sm font-semibold mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getJobDetail(id)
      .then(res => setJob(res?.data ?? res))
      .catch(err => toastApiError(err, 'Could not load job'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await toggleSaveJob(id);
      setJob(prev => ({ ...prev, is_saved: res.saved }));
      toast.success(res.saved ? 'Job saved' : 'Job unsaved');
    } catch (err) {
      toastApiError(err, 'Could not save job');
    } finally {
      setSaving(false);
    }
  };


  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 placeholder-white/20";

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4 pb-20">
        <div className="animate-pulse h-6 bg-secondary rounded w-32" />
        <div className="animate-pulse bg-secondary border border-white/5 rounded-xl h-64" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl text-center py-20">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40">Job not found.</p>
        <button onClick={() => navigate('/freelancer/find-work')} className="mt-4 text-accent text-sm hover:underline">
          Back to Find Work
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full space-y-8 pb-20 font-sans tracking-tight"
    >
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/freelancer/find-work')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm font-medium group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to result
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-transparent border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8 mb-8 pb-8 border-b border-white/10">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  {job.experience_level && <ExpBadge level={job.experience_level} />}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                    {job.category || 'Professional Services'}
                  </span>
                  {job.created_at && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10">
                      Posted • {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <button 
                  title="Not interested"
                  className="p-1 px-3 text-white/20 hover:text-red-400 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <ThumbsDown size={20} />
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  title={job.is_saved ? "Remove from saved" : "Save job"}
                  className={`transition-all duration-300 transform hover:scale-110 active:scale-95 shrink-0 ${
                    job.is_saved ? 'text-accent' : 'text-white/20 hover:text-accent'
                  } ${saving ? "opacity-50 cursor-wait" : ""}`}
                >
                  {saving ? (
                    <InfinityLoader size={20} />
                  ) : (
                    <Bookmark 
                      size={18} 
                      className={`transition-all duration-300 ${job.is_saved ? 'fill-accent' : ''}`} 
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <InfoRow 
                icon={IndianRupee} 
                label="Budget"
                value={job.budget_amount !== undefined ? `${formatINR(job.budget_amount)} ${job.budget_type}` : null} 
              />
              <InfoRow icon={Clock} label="Duration" value={job.duration || 'Not specified'} />
              <InfoRow 
                icon={Briefcase} 
                label="Proposals" 
                value={`${job.proposal_count ?? job.proposals?.length ?? 0}`} 
              />
              {job.bid_deadline && (
                <InfoRow 
                  icon={Clock} 
                  label="Deadline" 
                  value={new Date(job.bid_deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} 
                />
              )}
            </div>

            {job.description && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3">
                  <span className="w-1 h-3 bg-accent rounded-full"></span>
                  Job Description
                </h3>
                <p className="text-white/60 text-sm leading-relaxed font-normal whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {/* Roles Section (NEW) */}
            {job.job_mode === 'team' && job.roles?.length > 0 && (
              <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
                   <Briefcase size={14} className="text-accent" />
                   Available Roles for this Project
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.roles.map(role => (
                    <div key={role.id} className={`p-5 rounded-2xl border transition-all ${role.status === 'filled' ? 'border-white/5 opacity-50' : 'border-white/10'}`}>

                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-base font-bold ${role.status === 'filled' ? 'text-white/20' : 'text-white'}`}>{role.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${role.status === 'filled' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {role.status === 'filled' ? 'Filled' : `${role.positions - role.filled_positions} Left`}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2 mb-4 h-10">{role.description || 'No specific role description provided.'}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-accent font-bold text-sm">
                          <IndianRupee size={12} />
                          {formatINR(role.budget)}
                        </div>
                        {role.status !== 'filled' && (
                          <button 
                            onClick={() => navigate(`/freelancer/jobs/${id}/apply?role=${role.id}`)}
                            className="bg-white/5 hover:bg-accent hover:text-white text-white/60 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                             Bid for this role
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-6 border-b border-white/5 pb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills.map(s => (
                    <span key={s} className="px-4 py-2 bg-transparent border border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:text-white">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24 transition-all duration-300">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-4 mb-6">About the Client</h3>
              <div className="flex items-center gap-4">
                <Avatar 
                  src={job.client?.avatar_url} 
                  name={job.client?.company_name || job.client?.name} 
                  size="w-12 h-12"
                  className="ring-2 ring-white/5 group-hover:ring-accent/40 transition-all duration-300"
                />
                <div>
                  <p className="text-white text-[15px] font-bold tracking-tight">{job.client?.company_name || job.client?.name}</p>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-0.5">Verified Client</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center bg-transparent border border-white/10 p-4 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Country</span>
                <span className="text-[13px] text-white font-medium">{job.client?.country || 'International'}</span>
              </div>
              <div className="flex justify-between items-center bg-transparent border border-white/10 p-4 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Jobs Posted</span>
                <span className="text-[13px] text-white font-medium">{job.client_stats?.total_posted ?? '0'}</span>
              </div>
              <div className="flex justify-between items-center bg-transparent border border-white/10 p-4 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Engagement</span>
                <span className="text-[13px] text-white font-medium">{job.client_stats?.hire_rate || 0}% Hire Rate</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/freelancer/jobs/${id}/apply`)}
              disabled={!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline))}
              className={`w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition shadow-lg transform hover:scale-[1.02] active:scale-95 ${
                (!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline)))
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                  : 'bg-accent !text-white hover:bg-accent/90 shadow-accent/10'
              }`}
            >
              <Send size={16} /> 
              {(!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline))) 
                ? 'Bidding Closed' 
                : 'Submit Proposal'}
            </button>
            {job.bid_deadline && new Date() > new Date(job.bid_deadline) && (
              <p className="text-[9px] text-center text-red-400 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                <AlertCircle size={10} /> Deadline expired
              </p>
            )}
            <p className="text-[10px] text-center text-white/10 font-bold uppercase tracking-widest">Required connects: 6</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
