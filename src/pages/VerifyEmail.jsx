import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationEmail } from '../services/apiService';
import { CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import InfinityLoader from '../components/common/InfinityLoader';
import { motion } from 'framer-motion';

const LOGO = 'https://ogtkjtbvbkyddutnmcov.supabase.co/storage/v1/object/public/assests/Logo2.png';

const STATES = {
  success: {
    Icon: CheckCircle2,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.1)',
    ring: 'rgba(34,197,94,0.2)',
    title: 'Almost there!',
    subtitle: 'Your email is verified. Please log in to complete your profile setup.',
    primaryLabel: 'Continue to Login',
    primaryAction: 'login',
    secondaryLabel: null,
  },
  already_verified: {
    Icon: ShieldCheck,
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.1)',
    ring: 'rgba(59,130,246,0.2)',
    title: 'Already Verified',
    subtitle: 'Your email is already verified. You\'re all set.',
    primaryLabel: 'Go to Dashboard',
    primaryAction: 'login',
    secondaryLabel: null,
  },
  expired: {
    Icon: Clock,
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.1)',
    ring: 'rgba(249,115,22,0.2)',
    title: 'Link Expired',
    subtitle: 'This verification link has expired. Please request a new one.',
    primaryLabel: 'Request New Link',
    primaryAction: 'resend',
    secondaryLabel: 'Back to Login',
  },
  invalid: {
    Icon: XCircle,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.1)',
    ring: 'rgba(239,68,68,0.2)',
    title: 'Invalid Verification Link',
    subtitle: 'This link is not valid or has already been used.',
    primaryLabel: 'Back to Login',
    primaryAction: 'login',
    secondaryLabel: 'Return to home',
  },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, getDashboardRoute, profile } = useAuth();
  const status = searchParams.get('status');
  const state = status ? (STATES[status] ?? STATES.invalid) : null;

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handlePrimary = async () => {
    if (!state) return;
    if (state.primaryAction === 'dashboard' || state.primaryAction === 'login') {
      navigate('/login', { replace: true });
    } else if (state.primaryAction === 'resend') {
      setResending(true);
      try {
        await sendVerificationEmail();
        setResent(true);
      } catch {
        // silent fail
      } finally {
        setResending(false);
      }
    }
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
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(13, 21, 38, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(30, 45, 74, 0.5)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.02)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={LOGO} alt="Connect" style={{ width: '130px', height: 'auto', margin: '0 auto', display: 'block' }} />
        </div>

        {/* Loading state */}
        {!status && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <InfinityLoader size={60} />
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '16px', fontWeight: '500' }}>Verifying your email...</p>
          </div>
        )}

        {/* Status states */}
        {state && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: state.iconBg,
                  border: `2px solid ${state.ring}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: `0 0 40px ${state.ring}`,
                }}
              >
                <state.Icon size={42} style={{ color: state.iconColor }} />
              </motion.div>
            </div>

            <h1 style={{
              color: '#f8fafc',
              fontSize: '26px',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '16px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}>
              {state.title}
            </h1>

            <p style={{
              color: '#94a3b8',
              fontSize: '15px',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '40px',
            }}>
              {status === 'success' 
                ? 'Your email is verified. Please log in to complete your profile setup and start using Connect.'
                : (resent ? '✅ We\'ve sent a fresh link. Please check your inbox again.' : state.subtitle)}
            </p>

            {!resent && (
              <button
                onClick={handlePrimary}
                disabled={resending}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: state.primaryAction === 'resend' ? 'rgba(249,115,22,0.1)'
                    : '#3b82f6',
                  color: state.primaryAction === 'resend' ? '#f97316' : '#fff',
                  border: state.primaryAction === 'resend' ? '1px solid rgba(249,115,22,0.2)' : 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: resending ? 'not-allowed' : 'pointer',
                  opacity: resending ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: state.primaryAction !== 'resend' ? '0 10px 20px -5px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                {resending && <InfinityLoader size={20} />}
                {resending ? 'Sending...' : state.primaryLabel}
              </button>
            )}

            {resent && (
              <Link to="/login" style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '700',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '16px',
              }}>
                Back to Login
              </Link>
            )}

            {state.secondaryLabel && !resent && (
              <Link
                to={state.secondaryLabel === 'Return to home' ? '/' : '/login'}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  padding: '12px',
                  transition: 'color 0.2s',
                }}
              >
                {state.secondaryLabel}
              </Link>
            )}

            <Link
              to="/"
              style={{
                display: 'block',
                textAlign: 'center',
                color: '#475569',
                fontSize: '13px',
                textDecoration: 'none',
                marginTop: '12px',
                fontWeight: '500',
              }}
            >
              Return to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
