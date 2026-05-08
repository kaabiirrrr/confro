import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    Shield, 
    ArrowRight,
    CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectsApi } from '../../../services/connectsApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';

// UI Components
import SectionHeader from "../../ui/SectionHeader";
import Button from "../../ui/Button";
import CustomDropdown from "../../ui/CustomDropdown";
import Card from "../../ui/Card";

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
    const [selectedPackageId, setSelectedPackageId] = useState("");
    const [settings, setSettings] = useState({ is_connect_system_enabled: true });
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    // Update local balance when context balance changes
    useEffect(() => {
        if (contextBalance !== undefined) {
            setBalance(contextBalance);
        }
    }, [contextBalance]);

    useEffect(() => {
        if (!selectedPackageId && packages.length > 0) {
            const bestValue = packages.find(p => p.isBestValue) || packages[0];
            setSelectedPackageId(bestValue.id);
        }
    }, [packages, selectedPackageId]);

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
        const selectedPkg = packages.find(p => p.id === selectedPackageId);
        if (!selectedPkg) return;
        
        try {
            setLoading(true);
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) { toast.error("Gateway error"); setLoading(false); return; }

            const res = await connectsApi.createPaymentIntent(selectedPkg.id, promoCode);
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
                        packageId: selectedPkg.id
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
        const selectedPkg = packages.find(p => p.id === selectedPackageId);
        if (!selectedPkg) return 0;
        let p = selectedPkg.price / 100;
        if (appliedPromo) p *= (1 - (appliedPromo.discount_percentage || 0) / 100);
        return p;
    };

    const selectedPkg = packages.find(p => p.id === selectedPackageId);
    const finalPrice = calculateFinalPrice();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const dropdownOptions = packages.map(pkg => ({
        label: `${pkg.connects} Connects for ₹${(pkg.price / 100).toFixed(2)}`,
        value: pkg.id,
        description: pkg.isBestValue ? "Best Value" : ""
    }));

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 font-sans tracking-tight">
            {/* Header */}
            <SectionHeader 
                title="Refill Connects" 
                subtext="Capital Store"
                action={
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                        <Shield className="text-emerald-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Safe & Secure Payment</span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10 mt-8">
                {/* Main Content */}
                <Card className="xl:col-span-8 p-6 sm:p-10 space-y-8 sm:space-y-10 shadow-2xl">
                    
                    {/* Available Connects */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Your available Connects</label>
                            <button 
                                onClick={handleManualRefresh} 
                                className="transition-all text-accent group p-1"
                                title="Refresh Balance"
                            >
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{balance}</p>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-4">
                        <label className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Select the amount to buy</label>
                        <div className="max-w-md">
                            <CustomDropdown 
                                options={dropdownOptions}
                                value={selectedPackageId}
                                onChange={setSelectedPackageId}
                                placeholder="Select a package"
                            />
                        </div>
                    </div>

                    <div className="h-[1px] bg-slate-100 dark:bg-white/5 w-full" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-8">
                        <div className="space-y-1 sm:space-y-1.5 text-left">
                            <label className="text-slate-400 dark:text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em]">Charge</label>
                            <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white">₹{finalPrice.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 border-x border-slate-100 dark:border-white/5 px-2 sm:px-0 text-center">
                            <label className="text-slate-400 dark:text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em]">Balance</label>
                            <p className="text-sm sm:text-xl font-black text-accent">{balance + (selectedPkg?.connects || 0)}</p>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 text-right">
                            <label className="text-slate-400 dark:text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em]">Expiry</label>
                            <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 dark:text-white/40 leading-tight">
                                {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).replace(',', '')}
                            </p>
                        </div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="space-y-4 pt-4">
                        <label className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Promo Code</label>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                            <input
                                type="text"
                                placeholder="ENTER CODE"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full py-3 px-6 text-slate-900 dark:text-white text-xs font-black tracking-widest focus:outline-none focus:border-accent/40 transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
                            />
                            <Button 
                                onClick={handleApplyPromo} 
                                isLoading={isApplyingPromo} 
                                variant="secondary"
                                className="px-8 text-slate-600 dark:text-white/60 border-slate-200 dark:border-white/10"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                        <Button
                            onClick={handlePurchase}
                            isLoading={loading}
                            className="w-full sm:w-auto px-8 h-11 text-xs uppercase tracking-widest font-black"
                        >
                            Buy Connects Now
                        </Button>
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-slate-300 dark:text-white/10" />
                            <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-widest">Secure Razorpay Checkout</p>
                        </div>
                    </div>
                </Card>

                {/* Sidebar Info */}
                <div className="xl:col-span-4 space-y-6 sm:space-y-8">
                    <div className="bg-accent/5 border border-accent/10 rounded-[24px] p-6 sm:p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                            <RefreshCw size={120} className="text-accent" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Get 50% Off Freelancer Plus</h2>
                        <p className="text-slate-600 dark:text-white/40 text-[11px] leading-relaxed font-medium">
                            100 Connects included monthly. Plus members win 40% more contracts on average.
                        </p>
                        <Button 
                            className="w-full h-12 text-[10px] uppercase tracking-widest font-black"
                        >
                            Learn More
                        </Button>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[24px] p-6 sm:p-8 border border-slate-100 dark:border-white/5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={14} className="text-accent" />
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white/60 uppercase tracking-widest">Safe Billing</h4>
                        </div>
                        <p className="text-slate-500 dark:text-white/30 text-[10px] leading-relaxed font-medium italic">
                            Your transactions are protected with industry-standard bank-level encryption. We never store your card details on our servers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
