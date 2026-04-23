import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { sendOtp, verifyOtp, OTP_TIMERS } from '../services/otpApi';

const OTP_LENGTH = 6;

export default function OtpModal({ isOpen, onClose, onSuccess, phone, purpose, title, subtitle }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Send OTP on open
  useEffect(() => {
    if (isOpen && phone && purpose) {
      handleSend();
    }
    return () => {
      clearInterval(timerRef.current);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setSent(false);
      setTimer(0);
    };
  }, [isOpen]);

  // Auto-focus first input after send
  useEffect(() => {
    if (sent) setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [sent]);

  const startTimer = useCallback((seconds) => {
    clearInterval(timerRef.current);
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await sendOtp({ phone, purpose });
      setSent(true);
      startTimer(OTP_TIMERS[purpose] ?? 60);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index, value) => {
    // Handle paste
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
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) { setError('Enter all 6 digits'); return; }
    if (timer === 0) { setError('OTP expired. Please resend.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await verifyOtp({ phone, purpose, otp });
      clearInterval(timerRef.current);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const otp = digits.join('');
  const canSubmit = otp.length === OTP_LENGTH && timer > 0 && !loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[#0d1526] border border-[#1a2744] rounded-2xl w-full max-w-[400px] p-7 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{title || 'Verify OTP'}</h2>
                  <p className="text-[#64748b] text-xs mt-0.5">{subtitle || `Code sent to ${phone}`}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#475569] hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {sending ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 size={28} className="animate-spin text-blue-400" />
                <p className="text-[#64748b] text-sm">Sending OTP to {phone}…</p>
              </div>
            ) : (
              <>
                {/* Phone display */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-white/[0.03] border border-[#1a2744] rounded-xl">
                  <Phone size={14} className="text-[#475569] shrink-0" />
                  <span className="text-[#94a3b8] text-sm font-mono">{phone}</span>
                </div>

                {/* OTP inputs */}
                <div className="flex gap-2 justify-center mb-4">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={OTP_LENGTH}
                      value={d}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={e => { e.preventDefault(); handleChange(i, e.clipboardData.getData('text')); }}
                      className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition-all outline-none
                        ${error ? 'border-red-500/50 bg-red-500/5 text-red-400'
                          : d ? 'border-blue-500/50 bg-blue-500/5 text-white'
                          : 'border-[#1a2744] bg-white/[0.03] text-white focus:border-blue-500/60 focus:bg-blue-500/5'}`}
                    />
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-xs text-center mb-3">{error}</p>
                )}

                {/* Timer */}
                <div className="text-center mb-5">
                  {timer > 0 ? (
                    <p className="text-[#475569] text-xs">
                      Code expires in <span className={`font-mono font-semibold ${timer <= 10 ? 'text-red-400' : 'text-[#94a3b8]'}`}>{fmtTimer(timer)}</span>
                    </p>
                  ) : (
                    <p className="text-red-400 text-xs">OTP expired</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Verifying…' : 'Verify'}
                </button>

                {/* Resend */}
                <button
                  onClick={handleSend}
                  disabled={timer > 0 || sending}
                  className="w-full py-2 text-xs text-[#475569] hover:text-[#94a3b8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {timer > 0 ? `Resend in ${fmtTimer(timer)}` : 'Resend OTP'}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
