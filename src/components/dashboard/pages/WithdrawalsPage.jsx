import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Clock, CheckCircle2, XCircle,
  AlertCircle, Plus, X, CreditCard, ChevronDown, Search, Building2
} from 'lucide-react';
import { formatINR, convertToUSD, USD_TO_INR } from '../../../utils/currencyUtils';
import { getWithdrawals, requestWithdrawal, cancelWithdrawal } from '../../../services/apiService';
import { getBankAccounts, addBankAccount, deleteBankAccount, setDefaultBankAccount } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import OtpModal from '../../OtpModal';
import { useOtp } from '../../../hooks/useOtp';
import { useAuth } from '../../../context/AuthContext';

const INDIAN_BANKS = [
  { name: 'State Bank of India (SBI)',  ifscPrefix: 'SBIN', acLen: 11 },
  { name: 'HDFC Bank',                  ifscPrefix: 'HDFC', acLen: 14 },
  { name: 'ICICI Bank',                 ifscPrefix: 'ICIC', acLen: 12 },
  { name: 'Axis Bank',                  ifscPrefix: 'UTIB', acLen: 15 },
  { name: 'Kotak Mahindra Bank',        ifscPrefix: 'KKBK', acLen: 16 },
  { name: 'Punjab National Bank',       ifscPrefix: 'PUNB', acLen: 16 },
  { name: 'Bank of Baroda',             ifscPrefix: 'BARB', acLen: 14 },
  { name: 'Canara Bank',                ifscPrefix: 'CNRB', acLen: 13 },
  { name: 'Union Bank of India',        ifscPrefix: 'UBIN', acLen: 15 },
  { name: 'Bank of India',              ifscPrefix: 'BKID', acLen: 15 },
  { name: 'Indian Bank',                ifscPrefix: 'IDIB', acLen: 15 },
  { name: 'Central Bank of India',      ifscPrefix: 'CBIN', acLen: 14 },
  { name: 'IndusInd Bank',              ifscPrefix: 'INDB', acLen: 15 },
  { name: 'Yes Bank',                   ifscPrefix: 'YESB', acLen: 15 },
  { name: 'IDFC First Bank',            ifscPrefix: 'IDFB', acLen: 12 },
  { name: 'Federal Bank',               ifscPrefix: 'FDRL', acLen: 14 },
  { name: 'South Indian Bank',          ifscPrefix: 'SIBL', acLen: 16 },
  { name: 'Karnataka Bank',             ifscPrefix: 'KARB', acLen: 13 },
  { name: 'Bandhan Bank',               ifscPrefix: 'BDBL', acLen: 13 },
  { name: 'RBL Bank',                   ifscPrefix: 'RATN', acLen: 12 },
  { name: 'UCO Bank',                   ifscPrefix: 'UCBA', acLen: 15 },
  { name: 'Bank of Maharashtra',        ifscPrefix: 'MAHB', acLen: 16 },
  { name: 'Indian Overseas Bank',       ifscPrefix: 'IOBA', acLen: 15 },
  { name: 'Paytm Payments Bank',        ifscPrefix: 'PYTM', acLen: 11 },
  { name: 'Airtel Payments Bank',       ifscPrefix: 'AIRP', acLen: 11 },
  { name: 'Fino Payments Bank',         ifscPrefix: 'FINO', acLen: 12 },
];

const METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal',        label: 'PayPal' },
  { value: 'stripe',        label: 'Stripe' },
];

