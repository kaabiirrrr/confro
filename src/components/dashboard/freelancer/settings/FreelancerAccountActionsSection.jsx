import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { deleteAccount } from "../../../../services/apiService";
import { supabase } from "../../../../lib/supabase";
import SettingsCard from "../../../ui/SettingsCard";
import InfinityLoader from '../../../common/InfinityLoader';

const FreelancerAccountActionsSection = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deleteReason.trim());
      await supabase.auth.signOut();
      await logout();
      navigate("/?deleted=1", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
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
            onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeleteReason(""); }}
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
                  <h2 className="text-xl font-bold text-white tracking-tight">Confirm Deletion</h2>
                  <button onClick={() => setShowDeleteModal(false)} className="p-2 text-white/20 hover:text-accent transition-colors -mr-2">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-5">
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
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 h-12 rounded-full bg-red-600 text-white font-bold text-[13px] sm:text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting && <InfinityLoader/>}
                    Delete Account
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 h-12 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[13px] sm:text-sm hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
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
