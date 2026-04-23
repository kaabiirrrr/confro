import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectsApi } from '../../../services/connectsApi';
import PaymentModal from '../../freelancer/connects/PaymentModal';
import InfinityLoader from '../../common/InfinityLoader';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

export default function BuyConnects() {
    const { loading: authLoading, isAuthenticated, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const isClient = role === 'CLIENT';

    // ── Local Safety Failsafe ──────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("[BuyConnects] Loading failsafe triggered after 5s");
                setLoading(false);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [loading]);
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [balance, setBalance] = useState(0);
    const [settings, setSettings] = useState({ is_connect_system_enabled: true });
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef(null);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [checkoutDetails, setCheckoutDetails] = useState({ amount: 0, connects: 0 });

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) return;
            
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            
            try {
                const [balanceRes, packagesRes, settingsRes] = await Promise.all([
                    connectsApi.getBalance(),
                    connectsApi.getPackages(),
                    connectsApi.getSettings()
                ]);
                setBalance(balanceRes.data.balance);
                setPackages(packagesRes.data);
                if (settingsRes.success) setSettings(settingsRes.data);
                
                const bestValue = packagesRes.data.find(p => p.isBestValue) || packagesRes.data[0];
                setSelectedPackage(bestValue);
            } catch (error) {
                console.error("Fetch data failed:", error);
                toast.error("Failed to load connects configurations");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }

        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [authLoading, isAuthenticated]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplyingPromo(true);
        try {
            const res = await connectsApi.applyPromoCode(promoCode);
            setAppliedPromo(res.data);
            toast.success(`Applied ${res.data.discount_percent}% discount!`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid promo code");
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleBuyNow = async () => {
        if (!selectedPackage) return;
        try {
            const res = await connectsApi.createPaymentIntent(selectedPackage.id, promoCode);
            setClientSecret(res.clientSecret);
            setCheckoutDetails({
                amount: res.amount,
                connects: res.connects
            });
            setIsPaymentModalOpen(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Initiating payment failed");
        }
    };

    const calculateFinalPrice = () => {
        if (!selectedPackage) return 0;
        if (!appliedPromo) return selectedPackage.price;
        return selectedPackage.price * (1 - appliedPromo.discount_percent / 100);
    };

    if (loading || authLoading) return <InfinityLoader />;

    const finalPrice = calculateFinalPrice();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <label className="text-accent text-[9px] font-black uppercase tracking-[0.3em]">Capital Store</label>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-light-text tracking-tight flex items-center gap-4">
                        {isClient ? "Hiring Power Repost" : "Refill Connects"}
                    </h1>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl group hover:border-accent/20 transition-all cursor-default translate-y-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-emerald-500/80 transition-colors">Safe & Secure Payment</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="xl:col-span-8 border border-white/5 rounded-[24px] p-8 lg:p-10 space-y-10 shadow-2xl backdrop-blur-sm">
                    
                    {/* Header Banner - Only show if FREE MODE is active */}
                    {!settings.is_connect_system_enabled && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{isClient ? "Free Job Posting Active" : "Connects Free Mode"}</h4>
                                    <p className="text-white/40 text-[11px] font-medium leading-tight">Platform actions cost 0 connects while this mode is active.</p>
                                </div>
                            </div>
                            <div className="px-5 py-2 bg-accent text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-accent/20">
                                ACTIVE STATUS
                            </div>
                        </motion.div>
                    )}

                    {/* Current Balance */}
                    <div className="space-y-1">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">
                            {isClient ? "Hiring Balance" : "Your available Connects"}
                        </label>
                        <p className="text-3xl font-bold text-light-text tracking-tighter">{balance}</p>
                    </div>

                    {/* Amount Selection */}
                    <div className="space-y-4">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">Select the amount to buy</label>
                        <div className="relative" ref={selectRef}>
                            <button
                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                className={`w-full md:max-w-md flex items-center justify-between px-6 py-4 rounded-xl border transition-all ${isSelectOpen ? 'border-accent/40 shadow-xl bg-secondary/60' : 'bg-secondary/40 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className="text-light-text text-sm font-bold">{selectedPackage?.connects} for ₹{selectedPackage?.price.toFixed(2)}</span>
                                <ChevronDown size={14} className={`text-light-text/40 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isSelectOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 mt-3 w-full md:max-w-md bg-secondary border border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                                    >
                                        <div className="p-3 space-y-1">
                                            {packages.map((pkg) => (
                                                <button
                                                    key={pkg.id}
                                                    onClick={() => { setSelectedPackage(pkg); setIsSelectOpen(false); }}
                                                    className={`w-full flex items-center justify-between p-5 rounded-xl text-xs transition-all ${selectedPackage?.id === pkg.id ? 'bg-accent/10 text-accent font-bold' : 'text-light-text/60 hover:bg-white/5 hover:text-light-text'
                                                        }`}
                                                >
                                                    <span className="font-semibold">{pkg.connects} Connects</span>
                                                    <span className="font-bold">₹{pkg.price.toFixed(2)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">Charge amount</label>
                            <p className="text-lg font-bold text-light-text tracking-tight">₹{finalPrice.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">New balance</label>
                            <p className="text-lg font-bold text-accent tracking-tight">{balance + (selectedPackage?.connects || 0)}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">Expiry date</label>
                            <p className="text-sm font-bold text-light-text/80 tracking-tight">{formattedExpiry}</p>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="space-y-5 pt-8 border-t border-white/5">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">Promo code</label>
                        <div className="flex gap-4 max-w-sm">
                            <input
                                type="text"
                                placeholder="Enter code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-secondary/40 border border-white/10 rounded-xl py-3 px-6 text-light-text text-[10px] font-bold tracking-widest focus:outline-none focus:border-accent/40 transition-all placeholder:text-light-text/10"
                            />
                            <button
                                onClick={handleApplyPromo}
                                disabled={isApplyingPromo || !promoCode}
                                className="h-12 px-6 bg-white/5 hover:bg-white/10 text-light-text font-bold rounded-xl text-[9px] uppercase tracking-[0.2em] transition-all disabled:opacity-20 flex items-center justify-center border border-white/5"
                            >
                                {isApplyingPromo ? <InfinityLoader size={18} fullScreen={false} text="" /> : "Apply"}
                            </button>
                        </div>
                        {appliedPromo && (
                            <p className="text-[11px] text-accent font-bold uppercase tracking-[0.2em]">
                                Discount Applied: -{appliedPromo.discount_percent}%
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                        <button
                            onClick={handleBuyNow}
                            className="w-full sm:w-auto h-12 px-10 bg-accent text-white font-bold rounded-xl transition-all text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-primary active:scale-95 shadow-xl shadow-accent/10"
                        >
                            Buy Connects Now
                        </button>
                        <p className="text-[11px] text-light-text/20 font-bold uppercase tracking-[0.1em]">
                            Secure Stripe Checkout
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="border border-accent/10 rounded-[24px] p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-all" />
                        <h3 className="text-[9px] font-bold text-accent uppercase tracking-[0.3em]">Special Offer</h3>
                        <h2 className="text-lg font-bold text-light-text leading-tight tracking-tight">Get 50% Off Freelancer Plus</h2>
                        <p className="text-light-text/50 text-[11px] leading-relaxed font-medium">
                            100 Connects included monthly. Plus members win 40% more contracts on average.
                        </p>
                        <button className="w-full h-12 bg-accent text-white font-bold rounded-xl transition-all text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-primary active:scale-95">
                            Learn More
                        </button>
                    </div>

                    <div className="rounded-[24px] p-8 border border-white/5 space-y-4">
                        <h4 className="text-[9px] font-bold text-light-text/20 uppercase tracking-[0.2em]">Safe Billing</h4>
                        <p className="text-light-text/40 text-[9px] leading-relaxed font-medium">
                            Your transactions are protected with industry-standard bank-level encryption. We never store your card details on our servers.
                        </p>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                clientSecret={clientSecret}
                amount={checkoutDetails.amount}
                connects={checkoutDetails.connects}
                onComplete={() => {
                    toast.success("Balance updated successfully!");
                    navigate('/freelancer/dashboard');
                }}
            />
        </div>
    );
}
