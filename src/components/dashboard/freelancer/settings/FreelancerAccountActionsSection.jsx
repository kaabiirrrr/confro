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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-white font-bold text-lg">Close Account</h4>
            <p className="text-white/40 text-sm font-medium mt-1">Permanently remove your freelancer profile and history.</p>
          </div>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeleteReason(""); }}
            className="px-8 h-12 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-all"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Confirm Deletion</h2>
                  <button onClick={() => setShowDeleteModal(false)} className="text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authenticated Identity</p>
                    <p className="text-white font-medium">{profile?.email || "user@example.com"}</p>
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed">
                    This action is permanent. All your projects, feedback, and certifications will be removed from our architecture.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Reason (Optional)</label>
                    <textarea
                      value={deleteReason}
                      onChange={e => setDeleteReason(e.target.value)}
                      placeholder="Why are you leaving us?"
                      rows={3}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10 resize-none"
                    />
                  </div>

                  {deleteError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                      {deleteError}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-12">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 h-14 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting && <InfinityLoader size={20} />}
                    Delete Forever
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 h-14 rounded-xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
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
