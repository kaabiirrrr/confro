import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Clock, 
    Calendar, 
    ChevronRight, 
    AlertCircle, 
    MessageSquare,
    Search,
    History,
    CheckCircle2,
    Filter,
    UserCircle2
} from 'lucide-react';
import { 
    getHiredFreelancers, 
    getJobWorkLogs,
    askForWorkUpdate,
    getClientWorkSummary
} from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../../ui/CustomDropdown';
import InfinityLoader from '../../../common/InfinityLoader';


const ClientWorkActivityPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryJobId = searchParams.get('jobId');

    const [activeJobs, setActiveJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(queryJobId || '');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [asking, setAsking] = useState(false);

    // 1. Initial Load: Get all active hrings/jobs
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await getHiredFreelancers();
                setActiveJobs(res.data || []);
                
                if (!selectedJobId && res.data?.length > 0) {
                    setSelectedJobId(res.data[0].job_id);
                }
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
                toast.error('Could not load active jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    // 2. Fetch Logs when job or page changes
    useEffect(() => {
        if (selectedJobId) {
            fetchLogs(1);
        }
    }, [selectedJobId]);

    const fetchLogs = async (pageNum = 1) => {
        setLogsLoading(true);
        try {
            const res = await getJobWorkLogs(selectedJobId, pageNum, 10);
            if (pageNum === 1) {
                setLogs(res.data || []);
            } else {
                setLogs(prev => [...prev, ...(res.data || [])]);
            }
            setTotalPages(res.pagination?.totalPages || 1);
            setPage(pageNum);
        } catch (err) {
            console.error('Logs fetch err:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleAskUpdate = async (freelancerId) => {
        setAsking(true);
        try {
            await askForWorkUpdate({ job_id: selectedJobId, freelancer_id: freelancerId });
            toast.success('Update request sent to freelancer', { icon: '📬' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Daily limit reached');
        } finally {
            setAsking(false);
        }
    };

    const selectedJob = activeJobs.find(j => j.job_id === selectedJobId);
    const todayStr = new Date().toISOString().split('T')[0];
    const hasLogToday = logs.some(l => l.date === todayStr);

    if (loading) {
        return <InfinityLoader fullScreen={false} text="Loading Project Activity..."/>;
    }

    if (activeJobs.length === 0) {
        return (
            <div className="max-w-[1500px] mx-auto py-20 border-b border-white/5 text-center">
                <AlertCircle size={24} className="text-white/10 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">No Active Tracking</h3>
                <p className="text-white/30 max-w-sm mx-auto text-sm">You don't have any active contracts currently. Once a freelancer starts working, their daily updates will appear here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Project Activity</h1>
                    <p className="text-white/30 text-[10px] md:text-[11px] mt-1 uppercase tracking-widest font-bold">Monitor daily progress & transparency</p>
                </div>
                
                <div className="w-full sm:w-auto">
                    <CustomDropdown 
                        options={activeJobs.map(j => ({ label: j.jobs?.title || 'Selected Project', value: j.job_id }))}
                        value={selectedJobId}
                        onChange={(val) => {
                            setSelectedJobId(val);
                            setPage(1);
                            setSearchParams({ jobId: val });
                        }}
                        className="w-full sm:min-w-[280px]"
                        fullWidth={true}
                        placeholder="Select Project"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
                {/* ── LEFT: FREELANCER INFO ── */}
                <div className="lg:col-span-1 space-y-10 lg:space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="pb-10 border-b border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                {selectedJob?.freelancer?.avatar_url ? (
                                    <img src={selectedJob.freelancer.avatar_url} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <UserCircle2 className="text-white/10" size={28} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base leading-tight">{selectedJob?.freelancer?.name || 'Freelancer'}</h3>
                                <p className="text-white/30 text-[9px] uppercase font-black tracking-widest mt-0.5">Project Contractor</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${hasLogToday ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                    {hasLogToday ? 'Updates Current' : 'Pending Update'}
                                </span>
                            </div>
                            {!hasLogToday && (
                                <button 
                                    onClick={() => handleAskUpdate(selectedJob?.freelancer_id)}
                                    disabled={asking}
                                    className="w-full py-2.5 rounded-xl border border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
                                >
                                    {asking ? 'Requesting...' : 'Ask for Update'}
                                </button>
                            )}
                        </div>
                    </motion.div>

                    <div className="pb-8 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={12} className="text-blue-400" />
                            <h4 className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Transparency Note</h4>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed italic">
                            Freelancers are encouraged to log updates daily. This log acts as a work diary for the project.
                        </p>
                    </div>
                </div>


                {/* ── RIGHT: LOG TIMELINE ── */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History className="text-white/20" size={18} />
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Activity Stream</h2>
                        </div>
                        {logsLoading && <Clock className="animate-spin text-accent" size={16} />}
                    </div>

                    <div className="space-y-10 relative before:absolute before:left-[13px] before:top-4 before:bottom-4 before:w-[1px] before:bg-white/5">
                        <AnimatePresence mode="popLayout">
                            {logs.length === 0 && !logsLoading ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-16 text-center"
                                >
                                    <p className="text-white/20 text-sm italic font-medium">No activity logs recorded yet for this project.</p>
                                </motion.div>
                            ) : (
                                logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative pl-10 group"
                                    >
                                        {/* Timeline Dot (Border Removed) */}
                                        <div className={`absolute left-0 top-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center z-10 transition-all group-hover:scale-110`}>
                                            <Calendar size={12} className={log.date === todayStr ? 'text-accent' : 'text-white/20'} />
                                        </div>

                                        <div className={`pb-10 border-b border-white/5 transition-all ${log.date === todayStr ? 'border-accent/10' : ''}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm md:text-base font-black text-white">
                                                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    {log.date === todayStr && (
                                                        <span className="bg-accent/10 text-accent text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-accent/20 tracking-tighter">Current Day</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                    Logged at {new Date(log.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <p className="text-white/70 text-[14px] leading-relaxed whitespace-pre-wrap relative z-10">
                                                    {log.note}
                                                </p>
                                            </div>




                                            {log.updated_at !== log.created_at && (
                                                <div className="mt-4 flex items-center gap-1.5 text-white/20 text-[10px] italic">
                                                    <Clock size={10} />
                                                    <span>Edited later that day</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>

                        {page < totalPages && (
                            <div className="pl-12">
                                <button
                                    onClick={() => fetchLogs(page + 1)}
                                    disabled={logsLoading}
                                    className="w-full py-5 rounded-3xl border border-white/5 hover:bg-white/5 transition-all text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    {logsLoading ? <Clock className="animate-spin" size={16} /> : 'View Full History Timeline'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientWorkActivityPage;
