import React, { useState } from "react";
import { X, AlertTriangle, Copy, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { deleteAccount, sendDeleteAccountOTP } from "../../../../services/apiService";
import { supabase } from "../../../../lib/supabase";
import SettingsCard from "../../../ui/SettingsCard";
import { toast } from "react-hot-toast";

const FreelancerAccountActionsSection = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [step, setStep] = useState(1); // 1 = reason & request OTP, 2 = verify OTP & confirm phrase
  const [deleteReason, setDeleteReason] = useState("");
  
  const [otp, setOtp] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [copied, setCopied] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const expectedPhrase = `delete-account/${profile?.email || 'user@example.com'}`;

  const resetModal = () => {
    setShowDeleteModal(false);
    setStep(1);
    setDeleteReason("");
    setOtp("");
    setConfirmPhrase("");
    setDeleteError(null);
    setCopied(false);
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setDeleteError(null);
    try {
      await sendDeleteAccountOTP();
      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send verification code.";
      setDeleteError(msg);
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

  const handleDelete = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    if (confirmPhrase.trim() !== expectedPhrase) {
      toast.error("Confirmation phrase does not match");
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(otp.trim(), confirmPhrase.trim(), deleteReason.trim());
      toast.success("Account closed successfully");
      await supabase.auth.signOut();
      await logout();
      navigate("/?deleted=1", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete account.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <SettingsCard
        title="Account Management"
        subtitle="Manage your platform presence and data privacy"
        icon="/Icons/icons8-alert-96 (1).png"
        iconClassName="w-[30px] h-[30px]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm sm:text-lg">Close Account</h4>
            <p className="text-white/40 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 leading-relaxed">Permanently remove your freelancer profile and history.</p>
          </div>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeleteReason(""); setStep(1); }}
            className="w-full sm:w-auto px-6 sm:px-8 h-9 sm:h-12 shrink-0 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 font-bold text-xs sm:text-sm hover:bg-red-500/10 transition-all active:scale-95"
          >
            Close Account
          </button>
        </div>
      </SettingsCard>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center z-[110] p-4 pt-16 sm:pt-24"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-secondary border border-white/10 w-full max-w-[500px] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={22} className="text-red-500" />
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Close Account</h2>
                      <p className="text-white/30 text-xs mt-0.5">Step {step} of 2</p>
                    </div>
                  </div>
                  <button onClick={resetModal} className="p-2 text-white/20 hover:text-red-500 transition-colors -mr-2">
                    <X size={24} />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-8">
                  <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-red-500' : 'bg-white/10'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-red-500' : 'bg-white/10'}`} />
                </div>

                <div className="space-y-5">
                  {step === 1 ? (
                    <>
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authenticated Identity</p>
                        <p className="text-white text-sm font-medium">{profile?.email || "user@example.com"}</p>
                      </div>

                      <p className="text-white/50 text-xs leading-relaxed">
                        This action is permanent. All your projects, feedback, and certifications will be removed from our architecture.
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Reason (Optional)</label>
                        <textarea
                          value={deleteReason}
                          onChange={e => setDeleteReason(e.target.value)}
                          placeholder="Why are you leaving us?"
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-red-500/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20 resize-none"
                        />
                      </div>

                      {deleteError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex gap-3 mt-8">
                        <button
                          onClick={handleSendOtp}
                          disabled={sendingOtp}
                          className="flex-1 h-12 rounded-full bg-red-600 text-white font-bold text-[13px] sm:text-sm hover:bg-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {sendingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                          Send Verification Code
                        </button>
                        <button
                          onClick={resetModal}
                          className="flex-1 h-12 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[13px] sm:text-sm hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <p className="text-red-400 text-xs font-semibold mb-1 uppercase tracking-wider">Verify Email Identity</p>
                        <p className="text-white/40 text-[10px] leading-relaxed">
                          We sent a 6-digit confirmation code to <strong className="text-white/80">{profile?.email}</strong>.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Verification Code</label>
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

                      {deleteError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex gap-3 mt-8">
                        <button
                          onClick={handleDelete}
                          disabled={deleting || otp.length < 6 || confirmPhrase !== expectedPhrase}
                          className="flex-1 h-12 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-30 disabled:hover:bg-red-600 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                          {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                          Delete Permanently
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          className="flex-1 h-12 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[11px] hover:bg-white/10 transition-all"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FreelancerAccountActionsSection;
