import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Mail } from 'lucide-react';
import api from '../../lib/api';

const OTP_LENGTH = 6;

export default function OTPVerificationModal({ isOpen, onClose, onVerified, action, email }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes
  const [sent, setSent] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Start countdown timer
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(600);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  // Send OTP function
  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await api.post('/api/otp/send', { action });
      setSent(true);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send verification code.');
    } finally {
      setSending(false);
    }
  };

  // Send on open
  useEffect(() => {
    if (isOpen) {
      handleSend();
    }
    return () => {
      clearInterval(timerRef.current);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setSent(false);
      setTimer(600);
      setShake(false);
    };
  }, [isOpen]);

  // Auto-focus first input when sent
  useEffect(() => {
    if (sent) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [sent]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((c, i) => { next[i] = c; });
      setDigits(next);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      triggerShake();
      return;
    }
    if (timer === 0) {
      setError('Verification code has expired. Please request a new one.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/otp/verify', { otp, purpose: action });
      clearInterval(timerRef.current);
      const sessionKey = action === 'job_post' ? 'otp_pending_job' : 'otp_pending_proposal';
      sessionStorage.removeItem(sessionKey);
      onVerified();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Verification failed.';
      setError(errMsg);
      triggerShake();
      if (err.response?.status === 401 || err.response?.status === 429) {
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const otp = digits.join('');
  const canSubmit = otp.length === OTP_LENGTH && timer > 0 && !loading && !sending;

  const handleClose = () => {
    const sessionKey = action === 'job_post' ? 'otp_pending_job' : 'otp_pending_proposal';
    sessionStorage.removeItem(sessionKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center bg-black/70 backdrop-blur-md p-4 pt-16"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`bg-secondary border border-white/[0.06] rounded-2xl w-full max-w-[420px] pt-10 pb-7 px-7 relative mt-10 ${
              shake ? 'animate-shake' : ''
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-accent transition-colors"
            >
              <X size={17} />
            </button>

            {/* Illustration */}
            <div className="flex justify-center mb-6 pt-2">
              <img
                src={encodeURI("/ChatGPT Image Jun 4, 2026, 12_59_45 AM.png")}
                alt="Email Verification"
                className="w-[147px] h-[147px] object-contain"
              />
            </div>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <h2 className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
                Security Verification
              </h2>
              <p className="text-slate-500 dark:text-white/40 text-sm mt-2">
                We sent a 6-digit verification code to
              </p>
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-full">
                <Mail size={13} className="text-accent shrink-0" />
                <span className="text-slate-700 dark:text-white/70 text-xs font-medium font-mono">{email}</span>
              </div>
            </div>

            {/* Digit Inputs */}
            <div className="flex gap-2.5 justify-center mb-5">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  disabled={sending || loading}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={e => { e.preventDefault(); handleChange(i, e.clipboardData.getData('text')); }}
                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all outline-none
                    ${error
                      ? 'border-red-400/60 bg-red-500/5 text-red-400 focus:border-red-400'
                      : d
                        ? 'border-accent/50 bg-accent/5 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:border-accent/60 focus:bg-accent/5'}`}
                  style={{ height: '3.25rem' }}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-xs text-center font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Timer */}
            <div className="text-center mb-5">
              {timer > 0 ? (
                <p className="text-slate-400 dark:text-white/30 text-xs font-medium">
                  Code expires in:{' '}
                  <span className={`font-mono font-bold ${timer <= 60 ? 'text-red-400' : 'text-slate-600 dark:text-white/60'}`}>
                    {formatTimer(timer)}
                  </span>
                </p>
              ) : (
                <p className="text-red-400 text-xs font-bold">Code has expired.</p>
              )}
            </div>

            {/* Verify Button — accent color, fully rounded */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || sending || loading}
              className="w-full py-3.5 rounded-full bg-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading || sending ? <Loader2 size={16} className="animate-spin" /> : null}
              {sending 
                ? 'Requesting Code...' 
                : loading 
                  ? 'Verifying Code...' 
                  : 'Confirm Verification'}
            </button>

            {/* Resend Action */}
            <div className="text-center mt-4">
              <button
                onClick={() => handleSend()}
                disabled={timer > 0 || sending || loading}
                className="text-xs font-semibold text-accent hover:opacity-80 disabled:text-slate-400 dark:disabled:text-white/20 disabled:cursor-not-allowed transition-colors py-1.5 px-3 rounded-lg"
              >
                {timer > 0 ? `Resend code in ${formatTimer(timer)}` : 'Resend Verification Code'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
