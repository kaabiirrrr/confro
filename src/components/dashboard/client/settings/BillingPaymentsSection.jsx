import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, Calendar, IndianRupee, AlertCircle, Plus, ChevronDown, Clock, X, RefreshCw } from "lucide-react";
import api from "../../../../lib/api";
import toast from "react-hot-toast";

const BillingPaymentsSection = () => {
  const { profile, user } = useAuth();
  const [showBillingCycle, setShowBillingCycle] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [showTopup, setShowTopup] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const { data } = await api.get("/api/wallet");
      if (data.success) setBalance(data.data);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      setLoadingTx(true);
      const { data } = await api.get("/api/wallet/history");
      if (data.success) setTransactions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  // Load Razorpay script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Initiate Razorpay top-up
  const handlePayNow = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount < 500) {
      toast.error("Minimum top-up amount is ₹500");
      return;
    }

    setProcessingPayment(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Check your internet connection.");
        return;
      }

      // Create order on backend — send amount in INR (backend converts to paise)
      const { data: orderData } = await api.post("/api/wallet/topup/create", {
        amount, // INR
      });

      if (!orderData.success) throw new Error(orderData.message || "Order creation failed");

      const { order_id, amount: orderAmount, currency, key_id } = orderData.data;

      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency || "INR",
        name: "Connect Freelance",
        description: "Wallet Top-up",
        image: "/Logo2.png",
        order_id,
        prefill: {
          name: profile?.name || user?.user_metadata?.full_name || "",
          email: user?.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post("/api/wallet/topup/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            });

            if (verifyData.success) {
              toast.success(`₹${amount} added to your wallet!`);
              setShowTopup(false);
              setPayAmount("");
              fetchBalance();
              fetchTransactions();
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setProcessingPayment(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed");
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Payment initiation failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(val || 0);

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-2">
          Billing &amp; Payments
        </h2>
        <p className="text-white/40 text-[11px] sm:text-sm font-medium">
          Manage your billing cycle, wallet balance, and payment history.
        </p>
      </div>

      {/* BILLING CYCLE CARD */}
      <div
        onClick={() => setShowBillingCycle(!showBillingCycle)}
        className="glass-card rounded-xl p-5 sm:p-8 cursor-pointer transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex gap-4 flex-1 min-w-0">
            <Calendar size={22} className="text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">Company billing cycle</h3>
              <span className="text-white text-sm font-bold">Weekly</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-white/40 text-[9px] font-semibold uppercase tracking-widest hidden sm:inline">Standard Terms</span>
            <div className={`w-8 h-8 flex items-center justify-center transition-transform duration-300 ${showBillingCycle ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} className="text-white/40" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showBillingCycle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Next Statement</p>
                  <p className="text-white text-base font-bold flex items-center gap-2">
                    <Clock size={14} className="text-accent" /> Every Monday
                  </p>
                </div>
                <div className="rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Frequency</p>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">
                    Billed <span className="text-white font-bold">every Monday</span> for all active hourly contracts.
                  </p>
                </div>
                <div className="rounded-xl p-4 border border-white/10 md:col-span-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Escrow Policy</p>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">
                    Fixed-price milestones are secured in Escrow immediately and are independent of your weekly cycle.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WALLET BALANCE CARD */}
      <div className="glass-card rounded-xl p-5 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div className="flex gap-4">
            <IndianRupee size={22} className="text-accent shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight mb-1">Wallet Balance</h3>
              {loadingBalance ? (
                <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {formatCurrency(balance?.available_balance ?? 0)}
                </p>
              )}
              {balance?.escrow_balance > 0 && (
                <p className="text-white/40 text-xs mt-1">
                  + {formatCurrency(balance.escrow_balance)} in escrow
                </p>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowTopup(!showTopup)}
              className="w-full sm:w-auto h-10 px-6 rounded-full bg-accent text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            >
              Add Funds
            </button>
          </div>
        </div>

        {/* TOP-UP FORM */}
        <AnimatePresence>
          {showTopup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-white/5 relative z-10">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Amount to add (₹ · min ₹500)</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setPayAmount(String(amt))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          payAmount === String(amt)
                            ? "border-accent text-accent"
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Custom amount"
                    min="1"
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-accent/40 transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
                  <button
                    onClick={() => { setShowTopup(false); setPayAmount(""); }}
                    className="w-full sm:w-auto h-10 px-6 rounded-full border border-white/10 text-white/40 hover:text-white text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={processingPayment || !payAmount}
                    className="w-full sm:w-auto h-10 px-8 rounded-full bg-accent text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />Processing...</>
                    ) : (
                      <>Pay via Razorpay</>
                    )}
                  </button>
                </div>
                <p className="text-white/20 text-[10px] mt-3 text-center sm:text-right">
                  Secured by Razorpay · UPI · Cards · Net Banking · Wallets
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="glass-card rounded-xl p-5 sm:p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Wallet size={20} className="text-accent" />
          <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">Transaction History</h3>
        </div>

        {loadingTx ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-10 text-center">
            <AlertCircle size={28} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-medium">No transactions yet.</p>
            <p className="text-white/20 text-xs mt-1">Add funds to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
                <div>
                  <p className="text-white text-sm font-medium capitalize">{tx.description || tx.type || "Transaction"}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPaymentsSection;
