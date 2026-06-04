import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Target, AlertCircle } from 'lucide-react';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';

const EditMemberModal = ({ isOpen, onClose, member, jobId, onUpdate }) => {
    const [role, setRole] = useState(member?.role || '');
    const [scope, setScope] = useState(member?.scope || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    useEffect(() => {
        if (isOpen && member) {
            setRole(member.role || '');
            setScope(member.scope || '');
        }
    }, [isOpen, member]);

    const handleOptimize = async () => {
        if (!scope.trim() || scope.length < 5) {
            toast.error("Please enter a rough scope first");
            return;
        }
        setIsOptimizing(true);
        try {
            const { data: res } = await api.post('/api/ai/optimize-mission', {
                role: role || 'Freelancer',
                category: member?.profile?.category || 'General',
                roughScope: scope
            });
            if (res.success && res.data) {
                setScope(res.data);
                toast.success("Mission scope optimized by Connect AI");
            } else if (res.data) {
                setScope(res.data);
                toast.success("Mission scope optimized by Connect AI");
            }
        } catch (err) {
            toast.error("AI service temporarily unavailable");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleSubmit = async () => {
        if (!role.trim()) { toast.error("Role is required"); return; }
        if (!scope.trim()) { toast.error("Mission scope is mandatory"); return; }

        setIsSubmitting(true);
        try {
            const res = await onUpdate(member.id, { role, scope });
            if (res?.success !== false) onClose();
        } catch (err) {
            toast.error("Failed to update team member");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/75 backdrop-blur-sm"
                    />

                    {/* Sheet — slides down, fully rounded */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                        className="relative w-full sm:max-w-md bg-secondary border border-white/10 rounded-2xl shadow-2xl shadow-black/60"
                    >
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-widest">Mission Control</h2>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                                    {member?.profile?.name || 'Freelancer'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-white/30 hover:text-white transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Role Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                                    <User size={9} /> Assigned Role
                                </label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Lead Developer, Senior Designer"
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder:text-white/10 focus:border-accent/40 focus:ring-0 transition-all outline-none"
                                />
                            </div>

                            {/* Mission Scope Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                                        <Target size={9} /> Mission Scope
                                    </label>

                                    {/* Connect AI Button */}
                                    <button
                                        onClick={handleOptimize}
                                        disabled={isOptimizing}
                                        className="flex items-center gap-1.5 text-[9px] font-bold text-accent uppercase tracking-widest hover:bg-accent/10 py-1 px-2.5 rounded-full transition-all border border-accent/20 disabled:opacity-60"
                                    >
                                        {isOptimizing ? (
                                            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin shrink-0" />
                                        ) : (
                                            <>
                                                {/* Light theme logo */}
                                                <img
                                                    src="/Icons/AI-Connect.png"
                                                    className="w-3.5 h-3.5 object-contain block dark:hidden"
                                                    alt=""
                                                />
                                                {/* Dark theme logo */}
                                                <img
                                                    src="/Icons/White-AI-Connect.png"
                                                    className="w-3.5 h-3.5 object-contain hidden dark:block"
                                                    alt=""
                                                />
                                            </>
                                        )}
                                        Connect AI
                                    </button>
                                </div>

                                {/* Textarea or Skeleton */}
                                {isOptimizing ? (
                                    <div className="w-full bg-white/5 border border-white/10 rounded px-4 py-4 h-[132px] space-y-2.5 animate-pulse">
                                        <div className="h-2.5 bg-white/10 rounded-full w-full" />
                                        <div className="h-2.5 bg-white/10 rounded-full w-[90%]" />
                                        <div className="h-2.5 bg-white/10 rounded-full w-[75%]" />
                                        <div className="h-2.5 bg-white/10 rounded-full w-[85%]" />
                                        <div className="h-2.5 bg-white/10 rounded-full w-[60%]" />
                                    </div>
                                ) : (
                                    <textarea
                                        rows={4}
                                        value={scope}
                                        onChange={(e) => setScope(e.target.value)}
                                        placeholder="Define the core mission for this team member..."
                                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder:text-white/10 focus:border-accent/40 focus:ring-0 transition-all outline-none resize-none leading-relaxed"
                                    />
                                )}
                            </div>

                            {/* Warning */}
                            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-2.5">
                                <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-500/70 leading-relaxed font-medium">
                                    Updates will notify the freelancer and may reset their mission acknowledgement status.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
                            <button
                                onClick={onClose}
                                className="py-3 rounded-full border border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                className="rounded-full h-auto py-3 font-bold text-[11px] uppercase tracking-widest bg-accent text-black"
                            >
                                Update Mission
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditMemberModal;
