import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle, Clock, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminProblems, updateProblemStatus, deleteProblem } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const ProblemsPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: '' });

    const loadProblems = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAdminProblems(statusFilter);
            if (result.success) {
                setProblems(result.data);
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            toast.error('Failed to load user problems');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadProblems();
    }, [loadProblems]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const result = await updateProblemStatus(id, newStatus);
            if (result.success) {
                toast.success(`Problem marked as ${newStatus}`);
                setProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteProblem(confirmModal.id);
            if (result.success) {
                toast.success('Problem deleted');
                setProblems(prev => prev.filter(p => p.id !== confirmModal.id));
                setConfirmModal({ isOpen: false, id: null, type: '' });
            }
        } catch (error) {
            toast.error('Failed to delete problem');
        }
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-problem-solution-66.png" alt="User Problems" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        User Problems
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Review challenges and issues reported by users via the Solutions page.</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <CustomDropdown
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Resolved', value: 'resolved' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        variant="transparent"
                        className="w-full sm:min-w-[140px]"
                    />
                    <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-white/10 transition-all text-xs sm:text-sm font-bold active:scale-95 whitespace-nowrap">
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
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-white/50 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Problem Context</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Submitted At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            <InfinityLoader fullScreen={false} size="md" text="Loading problems..." />
                                        </td>
                                    </tr>
                                ) : problems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                            No problems found.
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((problem) => (
                                        <motion.tr
                                            key={problem.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-white font-semibold group-hover:text-accent transition-colors">{problem.first_name} {problem.last_name}</span>
                                                    <span className="text-white/40 text-[11px] font-medium tracking-wide">{problem.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white/70 text-sm max-w-md line-clamp-2 leading-relaxed">
                                                    {problem.problem_description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                    problem.status === 'resolved'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                    {problem.status === 'resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                    {problem.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/40 text-xs font-medium uppercase tracking-tighter opacity-80">{formatDate(problem.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {problem.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(problem.id, 'resolved')}
                                                            className="p-2 text-white/40 hover:text-emerald-400 transition-colors active:scale-90"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, id: problem.id, type: 'DELETE' })}
                                                        className="p-2 text-white/40 hover:text-rose-400 transition-colors active:scale-90"
                                                        title="Delete Problem"
                                                    >
                                                        <Trash2 size={18} />
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, type: '' })}
                onConfirm={handleDelete}
                title="Delete Problem entry?"
                message="Are you sure you want to delete this problem report? This data will be permanently removed from the records."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon={<img src="/Icons/icons8-delete-user-100.png" alt="Delete" className="w-16 h-16 object-contain" />}
            />
        </div>
    );
};

export default ProblemsPage;
