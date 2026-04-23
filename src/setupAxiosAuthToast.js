/**
 * Global axios 401 handling: one toast per burst (Strict Mode double-fetch, parallel calls).
 * Excludes credential endpoints so wrong-password login still uses the caller's message only.
 */
import axios from 'axios';
import toast from 'react-hot-toast';

let last401ToastAt = 0;
const DEDUPE_MS = 4500;

function isCredentialRequest(config) {
  if (!config?.url) return false;
  const u = String(config.url);
  return (
    u.includes('/api/auth/login') ||
    u.includes('/api/auth/signup') ||
    u.includes('/api/auth/register')
  );
}

export function toast401Once(message) {
  const now = Date.now();
  if (now - last401ToastAt < DEDUPE_MS) return;
  last401ToastAt = now;
  toast.error(
    message || 'Your session has expired or is invalid. Please log in again.',
    {
      id: 'session-expired',
      duration: 6000,
      className: 'system-notification', // Custom flag for PremiumToaster
    }
  );
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const cfg = error.config;
    if (status === 401 && cfg && !isCredentialRequest(cfg)) {
      // toast401Once(msg); // Removed as requested by user
    }
    return Promise.reject(error);
  }
);
