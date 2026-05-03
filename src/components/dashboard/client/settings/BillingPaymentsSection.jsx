import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, Calendar, DollarSign, CheckCircle2, AlertCircle, Plus, ChevronDown, Clock, X } from "lucide-react";

const BillingPaymentsSection = () => {
  const { profile } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [showBillingCycle, setShowBillingCycle] = useState(false);
  const [showPaymentConf, setShowPaymentConf] = useState(false);
  const [method, setMethod] = useState("");
  const [savedMethod, setSavedMethod] = useState('card'); // 'card' activates the billing mode by default
  
  const handleSaveMethod = (e) => {
    e.preventDefault();
    setSavedMethod(method);
    setShowAdd(false);
  };

return (

    <div className="space-y-10">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-3">
          Billing &amp; Payments
        </h2>
        <p className="text-white/40 text-sm font-medium">
          Manage your billing cycle, outstanding balances, and active payment instruments.
        </p>
      </div>

      {/* BILLING CYCLE CARD */}
      <div
        onClick={() => setShowBillingCycle(!showBillingCycle)}
        className="glass-card rounded-2xl p-5 sm:p-8 cursor-pointer group hover:border-white/10 transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex gap-4">
            <div className="flex items-center justify-center shrink-0">
              <Calendar size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">Company billing cycle</h3>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">Weekly</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Standard Terms</span>
              </div>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 transition-transform duration-300 ${showBillingCycle ? 'rotate-180 bg-white/10' : ''}`}>
            <ChevronDown size={20} className="text-white/40 group-hover:text-white" />
          </div>
        </div>

        <AnimatePresence>
          {showBillingCycle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 mt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Next Statement</p>
                  <p className="text-white text-lg font-bold flex items-center gap-2">
                    <Clock size={16} className="text-accent" /> April 5, 2026
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Frequency</p>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">
                    Billed <span className="text-white font-bold">every Monday</span> for all active hourly contracts.
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/5 md:col-span-2">
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

      {/* BALANCE CARD */}
      <div className="glass-card rounded-2xl p-5 sm:p-8 group hover:border-white/10 transition-all relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex gap-4 relative z-10">
            <div className="flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">Outstanding balance</h3>
              <p className="text-3xl sm:text-4xl font-black text-white">₹0.00</p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentConf(!showPaymentConf)}
            className={`max-sm:w-full h-12 px-8 rounded-full font-bold text-sm transition-all relative z-10 border shadow-lg ${
              showPaymentConf
                ? 'bg-accent/10 border-accent/20 text-accent shadow-accent/10'
                : 'bg-accent text-white border-transparent hover:scale-[1.02] shadow-accent/20'
            }`}
          >
            {showPaymentConf ? 'Settled ✓' : 'Pay now'}
          </button>
        </div>

        <AnimatePresence>
          {showPaymentConf && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden relative z-10"
            >
              <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base sm:text-lg">Fully Settled</p>
                    <p className="text-white/40 text-xs sm:text-[13px] font-medium">No outstanding invoices or escrow deposits require funding at this time.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentConf(false)}
                  className="max-sm:w-full max-sm:py-2 max-sm:border max-sm:border-white/10 max-sm:rounded-full text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BILLING METHOD CARD */}
      <div className="glass-card rounded-2xl p-5 sm:p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-10">
          <Wallet size={24} className="text-accent" />
          <h3 className="text-2xl font-bold text-white tracking-tight">Billing methods</h3>
        </div>

        {!savedMethod ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <AlertCircle size={32} className="text-white/20 mb-4" />
            <p className="text-white font-medium mb-8">No billing methods configured.</p>
            {!showAdd && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-accent text-white font-bold h-12 px-8 rounded-full hover:scale-[1.02] transition-all shadow-lg shadow-accent/20"
              >
                <Plus size={18} /> Add Method
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 sm:gap-5 relative z-10">
              <div className="flex items-center justify-center text-accent shrink-0">
                {savedMethod === 'card' ? <CreditCard size={28} /> : <Wallet size={28} />}
              </div>
              <div>
                <h4 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                  {savedMethod === 'card' ? 'Visa ending in 3456' : 'PayPal Account'}
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                </h4>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Primary Payment Method</p>
              </div>
            </div>
            <button
              onClick={() => { setShowAdd(true); setSavedMethod(null); }}
              className="relative z-10 text-accent text-sm font-bold hover:underline shrink-0 ml-3"
            >
              Modify
            </button>
          </div>
        )}
      </div>

      {/* ADD BILLING FORM */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card rounded-2xl p-5 sm:p-8 lg:p-10 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">New Billing Method</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PAYMENT CARD OPTION */}
                <div
                  className={`bg-white/5 border rounded-2xl p-6 cursor-pointer transition-all ${
                    method === "card" ? "border-accent/40 shadow-lg shadow-accent/5 bg-white/[0.08]" : "border-white/5 grayscale opacity-60 hover:opacity-100 hover:border-white/10"
                  }`}
                  onClick={() => setMethod("card")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4">
                      <input
                        type="radio"
                        checked={method === "card"}
                        readOnly
                        className="accent-accent w-5 h-5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-lg font-bold text-white tracking-tight">Payment Card</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Credit & Debit Cards</p>
                      </div>
                    </div>
                    <CreditCard size={24} className="text-white/20" />
                  </div>
                </div>

                {/* PAYPAL OPTION */}
                <div
                  className={`bg-white/5 border rounded-2xl p-6 cursor-pointer transition-all ${
                    method === "paypal" ? "border-accent/40 shadow-lg shadow-accent/5 bg-white/[0.08]" : "border-white/5 grayscale opacity-60 hover:opacity-100 hover:border-white/10"
                  }`}
                  onClick={() => setMethod("paypal")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4">
                      <input
                        type="radio"
                        checked={method === "paypal"}
                        readOnly
                        className="accent-accent w-5 h-5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-lg font-bold text-white tracking-tight">PayPal</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Instant Bank Transfer</p>
                      </div>
                    </div>
                    <Wallet size={24} className="text-white/20" />
                  </div>
                </div>
              </div>

              {/* CARD FORM */}
              <AnimatePresence>
                {method === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Card number</label>
                        <input
                          required
                          placeholder="1234 5678 9012 3456"
                          className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/10 font-mono tracking-wider"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">First name</label>
                          <input
                            required
                            placeholder="Owner Given Name"
                            defaultValue={profile?.name?.split(' ')[0]}
                            className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Last name</label>
                          <input
                            required
                            placeholder="Owner Surname"
                            defaultValue={profile?.name?.split(' ').slice(1).join(' ')}
                            className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Expiry MM</label>
                          <input required placeholder="01" className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all text-center" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Expiry YY</label>
                          <input required placeholder="28" className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all text-center" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Security Code</label>
                          <input required placeholder="•••" type="password" maxLength={4} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all text-center" />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Billing Address</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Address 1</label>
                            <input required placeholder="Corporate Address" className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">City</label>
                              <input required className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"/>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Postal Code</label>
                              <input required className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"/>
                            </div>
                          </div>
                        </div>

                        <button type="submit" className="w-full h-14 rounded-full bg-accent text-white font-bold text-sm uppercase tracking-widest mt-10 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-accent/20">
                          Securely Save Method
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PAYPAL REDIRECT */}
              <AnimatePresence>
                {method === "paypal" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 text-center bg-white/[0.02] rounded-2xl p-10 border border-white/5">
                      <div className="w-20 h-20 rounded-full bg-[#0070BA]/10 flex items-center justify-center mx-auto mb-6">
                         <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" className="w-10 h-10 grayscale brightness-200" alt="PP" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Redirecting to PayPal</h3>
                      <p className="text-white/40 text-sm max-w-sm mx-auto mb-10">
                        You'll be temporarily redirected to PayPal to complete secure verification of your account.
                      </p>
                      <button type="submit" className="h-14 px-12 rounded-full bg-[#0070BA] text-white font-bold hover:bg-[#003087] transition-all shadow-lg shadow-[#0070BA]/20">
                        Continue to PayPal
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

);

};

export default BillingPaymentsSection;