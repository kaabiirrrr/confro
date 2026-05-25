import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/authUtils';

const API_URL = getApiUrl();
const LOGO = '/Logo2.png';

export default function VerifyEmailWaiting() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  // Guard — no email → back to signup
  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  // We no longer poll for session because registration does not automatically sign in.
  // The user should click the link in their email which will redirect them to login.

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCooldown = () => {
    setCooldown(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      setResendDone(true);
      toast.success("Email sent! Please check your inbox.");
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend email. Please try again.");
    } finally { 
      setResending(false); 
    }
  };

  const isGmail = email?.toLowerCase().endsWith('@gmail.com');

  if (!email) return null;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      {/* Navbar Aligned Logo */}
      <div className="absolute top-0 left-0 w-full z-20">
        <div className="max-w-[1630px] mx-auto h-14 md:h-20 px-4 md:px-8 flex items-center">
          <Link to="/" className="flex items-center group">
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[480px] p-8 md:p-12 text-center relative z-10"
      >
        {/* Verification Image */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center"
          >
            <img
              src="/verify-email-icon-3.png"
              alt="Verification"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
          Verify your email
        </h1>

        {/* Subtext */}
        <p className="text-white/60 text-base leading-relaxed mb-6">
          We've sent a verification link to <br />
          <span className="text-white font-semibold">{email}</span>.
          Please check your inbox to continue.
        </p>

        {/* Resend success alert */}
        <AnimatePresence>
          {resendDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6"
            >
              <p className="text-green-400 text-sm font-medium">
                ✓ Check your inbox, email resent!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-row gap-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="flex-1 px-3 sm:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Retry in ${cooldown}s` : 'Send again'}
            </button>

            {isGmail ? (
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 sm:px-6 py-2.5 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                Go to Gmail
              </a>
            ) : (
              <button className="flex-1 px-3 sm:px-6 py-2.5 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 whitespace-nowrap">
                Open Inbox
              </button>
            )}
          </div>

          <Link
            to="/login"
            className="w-full px-6 py-2.5 rounded-full border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 transition-all font-bold text-sm text-center"
          >
            I've verified my email — Log in
          </Link>
        </div>

        {/* Help toggle */}
        <div className="space-y-3">
          <button
            onClick={() => setShowHelp(v => !v)}
            className="text-white/40 hover:text-accent text-sm font-medium transition-colors"
          >
            Didn't receive the email?
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left"
              >
                <p className="text-white/50 text-xs leading-relaxed">
                  Make sure to check your spam or junk folder. If you still don't see it, you can
                  <Link to="/signup" className="text-accent hover:underline ml-1">try a different email address</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4">
          <p className="text-white/40 text-sm">
            Already verified?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline px-1 ml-1">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
