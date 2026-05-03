import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, X, Lock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import InfinityLoader from '../../../common/InfinityLoader';
import { formatINR } from '../../../../utils/currencyUtils';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_sample');

// ── Inner Stripe form ─────────────────────────────────────────
function EscrowCheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (stripeErr) {
      setError(stripeErr.message);
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest transition">
          Skip for now
        </button>
        <button type="submit" disabled={processing || !stripe}
          className="flex-1 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
          {processing ? <InfinityLoader size={18} /> : <><Lock size={14} /> Fund {formatINR(amount)}</>}
        </button>
      </div>
    </form>
  );
}

// ── Main Modal ────────────────────────────────────────────────
export default function EscrowFundingModal({ isOpen, onClose, contractId, jobTitle, amount, freelancerName, isTeam = false, teamMembers = [] }) {
  const { refreshWallet } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [funded, setFunded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !contractId) return;
    setFunded(false);
    setError(null);
    setClientSecret(null);
    setLoading(true);
    api.post('/api/escrow/create-intent', { contractId })
      .then(res => setClientSecret(res.data?.data?.clientSecret || res.data?.clientSecret))
      .catch(err => setError(err.response?.data?.message || 'Could not initialize payment'))
      .finally(() => setLoading(false));
  }, [isOpen, contractId]);

  const handleSuccess = async (paymentIntentId) => {
    try {
      await api.post('/api/escrow/confirm', { contractId, paymentIntentId });
      setFunded(true);
      await refreshWallet();
      toast.success('Escrow funded! Work can now begin.');
    } catch {
      toast.success('Payment received — escrow will be confirmed shortly.');
      setFunded(true);
    }
  };

  const handleRazorpayFund = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: orderRes } = await api.post('/api/payments/razorpay/create-escrow', {
        contract_id: contractId,
        amount: amount
      });

      if (!orderRes.success) throw new Error(orderRes.message);

      const options = {
        key: orderRes.data.key_id,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Connect Freelance",
        description: `Escrow Funding: ${jobTitle}`,
        order_id: orderRes.data.order_id,
        handler: async (response) => {
          try {
            setLoading(true);
            const { data: verifyRes } = await api.post('/api/payments/razorpay/verify-escrow', {
              ...response,
              contract_id: contractId,
              amount: amount
            });
            if (verifyRes.success) {
              setFunded(true);
              await refreshWallet();
              toast.success('Funds secured in escrow!');
            }
          } catch (err) {
            setError("Verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: freelancerName || "",
          email: "" // We don't have user email easily here, but RZP will ask if missing
        },
        theme: { color: "#38bdf8" },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate Razorpay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-secondary dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Fund Escrow</h2>
                  <p className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5">Secure payment to start work</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white transition p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contract summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest">Project</span>
                  <span className="text-slate-900 dark:text-white text-sm font-semibold truncate max-w-[200px]">{jobTitle}</span>
                </div>

                {isTeam ? (
                  // Team hiring — show each member + their amount
                  <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-3">
                    <span className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">Team Members</span>
                    {teamMembers.map((m, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-slate-900 dark:text-white text-xs font-semibold">{m.name}</p>
                          <p className="text-slate-500 dark:text-white/30 text-[9px] uppercase tracking-widest">{m.role}</p>
                        </div>
                        <span className="text-slate-700 dark:text-white/70 text-sm font-bold">{formatINR(m.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest">Freelancer</span>
                    <span className="text-slate-900 dark:text-white text-sm font-semibold">{freelancerName}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest">
                    {isTeam ? 'Total Escrow' : 'Escrow Amount'}
                  </span>
                  <span className="text-accent text-xl font-black">{formatINR(amount)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <Zap size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300/70 text-xs leading-relaxed">
                  Funds are held securely in escrow and only released when you approve the delivered work. You're protected until satisfied.
                </p>
              </div>

              {/* States */}
              {funded ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-500 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">Escrow Funded!</p>
                    <p className="text-slate-500 dark:text-white/40 text-sm mt-1">The freelancer can now begin work.</p>
                  </div>
                  <button onClick={onClose}
                    className="px-8 py-3 rounded-2xl bg-accent text-white text-[11px] font-bold uppercase tracking-widest hover:bg-accent/90 transition">
                    Go to Contract
                  </button>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-10">
                  <InfinityLoader size={32} />
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
                  <button onClick={onClose}
                    className="w-full py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white text-[11px] font-bold uppercase tracking-widest transition">
                    Close
                  </button>
                </div>
              ) : clientSecret && import.meta.env.VITE_ESCROW_MODE !== 'REAL' ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <EscrowCheckoutForm amount={amount} onSuccess={handleSuccess} onCancel={onClose} />
                </Elements>
              ) : import.meta.env.VITE_ESCROW_MODE === 'FAKE' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex flex-col items-center gap-2">
                    <div className="flex flex-col text-right">
                      <span className="text-slate-500 dark:text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">Available</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {formatINR(wallet?.balance || 0)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const { fundFakeEscrow } = await import('../../../../services/apiService');
                        const res = await fundFakeEscrow({
                          contract_id: contractId,
                          freelancer_id: teamMembers.length > 0 ? teamMembers[0].user_id : undefined, // Fallback for team
                          amount: amount
                        });
                        if (res.success) {
                          setFunded(true);
                          await refreshWallet();
                          toast.success('Funds secured in demo escrow!');
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || 'Funding failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={14} /> Confirm Demo Funding
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Payment Protection</p>
                      <p className="text-white/40 text-[10px]">Your funds are held safely until you approve milestones.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRazorpayFund}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-accent text-white font-black text-[11px] uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
                  >
                    {loading ? <InfinityLoader size={18} /> : <><Lock size={14} /> Fund with Razorpay</>}
                  </button>
                  <p className="text-center text-[9px] text-white/20 uppercase tracking-widest font-bold">Secure INR Transaction via Razorpay</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
