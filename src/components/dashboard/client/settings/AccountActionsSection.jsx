import React, { useState } from "react";
import { Search, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { deleteAccount } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import InfinityLoader from "../../../common/InfinityLoader";

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
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const resetModal = () => {
    setShowCloseModal(false);
    setStep(1);
    setReason("");
    setPassword("");
  };

  const handleCloseAccount = async () => {
    if (!password.trim()) {
      toast.error("Please enter your password to confirm");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteAccount(reason);
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
      <div className="glass-card rounded-2xl p-8 lg:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Account Management</h3>
          <p className="text-white/40 text-sm mb-10 font-medium italic">Current role: Client Account Administrator</p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => navigate("/join")}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-accent text-white font-bold text-base hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
            >
              Create New Account
            </button>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="text-white/40 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group/btn"
              >
                Transfer Ownership
                <div className="w-1 h-1 rounded-full bg-white/20 group-hover/btn:bg-accent transition-colors" />
              </button>

              <button
                onClick={() => { setShowCloseModal(true); setStep(1); }}
                className="text-red-500/60 hover:text-red-500 text-sm font-bold transition-all"
              >
                Close Account
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <div className="glass-card rounded-2xl p-8 lg:p-10 relative shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Transfer Ownership</h2>
                  <p className="text-white/40 text-xs mt-1 font-medium">Assign a new owner to this client organization</p>
                </div>
                <button onClick={() => setShowTransfer(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-8 group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                <input
                  placeholder="Enter team member name or email..."
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowTransfer(false)}
                  className="px-6 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white text-sm font-bold transition-all border border-white/10"
                >
                  Cancel Transfer
                </button>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-[520px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">Close Account</h2>
                      <p className="text-white/30 text-xs mt-0.5">Step {step} of 2</p>
                    </div>
                  </div>
                  <button onClick={resetModal} className="text-white/20 hover:text-white transition-colors">
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
                        className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { if (!reason) { toast.error("Please select a reason"); return; } setStep(2); }}
                        className="flex-1 h-12 rounded-xl bg-red-600/80 text-white font-bold text-sm hover:bg-red-600 transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <p className="text-red-400 text-sm font-semibold mb-1">This action is permanent</p>
                      <p className="text-white/40 text-xs leading-relaxed">All your jobs, contracts, and payment history will be permanently deleted. This cannot be undone.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Closing Account</p>
                      <p className="text-white font-medium">{profile?.email || "your account"}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Confirm with your password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500/40 transition-all placeholder:text-white/10"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCloseAccount}
                        disabled={isDeleting}
                        className="flex-1 h-12 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? <><InfinityLoader size={14} /> Closing...</> : "Permanently Close"}
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
