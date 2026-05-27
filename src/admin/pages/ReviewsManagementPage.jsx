import { useState, useEffect, useCallback } from 'react';
import { Trash2, Star, RefreshCw, Search, User, Briefcase, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminProjectReviews, getAdminSiteReviews, deleteReview } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { exportTableToPDF } from '../utils/exportPDF';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const ReviewsManagementPage = () => {
    const [reviews, setReviews]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [activeTab, setActiveTab]   = useState('project');
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [dateFrom, setDateFrom]     = useState('');
    const [dateTo, setDateTo]         = useState('');

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const result = activeTab === 'project'
                ? await getAdminProjectReviews()
                : await getAdminSiteReviews();
            if (result.success) setReviews(result.data);
        } catch {
            toast.error(`Failed to load ${activeTab} reviews`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this review permanently?')) return;
        try {
            const result = await deleteReview(id, activeTab);
            if (result.success) {
                toast.success('Review deleted');
                setReviews(prev => prev.filter(r => r.id !== id));
            }
        } catch {
            toast.error('Failed to delete review');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : '—';

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={11}
                    className={i < rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200 dark:fill-white/10 dark:text-white/10'}
                />
            ))}
            <span className="ml-1 text-[10px] font-bold text-amber-500">{rating}.0</span>
        </div>
    );

    const filtered = reviews.filter(r => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !q || (activeTab === 'project'
            ? (r.comment?.toLowerCase().includes(q) || r.reviewer_profile?.name?.toLowerCase().includes(q) || r.reviewee_profile?.name?.toLowerCase().includes(q) || r.contract?.title?.toLowerCase().includes(q))
            : (r.comment?.toLowerCase().includes(q) || r.name?.toLowerCase().includes(q)));
        const matchRating = !ratingFilter || r.rating === parseInt(ratingFilter);
        const d = r.created_at ? new Date(r.created_at) : null;
        const matchFrom = !dateFrom || (d && d >= new Date(dateFrom));
        const matchTo = !dateTo || (d && d <= new Date(dateTo + 'T23:59:59'));
        return matchSearch && matchRating && matchFrom && matchTo;
    });

    const handleExportPDF = () => {
        if (filtered.length === 0) { toast.error('No reviews to export'); return; }
        exportTableToPDF({
            title: `Reviews Management — ${activeTab === 'project' ? 'Project Reviews' : 'Site Reviews'}`,
            columns: activeTab === 'project'
                ? ['Reviewer', 'Reviewee', 'Contract', 'Rating', 'Comment', 'Date']
                : ['Name', 'Rating', 'Comment', 'Date'],
            rows: filtered.map(r => activeTab === 'project'
                ? [
                    r.reviewer_profile?.name || 'Unknown',
                    r.reviewee_profile?.name || '—',
                    r.contract?.title || '—',
                    `${r.rating}/5`,
                    (r.comment || '').slice(0, 80),
                    r.created_at ? new Date(r.created_at).toLocaleDateString() : '—',
                ]
                : [
                    r.name || 'Anonymous',
                    `${r.rating}/5`,
                    (r.comment || '').slice(0, 100),
                    r.created_at ? new Date(r.created_at).toLocaleDateString() : '—',
                ]
            ),
            filename: `reviews_${activeTab}`,
            filters: {
                Tab: activeTab === 'project' ? 'Project Reviews' : 'Site Reviews',
                Rating: ratingFilter ? `${ratingFilter} Stars` : 'All',
                ...(searchTerm && { Search: searchTerm }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo }),
            },
        });
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '—';
    const fiveStars = reviews.filter(r => r.rating === 5).length;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-review-100.png" alt="Reviews" className="w-7 h-7 object-contain" />
                            Reviews Management
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Monitor and moderate platform reviews to ensure community standards and quality</p>
                    </div>
                    {/* Refresh inline with title on mobile */}
                    <button
                        onClick={loadReviews}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Monitor and moderate platform reviews to ensure community standards and quality</p>
                {/* Refresh on desktop */}
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={loadReviews}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Reviews', value: reviews.length,  icon: '/Icons/icons8-review-100.png' },
                    { label: 'Avg Rating',    value: avgRating,        icon: '/Icons/icons8-star-100.png' },
                    { label: '5-Star',        value: fiveStars,        icon: '/Icons/icons8-facebook-like-100.png' },
                    { label: 'This Tab',      value: filtered.length,  icon: '/Icons/icons8-filter-100.png' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={icon} alt={label} className="w-4 h-4 object-contain opacity-50" />
                            <p className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                        </div>
                        <p className="text-slate-800 dark:text-white font-black text-2xl">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                {/* Main content */}
                <div className="space-y-4">
                    {/* Tabs + Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 w-full sm:w-auto">
                            {[
                                { id: 'project', label: 'Project Reviews' },
                                { id: 'site',    label: 'Site Reviews' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap text-center ${
                                        activeTab === tab.id
                                            ? 'text-accent'
                                            : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="reviewTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Filters row */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            {/* Dates: Row 1 on mobile */}
                            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                                <div className="relative flex-1 sm:w-36">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        title="From date"
                                        className="w-full h-10 px-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:border-accent [color-scheme:dark]"
                                    />
                                    <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest">From</span>
                                </div>
                                <div className="relative flex-1 sm:w-36">
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        title="To date"
                                        className="w-full h-10 px-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:border-accent [color-scheme:dark]"
                                    />
                                    <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest">To</span>
                                </div>
                            </div>

                            {/* CustomDropdown & Export: Row 2 on mobile */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2 sm:order-3">
                                <div className="w-full sm:w-auto sm:flex-initial">
                                    <CustomDropdown
                                        options={[
                                            { label: 'All Ratings', value: '' },
                                            { label: '5 Stars', value: '5' },
                                            { label: '4 Stars', value: '4' },
                                            { label: '3 Stars', value: '3' },
                                            { label: '2 Stars', value: '2' },
                                            { label: '1 Star', value: '1' }
                                        ]}
                                        value={ratingFilter}
                                        onChange={val => setRatingFilter(val)}
                                        variant="transparent"
                                        className="w-full sm:w-44"
                                    />
                                </div>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full sm:w-auto sm:flex-initial flex items-center justify-center gap-2 h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
                                >
                                    <FileDown size={14} /> Export PDF
                                </button>
                            </div>
                        </div>
                    </div>

                {/* Search Bar Row */}
                <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-12 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                        />
                    </div>
                    <button
                        onClick={loadReviews}
                        className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-slate-400 dark:text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>

                {/* Review cards */}
                    {loading ? (
                        <InfinityLoader fullScreen={false} text="Loading reviews..." />
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                            <img src="/Icons/icons8-review-100.png" alt="No reviews" className="w-10 h-10 object-contain opacity-10 mx-auto mb-3" />
                            <p className="text-slate-400 dark:text-white/30 text-sm">No reviews found</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <div className="space-y-3">
                                {filtered.map(review => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="border border-slate-200 dark:border-white/10 rounded-xl p-5 transition-all hover:border-accent/20"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* Reviewer row */}
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    {/* Reviewer avatar */}
                                                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                                        {activeTab === 'project' && review.reviewer_profile?.avatar_url ? (
                                                            <img src={review.reviewer_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={12} className="text-accent" />
                                                        )}
                                                    </div>
                                                    <span className="text-slate-800 dark:text-white font-bold text-sm">
                                                        {activeTab === 'project'
                                                            ? (review.reviewer_profile?.name || 'Unknown')
                                                            : (review.name || 'Anonymous')}
                                                    </span>

                                                    {activeTab === 'project' && review.reviewee_profile?.name && (
                                                        <>
                                                            <span className="text-slate-300 dark:text-white/20 text-xs">→</span>
                                                            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                                                {review.reviewee_profile?.avatar_url ? (
                                                                    <img src={review.reviewee_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User size={12} className="text-accent" />
                                                                )}
                                                            </div>
                                                            <span className="text-slate-600 dark:text-white/60 text-sm">
                                                                {review.reviewee_profile.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Contract tag */}
                                                {activeTab === 'project' && review.contract?.title && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <Briefcase size={10} className="text-slate-400 dark:text-white/30" />
                                                        <span className="text-[10px] text-slate-400 dark:text-white/30 truncate">{review.contract.title}</span>
                                                    </div>
                                                )}

                                                {/* Stars */}
                                                <div className="mb-2">{renderStars(review.rating)}</div>

                                                {/* Comment */}
                                                <p className="text-slate-500 dark:text-white/50 text-xs leading-relaxed line-clamp-2">
                                                    {review.comment || <span className="italic text-slate-400 dark:text-white/25">No comment provided</span>}
                                                </p>

                                                <p className="text-slate-400 dark:text-white/25 text-[10px] mt-2">{formatDate(review.created_at)}</p>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1.5 text-slate-400 dark:text-white/30 hover:text-red-500 transition-colors shrink-0"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="border border-accent/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-alert-96.png" alt="Info" className="w-5 h-5 object-contain opacity-70 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">Moderation</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Remove reviews that violate community guidelines. Deleted reviews cannot be recovered.
                            </p>
                        </div>
                    </div>
                    <div className="border border-amber-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-light-100.png" alt="Tip" className="w-5 h-5 object-contain opacity-60 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-1">Quality Signal</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                High average ratings indicate a healthy platform. Monitor low-rated reviews for patterns of abuse or fraud.
                            </p>
                        </div>
                    </div>

                    {/* Top reviewers mini-list */}
                    {reviews.length > 0 && (
                        <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <img src="/Icons/icons8-growth-100.png" alt="Top" className="w-4 h-4 object-contain opacity-60" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Recent Activity</h3>
                            </div>
                            {reviews.slice(0, 3).map(r => (
                                <div key={r.id} className="flex items-center justify-between gap-2">
                                    <span className="text-slate-700 dark:text-white/70 text-xs truncate">
                                        {activeTab === 'project'
                                            ? (r.reviewer_profile?.name || 'Unknown')
                                            : (r.name || 'Anonymous')}
                                    </span>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={9}
                                                className={i < r.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-slate-200 text-slate-200 dark:fill-white/10 dark:text-white/10'} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsManagementPage;