const STATUS_CFG = {
  PENDING:    { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  PROCESSING: { cls: 'bg-accent/10 text-accent border-accent/20',             Icon: Clock },
  COMPLETED:  { cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  REJECTED:   { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
};

const fmtINR = (v) => formatINR(v);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const FEE_RATE = 0.03;
const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent transition-all duration-200 backdrop-blur-md";

function BankDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const filtered = INDIAN_BANKS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const selected = INDIAN_BANKS.find(b => b.name === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-transparent border border-[#2a2a2a] rounded-xl text-sm text-white hover:border-[#3b82f6] transition-colors focus:outline-none">
        <span className={selected ? 'text-white' : 'text-[#444]'}>{selected ? selected.name : 'Select bank'}</span>
        <ChevronDown size={14} className={`text-[#555] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full mt-2 w-full bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
            <div className="p-3 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-xl border border-white/10">
                <Search size={14} className="text-white/20 shrink-0" />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search bank..." className="bg-transparent text-white text-sm placeholder-white/10 outline-none flex-1" />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0
                ? <div className="flex flex-col items-center py-8 opacity-40 italic text-xs text-white">No results found</div>
                : filtered.map(bank => (
                  <button key={bank.name} type="button"
                    onClick={() => { onChange(bank); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.05] transition-all text-left group ${value === bank.name ? 'bg-accent/10 border-l-2 border-accent' : ''}`}>
                    <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{bank.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{bank.acLen} digits</span>
                      {value === bank.name && <CheckCircle2 size={14} className="text-accent" />}
                    </div>
                  </button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BankFormFields({ selectedBank, details, setDetail, handleBankSelect, errors }) {
  const Err = ({ field }) => errors[field] ? <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> {errors[field]}</p> : null;
  const Label = ({ children }) => <label className="block text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">{children}</label>;
  return (
    <div className="space-y-4">
      <div>
        <Label>Bank name</Label>
        <BankDropdown value={selectedBank?.name} onChange={handleBankSelect} />
        <Err field="bank_name" />
      </div>
      <div>
        <Label>Account holder name</Label>
        <input value={details.account_holder || ''} onChange={setDetail('account_holder')}
          placeholder="As per bank records" className={inputCls} />
        <Err field="account_holder" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Account number</Label>
          {selectedBank && details.account_number && (
            <span className={`text-xs ${details.account_number.length === selectedBank.acLen ? 'text-[#3b82f6]' : 'text-[#555]'}`}>
              {details.account_number.length}/{selectedBank.acLen}
            </span>
          )}
        </div>
        <input type="text" inputMode="numeric" pattern="[0-9]*"
          value={details.account_number || ''} onChange={setDetail('account_number')}
          placeholder={selectedBank ? `${selectedBank.acLen}-digit account number` : 'Select a bank first'}
          disabled={!selectedBank} maxLength={selectedBank?.acLen}
          className={inputCls + (!selectedBank ? ' opacity-40 cursor-not-allowed' : '')} />
        <Err field="account_number" />
      </div>
      <div>
        <Label>IFSC code</Label>
        <input value={details.ifsc_code || ''} onChange={setDetail('ifsc_code')}
          placeholder={selectedBank ? `${selectedBank.ifscPrefix}0XXXXXX` : 'e.g. SBIN0001234'}
          maxLength={11} className={inputCls + ' uppercase tracking-wider font-mono'} />
        <Err field="ifsc_code" />
      </div>
    </div>
  );
}

function AddBankModal({ onClose, onSuccess }) {
  const [selectedBank, setSelectedBank] = useState(null);
  const [details, setDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const setDetail = (k) => (e) => {
    const val = e.target.value;
    if (k === 'account_number' && selectedBank && val.length > selectedBank.acLen) return;
    if (k === 'ifsc_code') { setDetails(p => ({ ...p, [k]: val.toUpperCase() })); setErrors(p => ({ ...p, [k]: undefined })); return; }
    setDetails(p => ({ ...p, [k]: val }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setDetails(p => ({ ...p, bank_name: bank.name, account_number: '', ifsc_code: bank.ifscPrefix }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!selectedBank) e.bank_name = 'Select a bank';
    if (!details.account_holder?.trim()) e.account_holder = 'Required';
    if (!details.account_number?.trim()) e.account_number = 'Required';
    else if (selectedBank && details.account_number.length !== selectedBank.acLen)
      e.account_number = `Must be exactly ${selectedBank.acLen} digits`;
    if (!details.ifsc_code?.trim()) e.ifsc_code = 'Required';
    else if (details.ifsc_code.length !== 11) e.ifsc_code = 'IFSC must be 11 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await addBankAccount({ bank_name: details.bank_name, account_holder: details.account_holder, account_number: details.account_number, ifsc_code: details.ifsc_code });
      toast.success('Bank account added');
      onSuccess(res?.data ?? res);
      onClose();
    } catch (err) {
      toastApiError(err, 'Failed to add bank account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40" onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-secondary/95 border border-white/10 rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col">
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-white text-xl font-bold tracking-tight">Add Bank Account</h2>
            <p className="text-white/40 text-xs mt-1 font-medium">Link a verified account for fast withdrawals</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 overflow-y-auto">
          <BankFormFields selectedBank={selectedBank} details={details} setDetail={setDetail} handleBankSelect={handleBankSelect} errors={errors} />
          <div className="flex items-start gap-3 p-3 bg-accent/5 border border-accent/10 rounded-xl">
            <AlertCircle size={14} className="text-accent shrink-0 mt-0.5" />
            <p className="text-white/40 text-[10px] leading-relaxed">Account details are encrypted. Ensure the holder name matches your profile for faster approval.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-full border border-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3.5 rounded-full bg-accent hover:bg-accent/90 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
              {submitting ? <InfinityLoader size={16} /> : 'Save Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function WithdrawalModal({ available, onClose, onSuccess }) {
  const availableINR = parseFloat(available || 0) * USD_TO_INR;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [selectedBank, setSelectedBank] = useState(null);
  const [details, setDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const amtNum = parseFloat(amount) || 0;
  const fee = Math.round(amtNum * FEE_RATE);
  const youReceive = amtNum - fee;

  const setDetail = (k) => (e) => {
    const val = e.target.value;
    if (k === 'account_number' && selectedBank && val.length > selectedBank.acLen) return;
    if (k === 'ifsc_code') { setDetails(p => ({ ...p, [k]: val.toUpperCase() })); setErrors(p => ({ ...p, [k]: undefined })); return; }
    setDetails(p => ({ ...p, [k]: val }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setDetails(p => ({ ...p, bank_name: bank.name, account_number: '', ifsc_code: bank.ifscPrefix }));
    setErrors({});
  };

  const Err = ({ field }) => errors[field] ? <p className="text-red-400 text-xs mt-1">{errors[field]}</p> : null;
  const Label = ({ children }) => <label className="block text-xs text-[#888] mb-1.5">{children}</label>;

  const validate = () => {
    const e = {};
    if (!amount || isNaN(amtNum)) e.amount = 'Enter a valid amount';
    else if (amtNum < 500) e.amount = 'Minimum withdrawal is ₹500';
    else if (amtNum > availableINR) e.amount = 'Exceeds available balance';
    if (method === 'bank_transfer') {
      if (!selectedBank) e.bank_name = 'Select a bank';
      if (!details.account_holder?.trim()) e.account_holder = 'Required';
      if (!details.account_number?.trim()) e.account_number = 'Required';
      else if (selectedBank && details.account_number.length !== selectedBank.acLen)
        e.account_number = `Must be exactly ${selectedBank.acLen} digits`;
      if (!details.ifsc_code?.trim()) e.ifsc_code = 'Required';
      else if (details.ifsc_code.length !== 11) e.ifsc_code = 'IFSC must be 11 characters';
    } else if (method === 'paypal') {
      if (!details.paypal_email?.trim()) e.paypal_email = 'Required';
    } else if (method === 'stripe') {
      if (!details.stripe_account_id?.trim()) e.stripe_account_id = 'Required';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = { amount: convertToUSD(amount), method, account_details: details };
      onSuccess(payload); // pass to parent — OTP will gate the actual API call
    } catch (err) {
      toastApiError(err, 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md bg-black/40" onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-secondary/95 border border-white/10 rounded-3xl w-full max-w-[460px] shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col">
        
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-white text-xl font-bold tracking-tight">Withdraw Funds</h2>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Available: <span className="text-accent">{fmtINR(availableINR)}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 overflow-y-auto">
          {/* Amount */}
          <div className="space-y-2">
            <Label>Withdrawal Amount</Label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-lg group-focus-within:text-accent group-focus-within:font-bold transition-all">₹</span>
              <input type="number" min={500} step="1" value={amount}
                onChange={e => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: undefined })); }}
                placeholder="0.00"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-20 py-4 text-white text-xl font-bold placeholder-white/5 focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all" />
              <button type="button"
                onClick={() => { setAmount(Math.floor(availableINR).toString()); setErrors(p => ({ ...p, amount: undefined })); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all">
                Max Funds
              </button>
            </div>
            <Err field="amount" />
          </div>

          {/* Fee preview */}
          {amtNum >= 500 && (
            <div className="flex items-center justify-between p-4 bg-accent/[0.03] rounded-2xl border border-accent/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Fee (3%) <span className="text-red-400 opacity-50 ml-1">−₹{fee.toLocaleString()}</span></span>
              <span className="text-sm font-bold text-white tracking-tight">You get <span className="text-accent">₹{youReceive.toLocaleString()}</span></span>
            </div>
          )}

          {/* Method tabs */}
          <div className="space-y-3">
            <Label>Transfer Method</Label>
            <div className="flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl">
              {METHODS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => { setMethod(value); setDetails({}); setSelectedBank(null); setErrors({}); }}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${method === value ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/30 hover:text-white/60'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
            {method === 'bank_transfer' && (
              <BankFormFields selectedBank={selectedBank} details={details} setDetail={setDetail} handleBankSelect={handleBankSelect} errors={errors} />
            )}
            {method === 'paypal' && (
              <div className="space-y-2">
                <Label>PayPal Email Address</Label>
                <input type="email" value={details.paypal_email || ''} onChange={setDetail('paypal_email')}
                  placeholder="name@example.com" className={inputCls} />
                <Err field="paypal_email" />
              </div>
            )}
            {method === 'stripe' && (
              <div className="space-y-2">
                <Label>Stripe Account Identifier</Label>
                <input value={details.stripe_account_id || ''} onChange={setDetail('stripe_account_id')}
                  placeholder="acct_..." className={inputCls + ' font-mono'} />
                <Err field="stripe_account_id" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-white/20 text-[10px] uppercase font-bold tracking-widest bg-white/[0.01] p-3 rounded-xl border border-white/5">
            <Clock size={12} className="text-accent" />
            Process time: 2–5 business days
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-4 rounded-full border border-white/10 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-4 rounded-full bg-accent hover:bg-accent/90 text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
              {submitting ? <InfinityLoader size={16} /> : amtNum >= 500 ? `Withdraw Now` : 'Continue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function WithdrawalsPage() {
  const { profile } = useAuth();
  const phone = profile?.mobile_number || profile?.phone || '';

  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [deletingBankId, setDeletingBankId] = useState(null);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);

  const { openOtp, otpProps } = useOtp({
    phone,
    onSuccess: async (_result, purpose) => {
      if (purpose === 'withdrawal' && pendingWithdrawal) {
        // OTP verified — now actually submit the withdrawal
        try {
          const res = await requestWithdrawal(pendingWithdrawal);
          toast.success('Withdrawal request submitted');
          handleCreated(res?.data ?? res);
        } catch (err) {
          toastApiError(err, 'Failed to submit withdrawal');
        } finally {
          setPendingWithdrawal(null);
          setShowModal(false);
        }
      }
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, bRes] = await Promise.all([
        getWithdrawals(),
        getBankAccounts().catch(() => ({ data: [] })),
      ]);
      const d = wRes?.data ?? wRes;
      setWithdrawals(d?.withdrawals ?? d ?? []);
      setBalance(d?.balance ?? null);
      const banks = bRes?.data ?? bRes ?? [];
      setBankAccounts(Array.isArray(banks) ? banks : []);
    } catch (err) {
      toastApiError(err, 'Could not load withdrawals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await cancelWithdrawal(id);
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'CANCELLED' } : w));
      toast.success('Withdrawal cancelled');
    } catch (err) { toastApiError(err, 'Failed to cancel'); }
    finally { setCancellingId(null); }
  };

  const handleCreated = (newW) => {
    if (newW?.id) setWithdrawals(prev => [newW, ...prev]);
    load();
  };

  // Called by WithdrawalModal — store payload, trigger OTP
  const handleWithdrawalRequest = (payload) => {
    setPendingWithdrawal(payload);
    setShowModal(false);
    if (phone) {
      openOtp('withdrawal');
    } else {
      // No phone on file — submit directly (fallback)
      requestWithdrawal(payload)
        .then(res => { toast.success('Withdrawal request submitted'); handleCreated(res?.data ?? res); })
        .catch(err => toastApiError(err, 'Failed to submit withdrawal'));
    }
  };

  const handleDeleteBank = async (id) => {
    setDeletingBankId(id);
    try {
      await deleteBankAccount(id);
      setBankAccounts(prev => prev.filter(b => b.id !== id));
      toast.success('Bank account removed');
    } catch (err) { toastApiError(err, 'Failed to remove account'); }
    finally { setDeletingBankId(null); }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultBankAccount(id);
      setBankAccounts(prev => prev.map(b => ({ ...b, is_default: b.id === id })));
      toast.success('Default account updated');
    } catch (err) { toastApiError(err, 'Failed to update default'); }
  };

  const availableINR = parseFloat(balance?.available || 0) * USD_TO_INR;
  const canWithdraw = availableINR >= 500;
  const lastWithdrawal = withdrawals[0];

  const filtered = statusFilter === 'all'
    ? withdrawals
    : withdrawals.filter(w => w.status === statusFilter);

  const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="w-full px-4 sm:px-8 py-8 font-sans space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Withdrawals</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Manage your earnings and secure payouts</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button onClick={() => setShowModal(true)} disabled={!canWithdraw || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:grayscale text-white text-sm font-bold transition-all shadow-lg shadow-accent/20">
            <Plus size={16} strokeWidth={2.5} /> Withdraw Funds
          </button>
          <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Min ₹500 · 2–5 business days</p>
        </div>
      </div>

      {/* Stats: 2fr 1fr 1fr 1fr */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-[136px] lg:col-span-2 rounded-xl bg-[#161616] animate-pulse" />
          {[1,2].map(i => <div key={i} className="h-[136px] rounded-xl bg-[#161616] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Available — dominant */}
          <div className="rounded-2xl bg-transparent border border-white/10 p-6 flex flex-col justify-between h-[136px] relative overflow-hidden group backdrop-blur-xl sm:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div>
                <p className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Available to withdraw</p>
                <p className="text-white font-bold tracking-tighter leading-none" style={{ fontSize: '2.25rem' }}>{fmtINR(availableINR)}</p>
              </div>
              {canWithdraw && (
                <button onClick={() => setShowModal(true)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 backdrop-blur-md">
                  Withdraw
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-white/5 relative z-10">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Last Payout: <span className="text-white/60">{lastWithdrawal ? fmtDate(lastWithdrawal.created_at) : 'Never'}</span></p>
              {!canWithdraw && <p className="text-red-400/60 text-[10px] font-bold uppercase tracking-wider italic">Need ₹{Math.ceil(500 - availableINR)} more</p>}
            </div>
          </div>
          {[
            { label: 'Total Earned',    value: parseFloat(balance?.total_earned    || 0) * USD_TO_INR },
            { label: 'Total Withdrawn', value: parseFloat(balance?.total_withdrawn || 0) * USD_TO_INR },
            { label: 'Pending',         value: parseFloat(balance?.pending         || 0) * USD_TO_INR },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-transparent border border-white/10 p-5 flex flex-col justify-between h-[136px] backdrop-blur-sm">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{label}</p>
              <p className="text-white/90 text-2xl font-bold tracking-tight">{fmtINR(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* History */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-accent" /> Withdrawal History
            </h2>
            <div className="flex items-center gap-8 border-b border-white/10">
              {STATUS_FILTERS.map(({ key, label }) => (
                <button key={key} onClick={() => setStatusFilter(key)}
                  className={`relative pb-4 px-2 text-[10px] uppercase font-black tracking-widest transition-all ${statusFilter === key ? 'text-accent' : 'text-white/30 hover:text-white'}`}>
                  {label}
                  {statusFilter === key && (
                    <motion.div layoutId="statusFilterUnderline" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/5 bg-transparent text-center backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mb-4 border border-white/5">
                <IndianRupee size={24} className="text-white/10" />
              </div>
              <p className="text-white/60 text-sm font-bold tracking-tight mb-1">No withdrawals yet</p>
              <p className="text-white/20 text-xs mb-6 max-w-[240px]">Start by withdrawing your earnings to your bank account.</p>
              <button onClick={() => setShowModal(true)} disabled={!canWithdraw}
                className="px-6 py-3 rounded-full bg-accent hover:bg-accent/90 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-lg shadow-accent/20">
                Withdraw Funds
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-transparent overflow-hidden backdrop-blur-xl">
              <div className="hidden sm:grid grid-cols-[1fr_120px_120px_120px_64px] gap-4 px-6 py-4 border-b border-white/5 bg-transparent">
                {['Date', 'Amount', 'Method', 'Status', ''].map((h, i) => (
                  <span key={i} className={`text-[10px] font-bold text-white/20 uppercase tracking-widest ${i > 0 && i < 4 ? 'text-right' : ''}`}>{h}</span>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {filtered.map(w => {
                  const cfg = STATUS_CFG[w.status] || STATUS_CFG.PENDING;
                  return (
                    <div key={w.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_120px_120px_64px] gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors items-center sm:items-center group border-b border-white/5 last:border-0">
                      <div className="w-full sm:w-auto flex justify-between sm:block">
                        <div>
                          <p className="text-white/80 text-sm font-medium">{fmtDate(w.created_at)}</p>
                          <p className="text-white/10 text-[10px] mt-1 font-mono group-hover:text-white/20 transition-colors uppercase tracking-tight">{w.id?.slice(0, 12)}</p>
                        </div>
                        <div className="sm:hidden text-right">
                           <p className="text-white font-bold text-sm tracking-tight">{fmtINR(w.amount)}</p>
                           <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">{w.method?.replace('_', ' ') || '—'}</p>
                        </div>
                      </div>
                      <p className="hidden sm:block text-white font-bold text-sm text-right tracking-tight">{fmtINR(w.amount)}</p>
                      <p className="hidden sm:block text-white/40 text-xs text-right capitalize font-medium">{w.method?.replace('_', ' ') || '—'}</p>
                      <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center">
                        <span className="sm:hidden text-white/20 text-[10px] font-bold uppercase tracking-widest">Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${cfg.cls}`}>
                          <cfg.Icon size={10} />
                          {w.status?.toLowerCase()}
                        </span>
                      </div>
                      <div className="w-full sm:w-auto flex justify-end">
                        {w.status === 'PENDING' && (
                          <button onClick={() => handleCancel(w.id)} disabled={cancellingId === w.id}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 sm:p-2 rounded-lg transition-all border border-red-500/10 sm:opacity-0 group-hover:opacity-100 flex items-center gap-2 sm:gap-0 font-bold text-[10px] sm:text-inherit">
                            {cancellingId === w.id ? <InfinityLoader size={12} /> : <><X size={14} /><span className="sm:hidden uppercase tracking-widest">Cancel Request</span></>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">

          {/* Saved Accounts */}
          <div className="rounded-2xl border border-white/10 bg-transparent overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-transparent">
              <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Saved Accounts</h2>
              <button onClick={() => setShowAddBank(true)}
                className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-accent hover:text-accent/80 transition-colors">
                <Plus size={12} strokeWidth={3} /> Add New
              </button>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Building2 size={20} className="text-white/10" />
                </div>
                <p className="text-white/30 text-xs mb-4">No bank accounts saved yet</p>
                <button onClick={() => setShowAddBank(true)} className="text-[10px] uppercase font-bold tracking-widest text-accent hover:underline">
                  Link Account
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {bankAccounts.map(b => (
                  <div key={b.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white/90 text-sm font-bold truncate tracking-tight">{b.bank_name}</p>
                          {b.is_default && (
                            <span className="px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-bold uppercase tracking-widest shrink-0">DEFAULT</span>
                          )}
                        </div>
                        <p className="text-white/20 text-[10px] font-mono tracking-wider">•••• {b.account_number?.slice(-4)}</p>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-wide mt-1">{b.account_holder}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {!b.is_default && (
                          <button onClick={() => handleSetDefault(b.id)} className="text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-accent transition-colors">
                            Default
                          </button>
                        )}
                        <button onClick={() => handleDeleteBank(b.id)} disabled={deletingBankId === b.id}
                          className="text-[9px] font-bold uppercase tracking-widest text-red-400/40 hover:text-red-400 transition-colors">
                          {deletingBankId === b.id ? <InfinityLoader size={10} /> : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Info */}
          <div className="rounded-2xl border border-white/10 bg-transparent p-6 space-y-4 backdrop-blur-xl">
            <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Payout Info</h2>
            <div className="space-y-3">
              {[
                { label: 'Processing time', value: '2–5 business days' },
                { label: 'Platform fee',    value: '3% per withdrawal' },
                { label: 'Min withdrawal',  value: '₹500' },
                { label: 'Methods',         value: 'Bank / PayPal / Stripe' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                  <span className="text-white/70 text-xs font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <WithdrawalModal available={balance?.available ?? 0} onClose={() => setShowModal(false)} onSuccess={handleWithdrawalRequest} />
      )}
      {showAddBank && (
        <AddBankModal
          onClose={() => setShowAddBank(false)}
          onSuccess={(newBank) => {
            if (newBank?.id) setBankAccounts(prev => [...prev, newBank]);
            else load();
          }}
        />
      )}
      <OtpModal {...otpProps} />
    </div>
  );
}
