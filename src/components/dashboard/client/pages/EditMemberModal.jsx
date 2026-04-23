import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, User, Target, Shield, AlertCircle } from 'lucide-react';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import InfinityLoader from '../../../common/InfinityLoader';

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
                toast.success("Mission scope optimized by AI");
            } else if (res.data) {
                // Handle cases where data is returned directly
                setScope(res.data);
                toast.success("Mission scope optimized by AI");
            }
        } catch (err) {
            toast.error("AI service temporarily unavailable");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleSubmit = async () => {
        if (!role.trim()) {
            toast.error("Role is required");
            return;
        }
        if (!scope.trim()) {
            toast.error("Mission scope is mandatory");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await onUpdate(member.id, { role, scope });
            if (res?.success !== false) {
                onClose();
            }
        } catch (err) {
            toast.error("Failed to update team member");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0B0C10] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header Image/Pattern */}
                    <div className="h-32 bg-gradient-to-br from-accent/20 to-transparent relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" 
                             style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px'}} />
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20 border-4 border-[#0B0C10]">
                                <Zap size={32} className="text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-14">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Mission Control</h2>
                            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-black">Member: {member?.profile?.name || 'Freelancer'}</p>
                        </div>

                        <div className="space-y-6">
                            {/* Role Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                                    <User size={10} /> Assigned Role
                                </label>
                                <input 
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Lead Developer, Senior Designer"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-white/10 focus:border-accent/40 focus:ring-0 transition-all outline-none"
                                />
                            </div>

                            {/* Mission Scope Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 ml-1">
                                        <Target size={10} /> Mission Scope
                                    </label>
                                    <button 
                                        onClick={handleOptimize}
                                        disabled={isOptimizing}
                                        className="text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5 hover:bg-accent/10 py-1.5 px-3 rounded-lg transition-all border border-accent/20"
                                    >
                                        {isOptimizing ? <InfinityLoader size={8} /> : <Zap size={10} fill="currentColor" />}
                                        AI Optimize
                                    </button>
                                </div>
                                <textarea 
                                    rows={5}
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    placeholder="Define the core mission for this team member..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-white/10 focus:border-accent/40 focus:ring-0 transition-all outline-none resize-none leading-relaxed"
                                />
                            </div>

                            {/* Warning Card */}
                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-500/70 leading-relaxed font-medium">
                                    Updates will notify the freelancer and may reset their mission acknowledgement status.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button 
                                onClick={onClose}
                                className="px-6 py-4 rounded-2xl border border-white/5 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <Button 
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                className="rounded-2xl h-auto py-4 font-bold text-[11px] uppercase tracking-widest bg-accent text-black"
                            >
                                Update Mission
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditMemberModal;
