import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle, Clock, Trash2, Edit3, X, Save, MessageSquare, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminFAQs, updateFAQ, deleteFAQ } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const FAQManagementPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [editModal, setEditModal] = useState({ isOpen: false, faq: null });
    const [answer, setAnswer] = useState('');
    const [question, setQuestion] = useState('');
    const [status, setStatus] = useState('pending');

    const loadFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAdminFAQs(statusFilter);
            if (result.success) {
                setFaqs(result.data);
            }
        } catch (error) {
            console.error('Error loading FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadFaqs();
    }, [loadFaqs]);

    const handleOpenEdit = (faq) => {
        setEditModal({ isOpen: true, faq });
        setQuestion(faq.question);
        setAnswer(faq.answer || '');
        setStatus(faq.status);
    };

    const handleUpdate = async () => {
        if (!question.trim()) {
            toast.error('Question cannot be empty');
            return;
        }

        try {
            const result = await updateFAQ(editModal.faq.id, {
                question,
                answer,
                status
            });
            if (result.success) {
                toast.success('FAQ updated successfully');
                setFaqs(prev => prev.map(f => f.id === editModal.faq.id ? result.data : f));
                setEditModal({ isOpen: false, faq: null });
            }
        } catch (error) {
            toast.error('Failed to update FAQ');
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteFAQ(confirmModal.id);
            if (result.success) {
                toast.success('FAQ entry deleted');
                setFaqs(prev => prev.filter(f => f.id !== confirmModal.id));
                setConfirmModal({ isOpen: false, id: null });
            }
        } catch (error) {
            toast.error('Failed to delete FAQ');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-lg sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <img src="/Icons/icons8-faq-80.png" alt="FAQ Management" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        FAQ Management
                    </h1>
                    <p className="text-white/50 text-sm">Manage Frequently Asked Questions and answer user-submitted inquiries.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <CustomDropdown
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Published', value: 'published' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        variant="accent"
                        className="min-w-[140px] !rounded-full h-[42px]"
                        fullWidth={false}
                    />
                    <button className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white px-5 py-2.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 h-[42px]">
                        <Download size={14} />
                        Export Data
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-transparent border border-white/10 rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-white/50 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">Question</th>
                                <th className="px-6 py-4">Answer Detail</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <tr key="loading">
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            <InfinityLoader fullScreen={false} size="md" text="Loading FAQs..." />
                                        </td>
                                    </tr>
                                ) : faqs.length === 0 ? (
                                    <tr key="empty">
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            No FAQ entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    faqs.map((faq) => (
                                        <motion.tr
                                            key={faq.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-white font-semibold group-hover:text-accent transition-colors line-clamp-2 max-w-xs">{faq.question}</p>
                                            </td>
                                            <td className="px-6 py-4 text-white/60">
                                                <p className="text-sm line-clamp-2 max-w-md leading-relaxed italic">
                                                    {faq.answer || <span className="text-white/20 text-xs font-medium">Awaitng response...</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${faq.status === 'published'
                                                        ? 'text-emerald-400'
                                                        : 'text-orange-400'
                                                    }`}>
                                                    {faq.status === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                    {faq.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/40 text-xs font-medium uppercase tracking-tighter opacity-80">{formatDate(faq.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(faq)}
                                                        className="p-2 text-white/40 hover:text-white transition-colors active:scale-95 group/btn"
                                                        title="Edit / Answer"
                                                    >
                                                        <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, id: faq.id })}
                                                        className="p-2 text-white/40 hover:text-rose-400 transition-colors active:scale-95 group/btn"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Edit / Answer Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditModal({ isOpen: false, faq: null })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-secondary border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <button
                                onClick={() => setEditModal({ isOpen: false, faq: null })}
                                className="absolute top-6 right-6 text-white/20 hover:text-white hover:scale-110 transition-all z-10"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-lg sm:text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                <div className="text-accent">
                                    <MessageSquare size={24} />
                                </div>
                                {editModal.faq.answer ? 'Refine FAQ' : 'Answer Question'}
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Question Description</label>
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all min-h-[100px] text-sm leading-relaxed"
                                        placeholder="Enter the question..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Official Answer</label>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all min-h-[180px] text-sm leading-relaxed"
                                        placeholder="Provide a detailed answer for the users..."
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 block">Publication Status</label>
                                        <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10 w-fit">
                                            <button
                                                onClick={() => setStatus('pending')}
                                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${status === 'pending' ? 'bg-orange-500/20 text-orange-400 shadow-lg border border-orange-500/20' : 'text-white/30 hover:text-white'}`}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                onClick={() => setStatus('published')}
                                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${status === 'published' ? 'bg-emerald-500/20 text-emerald-400 shadow-lg border border-emerald-500/20' : 'text-white/30 hover:text-white'}`}
                                            >
                                                Published
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setEditModal({ isOpen: false, faq: null })}
                                            className="px-6 py-3 rounded-2xl text-white/40 hover:text-white transition-all font-bold text-sm tracking-wide"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-8 py-3 bg-accent hover:opacity-90 text-white rounded-full transition-all font-black text-sm uppercase tracking-widest flex items-center gap-2 active:scale-95"
                                        >
                                            <Save size={18} />
                                            Update FAQ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete FAQ entry?"
                message="Are you sure you want to delete this FAQ entry? This will permanently remove it from the public help center."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon={<img src="/Icons/icons8-delete-user-100.png" alt="Delete" className="w-16 h-16 object-contain" />}
            />
        </div>
    );
};

export default FAQManagementPage;
