import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Clock, Briefcase, Bookmark,
  AlertCircle, ThumbsDown, MapPin, Users, Zap, CheckCircle2, BarChart2, Globe
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { getJobDetail, toggleSaveJob } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import Avatar from '../../Avatar';
import InfinityLoader from '../../common/InfinityLoader';

const ExpBadge = ({ level }) => {
  return (
    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-transparent text-accent border-accent/30">
      {level}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, img }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
      {img
        ? <img src={img} alt={label} className="w-6 h-6 object-contain" />
        : <Icon size={14} className="text-accent" />
      }
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/20">{label}</p>
      <p className="text-slate-900 dark:text-white text-sm font-semibold mt-0.5">{value ?? '—'}</p>
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


  const inputCls = null; // unused

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
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 transition-all duration-300">
            <div className="mb-8 pb-8 border-b border-slate-100 dark:border-white/10">
              {/* Row 1: Title + action buttons */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug flex-1 min-w-0">
                  {job.title}
                </h1>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title="Not interested"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-white/20 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95"
                  >
                    <ThumbsDown size={14} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    title={job.is_saved ? "Remove from saved" : "Save job"}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                      job.is_saved ? 'text-accent' : 'text-slate-400 dark:text-white/20 hover:text-accent hover:bg-accent/5'
                    } ${saving ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {saving ? <InfinityLoader /> : (
                      <Bookmark size={14} className={job.is_saved ? 'fill-accent' : ''} />
                    )}
                  </button>
                </div>
              </div>

              {/* Row 2: Experience badge (left) + category + posted (right) */}
              <div className="flex items-center justify-between gap-2">
                <div>{job.experience_level && <ExpBadge level={job.experience_level} />}</div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    {job.category || 'Professional Services'}
                  </span>
                  {job.created_at && (
                    <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-white/30">
                      Posted • {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              <InfoRow 
                icon={IndianRupee}
                img="/Icons/icons8-rupee-64.png"
                label="Budget"
                value={job.budget_amount !== undefined ? `${formatINR(job.budget_amount)} ${job.budget_type}` : null} 
              />
              <InfoRow
                icon={Clock}
                img="/Icons/icons8-clock-80.png"
                label="Duration"
                value={job.duration || 'Not specified'}
              />
              <InfoRow 
                icon={Briefcase}
                img="/Icons/icons8-bag-80.png"
                label="Proposals" 
                value={`${job.proposal_count ?? job.proposals?.length ?? 0}`} 
              />
              {job.bid_deadline && (
                <InfoRow 
                  icon={Clock}
                  img="/Icons/icons8-desk-calender-96.png"
                  label="Deadline" 
                  value={new Date(job.bid_deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} 
                />
              )}
            </div>

            {job.description && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-6 flex items-center gap-3">
                  <span className="w-1 h-3 bg-accent rounded-full"></span>
                  Job Description
                </h3>
                <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed font-normal whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {job.job_mode === 'team' && job.roles?.length > 0 && (
              <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-6 border-b border-slate-100 dark:border-white/5 pb-4 flex items-center gap-3">
                   <Briefcase size={14} className="text-accent" />
                   Available Roles for this Project
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.roles.map(role => (
                    <div key={role.id} className={`p-5 rounded-xl border transition-all ${role.status === 'filled' ? 'border-slate-100 dark:border-white/5 opacity-50' : 'border-slate-200 dark:border-white/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-base font-bold ${role.status === 'filled' ? 'text-slate-300 dark:text-white/20' : 'text-slate-900 dark:text-white'}`}>{role.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${role.status === 'filled' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-500 dark:text-green-400'}`}>
                          {role.status === 'filled' ? 'Filled' : `${role.positions - role.filled_positions} Left`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-white/40 line-clamp-2 mb-4 h-10">{role.description || 'No specific role description provided.'}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1 text-accent font-bold text-sm">
                          <IndianRupee size={12} />
                          {formatINR(role.budget)}
                        </div>
                        {role.status !== 'filled' && (
                          <button 
                            onClick={() => navigate(`/freelancer/jobs/${id}/apply?role=${role.id}`)}
                            className="bg-slate-100 dark:bg-white/5 hover:bg-accent hover:text-white text-slate-500 dark:text-white/60 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
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
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 sm:px-4 sm:py-2 bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-6 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-4 flex items-center gap-3">
                <span className="w-1 h-3 bg-accent rounded-full"></span>
                Project Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.project_type && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Project Type</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{job.project_type}</p>
                  </div>
                )}
                {job.job_mode && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Job Mode</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{job.job_mode}</p>
                  </div>
                )}
                {job.connects_required !== undefined && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Connects Needed</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.connects_required}</p>
                  </div>
                )}
                {job.location && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-2">
                    <MapPin size={13} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Location</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.location}</p>
                    </div>
                  </div>
                )}
                {job.is_remote !== undefined && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-2">
                    <Globe size={13} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Work Style</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.is_remote ? 'Remote' : 'On-site'}</p>
                    </div>
                  </div>
                )}
                {job.experience_level && (
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Experience</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{job.experience_level}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity on this job */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-4 flex items-center gap-3">
                <span className="w-1 h-3 bg-accent rounded-full"></span>
                Activity on this Job
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-2">
                  <BarChart2 size={13} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Proposals</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.proposal_count ?? job.proposals?.length ?? 0}</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-2">
                  <Users size={13} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Interviewing</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.interviewing_count ?? 0}</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-1">Invites Sent</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.invites_sent ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 space-y-6 sticky top-24 transition-all duration-300">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 border-b border-slate-100 dark:border-white/10 pb-4 mb-6">About the Client</h3>
              <div className="flex items-center gap-4">
                <Avatar 
                  src={job.client?.avatar_url} 
                  name={job.client?.company_name || job.client?.name} 
                  size="w-12 h-12"
                  className="ring-2 ring-slate-100 dark:ring-white/5 group-hover:ring-accent/40 transition-all duration-300"
                />
                <div>
                  <p className="text-slate-900 dark:text-white text-[15px] font-bold tracking-tight">{job.client?.company_name || job.client?.name}</p>
                  <p className="text-slate-400 dark:text-white/20 text-[10px] font-bold uppercase tracking-widest mt-0.5">Verified Client</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border border-slate-200 dark:border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/20">Country</span>
                <span className="text-[13px] text-slate-900 dark:text-white font-medium">{job.client?.country || 'International'}</span>
              </div>
              <div className="flex justify-between items-center border border-slate-200 dark:border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/20">Jobs Posted</span>
                <span className="text-[13px] text-slate-900 dark:text-white font-medium">{job.client_stats?.total_posted ?? '0'}</span>
              </div>
              <div className="flex justify-between items-center border border-slate-200 dark:border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/20">Engagement</span>
                <span className="text-[13px] text-slate-900 dark:text-white font-medium">{job.client_stats?.hire_rate || 0}% Hire Rate</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/freelancer/jobs/${id}/apply`)}
              disabled={!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline))}
              className={`w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition shadow-lg transform hover:scale-[1.02] active:scale-95 ${
                (!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline)))
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed border border-slate-200 dark:border-white/10'
                  : 'bg-accent !text-white hover:bg-accent/90 shadow-accent/10'
              }`}
            >
              {(!job.is_bidding_open || (job.bid_deadline && new Date() > new Date(job.bid_deadline))) 
                ? 'Bidding Closed' 
                : 'Submit Proposal'}
            </button>
            {job.bid_deadline && new Date() > new Date(job.bid_deadline) && (
              <p className="text-[9px] text-center text-red-400 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
               Deadline expired
              </p>
            )}
            <p className="text-[10px] text-center text-slate-300 dark:text-white/10 font-bold uppercase tracking-widest">Required connects: 6</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
