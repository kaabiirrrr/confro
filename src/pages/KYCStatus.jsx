import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, XCircle, RefreshCw, User, Hash, Calendar, FileText, ArrowRight } from 'lucide-react';
import { getKYCStatus } from '../services/apiService';
import InfinityLoader from '../components/common/InfinityLoader';

const STATUS_CFG = {
  PENDING:  { label: 'Pending Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', Icon: Clock },
  VERIFIED: { label: 'Verified',       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', Icon: ShieldCheck },
  APPROVED: { label: 'Verified',       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', Icon: ShieldCheck },
  REJECTED: { label: 'Rejected',       color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', Icon: XCircle },
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1a2744] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center shrink-0">
        <Icon size={14} className="text-[#3b82f6]" />
      </div>
      <div>
        <p className="text-[#475569] text-[10px] font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-[#e2e8f0] text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function KYCStatus() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKYCStatus()
      .then(res => setStatus(res?.data ?? res))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <InfinityLoader size={32} />
    </div>
  );

  if (!status) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="text-center space-y-4">
        <p className="text-[#64748b]">No KYC submission found.</p>
        <Link to="/kyc" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-xl transition-colors">
          Start KYC <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );

  const kycStatus = (status.kyc_status || status.status || 'PENDING').toUpperCase();
  const cfg = STATUS_CFG[kycStatus] || STATUS_CFG.PENDING;
  const { Icon } = cfg;

  // Handle all possible field names the backend might return
  const ocr = status.extracted_data || status.ocr_data || status.ocr || status.data?.extracted_data || {};
  const ocrName    = ocr.name || ocr.full_name || ocr.fullName || null;
  const ocrDob     = ocr.dob  || ocr.date_of_birth || ocr.dateOfBirth || ocr.birth_date || null;
  const ocrDocNum  = ocr.document_number || ocr.doc_number || ocr.id_number || ocr.number || null;
  const ocrDocType = status.document_type || ocr.document_type || null;
  const ocrAddress = ocr.address || ocr.addr || null;
  const ocrGender  = ocr.gender || ocr.sex || null;
  const hasOCR     = ocrName || ocrDob || ocrDocNum;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
        className="w-full max-w-[480px] space-y-4">

        {/* Status card */}
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-2xl p-7">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Icon size={22} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-semibold text-lg">KYC Status</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-[#64748b] text-sm">
                {kycStatus === 'PENDING' && 'Your documents are being reviewed. This usually takes 1–2 business days.'}
                {(kycStatus === 'VERIFIED' || kycStatus === 'APPROVED') && 'Your identity has been verified successfully.'}
                {kycStatus === 'REJECTED' && 'Your KYC was not approved. Please review the reason and resubmit.'}
              </p>
            </div>
          </div>

          {/* Rejection reason */}
          {kycStatus === 'REJECTED' && status.rejection_reason && (
            <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-5">
              <p className="text-[#475569] text-[10px] font-semibold uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-[#f87171] text-sm">{status.rejection_reason}</p>
            </div>
          )}

          {/* OCR extracted data */}
          {hasOCR && (
            <div>
              <p className="text-[#475569] text-[10px] font-semibold uppercase tracking-wider mb-3">Extracted Information</p>
              <div className="bg-[#0a0f1e] rounded-xl border border-[#1a2744] px-4">
                <InfoRow icon={User}     label="Full Name"        value={ocrName} />
                <InfoRow icon={Calendar} label="Date of Birth"    value={ocrDob} />
                <InfoRow icon={Hash}     label="Document Number"  value={ocrDocNum} />
                <InfoRow icon={FileText} label="Document Type"    value={ocrDocType?.replace(/_/g, ' ')} />
                <InfoRow icon={User}     label="Gender"           value={ocrGender} />
                <InfoRow icon={FileText} label="Address"          value={ocrAddress} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {kycStatus === 'REJECTED' && (
            <button onClick={() => navigate('/kyc')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold transition-colors">
              <RefreshCw size={15} /> Resubmit KYC
            </button>
          )}
          {(kycStatus === 'VERIFIED' || kycStatus === 'APPROVED') && (
            <button onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold transition-colors">
              Go to Dashboard <ArrowRight size={15} />
            </button>
          )}
          {kycStatus === 'PENDING' && (
            <button onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1a2744] text-[#94a3b8] hover:text-white hover:border-[#2a3a5a] text-sm font-medium transition-colors">
              <RefreshCw size={15} /> Refresh Status
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
