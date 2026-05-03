import React, { useState, useEffect } from 'react';
import {
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronRight,
    MessageSquare,
    Save,
    History,
    Search,
    Filter,
    X
} from 'lucide-react';
import {
    getMyContracts,
    upsertWorkLog,
    getJobWorkLogs
} from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import CustomDropdown from '../../ui/CustomDropdown';
import InfinityLoader from '../../common/InfinityLoader';
import { formatINR } from '../../../utils/currencyUtils';

const WorkActivity = () => {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [logs, setLogs] = useState([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fetchLogsLoading, setFetchLogsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hours, setHours] = useState('');
    const [queries, setQueries] = useState([]);

    // Initial load: Fetch active contracts
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await getMyContracts();
                // Filter only active/in-progress contracts
                const activeOnes = (res?.data || []).filter(c => ['ACTIVE', 'IN_PROGRESS'].includes(c.status));
                setContracts(activeOnes);

                if (activeOnes.length > 0) {
                    setSelectedJob(activeOnes[0]);
                }
                
                // Fetch direct query alerts
                try {
                    const { getWorkLogQueries } = await import('../../../services/apiService');
                    const qRes = await getWorkLogQueries();
                    setQueries(qRes.data || []);
                } catch (qErr) {
                    console.error('Failed to fetch requests:', qErr);
                }
            } catch (err) {
                console.error('Failed to fetch contracts:', err);
                toast.error('Could not load active jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch logs when job changes
    useEffect(() => {
        if (selectedJob) {
            fetchLogs(1);
            // Check if there's a log for today to pre-fill
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLog = logs.find(l => l.date === todayStr);
            if (todayLog) {
                setNote(todayLog.note);
                setHours(todayLog.hours || '');
            } else {
                setNote('');
                setHours('');
            }
        }
    }, [selectedJob]);

    const fetchLogs = async (pageNum = 1) => {
        if (!selectedJob) return;
        setFetchLogsLoading(true);
        try {
            const res = await getJobWorkLogs(selectedJob.job_id, pageNum, 10);
            if (pageNum === 1) {
                setLogs(res.data || []);
            } else {
                setLogs(prev => [...prev, ...(res.data || [])]);
            }
            setTotalPages(res.pagination?.totalPages || 1);
            setPage(pageNum);

            // Check if today is already logged
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLog = (res.data || []).find(l => l.date === todayStr);
            if (todayLog && pageNum === 1) {
                setNote(todayLog.note);
                setHours(todayLog.hours || '');
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setFetchLogsLoading(false);
        }
    };

    const handleUpsert = async (e) => {
        e.preventDefault();
        if (!selectedJob) return;
        if (note.trim().length < 10) {
            toast.error('Please provide a more meaningful update (min 10 characters)');
            return;
        }

        setSubmitting(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            
            console.log('[handleUpsert] Selected Job State:', selectedJob);
            
            if (!selectedJob?.job_id) {
                console.error('[handleUpsert] MISSING job_id on selected job object');
                toast.error('Data sync error: Missing project reference. Please refresh.');
                setSubmitting(false);
                return;
            }

            await upsertWorkLog({
                job_id: selectedJob.job_id,
                note: note.trim(),
                hours: parseFloat(hours) || 0,
                date: today
            });
            toast.success('Work activity updated for today');
            fetchLogs(1); // Refresh list
        } catch (err) {
            console.error('Upsert Err:', err);
            toast.error(err.response?.data?.message || 'Failed to save update');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <InfinityLoader fullScreen={false} size="md" text="Loading Your Activity..." />;
    }

    if (contracts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-3xl">
                <AlertCircle size={48} className="text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Jobs</h3>
                <p className="text-white/40 max-w-sm">You need an active contract to log daily work activity. Check your proposals or hired projects.</p>
            </div>
        );
    }

    return (
        <div className="w-[1480px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── ALERTS SECTION (Client Requests) ── */}
            <AnimatePresence>
                {queries.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 mb-8">
                            {queries.map((q) => (
                                <div key={q.id} className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-4 transition shadow-sm animate-pulse-slow">
                                    <Clock className="text-accent shrink-0 mt-0.5" size={16} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Update Requested</h4>
                                        <p className="text-slate-900 dark:text-white font-bold text-xs truncate mb-1">{q.job?.title || 'Project'}</p>
                                        <p className="text-[11px] text-slate-600 dark:text-white/50 italic">&ldquo;{q.message}&rdquo;</p>
                                    </div>
                                    <button 
                                        onClick={() => setQueries(prev => prev.filter(item => item.id !== q.id))}
                                        className="text-white/20 hover:text-white shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Work Activity</h1>
                    <p className="text-white/40 text-[11px] mt-1">Log your daily progress and keep clients informed.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-64">
                    <CustomDropdown
                        options={contracts.map(c => ({
                            label: c.job?.title || 'Selected Job',
                            value: c.id,
                            description: `${c.job?.category || 'Project'} • ${c.status}`
                        }))}
                        value={selectedJob?.id}
                        onChange={(val) => setSelectedJob(contracts.find(c => c.id === val))}
                        placeholder="Select Job"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── LOGGING FORM ── */}
                <div className="lg:col-span-1 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pb-10 border-b border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="text-accent" size={18} />
                            <div>
                                <h3 className="text-white font-bold text-xs">Today's Update</h3>
                                <p className="text-white/30 text-[8px] uppercase tracking-widest font-black">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpsert} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Daily Log Note</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What did you work on today?..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-white/20 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Hours Worked</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="e.g. 5.5"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-white/10"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                        hours
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || note.trim().length < 10 || !hours}
                                className="w-full bg-accent text-white py-3.5 rounded-full flex items-center justify-center gap-2 group disabled:opacity-50 hover:bg-accent/90 transition-all active:scale-[0.98]"
                            >
                                {submitting ? <Clock className="animate-spin" size={16} /> : (
                                    <>
                                        <Save size={16} className="group-hover:rotate-12 transition-transform" />
                                        <span className="font-bold">Save Activity Log</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={12} className="text-accent mt-0.5 shrink-0" />
                                <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                    Updates for today can be edited until 11:59 PM.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="pb-8 border-b border-white/5">
                        <h4 className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-4">Contract Summary</h4>
                        
                        {/* Client Info Added */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group/client hover:bg-white/[0.08] transition-all mb-6">
                            {selectedJob?.client?.avatar_url ? (
                                <img 
                                    src={selectedJob.client.avatar_url} 
                                    alt={selectedJob.client.name} 
                                    className="w-12 h-12 rounded-full object-cover transition-transform group-hover/client:scale-105"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg font-black group-hover/client:rotate-6 transition-transform">
                                    {selectedJob?.client?.name?.[0] || 'C'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">Project Client</p>
                                <h4 className="text-sm font-bold text-white truncate">{selectedJob?.client?.name || 'Project Client'}</h4>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Logs</span>
                                <span className="text-white font-black text-sm">{logs.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Rate</span>
                                <span className="text-white font-black text-xs text-accent">{formatINR(selectedJob?.agreed_rate)}{selectedJob?.job?.budget_type?.toLowerCase() === 'hourly' ? '/hr' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LOG HISTORY ── */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History size={18} className="text-white/20" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Activity Timeline</h3>
                        </div>
                        {fetchLogsLoading && <Clock className="animate-spin text-accent" size={14} />}
                    </div>

                    <div className="space-y-0">
                        <AnimatePresence mode="popLayout">
                            {logs.length === 0 && !fetchLogsLoading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center rounded-3xl border border-dashed border-white/10"
                                >
                                    <p className="text-white/20 text-sm italic">No updates logged yet.</p>
                                </motion.div>
                            ) : (
                                logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group pb-8 mb-8 border-b border-white/5 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {log.date === new Date().toISOString().split('T')[0] && (
                                                        <span className="text-[9px] font-black text-accent border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white/70 text-[14px] leading-relaxed whitespace-pre-wrap">
                                                    {log.note}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-white tracking-widest">{log.hours || 0}h</span>
                                                    <div className="text-accent">
                                                        <CheckCircle2 size={12} />
                                                    </div>
                                                </div>
                                                <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">
                                                    {new Date(log.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>


                        {page < totalPages && (
                            <button
                                onClick={() => fetchLogs(page + 1)}
                                disabled={fetchLogsLoading}
                                className="w-full py-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-white/30 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {fetchLogsLoading ? <Clock className="animate-spin" size={14} /> : 'Load More History'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkActivity;
