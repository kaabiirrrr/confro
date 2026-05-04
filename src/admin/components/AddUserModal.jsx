import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, User, Briefcase, Shield } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'FREELANCER'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onAdd(formData);
            setFormData({ name: '', email: '', password: '', role: 'FREELANCER' });
            onClose();
        } catch (error) {
            console.error('Failed to add user', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 sm:p-6 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 mt-10"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between bg-transparent">
                            <div className="flex items-center gap-4">
                                <div className="text-accent">
                                    <img src="/Icons/icons8-user-100.png" alt="Add User" className="w-8 h-8 object-contain" 
                                        style={{ filter: 'invert(58%) sepia(85%) saturate(1500%) hue-rotate(175deg) brightness(110%) contrast(110%)' }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Add New User</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-white/40 mt-1">Register a new platform member manually.</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="transition-all text-slate-400 hover:text-accent transform hover:scale-110"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
                            <div className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 ml-1">Temporary Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 ml-1">Account Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'FREELANCER' })}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                                formData.role === 'FREELANCER'
                                                    ? 'bg-accent/10 border-accent text-accent'
                                                    : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <Briefcase size={18} />
                                            <span className="text-xs font-bold">Freelancer</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                                formData.role === 'CLIENT'
                                                    ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                                                    : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <Shield size={18} />
                                            <span className="text-xs font-bold">Client</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full sm:flex-1 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <img src="/Icons/icons8-user-100.png" alt="Create" className="w-4 h-4 object-contain brightness-0 invert" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddUserModal;
