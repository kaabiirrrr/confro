import React, { useState, useEffect } from "react";
import { Eye, EyeOff, X, Shield, Lock, Smartphone, Key, CheckCircle2, AlertCircle, Info, ChevronRight, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../../lib/supabase";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
import InfinityLoader from "../../../common/InfinityLoader";
import { accountApi } from "../../../../services/accountApi";

const PasswordSecuritySection = () => {
    const { user } = useAuth();
    const [showChange, setShowChange] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [sendingRecovery, setSendingRecovery] = useState(false);
    const [recoverySent, setRecoverySent] = useState(false);

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // New Password Fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [settings, setSettings] = useState({
        two_factor_enabled: false,
        push_notifications_enabled: false,
        security_question: '',
        has_security_answer: false
    });
    const [loadingSettings, setLoadingSettings] = useState(true);

    const [showSecurityQuestionModal, setShowSecurityQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await accountApi.getSecuritySettings();
                if (res.success) setSettings(res.data);
            } catch (err) {
                console.error("Failed to load security settings", err);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword !== confirmNewPassword) {
            toast.error("Passwords do not match or are empty");
            return;
        }

        setUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully");
            setShowChange(false);
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            toast.error(err.message || "Failed to update password");
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleToggle2FA = async (field, value) => {
        try {
            setSettings(prev => ({ ...prev, [field]: value }));
            const res = await accountApi.updateSecuritySettings({ [field]: value });
            if (res.success) {
                toast.success(`${field.replace(/_/g, ' ')} updated`);
            }
        } catch (err) {
            setSettings(prev => ({ ...prev, [field]: !value }));
            toast.error("Failed to update setting");
        }
    };

    const handleLinkAccount = async (provider) => {
        try {
            toast.loading(`Linking ${provider} account...`);
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.href,
                    queryParams: { prompt: 'select_account' }
                }
            });
            if (error) throw error;
        } catch (err) {
            toast.dismiss();
            toast.error(err.message || `Failed to link ${provider}`);
        }
    };

    const handleSaveSecurityQuestion = async () => {
        if (!newQuestion || !newAnswer) {
            toast.error("Both question and answer are required");
            return;
        }
        try {
            const res = await accountApi.updateSecuritySettings({
                security_question: newQuestion,
                security_answer: newAnswer
            });
            if (res.success) {
                setSettings(prev => ({ ...prev, security_question: newQuestion, has_security_answer: true }));
                toast.success("Security question updated");
                setShowSecurityQuestionModal(false);
                setNewQuestion('');
                setNewAnswer('');
            }
        } catch (err) {
            toast.error("Failed to save security question");
        }
    };

    const handleSendRecoveryLink = async () => {
        const email = recoveryEmail.trim() || user?.email;
        if (!email) {
            toast.error('Enter your email address');
            return;
        }
        setSendingRecovery(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setRecoverySent(true);
            toast.success('Recovery link sent');
        } catch (err) {
            toast.error(err.message || 'Failed to send recovery link');
        } finally {
            setSendingRecovery(false);
        }
    };

    if (loadingSettings) return (
       <div className="flex items-center justify-center min-h-[400px]">
           <InfinityLoader />
       </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-10 overflow-x-hidden">
            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="text-accent flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Guard Protocol v4.2</p>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">Security Perimeter</h1>
                    <p className="text-white/40 text-[11px] sm:text-sm font-medium max-w-xl leading-relaxed">
                        Manage organizational access credentials, multi-factor authentication nodes, and cryptographic recovery questions.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16">
                {/* LEFT: LOGIN CREDENTIALS */}
                <div className="xl:col-span-12 2xl:col-span-7 space-y-12">
                    <div className="relative z-10 space-y-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    <p className="text-[8px] sm:text-[10px] text-accent font-black uppercase tracking-widest leading-none">Primary Access Node</p>
                                </div>
                                <h3 className="text-white font-bold text-xl sm:text-2xl tracking-tight">Portal Authentication</h3>
                                <p className="text-white/30 text-[9px] sm:text-[11px] font-medium max-w-md">Rotate credentials regularly to maintain cryptographic integrity.</p>
                            </div>
                            <button 
                                onClick={() => setShowChange(true)}
                                className="w-fit h-12 sm:h-14 px-6 sm:px-8 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-accent/40 transition-all active:scale-95 flex items-center gap-2 sm:gap-3 group"
                            >
                                <Lock size={12} className="sm:w-[14px] sm:h-[14px] group-hover:text-accent transition-colors" />
                                Rotate Passcode
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-white/5">
                            {/* GOOGLE */}
                            <div className="flex items-center justify-between gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/row">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center justify-center group-hover/row:scale-110 transition-all shrink-0">
                                        <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-8 h-8" alt="G" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <span className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-widest block">Third-Party Node</span>
                                        <span className="text-white font-bold text-xs sm:text-sm truncate">Google Workspace</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLinkAccount('google')}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-accent transition-colors shrink-0"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* APPLE */}
                            <div className="flex items-center justify-between gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/row">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center justify-center group-hover/row:scale-110 transition-all shrink-0">
                                        <img src="https://cdn-icons-png.flaticon.com/512/153/153240.png" className="w-8 h-8 brightness-200" alt="A" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <span className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-widest block">Hardware Token</span>
                                        <span className="text-white font-bold text-xs sm:text-sm truncate">Apple ID</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLinkAccount('apple')}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-accent transition-colors shrink-0"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: VERIFICATION & RECOVERY */}
                <div className="xl:col-span-12 2xl:col-span-5 space-y-12">
                    <div className="space-y-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    <p className="text-[8px] sm:text-[10px] text-white/20 font-black uppercase tracking-widest block leading-none">Active Defense Protocol</p>
                                </div>
                                <h3 className="text-white font-bold text-lg sm:text-2xl tracking-tight leading-none">Dual-Factor Auth</h3>
                                <p className="text-white/30 text-[8px] sm:text-[11px] font-medium max-w-md">Multi-layered security nodes for identity verification.</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="grid grid-cols-1 gap-8">
                                {/* PUSH */}
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <Smartphone size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white font-bold text-xs sm:text-base leading-tight">Mobile Biometry</p>
                                            <p className="text-white/20 text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-tight">Biometric Push Nodes</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle2FA('push_notifications_enabled', !settings.push_notifications_enabled)}
                                        className={`w-14 h-7 rounded-full p-1.5 transition-all duration-300 shrink-0 ${
                                            settings.push_notifications_enabled ? "bg-accent shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-white/10"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                                            settings.push_notifications_enabled ? "translate-x-7" : "translate-x-0"
                                        }`} />
                                    </button>
                                </div>

                                {/* AUTH */}
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <Key size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white font-bold text-xs sm:text-base leading-tight">Authenticator Node</p>
                                            <p className="text-white/20 text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-tight">TOTP Cryptography</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle2FA('two_factor_enabled', !settings.two_factor_enabled)}
                                        className={`w-14 h-7 rounded-full p-1.5 transition-all duration-300 shrink-0 ${
                                            settings.two_factor_enabled ? "bg-accent shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-white/10"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                                            settings.two_factor_enabled ? "translate-x-7" : "translate-x-0"
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/10 space-y-8">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="space-y-1.5">
                                            <p className="text-[7px] sm:text-[10px] text-white/20 font-black uppercase tracking-widest">Recovery Protocol</p>
                                            <h4 className="text-white font-bold text-sm sm:text-lg">Security Questions</h4>
                                        </div>
                                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                                            <p className="text-white/40 text-[11px] sm:text-[13px] italic leading-relaxed">
                                                {settings.has_security_answer ? `"${settings.security_question}"` : 'Emergency recovery question not yet configured.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowSecurityQuestionModal(true)}
                                        className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:border-accent transition-all active:scale-95 shrink-0"
                                    >
                                        Update Recovery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {showChange && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-secondary border border-white/10 w-full max-w-[500px] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] p-10 space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-accent font-black uppercase tracking-widest leading-none">System Update</p>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Rotate Key</h2>
                                </div>
                                <button onClick={() => setShowChange(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">New Passcode</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? "text" : "password"}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-full text-white outline-none focus:border-accent focus:bg-white/[0.05] transition-all placeholder:text-white/5"
                                            placeholder="Enter high-entropy password"
                                        />
                                        <button onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                                            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Verify Passcode</label>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={e => setConfirmNewPassword(e.target.value)}
                                        className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-full text-white outline-none focus:border-accent focus:bg-white/[0.05] transition-all placeholder:text-white/5"
                                        placeholder="Repeat for confirmation"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <button 
                                    onClick={handleUpdatePassword}
                                    disabled={updatingPassword}
                                    className="w-full h-16 rounded-full bg-accent text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {updatingPassword ? "Syncing..." : "Update Credentials"}
                                </button>
                                <button 
                                    onClick={() => setShowForgot(true)}
                                    className="text-[10px] text-white/30 hover:text-accent font-black uppercase tracking-widest transition-colors"
                                >
                                    Forgot Authentication Key?
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showForgot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[110] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-secondary border border-white/10 w-full max-w-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] p-10 space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-accent font-black uppercase tracking-widest text-center">Identity Recovery</p>
                                    <h2 className="text-xl font-bold text-white tracking-tight text-center">Forgot Key?</h2>
                                </div>
                                <button onClick={() => setShowForgot(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <p className="text-white/40 text-sm text-center">
                                    {recoverySent 
                                        ? `A recovery link has been dispatched to ${recoveryEmail || user?.email}.` 
                                        : "Enter the email associated with your account to receive a secure recovery bypass link."}
                                </p>

                                {!recoverySent && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Recovery Target</label>
                                        <input
                                            type="email"
                                            value={recoveryEmail}
                                            onChange={e => setRecoveryEmail(e.target.value)}
                                            className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-full text-white outline-none focus:border-accent focus:bg-white/[0.05] transition-all placeholder:text-white/5"
                                            placeholder={user?.email || "email@example.com"}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                {!recoverySent ? (
                                    <button 
                                        onClick={handleSendRecoveryLink}
                                        disabled={sendingRecovery}
                                        className="w-full h-16 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {sendingRecovery ? "Dispatching..." : "Send Recovery Link"}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { setShowForgot(false); setRecoverySent(false); }}
                                        className="w-full h-16 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Return to Sanctum
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showSecurityQuestionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
                    >
                         <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-secondary border border-white/10 w-full max-w-[480px] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] p-10 space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-accent font-black uppercase tracking-widest">Protocol Setup</p>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Recovery Node</h2>
                                </div>
                                <button onClick={() => setShowSecurityQuestionModal(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Secret Question</label>
                                    <input
                                        type="text"
                                        value={newQuestion}
                                        onChange={e => setNewQuestion(e.target.value)}
                                        className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-full text-white outline-none focus:border-accent focus:bg-white/[0.05] transition-all"
                                        placeholder="e.g. Identity of first construct"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Secure Answer</label>
                                    <input
                                        type="password"
                                        value={newAnswer}
                                        onChange={e => setNewAnswer(e.target.value)}
                                        className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-full text-white outline-none focus:border-accent focus:bg-white/[0.05] transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveSecurityQuestion}
                                className="w-full h-16 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all"
                            >
                                Commmit Recovery Plan
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PasswordSecuritySection;