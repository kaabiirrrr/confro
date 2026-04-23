import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) { navigate('/signup', { replace: true }); return; }

    // 'post_verify' flag is set by AuthCallback after email confirmation
    // Without it, user just registered → go to email verification
    const postVerify = sessionStorage.getItem('post_verify');
    const pendingRole = localStorage.getItem('pending_role');

    const destination = postVerify
      ? (pendingRole === 'CLIENT' ? '/client/setup-profile' : '/freelancer/setup-profile')
      : '/verify-email-waiting';

    const t = setTimeout(() => {
      if (postVerify) {
        sessionStorage.removeItem('post_verify');
        if (pendingRole) localStorage.removeItem('pending_role');
      }
      navigate(destination, { state: { email }, replace: true });
    }, 3000);
    return () => clearTimeout(t);
  }, [email, navigate]);

  if (!email) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ 
          textAlign: 'center', 
          maxWidth: 520,
          background: 'rgba(13, 21, 38, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(30, 45, 74, 0.5)',
          borderRadius: '32px',
          padding: '56px 40px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
        >
          <div style={{
            width: '100px',
            height: '100px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(34, 197, 94, 0.2)',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.1)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            color: '#f8fafc',
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.3,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Account Created!
          <br />
          <span style={{ color: '#22c55e' }}>Welcome to Connect.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: '#94a3b8',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}
        >
          We're preparing your spacecraft. You'll be redirected to the verification step in a moment.
        </motion.p>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 36 }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#22c55e', display: 'inline-block',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
