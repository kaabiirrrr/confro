import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Star, Trash2, ShieldCheck, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements
} from '@stripe/react-stripe-js';
import { getBillingMethods, createSetupIntent, addBillingMethod,
  setDefaultBillingMethod, removeBillingMethod,
} from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';
import InfinityLoader from '../../../common/InfinityLoader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#e2e8f0',
      fontFamily: 'inherit',
      fontSize: '14px',
      '::placeholder': { color: 'rgba(255,255,255,0.3)' },
    },
    invalid: { color: '#f87171' },
  },
};

const BRAND_COLORS = {
  visa: 'text-blue-400', mastercard: 'text-red-400',
  amex: 'text-green-400', discover: 'text-orange-400',
};

// ── Add Card Form (needs Stripe context) ──────────────────────
function AddCardForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { client_secret, customer_id } = await createSetupIntent().then(r => r?.data ?? r);
      const cardEl = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
        payment_method: { card: cardEl },
      });
      if (error) throw new Error(error.message);
      await addBillingMethod({ payment_method_id: setupIntent.payment_method, customer_id });
      toast.success('Card added successfully');
      onSuccess();
    } catch (err) {
      toastApiError(err, err.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !stripe} loading={loading} className="flex-1">
          Save Card
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BillingPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBillingMethods();
      setMethods(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSetDefault = async (id) => {
    setActionId(id);
    try {
      await setDefaultBillingMethod(id);
      setMethods(prev => prev.map(m => ({ ...m, is_default: m.id === id })));
      toast.success('Default payment method updated');
    } catch (err) {
      toastApiError(err, 'Failed to update default');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (id) => {
    setActionId(`del-${id}`);
    try {
      await removeBillingMethod(id);
      setMethods(prev => prev.filter(m => m.id !== id));
      toast.success('Card removed');
    } catch (err) {
      toastApiError(err, 'Failed to remove card');
    } finally {
      setActionId(null);
    }
  };

  const noStripeKey = !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
      <SectionHeader 
        title="Billing"
        subtext="Manage your payment methods and billing history."
      />

      {noStripeKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-400 text-sm mb-6 flex items-center gap-2">
          <ShieldCheck size={16} />
          Add <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> to your .env to enable card entry.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-24" />)}
        </div>
      ) : methods.length === 0 && !showAddForm ? (
        <EmptyState 
          icon={CreditCard}
          title="No payment methods"
          description="Add a card to start hiring freelancers and funding projects."
          action={
            <Button onClick={() => setShowAddForm(true)} icon={Plus}>
              Add payment method
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map(m => {
            const brand = m.brand?.toLowerCase() ?? '';
            const isRemoving = actionId === `del-${m.id}`;
            const isSettingDefault = actionId === m.id;
            return (
              <Card key={m.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className={BRAND_COLORS[brand] ?? 'text-white/40'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium capitalize">{m.brand ?? 'Card'} ···· {m.last4}</p>
                    {m.is_default && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Default</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">Expires {m.exp_month}/{m.exp_year}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!m.is_default && (
                    <button
                      onClick={() => handleSetDefault(m.id)}
                      disabled={!!actionId}
                      className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition disabled:opacity-40"
                      title="Set as default"
                    >
                      {isSettingDefault ? <InfinityLoader size={20} /> : <Star size={13} />}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={!!actionId}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-40"
                    title="Remove card"
                  >
                    {isRemoving ? <InfinityLoader size={20} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add card */}
      {showAddForm ? (
        <div className="max-w-xl">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Add New Card</h3>
              <button onClick={() => setShowAddForm(false)} className="text-white/30 hover:text-white transition p-1 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {noStripeKey ? (
              <p className="text-white/40 text-sm">Configure your Stripe publishable key to enable card entry.</p>
            ) : (
              <Elements stripe={stripePromise}>
                <AddCardForm
                  onSuccess={() => { setShowAddForm(false); load(); }}
                  onCancel={() => setShowAddForm(false)}
                />
              </Elements>
            )}
          </Card>
        </div>
      ) : methods.length > 0 && (
        <Button
          onClick={() => setShowAddForm(true)}
          icon={Plus}
        >
          Add Payment Method
        </Button>
      )}
    </div>
  );
}
