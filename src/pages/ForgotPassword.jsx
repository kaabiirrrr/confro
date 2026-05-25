import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen bg-primary flex items-center md:items-start md:pt-[12vh] justify-center p-6 font-sans selection:bg-accent/30 relative">
            {/* Topbar Logo matching Navbar */}
            <div className="absolute top-0 left-0 w-full h-14 md:h-20 px-14 md:px-16 flex items-center z-50">
                <Link to="/" className="flex items-center group" aria-label="Connect Home">
                    <img
                        src="/Logo-LightMode-trimmed.png"
                        alt="Connect"
                        className="h-9 md:h-12 object-contain block dark:hidden transition-all duration-300"
                    />
                    <img
                        src="/Logo2.png"
                        alt="Connect"
                        className="h-8 md:h-10 object-contain hidden dark:block transition-all duration-300"
                    />
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="w-full max-w-[440px] p-8 sm:p-10"
            >
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
                                Enter the email associated with your account and we'll send an email with instructions to reset your password.
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

                                <div className="flex gap-4 mt-2">
                                    <Link
                                        to="/login"
                                        className="flex-1 py-3 rounded-full border border-[var(--color-border)] text-text-secondary text-sm font-semibold flex items-center justify-center transition hover:border-accent hover:text-light-text"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-full border-none bg-accent text-white text-sm font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="success"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-center flex flex-col items-center"
                        >
                            {/* Icon */}
                            <img
                                src="/Icons/mail-illustration.png"
                                alt="Check Mail Illustration"
                                className="w-70 h-70 object-contain"
                            />

                            <h1 className="text-light-text text-2xl font-bold mb-3">
                                Check your mail
                            </h1>

                            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-[280px] mx-auto">
                                We have sent a password recover instructions to your email.
                            </p>

                            <a
                                href={isGmail ? "https://mail.google.com" : "mailto:"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full max-w-[280px] py-3.5 rounded-full border-none bg-accent text-white text-[15px] font-semibold flex items-center justify-center transition hover:opacity-90 mb-6 mx-auto"
                            >
                                Open email app
                            </a>

                            <Link to="/login" className="text-text-secondary text-[15px] font-medium hover:text-light-text transition mb-14">
                                Skip, I'll confirm later
                            </Link>

                            <p className="text-text-muted text-xs leading-relaxed max-w-[280px] mx-auto">
                                Did not receive the email? Check your spam filter,<br />
                                or <button type="button" onClick={() => setSubmitted(false)} className="text-accent font-medium hover:underline">try another email address</button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
