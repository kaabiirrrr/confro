import { useState, useEffect } from 'react';
import { Tag, Send, Users, UserCheck, Briefcase, Info, X, History, Clock, TrendingUp, Eye, MousePointer2, Percent } from 'lucide-react';
import { createAnnouncement, fetchAnnouncements, fetchOfferAnalytics } from '../../services/adminService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/ui/CustomDropdown';

const OffersPage = () => {
    const [offer, setOffer] = useState({
        offer_name: '',
        title: '',
        message: '',
        target_role: 'ALL',
        is_limited: false,
        end_time: ''
    });
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [analytics, setAnalytics] = useState({});

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const result = await fetchOfferAnalytics();
            if (result.success) {
                setAnalytics(result.data);
            }
        } catch (error) {
            console.error('Failed to load analytics');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // We use the same backend endpoint but with offer-specific data
            await createAnnouncement(offer);
            toast.success('Platform Offer published successfully!');
            setOffer({ 
                offer_name: '', 
                title: '', 
                message: '', 
                target_role: 'ALL', 
                is_limited: false, 
                end_time: '' 
            });
            loadAnalytics();
            if (showHistory) loadHistory();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to publish offer';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const result = await fetchAnnouncements();
            if (result.success) {
                // Filter if needed, but for now show all related to banners
                setHistory(result.data);
            }
        } catch (error) {
            toast.error('Failed to load offer history');
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStats = (id) => analytics[id] || { views: 0, clicks: 0, engagement_rate: '0.0' };

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-offer-100.png" alt="Offers" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Platform Offers
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Manage premium promotional banners and limited-time deals
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                {/* Form Section */}
                <div className="bg-transparent border border-white/10 rounded-[20px] sm:rounded-[32px] p-5 sm:p-10 relative overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/20">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                        <Tag size={300} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8 relative z-10">
                        {/* Target Audience */}
                        <div className="space-y-4">
                            <label className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pl-1">Target Audience</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'ALL', label: 'Everyone', icon: <Users size={16} /> },
                                    { id: 'FREELANCER', label: 'Freelancers', icon: <UserCheck size={16} /> },
                                    { id: 'CLIENT', label: 'Clients', icon: <Briefcase size={16} /> }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setOffer({ ...offer, target_role: role.id })}
                                        className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all duration-300 ${offer.target_role === role.id
                                            ? 'bg-[#38BDF8] border-[#38BDF8] text-white shadow-lg shadow-sky-500/10'
                                            : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        <div className={`${offer.target_role === role.id ? 'text-white' : 'text-[#38BDF8]'}`}>{role.icon}</div>
                                        <span className="font-bold text-[11px] tracking-wide uppercase">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                            <div className="space-y-4">
                                <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Promotion Name (Internal)</label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="text"
                                        value={offer.offer_name}
                                        onChange={(e) => setOffer({ ...offer, offer_name: e.target.value })}
                                        placeholder="e.g. Easter Special 2024"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 sm:px-6 sm:py-4 text-white text-xs sm:text-sm focus:outline-none focus:border-accent/50 transition-all font-medium group-hover:border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Banner Heading</label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="text"
                                        value={offer.title}
                                        onChange={(e) => setOffer({ ...offer, title: e.target.value })}
                                        placeholder="E.G. LIMITED FLASH SALE!"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 sm:px-6 sm:py-4 text-white text-xs sm:text-sm focus:outline-none focus:border-accent/50 transition-all font-medium group-hover:border-white/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Offer Expiry (Auto-Hide)</label>
                                <input
                                    required
                                    type="datetime-local"
                                    value={offer.end_time}
                                    onChange={(e) => setOffer({ ...offer, end_time: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 sm:px-6 sm:py-4 text-white text-xs sm:text-sm focus:outline-none focus:border-accent/50 transition-all font-medium group-hover:border-white/10 [color-scheme:dark]"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Display Mode</label>
                                <CustomDropdown
                                    options={[
                                        { label: 'Static Banner', value: 'false' },
                                        { label: 'Countdown Banner', value: 'true' }
                                    ]}
                                    value={String(offer.is_limited)}
                                    onChange={(val) => setOffer({ ...offer, is_limited: val === 'true' })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Marketing Message</label>
                            <div className="relative group">
                                <textarea
                                    required
                                    rows="4"
                                    value={offer.message}
                                    onChange={(e) => setOffer({ ...offer, message: e.target.value })}
                                    placeholder="Get 40% off your next transaction. Hurry!"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3 py-3 sm:px-6 sm:py-5 text-white text-xs sm:text-sm focus:outline-none focus:border-accent/50 transition-all resize-none placeholder:text-white/10 font-medium leading-relaxed group-hover:border-white/10"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 sm:py-3 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] sm:text-xs disabled:opacity-50 shadow-lg shadow-sky-500/10"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={14} />
                                    GO LIVE
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Analytics Sidebar */}
                <div className="space-y-6">
                    <div className="bg-transparent border border-white/10 rounded-[32px] p-6">
                        <div className="flex items-center gap-2 mb-6 text-accent">
                            <TrendingUp size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Engagement Highs</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-transparent rounded-2xl p-4 border border-white/5">
                                <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Most Engaged</p>
                                <p className="text-white font-bold text-xs truncate">
                                    {history.length > 0 ? (history.sort((a,b) => parseFloat(getStats(b.id).engagement_rate) - parseFloat(getStats(a.id).engagement_rate))[0]?.offer_name || 'Loading...') : 'No data'}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-transparent rounded-2xl p-4 border border-[#B8860B]/20">
                                    <Eye className="text-[#B8860B] mb-2" size={14} />
                                    <p className="text-[#B8860B]/60 text-[8px] font-black uppercase tracking-widest">Global Views</p>
                                    <p className="text-white font-black text-lg">
                                        {Object.values(analytics).reduce((acc, curr) => acc + curr.views, 0)}
                                    </p>
                                </div>
                                <div className="bg-transparent rounded-2xl p-4 border border-emerald-500/20">
                                    <MousePointer2 className="text-emerald-500 mb-2" size={14} />
                                    <p className="text-emerald-500/60 text-[8px] font-black uppercase tracking-widest">Global Clicks</p>
                                    <p className="text-white font-black text-lg">
                                        {Object.values(analytics).reduce((acc, curr) => acc + curr.clicks, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-transparent border border-amber-500/10 rounded-[24px] p-6 flex gap-4 items-start">
                        <Info className="text-amber-500 shrink-0" size={18} />
                        <div className="space-y-1">
                            <h4 className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.1em]">Strategy Tip</h4>
                            <p className="text-white/40 text-[9px] font-medium leading-relaxed">
                                Use high-contrast headings and clear calls-to-action. Performance logs help you see which offers convert best.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-secondary/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="w-full max-w-2xl h-full bg-secondary border-l border-white/10 p-8 overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                                        <History className="text-accent" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Offer Logs</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Historical performance metrics</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                                >
                                    <X size={24} className="text-white/40" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {loadingHistory ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-white/20 text-xs font-black uppercase tracking-widest">Loading...</span>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[32px]">
                                        <Tag size={48} className="mx-auto text-white/5 mb-4" />
                                        <p className="text-white/20 text-sm font-medium">No offer history found.</p>
                                    </div>
                                ) : (
                                    history.map((record) => {
                                        const stats = getStats(record.id);
                                        return (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-transparent border border-white/10 rounded-[28px] p-6 hover:bg-white/[0.08] transition-all group overflow-hidden relative"
                                            >
                                                {record.is_limited && (
                                                    <div className="absolute top-0 right-10 bg-accent text-white text-[8px] font-black px-3 py-1 rounded-b-lg tracking-[0.2em] uppercase">Limited</div>
                                                )}
                                                
                                                <div className="flex flex-col gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                                                                record.target_role === 'ALL' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                record.target_role === 'FREELANCER' ? 'bg-indigo-500/10 text-indigo-400' :
                                                                'bg-amber-500/10 text-amber-400'
                                                            }`}>
                                                                {record.target_role === 'ALL' ? 'Everyone' : record.target_role}
                                                            </span>
                                                            <span className="text-white/20 text-[9px] font-bold uppercase flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {formatDate(record.created_at)}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-white font-black text-lg tracking-tight leading-tight group-hover:text-accent transition-colors flex items-center gap-2">
                                                            {record.offer_name || 'Generic Promo'}
                                                            <span className="text-white/10 text-xs font-medium">({record.title})</span>
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                                                        <div className="space-y-1">
                                                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Views</p>
                                                            <div className="flex items-center gap-2 font-black text-white">
                                                                <Eye size={12} className="text-white/10" />
                                                                {stats.views}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Clicks</p>                                                            <div className="flex items-center gap-2 font-black text-white">
                                                                <MousePointer2 size={12} className="text-white/10" />
                                                                {stats.clicks}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">CTR</p>
                                                            <div className="flex items-center gap-2 font-black text-emerald-500">
                                                                <Percent size={12} className="text-emerald-500/20" />
                                                                {stats.engagement_rate}%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap">{record.message}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OffersPage;
