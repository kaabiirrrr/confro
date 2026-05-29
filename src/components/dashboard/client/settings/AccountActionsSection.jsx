import React, { useState } from "react";
import { Search, X, AlertTriangle, Copy, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { deleteAccount, sendDeleteAccountOTP } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import SettingsCard from "../../../ui/SettingsCard";

const CLOSE_REASONS = [
  { value: "quality", label: "Not satisfied with freelancers" },
  { value: "expensive", label: "Platform fees are too high" },
  { value: "wrong_type", label: "Wrong account type" },
  { value: "username", label: "Want to change username" },
  { value: "no_longer_needed", label: "No longer need the service" },
  { value: "other", label: "Other" },
];

const AccountActionsSection = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [showTransfer, setShowTransfer] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Step 1 — reason
  const [reason, setReason] = useState("");
  // Step 2 — confirm
  const [step, setStep] = useState(1); // 1 = reason, 2 = confirm

  const [otp, setOtp] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [copied, setCopied] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedPhrase = `delete-account/${profile?.email || 'user@example.com'}`;

  const resetModal = () => {
    setShowCloseModal(false);
    setStep(1);
    setReason("");
    setOtp("");
    setConfirmPhrase("");
    setCopied(false);
  };

  const handleSendOtp = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setSendingOtp(true);
    try {
      await sendDeleteAccountOTP();
      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err) {
      toastApiError(err, "Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(expectedPhrase);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseAccount = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    if (confirmPhrase.trim() !== expectedPhrase) {
      toast.error("Confirmation phrase does not match");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount(otp.trim(), confirmPhrase.trim(), reason);
      if (res.success !== false) {
        toast.success("Account closed. We're sorry to see you go.");
        resetModal();
        await logout();
        navigate("/");
      } else {
        toast.error(res.message || "Failed to close account");
      }
    } catch (err) {
      toastApiError(err, "Failed to close account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ACCOUNT ACTION CARD */}
      <SettingsCard
        title="Account Management"
        subtitle="Manage your platform presence and data privacy"
        icon="/Icons/icons8-alert-96 (1).png"
        iconClassName="w-[30px] h-[30px]"
      >
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm sm:text-lg">Close Account</h4>
              <p className="text-white/40 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 leading-relaxed">Permanently remove your organization's profile and history.</p>
            </div>
            <button
              onClick={() => { setShowCloseModal(true); setStep(1); }}
              className="w-full sm:w-auto px-6 sm:px-8 h-9 sm:h-12 shrink-0 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 font-bold text-xs sm:text-sm hover:bg-red-500/10 transition-all active:scale-95"
            >
              Close Account
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
             <button
                onClick={() => navigate("/join")}
                className="w-full sm:w-auto h-11 px-6 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-sm font-bold transition-all"
              >
                Create New Account
              </button>
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="w-full sm:w-auto h-11 px-6 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                Transfer Ownership
              </button>
          </div>
        </div>
      </SettingsCard>

      {/* TRANSFER OWNERSHIP PANEL */}
      <AnimatePresence>
        {showTransfer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-4 sm:p-10 relative overflow-hidden">
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Transfer Ownership</h2>
                  <p className="text-white/40 text-sm mt-1">Assign a new owner to this client organization</p>
                </div>
                <button onClick={() => setShowTransfer(false)} className="text-white/40 hover:text-accent transition-colors p-1 mt-1">
                  <X size={18} />
                </button>
              </div>

              <div className="relative mb-6 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                <input
                  placeholder="Enter team member name or email..."
                  className="w-full pl-11 pr-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20 text-sm"
                />
              </div>

              <div className="flex justify-end sm:justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowTransfer(false)}
                  className="w-full sm:w-auto px-6 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-sm font-bold transition-all border border-white/10"
                >
                  Cancel Transfer
                </button>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLOSE ACCOUNT MODAL */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center z-[100] p-4 pt-20"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-secondary border border-white/10 w-full max-w-[520px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={22} className="text-red-500" />
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">Close Account</h2>
                      <p className="text-white/30 text-xs mt-0.5">Step {step} of 2</p>
                    </div>
                  </div>
                  <button onClick={resetModal} className="text-white/20 hover:text-red-500 transition-colors">
                    <X size={22} />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-8">
                  <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-red-500' : 'bg-white/10'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-red-500' : 'bg-white/10'}`} />
                </div>

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-white font-semibold mb-1">We're sorry to see you go.</p>
                      <p className="text-white/40 text-sm">Please tell us why you're leaving so we can improve.</p>
                    </div>

                    <div className="space-y-3">
                      {CLOSE_REASONS.map(r => (
                        <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all group">
                          <input
                            type="radio"
                            name="close_reason"
                            value={r.value}
                            checked={reason === r.value}
                            onChange={() => setReason(r.value)}
                            className="accent-red-500"
                          />
                          <span className="text-white/70 text-sm group-hover:text-white transition-colors">{r.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={resetModal}
                        className="flex-1 h-12 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !reason}
                        className="flex-1 h-12 rounded-full bg-red-600/80 text-white font-bold text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        {sendingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                        Send Code & Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <p className="text-red-400 text-sm font-semibold mb-1">This action is permanent</p>
                      <p className="text-white/40 text-[10px] leading-relaxed">All your jobs, contracts, and payment history will be permanently deleted. This cannot be undone.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <p className="text-red-400 text-xs font-semibold mb-1 uppercase tracking-wider">Verify Email Identity</p>
                      <p className="text-white/40 text-[10px] leading-relaxed">
                        We sent a 6-digit confirmation code to <strong className="text-white/80">{profile?.email}</strong>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Verification Code</label>
                      <input
                        type="text"
                        value={otp}
                        maxLength={6}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm text-center tracking-[0.25em] font-mono text-base"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">To confirm deletion, copy and paste this phrase:</p>
                        <div className="flex items-center justify-between bg-black/30 border border-white/5 px-3 py-2.5 rounded-lg">
                          <code className="text-red-400 font-mono text-xs select-all break-all">{expectedPhrase}</code>
                          <button
                            type="button"
                            onClick={handleCopyPhrase}
                            className="text-white/40 hover:text-white transition-colors p-1"
                            title="Copy phrase"
                          >
                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={confirmPhrase}
                          onChange={e => setConfirmPhrase(e.target.value)}
                          placeholder="Paste the confirmation phrase here"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20 placeholder:font-sans placeholder:text-sm text-center font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[11px] hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCloseAccount}
                        disabled={isDeleting || otp.length < 6 || confirmPhrase !== expectedPhrase}
                        className="flex-1 h-12 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-30 disabled:hover:bg-red-600 disabled:scale-100 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin"/> Closing...</> : "Permanently Close"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountActionsSection;
