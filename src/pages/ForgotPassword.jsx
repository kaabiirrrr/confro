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
        <div style={{
            minHeight: '100vh',
            background: '#0a0f1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: '#0d1526',
                    border: '1px solid #1a2744',
                    borderRadius: '20px',
                    padding: '40px 36px',
                }}
            >
                {/* Logo */}
                <img src="/Logo2.png" alt="Connect"
                    style={{ width: 80, display: 'block', margin: '0 auto 32px' }} />

                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div key="form"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                                Reset your password
                            </h1>
                            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
                                Enter your email and we'll send you a reset link.
                            </p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                                        Email address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{
                                            position: 'absolute', left: 14, top: '50%',
                                            transform: 'translateY(-50%)', color: '#475569',
                                            pointerEvents: 'none',
                                        }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            placeholder="Enter your email"
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px 11px 38px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${error ? '#ef4444' : '#1e3a5f'}`,
                                                borderRadius: 12,
                                                color: '#f1f5f9',
                                                fontSize: 14,
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.15s',
                                            }}
                                            onFocus={e => { if (!error) e.target.style.borderColor = '#3b82f6'; }}
                                            onBlur={e => { if (!error) e.target.style.borderColor = '#1e3a5f'; }}
                                        />
                                    </div>
                                    {error && (
                                        <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 12,
                                        border: 'none',
                                        background: loading ? '#1e3a5f' : '#3b82f6',
                                        color: '#fff',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    {loading ? <InfinityLoader size={18} /> : 'Send Reset Link'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <Link to="/login" style={{
                                    color: '#475569', fontSize: 13, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                }}>
                                    <ArrowLeft size={14} /> Back to log in
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="success"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ textAlign: 'center' }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <Mail size={24} color="#3b82f6" />
                            </div>

                            <h1 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                                Check your email
                            </h1>

                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                                If an account exists for this email, you'll receive a password reset link shortly.
                            </p>

                            {/* Open Gmail / Open email if Gmail address */}
                            {isGmail && (
                                <a
                                    href="https://mail.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '10px 20px', borderRadius: 12,
                                        background: 'transparent',
                                        border: '1px solid #1e3a5f',
                                        color: '#94a3b8',
                                        fontSize: 13, fontWeight: 500,
                                        textDecoration: 'none', marginBottom: 20,
                                        transition: 'border-color 0.15s, color 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#f1f5f9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.color = '#94a3b8'; }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                                    </svg>
                                    Open Gmail
                                </a>
                            )}

                            <p style={{ color: '#334155', fontSize: 12, marginBottom: 20 }}>
                                Didn't receive it? Check spam or try again in a few seconds.
                            </p>

                            <Link to="/login" style={{
                                color: '#475569', fontSize: 13, textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}>
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
