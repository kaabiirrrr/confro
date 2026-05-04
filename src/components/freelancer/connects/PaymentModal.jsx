import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectsApi } from '../../../services/connectsApi';
import InfinityLoader from '../../common/InfinityLoader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_sample');

function CheckoutForm({ clientSecret, onSuccess, onCancel, amount, connects }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError(null);

        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message);
            toast.error(submitError.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                await connectsApi.confirmPayment(paymentIntent.id);
                onSuccess();
            } catch (err) {
                console.error("Backend confirmation failed:", err);
                setError("Payment succeeded but failed to sync connects. Please contact support.");
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-hover transition-colors text-light-text font-medium"
                >
                    Cancel
                </button>
                <button
                    disabled={isProcessing || !stripe}
                    className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2"
                >
                    {isProcessing ? <InfinityLoader/> : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
}

export default function PaymentModal({ isOpen, onClose, clientSecret, amount, connects, onComplete }) {
    const [status, setStatus] = useState('paying'); // paying, success

    const handleSuccess = () => {
        setStatus('success');
        setTimeout(() => {
            onComplete();
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-secondary border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
                {status === 'paying' ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-light-text mb-1">Complete Purchase</h3>
                                <p className="text-light-text/50 text-sm">Secure payment via Stripe</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-hover rounded-full transition-colors text-light-text/50 hover:text-light-text">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-hover rounded-xl p-4 mb-8 border border-border flex justify-between items-center">
                            <div>
                                <span className="text-light-text/40 text-xs uppercase tracking-wider font-semibold block">Order Total</span>
                                <span className="text-light-text font-medium">{connects} Connects</span>
                            </div>
                            <span className="text-2xl font-bold text-accent">${amount.toFixed(2)}</span>
                        </div>

                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={{
                                clientSecret,
                                appearance: {
                                    theme: isDark ? 'night' : 'flat',
                                    variables: { colorPrimary: '#38bdf8' }
                                }
                            }}>
                                <CheckoutForm
                                    clientSecret={clientSecret}
                                    amount={amount}
                                    connects={connects}
                                    onSuccess={handleSuccess}
                                    onCancel={onClose}
                                />
                            </Elements>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <InfinityLoader/>
                                <p className="text-light-text/50">Initializing secure checkout...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center scale-110">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                        >
                            <CheckCircle2 size={40} className="text-white" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-light-text mb-2">Payment Successful!</h3>
                        <p className="text-light-text/60 mb-2">Your wallet has been updated.</p>
                        <p className="text-accent font-medium">Redirecting to Dashboard...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
