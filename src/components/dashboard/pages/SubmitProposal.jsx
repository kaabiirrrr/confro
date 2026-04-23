import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import {
    ArrowLeft, Send, IndianRupee, Clock,
    Briefcase, Paperclip, X, AlertCircle, CheckCircle2
} from 'lucide-react';
import { formatINR, convertToUSD, USD_TO_INR } from '../../../utils/currencyUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { getJobDetail, submitProposal } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import analytics from '../../../services/analytics.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);


export default function SubmitProposal() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedRoleId = searchParams.get('role');


    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [attachments, setAttachments] = useState([]);

    const [formData, setFormData] = useState({
        cover_letter: '',
        bid_amount: '',
        delivery_time: '',
        role_id: preselectedRoleId || ''
    });


    useEffect(() => {
        setLoading(true);
        getJobDetail(jobId)
            .then(res => {
                const jobData = res?.data ?? res;
                setJob(jobData);


                
                // If it's a team job and no role is selected, and only 1 role exists, auto-select it
                if (jobData?.job_mode === 'team' && !formData.role_id && jobData.roles?.length === 1) {
                    setFormData(prev => ({ ...prev, role_id: jobData.roles[0].id }));
                }

                const targetRole = jobData?.roles?.find(r => r.id === (preselectedRoleId || formData.role_id));
                const budgetAmount = targetRole ? targetRole.budget : jobData?.budget_amount;

                setFormData(prev => ({
                    ...prev,
                    bid_amount: budgetAmount ? (budgetAmount * USD_TO_INR).toFixed(2) : '',
                    delivery_time: jobData?.duration || '',
                    role_id: targetRole?.id || prev.role_id
                }));

            })
            .catch(err => toastApiError(err, 'Could not load job details'))
            .finally(() => setLoading(false));
    }, [jobId]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // In a real app, you'd upload these to Supabase storage first
        // For now, we'll just simulate adding them as "names" or small objects
        const newAttachments = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
        setAttachments(prev => [...prev, ...newAttachments]);
        toast.success(`${files.length} file(s) attached`);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (job.bid_deadline && new Date() > new Date(job.bid_deadline)) {
            toast.error('The bidding deadline for this job has passed');
            return;
        }

        if (!job.is_bidding_open) {
            toast.error('Bidding is closed for this job');
            return;
        }

        const hasAlreadyBid = job.proposals?.some(p => 
            p.freelancer_id === localStorage.getItem('user_id') && 
            !['REJECTED', 'WITHDRAWN'].includes(p.status?.toUpperCase())
        );
        if (hasAlreadyBid) {
            toast.error('You have already submitted a proposal for this job');
            return;
        }

        setSubmitting(true);
        try {
            const response = await submitProposal({
                job_id: jobId,
                role_id: formData.role_id || job.roles?.[0]?.id, // Ensure role_id is passed
                cover_letter: formData.cover_letter,
                proposed_rate: convertToUSD(formData.bid_amount),
                estimated_duration: formData.delivery_time,
                attachments: attachments
            });


            if (response.success || response) {
                analytics.trackFeature('proposal_submission', '/freelancer/submit-proposal', { jobId: jobId });
                toast.success('Proposal submitted successfully!');
                
                // Ensure redirection happens after a small delay to let toast be seen
                setTimeout(() => {
                    navigate('/freelancer/proposals', { replace: true });
                }, 1000);
            }

        } catch (err) {
            console.error('[SubmitProposal] Error:', err);
            toastApiError(err, 'Failed to submit proposal');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <InfinityLoader size="lg" text="Loading Job Details..." />;
    }

    if (!job) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center">
                <AlertCircle className="w-12 h-12 text-light-text/20 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-light-text">Job Not Found</h2>
                <button onClick={() => navigate('/freelancer/find-work')} className="mt-4 text-accent hover:underline">
                    Back to Find Work
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full pb-20 space-y-8 font-sans tracking-tight"
        >
            {/* Header */}
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-light-text/40 hover:text-light-text transition text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Active Job Post</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-transparent border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                           <h1 className="text-xl sm:text-2xl font-bold text-white">Submit a Proposal</h1>
                           {job.job_mode === 'team' && (
                             <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Team Role</span>
                           )}
                        </div>

                        {/* Role Selection (For Team Mode) */}
                        {job.job_mode === 'team' && (
                            <div className="mb-10 p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-4">Select Your Role</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {job.roles?.filter(r => r.status !== 'filled').map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(f => ({ ...f, role_id: role.id, bid_amount: (role.budget).toFixed(2) }));
                                            }}
                                            className={`p-4 rounded-xl border text-left transition-all relative ${formData.role_id === role.id ? 'border-accent bg-accent/[0.02]' : 'border-white/5 hover:border-white/10'}`}
                                        >
                                            <p className={`text-sm font-bold ${formData.role_id === role.id ? 'text-accent' : 'text-white'}`}>{role.title}</p>
                                            <p className="text-[10px] text-white/40 mt-1">Budget: {formatINR(role.budget)}</p>
                                            {formData.role_id === role.id && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Proposal Details Card */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                                            Bid Amount {job.budget_type === 'hourly' ? '(₹/hr)' : '(₹)'}
                                        </label>
                                        <div className="relative">
                                            <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={formData.bid_amount}
                                                onChange={e => setFormData({ ...formData, bid_amount: e.target.value })}
                                                className="w-full bg-transparent border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition-all placeholder:text-white/10"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                                            Estimated Delivery
                                        </label>
                                        <div className="relative">
                                            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.delivery_time}
                                                onChange={e => setFormData({ ...formData, delivery_time: e.target.value })}
                                                className="w-full bg-transparent border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition-all placeholder:text-white/10"
                                                placeholder="e.g. 2 weeks"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                                        Cover Letter
                                    </label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={formData.cover_letter}
                                        onChange={e => setFormData({ ...formData, cover_letter: e.target.value })}
                                        className="w-full bg-transparent border border-white/10 rounded-xl p-5 text-sm text-white focus:outline-none focus:border-accent transition-all placeholder:text-white/10 resize-none leading-relaxed"
                                        placeholder="Explain why you are the best fit for this project..."
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <span className={`text-[10px] font-medium ${formData.cover_letter.length < 20 ? 'text-red-400' : 'text-white/10'}`}>
                                            {formData.cover_letter.length} characters (min 20)
                                        </span>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div className="space-y-4 pt-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                                        Attachments (optional)
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <AnimatePresence>
                                            {attachments.map((file, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/10 rounded-xl group"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <Paperclip size={14} className="text-accent shrink-0" />
                                                        <span className="text-xs text-white/60 truncate">{file.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(i)}
                                                        className="p-1 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-2xl hover:border-accent hover:bg-accent/5 cursor-pointer transition-all group">
                                            <Paperclip size={20} className="text-white/10 group-hover:text-accent mb-2 transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/20 group-hover:text-accent transition-colors">Attach Files</span>
                                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="flex-1 py-3 sm:py-4 px-6 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || job.proposals?.some(p => p.freelancer_id === localStorage.getItem('user_id'))}
                                        className="flex-[2] py-3 sm:py-4 px-6 rounded-2xl bg-accent !text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {submitting ? (
                                            <motion.div 
                                                animate={{ opacity: [0.4, 1, 0.4] }} 
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Send size={16} className="animate-pulse" />
                                                <span>Sending...</span>
                                            </motion.div>
                                        ) : (
                                            <>
                                                <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                                                {job.proposals?.some(p => p.freelancer_id === localStorage.getItem('user_id')) 
                                                    ? 'ALREADY SUBMITTED'
                                                    : (job.is_bidding_open && job.status === 'OPEN' && (!job.bid_deadline || new Date() < new Date(job.bid_deadline))
                                                        ? 'SUBMIT PROPOSAL'
                                                        : 'BIDDING CLOSED')}

                                            </>
                                        )}
                                    </button>

                                </div>
                                {(job.bid_deadline && new Date() > new Date(job.bid_deadline)) && (
                                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mt-4">
                                        <AlertCircle size={14} />
                                        <span>This job is no longer accepting proposals.</span>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Job & Client Summary */}
                <div className="space-y-6">
                    {/* Job Summary */}
                    <div className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-6 transition-all duration-300">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-4">Project Summary</h3>

                        <div>
                            <h4 className="text-lg font-semibold text-white leading-tight mb-2">{job.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {job.skills?.slice(0, 3).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-accent/5 border border-accent/10 text-[10px] font-semibold text-accent rounded-md uppercase tracking-wider">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                                    <IndianRupee size={14} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Budget</p>
                                    <p className="text-sm text-white font-medium">
                                        {formatINR(job.budget_amount)} {job.budget_type}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                                    <Clock size={14} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Duration</p>
                                    <p className="text-sm text-white font-medium">{job.duration || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                                    <Briefcase size={14} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Experience</p>
                                    <p className="text-sm text-white font-medium capitalize">{job.experience_level || 'All levels'}</p>
                                </div>
                            </div>

                            {job.bid_deadline && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${new Date() > new Date(job.bid_deadline) ? 'bg-red-500/10 border-red-500/20' : 'bg-accent/10'}`}>
                                        <Clock size={14} className={new Date() > new Date(job.bid_deadline) ? 'text-red-400' : 'text-accent'} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20">Bidding Deadline</p>
                                        <p className={`text-sm font-medium ${new Date() > new Date(job.bid_deadline) ? 'text-red-400' : 'text-white'}`}>
                                            {new Date() > new Date(job.bid_deadline) ? 'Expired' : dayjs(job.bid_deadline).fromNow()}
                                        </p>
                                        <p className="text-[9px] text-white/40 mt-0.5">
                                            {dayjs(job.bid_deadline).format('MMM D, YYYY h:mm A')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* About Client */}
                    <div className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-6 hover:border-accent/30 transition-all duration-300">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-4">About Client</h3>

                        <div className="flex items-center gap-4">
                            {job.client?.avatar_url ? (
                                <img src={job.client.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                    <span className="text-lg font-bold text-accent">{(job.client?.company_name || job.client?.name || 'C')[0]}</span>
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                                    {job.client?.company_name || job.client?.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <MapPin size={12} className="text-white/20" />
                                    <span className="text-[11px] text-white/40">{job.client?.country || 'International'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">Payment Method</span>
                                <div className="flex items-center gap-1 text-green-400 font-medium">
                                    <CheckCircle2 size={12} />
                                    <span>Verified</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">Jobs Posted</span>
                                <span className="text-white/80 font-semibold">{job.client?.total_posted || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">Member Since</span>
                                <span className="text-white/80 font-semibold">Apr 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

const MapPin = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
