import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthInput from '../components/AuthInput';
import { resetPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { logout } = useAuth();

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
                // Log the user out so they can log back in with their new password
                await logout();
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
                <div className="bg-secondary/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
                    <Link 
                        to="/login"
                        className="flex w-fit items-center text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Create new password</h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Your new password must be different from previous used passwords.
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

                            <div className="space-y-1">
                                <AuthInput
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                <p className="-mt-3 ml-1 text-xs text-white/40">Must be at least 8 characters.</p>
                            </div>

                            <div className="space-y-1">
                                <AuthInput
                                    label="Confirm Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <p className="-mt-3 ml-1 text-xs text-white/40">Both passwords must match.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
                                >
                                    {loading ? "Updating..." : "Save new password"}
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
