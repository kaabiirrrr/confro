import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  Plus, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatINR } from '../../utils/currencyUtils';
import InfinityLoader from './InfinityLoader';

export default function WalletModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const quickAmounts = [];

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleTopup = async (e) => {
    e?.preventDefault();
    setError(null);
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum < 500) {
      toast.error("Minimum top-up is ₹500");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order on Backend
      const { data: orderRes } = await api.post('/api/wallet/topup/create', { 
        amount: amountNum 
      });

      if (!orderRes.success) throw new Error(orderRes.message);

      // 2. Open Razorpay Checkout
      const options = {
        key: orderRes.data.key_id,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Connect Freelance",
        description: "Wallet Top-up",
        order_id: orderRes.data.order_id,
        handler: async (response) => {
          try {
            setLoading(true);
            const { data: verifyRes } = await api.post('/api/wallet/topup/verify', {
              ...response,
              amount: amountNum
            });

            if (verifyRes.success) {
              toast.success("Funds added successfully!");
              if (onSuccess) onSuccess(verifyRes.data.newBalance);
              onClose();
            } else {
              throw new Error(verifyRes.message || "Verification failed");
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "", // Will be filled by Razorpay if unknown
          email: ""
        },
        theme: { color: "#38bdf8" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      console.error("Top-up initiation failed", err);
      const msg = err.response?.data?.message || err.message || "Failed to initiate payment";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-center items-start pt-8 p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg bg-secondary border border-white/10 rounded-[20px] overflow-hidden shadow-2xl"
          >
            {/* Top Glossy Header */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

            <div className="p-5 relative">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <Wallet size={18} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight leading-none">Add Funds</h2>
                    <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Enterprise Wallet v3</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Area */}
              <div className="space-y-4">
                <div>
                  <label className="text-white/20 text-[8px] font-black uppercase tracking-widest pl-1 mb-1.5 block leading-none">
                    Amount (INR)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <span className="text-white/30 font-bold text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Min 500"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-lg font-black text-white focus:outline-none focus:border-accent/30 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-2.5">
                    <div className="flex items-center justify-center text-emerald-500/60">
                      <ShieldCheck size={12} />
                    </div>
                    <div>
                      <p className="text-white/20 text-[7px] font-bold uppercase tracking-widest leading-none mb-0.5">Secure</p>
                      <p className="text-white/60 text-[8px] font-bold leading-none">SSL Encrypted</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-2.5">
                    <div className="flex items-center justify-center text-blue-400/60">
                      <Zap size={12} />
                    </div>
                    <div>
                      <p className="text-white/20 text-[7px] font-bold uppercase tracking-widest leading-none mb-0.5">Speed</p>
                      <p className="text-white/60 text-[8px] font-bold leading-none">Instant</p>
                    </div>
                  </div>
                </div>

                {/* Error Block */}
                {error && (
                  <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2">
                    <AlertCircle size={10} className="text-red-500/60 shrink-0 mt-0.5" />
                    <p className="text-red-400/60 text-[8px] leading-relaxed">{error}</p>
                  </div>
                )}
                
                {/* Action Button */}
                <button
                  onClick={handleTopup}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3.5 rounded-full font-black text-[9px] uppercase tracking-[0.25em] shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? (
                    <InfinityLoader/>
                  ) : (
                    <>
                      Verify & Pay <ArrowRight size={12} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-0.5 opacity-20 grayscale">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Powered by</span>
                  <div className="flex items-center gap-1">
                    <CreditCard size={10} className="text-white" />
                    <span className="text-[10px] font-black text-white italic tracking-tighter">Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
