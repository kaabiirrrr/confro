import { useState, useEffect } from 'react';
import { Megaphone, Send, Users, UserCheck, Briefcase, Info, X, History, Clock } from 'lucide-react';
import { createAnnouncement, fetchAnnouncements } from '../../services/adminService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementsPage = () => {
    const [announcement, setAnnouncement] = useState({
        title: '',
        message: '',
        target_role: 'ALL',
        type: 'PLATFORM_UPDATE'
    });
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        // Shared loading of history if needed
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createAnnouncement(announcement);
            toast.success('Announcement published successfully!');
            setAnnouncement({ 
                title: '', 
                message: '', 
                target_role: 'ALL', 
                type: 'PLATFORM_UPDATE' 
            });
            if (showHistory) loadHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish announcement');
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const result = await fetchAnnouncements();
            if (result.success) {
                setHistory(result.data);
            }
        } catch (error) {
            toast.error('Failed to load history');
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleHistory = () => {
        if (!showHistory && history.length === 0) {
            loadHistory();
        }
        setShowHistory(!showHistory);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <Megaphone size={24} className="text-[#38BDF8]" /> Platform Announcements
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Broadcast general updates, news, and platform changes to users
                    </p>
                </div>
                
                <button
                    onClick={toggleHistory}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/10 transition-all text-xs font-semibold"
                >
                    <History size={14} />
                    View History
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                {/* Form Section */}
                <div className="bg-transparent border border-white/5 rounded-3xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-white/40 text-[9px] font-bold uppercase tracking-widest pl-1">Audience</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'ALL', label: 'Everyone', icon: <Users size={14} /> },
                                    { id: 'FREELANCER', label: 'Freelancers', icon: <UserCheck size={14} /> },
                                    { id: 'CLIENT', label: 'Clients', icon: <Briefcase size={14} /> }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setAnnouncement({ ...announcement, target_role: role.id })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-full border transition-all text-xs font-medium ${announcement.target_role === role.id
                                            ? 'bg-[#38BDF8] border-[#38BDF8] text-white shadow-lg shadow-sky-600/20'
                                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/10'
                                            }`}
                                    >
                                        {role.icon}
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">Headline</label>
                            <input
                                required
                                type="text"
                                value={announcement.title}
                                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                placeholder="What's new on the platform?"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">Content</label>
                            <textarea
                                required
                                rows="6"
                                value={announcement.message}
                                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                                placeholder="Describe the update in detail..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-white/10 leading-relaxed"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 shadow-lg shadow-sky-500/10"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={14} />
                                    Publish Announcement
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-transparent border border-[#38BDF8]/10 rounded-2xl p-6 flex gap-4 items-start">
                        <Info className="text-[#38BDF8] shrink-0" size={16} />
                        <div className="space-y-1">
                            <h4 className="text-[#38BDF8] font-bold text-[10px] uppercase tracking-widest">Platform Updates</h4>
                            <p className="text-white/30 text-[9px] leading-relaxed">
                                Use this section for non-promotional news, maintenance notices, and general feature releases.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="w-full max-w-xl h-full bg-[#0b0f1a] border-l border-white/5 p-8 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-white">Announcement History</h2>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X size={20} className="text-white/40" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {loadingHistory ? (
                                    <div className="py-20 text-center">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <span className="text-white/20 text-xs">Fetching records...</span>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-20 border border-white/5 rounded-2xl">
                                        <p className="text-white/20 text-sm">No announcements yet.</p>
                                    </div>
                                ) : (
                                    history.map((record) => (
                                        <div key={record.id} className="bg-transparent border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-blue-500/10 text-blue-400 uppercase tracking-widest">
                                                    {record.target_role}
                                                </span>
                                                <span className="text-white/20 text-[9px] flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDate(record.created_at)}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-bold text-sm">{record.title}</h3>
                                            <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{record.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnnouncementsPage;
