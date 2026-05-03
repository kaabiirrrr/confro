import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, 
    RefreshCw, 
    Zap, 
    Shield, 
    Clock, 
    Plus, 
    Check, 
    Info, 
    ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectsApi } from '../../../services/connectsApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';

export default function BuyConnects() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { balance: contextBalance, refetch: refetchProfile } = useProfile();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(contextBalance || 0);
    const [packages, setPackages] = useState([
        { id: 'starter', connects: 50, price: 25000 },
        { id: 'professional', connects: 100, price: 50000, isBestValue: true },
        { id: 'ultimate', connects: 200, price: 100000 }
    ]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [settings, setSettings] = useState({ is_connect_system_enabled: true });
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef(null);

    // Update local balance when context balance changes
    useEffect(() => {
        if (contextBalance !== undefined) {
            setBalance(contextBalance);
        }
    }, [contextBalance]);

    // Handle outside clicks for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!selectedPackage && packages.length > 0) {
            setSelectedPackage(packages.find(p => p.isBestValue) || packages[0]);
        }
    }, [packages]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const fetchData = useCallback(async () => {
        if (authLoading || !isAuthenticated) return;
        try {
            const results = await Promise.allSettled([
                connectsApi.getBalance(),
                connectsApi.getPackages(),
                connectsApi.getSettings()
            ]);

            if (results[0].status === 'fulfilled') {
                const bRes = results[0].value;
                if (bRes?.success) {
                    setBalance(bRes.data?.balance ?? 0);
                }
            }
            if (results[1].status === 'fulfilled') {
                const pRes = results[1].value;
                const pkgs = pRes?.data ?? pRes ?? [];
                if (Array.isArray(pkgs) && pkgs.length > 0) {
                    setPackages(pkgs);
                }
            }
            if (results[2].status === 'fulfilled') {
                const sRes = results[2].value;
                if (sRes?.success) setSettings(sRes.data);
            }
        } catch (err) { console.error("Error fetching connects data:", err); }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleManualRefresh = async () => {
        toast.promise(
            Promise.all([fetchData(), refetchProfile()]),
            {
                loading: 'Refreshing...',
                success: 'Balance updated',
                error: 'Refresh failed',
            }
        );
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setIsApplyingPromo(true);
        try {
            const res = await connectsApi.applyPromoCode(promoCode);
            if (res.success) {
                setAppliedPromo({ code: promoCode, ...res.data });
                toast.success("Promo applied!");
            } else {
                toast.error("Invalid promo code");
            }
        } catch (err) { toast.error("Failed to apply promo"); }
        finally { setIsApplyingPromo(false); }
    };

    const handlePurchase = async () => {
        if (!selectedPackage) return;
        try {
            setLoading(true);
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) { toast.error("Gateway error"); setLoading(false); return; }

            const res = await connectsApi.createPaymentIntent(selectedPackage.id, promoCode);
            if (!res.success) throw new Error(res.message);

            const options = {
                key: res.razorpayKeyId,
                amount: res.amount,
                currency: res.currency,
                name: "Connect Freelance",
                description: `Purchase ${res.connects} Connects`,
                order_id: res.orderId,
                handler: async (response) => {
                    const vRes = await connectsApi.confirmPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        packageId: selectedPackage.id
                    });
                    if (vRes.success) {
                        toast.success("Purchase successful!");
                        navigate('/freelancer/dashboard');
                    } else { toast.error("Verification failed"); }
                },
                theme: { color: "#3B82F6" }
            };
            new window.Razorpay(options).open();
        } catch (err) { toast.error(err.message || "Checkout failed"); }
        finally { setLoading(false); }
    };

    const calculateFinalPrice = () => {
        if (!selectedPackage) return 0;
        let p = selectedPackage.price / 100;
        if (appliedPromo) p *= (1 - (appliedPromo.discount_percentage || 0) / 100);
        return p;
    };

    const finalPrice = calculateFinalPrice();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    return (
        <div className="max-w-[1500px] mx-auto px-6 py-10 space-y-10 bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <span className="text-accent text-[8px] font-bold uppercase tracking-widest">Capital Store</span>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Refill Connects</h1>
                </div>
                <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                    <Shield className="text-emerald-500" size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Safe & Secure Payment</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="xl:col-span-8 bg-transparent border border-white/5 rounded-[24px] p-8 lg:p-10 space-y-10 shadow-2xl backdrop-blur-xl">
                    
                    {/* Available Connects */}
                    <div className="space-y-1 relative">
                        <div className="flex items-center justify-between">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">Your available Connects</label>
                            <button onClick={handleManualRefresh} className="text-[8px] font-bold uppercase tracking-widest text-accent/40 hover:text-accent transition-colors flex items-center gap-2">
                                <RefreshCw size={8} /> REFRESH
                            </button>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tighter">{balance}</p>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-4">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">Select the amount to buy</label>
                        <div className="relative" ref={selectRef}>
                            <button
                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                className={`w-full md:max-w-md flex items-center justify-between px-6 py-4 rounded-full border transition-all ${isSelectOpen ? 'border-accent/40 bg-white/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <span className="text-white text-sm font-bold">
                                    {selectedPackage ? `${selectedPackage.connects} Connects for ₹${(selectedPackage.price / 100).toFixed(2)}` : "Select a package"}
                                </span>
                                <ChevronDown size={14} className={`text-white/40 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isSelectOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 mt-3 w-full md:max-w-md bg-[#11141D] border border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
                                    >
                                        <div className="p-3 space-y-1">
                                            {packages.map((pkg) => (
                                                <button
                                                    key={pkg.id}
                                                    onClick={() => { setSelectedPackage(pkg); setIsSelectOpen(false); }}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl text-xs transition-all ${selectedPackage?.id === pkg.id ? 'bg-accent/10 text-accent font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    <span className="font-semibold">{pkg.connects} Connects</span>
                                                    <span className="font-bold">₹{(pkg.price / 100).toFixed(2)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 w-full" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">Charge amount</label>
                            <p className="text-lg font-bold text-white">₹{finalPrice.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">New balance</label>
                            <p className="text-lg font-bold text-accent">{balance + (selectedPackage?.connects || 0)}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">Expiry date</label>
                            <p className="text-[11px] font-bold text-white/40">{expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="space-y-4 pt-4">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em]">Promo Code</label>
                        <div className="flex gap-4 max-w-md">
                            <input
                                type="text"
                                placeholder="Enter code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-accent/40 transition-all"
                            />
                            <button onClick={handleApplyPromo} disabled={isApplyingPromo} className="px-8 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full text-[9px] uppercase tracking-widest transition-all border border-white/5">
                                {isApplyingPromo ? "..." : "Apply"}
                            </button>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="w-full sm:w-auto px-10 py-4 bg-accent hover:bg-accent/90 text-white rounded-full font-bold text-[9px] uppercase tracking-widest shadow-xl shadow-accent/10 transition-all active:scale-95"
                        >
                            {loading ? "Processing..." : "Buy Connects Now"}
                        </button>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Secure Razorpay Checkout</p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white/[0.02] border border-accent/10 rounded-[24px] p-8 space-y-6 relative overflow-hidden group backdrop-blur-xl">
                        <h2 className="text-lg font-bold text-white tracking-tight">Get 50% Off Freelancer Plus</h2>
                        <p className="text-white/40 text-[11px] leading-relaxed font-medium">
                            100 Connects included monthly. Plus members win 40% more contracts on average.
                        </p>
                        <button className="w-full h-11 bg-accent text-white font-bold rounded-full transition-all text-[9px] uppercase tracking-widest hover:bg-white hover:text-primary">
                            Learn More
                        </button>
                    </div>

                    <div className="bg-white/[0.02] rounded-[24px] p-8 border border-white/5 space-y-4 backdrop-blur-xl">
                        <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Safe Billing</h4>
                        <p className="text-white/30 text-[9px] leading-relaxed font-medium">
                            Your transactions are protected with industry-standard bank-level encryption. We never store your card details on our servers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
