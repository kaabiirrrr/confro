import { useState } from 'react';

/**
 * useOtp — manages OTP modal state for any flow.
 *
 * Usage:
 *   const { otpProps, openOtp } = useOtp({ phone, onSuccess });
 *   openOtp('payment');
 *   <OtpModal {...otpProps} />
 */
export function useOtp({ phone, onSuccess }) {
  const [state, setState] = useState({ open: false, purpose: null });

  const openOtp = (purpose) => setState({ open: true, purpose });
  const closeOtp = () => setState({ open: false, purpose: null });

  const handleSuccess = (result) => {
    closeOtp();
    onSuccess?.(result, state.purpose);
  };

  const PURPOSE_META = {
    payment:      { title: 'Confirm Payment',      subtitle: 'Enter the OTP to authorise this payment' },
    withdrawal:   { title: 'Confirm Withdrawal',   subtitle: 'Enter the OTP to process your withdrawal' },
    kyc:          { title: 'KYC Verification',     subtitle: 'Enter the OTP to start identity verification' },
    phone_verify: { title: 'Verify Phone Number',  subtitle: 'Enter the OTP sent to your phone' },
    first_job:    { title: 'Confirm Job Post',      subtitle: 'Enter the OTP to publish your first job' },
  };

  const meta = PURPOSE_META[state.purpose] || {};

  return {
    openOtp,
    closeOtp,
    otpProps: {
      isOpen:   state.open,
      onClose:  closeOtp,
      onSuccess: handleSuccess,
      phone,
      purpose:  state.purpose,
      title:    meta.title,
      subtitle: meta.subtitle,
    },
  };
}
