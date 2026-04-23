import { getApiUrl } from '../utils/authUtils';
const API = getApiUrl();

export const OTP_TIMERS = {
  payment:      30,
  withdrawal:   60,
  kyc:          120,
  phone_verify: 120,
  first_job:    300,
};

export async function sendOtp({ phone, purpose }) {
  const res = await fetch(`${API}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, purpose }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
  return data;
}

export async function verifyOtp({ phone, purpose, otp }) {
  const res = await fetch(`${API}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, purpose, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid OTP');
  return data;
}
