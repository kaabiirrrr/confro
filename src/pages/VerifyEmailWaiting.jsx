import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

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
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setResendDone(true);
      startCooldown();
    } catch { /* silent */ }
    finally { setResending(false); }
  };

  const isGmail = email?.toLowerCase().endsWith('@gmail.com');

  if (!email) return null;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[480px] p-8 md:p-12 text-center relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="inline-block mb-10">
          <img src={LOGO} alt="Connect" className="h-10 mx-auto" />
        </Link>

        {/* Envelope Icon (Original Image) */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative w-20 h-20 flex items-center justify-center"
          >
            <img 
              src="/icons8-mail-perfomance-64.png" 
              alt="Mail Icon" 
              className="w-16 h-16 object-contain"
            />
            {/* Animated small notification dot */}
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 right-4 w-3.5 h-3.5 bg-accent rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            />
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
          Verify your email
        </h1>

        {/* Subtext */}
        <p className="text-white/60 text-base leading-relaxed mb-8">
          We've sent a verification link to <br/>
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
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="flex-1 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Retry in ${cooldown}s` : 'Send again'}
            </button>

            {isGmail ? (
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-95"
              >
                Go to Gmail
              </a>
            ) : (
              <button className="flex-1 px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-lg shadow-accent/20 transition-all active:scale-95">
                Open Inbox
              </button>
            )}
          </div>

          <Link
            to="/login"
            className="w-full px-6 py-3.5 rounded-2xl border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 transition-all font-bold text-sm text-center"
          >
            I've verified my email — Log in
          </Link>
        </div>

        {/* Help toggle */}
        <div className="space-y-4">
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
        <div className="mt-8 pt-4">
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
