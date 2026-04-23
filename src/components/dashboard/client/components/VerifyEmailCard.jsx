import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { Mail, CheckCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import InfinityLoader from '../../../common/InfinityLoader';

const VerifyEmailCard = () => {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResend = async () => {
        if (!user?.email || sending) return;

        setSending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) throw error;

            setSent(true);
            toast.success(`Verification email sent to ${user.email}`);
            // Reset the "sent" state after 60 seconds so user can resend again
            setTimeout(() => setSent(false), 60000);
        } catch (err) {
            console.error('[VerifyEmailCard] Resend failed:', err);
            const msg = err?.message?.includes('already confirmed')
                ? 'Your email is already verified. Try refreshing the page.'
                : err?.message || 'Failed to send verification email. Please try again.';
            toast.error(msg);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-secondary border border-amber-500/20 rounded-xl p-5 sm:p-6 flex justify-between items-start hover:border-amber-500/40 transition group">
            <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-amber-400/70 mb-2 uppercase tracking-wider font-medium">
                    Required to hire
                </p>
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                    Verify your email
                </h3>
                <p className="text-light-text/50 text-xs sm:text-sm mb-4 max-w-[260px]">
                    {sent
                        ? `Check your inbox at ${user?.email}. Didn't get it? Check spam.`
                        : 'Confirm your email address to unlock all hiring features.'}
                </p>

                {sent ? (
                    <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                        <CheckCircle size={14} />
                        Email sent — check your inbox
                    </div>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="flex items-center gap-2 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <InfinityLoader size={20} />
                        ) : (
                            <RefreshCw size={13} />
                        )}
                        {sending ? 'Sending...' : 'Resend verification email'}
                    </button>
                )}
            </div>

            <Mail className="text-amber-400/50 group-hover:text-amber-400/70 transition flex-shrink-0 mt-1" size={20} />
        </div>
    );
};

export default VerifyEmailCard;
