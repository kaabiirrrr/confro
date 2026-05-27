import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';

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
                        className="relative w-full max-w-lg bg-secondary rounded-2xl overflow-hidden border border-white/10 mt-10"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between bg-transparent">
                            <div className="flex items-center gap-4">
                                <div className="text-accent">
                                    <img
                                        src="/Icons/icons8-add-administrator-100.png"
                                        alt="Add User"
                                        className="w-8 h-8 object-contain"
                                        style={{ filter: 'invert(58%) sepia(85%) saturate(1500%) hue-rotate(175deg) brightness(110%) contrast(110%)' }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none">Add New User</h3>
                                    <p className="text-[11px] text-white/40 mt-1">Register a new platform member manually.</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="transition-all text-white/40 hover:text-accent transform hover:scale-110"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
                            <div className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Temporary Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Account Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'FREELANCER' })}
                                            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all shadow-none ${
                                                formData.role === 'FREELANCER'
                                                    ? 'border-accent text-accent bg-transparent'
                                                    : 'border-white/10 text-white/40 bg-transparent hover:border-white/20 hover:text-white/60'
                                            }`}
                                        >
                                            <img
                                                src="/Icons/icons8-bag-100.png"
                                                alt="Freelancer"
                                                className={`w-4 h-4 object-contain transition-all ${formData.role === 'FREELANCER' ? 'opacity-100' : 'opacity-30'}`}
                                                style={formData.role === 'FREELANCER' ? { filter: 'invert(58%) sepia(85%) saturate(1500%) hue-rotate(175deg) brightness(110%) contrast(110%)' } : { filter: 'invert(1)' }}
                                            />
                                            <span className="text-xs font-bold">Freelancer</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                                            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all shadow-none ${
                                                formData.role === 'CLIENT'
                                                    ? 'border-blue-500 text-blue-400 bg-transparent'
                                                    : 'border-white/10 text-white/40 bg-transparent hover:border-white/20 hover:text-white/60'
                                            }`}
                                        >
                                            <img
                                                src="/Icons/icons8-account-male-96.png"
                                                alt="Client"
                                                className={`w-4 h-4 object-contain transition-all ${formData.role === 'CLIENT' ? 'opacity-100' : 'opacity-30'}`}
                                                style={formData.role === 'CLIENT' ? { filter: 'invert(53%) sepia(98%) saturate(400%) hue-rotate(190deg) brightness(110%)' } : { filter: 'invert(1)' }}
                                            />
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
                                        'Create Account'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:bg-white/5 transition-all order-2 sm:order-1"
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
