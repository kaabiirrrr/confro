import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Star, MessageSquare, Briefcase, User, Info, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminProjectReviews, getAdminSiteReviews, deleteReview } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import InfinityLoader from '../../components/common/InfinityLoader';

const ReviewsManagementPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('project'); // 'project' or 'site'
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [searchTerm, setSearchTerm] = useState('');

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const result = activeTab === 'project'
                ? await getAdminProjectReviews()
                : await getAdminSiteReviews();

            if (result.success) {
                setReviews(result.data);
            }
        } catch (error) {
            console.error(`Error loading ${activeTab} reviews:`, error);
            toast.error(`Failed to load ${activeTab} reviews`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleDelete = async () => {
        try {
            const result = await deleteReview(confirmModal.id, activeTab);
            if (result.success) {
                toast.success('Review deleted successfully');
                setReviews(prev => prev.filter(r => r.id !== confirmModal.id));
                setConfirmModal({ isOpen: false, id: null });
            }
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={i < rating ? "fill-accent text-accent" : "fill-white/10 text-white/10"}
                    />
                ))}
                <span className="ml-1 text-xs font-bold text-accent">{rating}.0</span>
            </div>
        );
    };

    const filteredReviews = reviews.filter(review => {
        const searchLower = searchTerm.toLowerCase();
        if (activeTab === 'project') {
            return (
                review.comment?.toLowerCase().includes(searchLower) ||
                review.reviewer_profile?.name?.toLowerCase().includes(searchLower) ||
                review.reviewee_profile?.name?.toLowerCase().includes(searchLower) ||
                review.contract?.title?.toLowerCase().includes(searchLower)
            );
        } else {
            return (
                review.comment?.toLowerCase().includes(searchLower) ||
                review.name?.toLowerCase().includes(searchLower)
            );
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-lg sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <img src="/Icons/icons8-review-100.png" alt="Reviews" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Reviews Management
                    </h1>
                    <p className="text-white/50 text-sm">Monitor and moderate platform and project-based user reviews.</p>
                </motion.div>

                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search reviews by content or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent/50 w-full transition-all hover:bg-white/10 focus:bg-white/[0.08]"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/10 w-full mb-2">
                {[
                    { key: 'project', label: 'Project Reviews' },
                    { key: 'site', label: 'Site Reviews' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`relative pb-4 px-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'text-accent' : 'text-white/30 hover:text-white'}`}
                    >
                        {label}
                        {activeTab === key && (
                            <motion.div 
                                layoutId="activeTabUnderline"
                                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent"
                            />
                        )}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-transparent border border-white/10 rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-white/50 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                                {activeTab === 'project' ? (
                                    <>
                                        <th className="px-6 py-4">Reviewer / Contract</th>
                                        <th className="px-6 py-4">Reviewee</th>
                                        <th className="px-6 py-4">Rating & Feedback</th>
                                        <th className="px-6 py-4">Date</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4">Reviewer Profile</th>
                                        <th className="px-6 py-4">Rating & Feedback</th>
                                        <th className="px-6 py-4">Date</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <tr key="loading">
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            <InfinityLoader fullScreen={false} size="md" text="Loading reviews..." />
                                        </td>
                                    </tr>
                                ) : filteredReviews.length === 0 ? (
                                    <tr key="empty">
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            <div className="flex flex-col items-center gap-2">
                                                <Info size={24} className="text-white/20" />
                                                <span>No reviews found matching your search.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReviews.map((review) => (
                                        <motion.tr
                                            key={review.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {activeTab === 'project' ? (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-sm shadow-black/20">
                                                                {review.reviewer_profile?.avatar_url ? (
                                                                    <img src={review.reviewer_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[10px] text-accent font-bold">
                                                                        {(review.reviewer_profile?.name || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-white font-medium text-xs">{review.reviewer_profile?.name || 'Unknown'}</span>
                                                                <span className="text-[9px] text-white/30 flex items-center gap-1">
                                                                    <Briefcase size={10} />
                                                                    {review.contract?.title || 'Contract Deleted'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-sm shadow-black/20">
                                                                {review.reviewee_profile?.avatar_url ? (
                                                                    <img src={review.reviewee_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[10px] text-accent font-bold">
                                                                        {(review.reviewee_profile?.name || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-white font-medium text-xs">{review.reviewee_profile?.name || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            {renderStars(review.rating)}
                                                            <p className="text-sm text-white/60 line-clamp-2 max-w-md">{review.comment}</p>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                                <User size={14} className="text-accent" />
                                                            </div>
                                                            <span className="text-white font-medium">{review.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            {renderStars(review.rating)}
                                                            <p className="text-sm text-white/60 line-clamp-2 max-w-md">{review.comment}</p>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-6 py-4">
                                                <span className="text-white/40 text-xs font-semibold tracking-tighter uppercase opacity-80">{formatDate(review.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setConfirmModal({ isOpen: true, id: review.id })}
                                                    className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Review?"
                message={`Are you sure you want to delete this ${activeTab} review? This action cannot be undone and will permanently remove it from the platform.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon={<img src="/Icons/icons8-delete-user-100.png" alt="Delete" className="w-16 h-16 object-contain" />}
            />
        </div>
    );
};

export default ReviewsManagementPage;
