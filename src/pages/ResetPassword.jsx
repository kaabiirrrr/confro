import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [tokenError, setTokenError] = useState('');

    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'recovery' && accessToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
                .then(({ error }) => {
                    if (error) {
                        setTokenError('This reset link is invalid or has expired. Please request a new one.');
                    } else {
                        setSessionReady(true);
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                });
        } else {
            supabase.auth.getSession().then(({ data }) => {
                if (data?.session) {
                    setSessionReady(true);
                } else {
                    setTokenError('No valid reset session found. Please request a new password reset link.');
                }
            });
        }
    }, []);

    const validate = () => {
        if (password.length < 8) { setError('Password must be at least 8 characters long.'); return false; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setSuccess(true);
            await supabase.auth.signOut();
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col font-sans selection:bg-accent/30">
            {/* Sticky navbar */}
            <div className="fixed top-0 left-0 w-full h-14 md:h-16 px-6 md:px-14 flex items-center justify-between z-50 bg-primary/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <Link to="/" aria-label="Connect Home">
                    <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-8 md:h-10 object-contain block dark:hidden" />
                    <img src="/Logo2.png" alt="Connect" className="h-7 md:h-9 object-contain hidden dark:block" />
                </Link>
                <Link to="/login" className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white text-sm font-medium transition-colors">
                    Skip
                </Link>
            </div>

            {/* Centered content */}
            <div className="flex-1 flex items-center justify-center px-6 pt-14 md:pt-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md py-8"
            >
                {tokenError ? (
                    <div className="text-center space-y-4">
                        <p className="text-red-500 dark:text-red-400 text-sm">{tokenError}</p>
                        <Link to="/forgot-password" className="text-accent text-sm font-semibold hover:underline">
                            Request a new reset link
                        </Link>
                    </div>
                ) : success ? (
                    <div className="text-center space-y-4 flex flex-col items-center">
                        <CheckCircle className="text-green-500" size={48} />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Password updated!</h2>
                        <p className="text-slate-500 dark:text-white/50 text-sm">You can now log in with your new password.</p>
                        <p className="text-slate-400 dark:text-white/30 text-xs">Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Create new password
                            </h2>
                            <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed">
                                Your new password must be different from previously used passwords.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Password field */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-4 pr-11 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors p-1">
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                <p className="ml-1 text-xs text-slate-400 dark:text-white/30">Must be at least 8 characters.</p>
                            </div>

                            {/* Confirm password field */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                                />
                                <p className="ml-1 text-xs text-slate-400 dark:text-white/30">Both passwords must match.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !sessionReady}
                                    className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Updating...</>
                                    ) : 'Save new password'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
