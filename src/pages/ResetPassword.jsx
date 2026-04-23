import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import AuthInput from '../components/AuthInput';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

        if (validate()) {
            setLoading(true);
            const result = await resetPassword(password);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="bg-secondary/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="mb-8 flex flex-col items-center">
                        <Link to="/" className="mb-6">
                            <img src="/Logo2.png" alt="Connect Logo" className="h-10 object-contain" />
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-white/50 text-center text-sm">
                            Enter your new password below for account recovery.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-4">
                            <div className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl mb-6 flex flex-col items-center">
                                <CheckCircle className="text-green-500 mb-2" size={32} />
                                <p className="text-green-100 text-sm font-medium">
                                    Password updated successfully!
                                </p>
                            </div>
                            <p className="text-white/40 text-xs">Redirecting to login page...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <AuthInput
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                                required
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-white/30 hover:text-white transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <AuthInput
                                label="Confirm New Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={ShieldCheck}
                                required
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
