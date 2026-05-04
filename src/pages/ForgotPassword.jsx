import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';
import InfinityLoader from '../components/common/InfinityLoader';

import { getApiUrl } from '../utils/authUtils';
 
const API_URL = getApiUrl();

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const isGmail = email.toLowerCase().endsWith('@gmail.com');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }

        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
        } catch (err) {
            // Only surface network/server errors — never 404 (no enumeration)
            if (!err.response || err.response.status >= 500) {
                setError('Something went wrong. Try again.');
                setLoading(false);
                return;
            }
            // 404 or any other 4xx → still show success (no enumeration)
        } finally {
            setLoading(false);
        }
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-primary flex items-center md:items-start md:pt-[12vh] justify-center p-6 font-sans selection:bg-accent/30">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="w-full max-w-[440px] bg-secondary border border-[var(--color-border)] rounded-2xl p-8 sm:p-10"
            >
                {/* Logo */}
                <img src="/Logo2.png" alt="Connect"
                    className="w-20 mx-auto block mb-8 invert dark:invert-0 object-contain" />

                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div key="form"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 className="text-light-text text-[22px] font-bold text-center mb-2">
                                Reset your password
                            </h1>
                            <p className="text-text-secondary text-sm text-center mb-7 leading-relaxed">
                                Enter your email and we'll send you a reset link.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-text-secondary text-xs font-medium mb-1.5">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            placeholder="Enter your email"
                                            autoFocus
                                            className={`w-full pl-[38px] pr-3.5 py-2.5 bg-primary border rounded-xl text-light-text text-sm outline-none transition-colors ${error ? 'border-red-500' : 'border-[var(--color-border)] focus:border-accent'}`}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-red-400 text-xs mt-1.5">{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-full border-none bg-accent text-white text-sm font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? <InfinityLoader/> : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <Link to="/login" className="text-text-muted text-[13px] inline-flex items-center gap-1.5 hover:text-accent transition">
                                    <ArrowLeft size={14} /> Back to log in
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="success"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-center"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                                <Mail size={24} className="text-accent" />
                            </div>

                            <h1 className="text-light-text text-xl font-bold mb-3">
                                Check your email
                            </h1>

                            <p className="text-text-secondary text-sm leading-relaxed mb-6">
                                If an account exists for this email, you'll receive a password reset link shortly.
                            </p>

                            {/* Open Gmail / Open email if Gmail address */}
                            {isGmail && (
                                <a
                                    href="https://mail.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-[13px] font-medium mb-5 hover:border-accent hover:text-light-text transition group"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary group-hover:text-light-text transition">
                                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                                    </svg>
                                    Open Gmail
                                </a>
                            )}

                            <p className="text-text-muted text-xs mb-5">
                                Didn't receive it? Check spam or try again in a few seconds.
                            </p>

                            <Link to="/login" className="text-text-muted text-[13px] inline-flex items-center gap-1.5 hover:text-accent transition">
                                <ArrowLeft size={14} /> Back to log in
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
