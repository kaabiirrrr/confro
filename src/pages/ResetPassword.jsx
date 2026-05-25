import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthInput from '../components/AuthInput';
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

    // Exchange the recovery token from the URL hash into a live session
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
                        // Clean the hash from the URL without reloading
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                });
        } else {
            // No token in URL — check if there's already an active recovery session
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
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
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
            // Sign out so they log in fresh with the new password
            await supabase.auth.signOut();
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary font-sans selection:bg-accent/30">
            {/* Sticky navbar with logo */}
            <div className="fixed top-0 left-0 w-full h-14 md:h-16 px-6 md:px-14 flex items-center justify-between z-50 bg-primary/80 backdrop-blur-md border-b border-white/5">
                <Link to="/" aria-label="Connect Home">
                    <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-8 md:h-10 object-contain block dark:hidden" />
                    <img src="/Logo2.png" alt="Connect" className="h-7 md:h-9 object-contain hidden dark:block" />
                </Link>
                <Link to="/login" className="text-white/40 hover:text-white text-sm font-medium transition-colors">
                    Skip
                </Link>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center min-h-screen pt-16 px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    {tokenError ? (
                        <div className="text-center space-y-4">
                            <p className="text-red-400 text-sm">{tokenError}</p>
                            <Link to="/forgot-password" className="text-accent text-sm font-semibold hover:underline">
                                Request a new reset link
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="text-center space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                <CheckCircle className="text-green-400" size={48} />
                                <h2 className="text-2xl font-bold text-white">Password updated!</h2>
                                <p className="text-white/50 text-sm">You can now log in with your new password.</p>
                            </div>
                            <p className="text-white/30 text-xs">Redirecting to login...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create new password</h2>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Your new password must be different from previously used passwords.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <AuthInput
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        rightElement={
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="text-white/30 hover:text-white transition-colors p-1">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        }
                                    />
                                    <p className="ml-1 text-xs text-white/30">Must be at least 8 characters.</p>
                                </div>

                                <div className="space-y-1">
                                    <AuthInput
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <p className="ml-1 text-xs text-white/30">Both passwords must match.</p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || !sessionReady}
                                        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-all active:scale-[0.98]"
                                    >
                                        {loading ? 'Updating...' : 'Save new password'}
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
