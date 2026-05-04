import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, BadgeCheck, Clock, XCircle, Upload,
  ChevronRight, ChevronLeft, User, Hash, Calendar,
  FileText, AlertCircle, Loader2, CheckCircle2, SkipForward
} from 'lucide-react';
import {
  getIdentityStatus,
  uploadAndScanIdentity,
  uploadIdentityDocument,
  submitIdentityVerification,
} from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';

// ── Constants ─────────────────────────────────────────────────
const DOC_TYPES = [
  { value: 'PASSPORT',        label: 'Passport',          icon: '🛂' },
  { value: 'NATIONAL_ID',     label: 'National ID',        icon: '🪪' },
  { value: 'AADHAAR',         label: 'Aadhaar',            icon: '🇮🇳' },
  { value: 'PAN',             label: 'PAN Card',           icon: '💳' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License",   icon: '🚗' },
];

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Helpers ───────────────────────────────────────────────────
const maskDocNumber = (num) => {
  if (!num) return null;
  const s = String(num);
  return s.length > 4 ? '****' + s.slice(-4) : '****';
};

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG, or WebP images allowed';
  if (file.size > MAX_SIZE) return 'File must be under 5MB';
  return null;
};

// ── Step Progress Bar ─────────────────────────────────────────
function StepBar({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i + 1 < current ? 'bg-[#3b82f6] text-white' :
            i + 1 === current ? 'bg-[#3b82f6] text-white ring-4 ring-[#3b82f6]/20' :
            'bg-[#1a2744] text-[#475569]'
          }`}>
            {i + 1 < current ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all ${i + 1 < current ? 'bg-[#3b82f6]' : 'bg-[#1a2744]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────
function DropZone({ file, onFile, uploading, label }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handle = (f) => {
    const err = validateFile(f);
    if (err) { toast.error(err); return; }
    onFile(f);
  };

  return (
    <div>
      {file ? (
        <div className="relative rounded-xl overflow-hidden border border-[#1a2744]">
          <img src={preview} alt="preview" className="w-full h-48 object-cover" />
          <button onClick={() => onFile(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white text-xs hover:bg-black transition">
            ✕
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[#4ade80] text-[10px] flex items-center gap-1">
            <CheckCircle2 size={10} /> {(file.size / 1024).toFixed(0)}KB
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          className={`h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
            ${drag ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-[#1a2744] bg-[#0a0f1e] hover:border-[#3b82f6]/50'}`}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
                <Upload size={18} className="text-[#3b82f6]" />
              </div>
              <div className="text-center">
                <p className="text-[#94a3b8] text-sm">{label || 'Click or drag & drop'}</p>
                <p className="text-[#475569] text-xs mt-0.5">JPG, PNG, WebP · Max 5MB</p>
              </div>
            </>
          )}
        </div>
      )}
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
        onChange={e => handle(e.target.files?.[0])} />
    </div>
  );
}

// ── OCR Preview ───────────────────────────────────────────────
function OCRPreview({ ocr }) {
  const name   = ocr?.name || ocr?.full_name;
  const dob    = ocr?.dob  || ocr?.date_of_birth;
  const docNum = ocr?.document_number || ocr?.doc_number || ocr?.id_number;
  const hasData = name || dob || docNum;

  if (!hasData) return (
    <div className="flex items-start gap-2 px-4 py-3 bg-[#1a2744]/40 border border-[#1a2744] rounded-xl">
      <AlertCircle size={14} className="text-[#fbbf24] shrink-0 mt-0.5" />
      <p className="text-[#94a3b8] text-xs leading-relaxed">
        OCR could not extract data. Admin will review manually.
      </p>
    </div>
  );

  return (
    <div className="bg-[#0a0f1e] border border-[#1a2744] rounded-xl px-4 divide-y divide-[#1a2744]">
      {name    && <div className="flex items-center gap-3 py-2.5"><User size={13} className="text-[#3b82f6] shrink-0" /><span className="text-[#475569] text-xs w-24">Full Name</span><span className="text-[#e2e8f0] text-sm font-medium">{name}</span></div>}
      {dob     && <div className="flex items-center gap-3 py-2.5"><Calendar size={13} className="text-[#3b82f6] shrink-0" /><span className="text-[#475569] text-xs w-24">Date of Birth</span><span className="text-[#e2e8f0] text-sm font-medium">{dob}</span></div>}
      {docNum  && <div className="flex items-center gap-3 py-2.5"><Hash size={13} className="text-[#3b82f6] shrink-0" /><span className="text-[#475569] text-xs w-24">Doc Number</span><span className="text-[#e2e8f0] text-sm font-mono">{maskDocNumber(docNum)}</span></div>}
    </div>
  );
}

// ── Status Screens ────────────────────────────────────────────
function StatusScreen({ vstatus, verifiedAt, rejectionReason, onResubmit }) {
  const navigate = useNavigate();

  if (vstatus === 'verified' || vstatus === 'VERIFIED' || vstatus === 'APPROVED') return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f] border border-[#1a2744] flex items-center justify-center mx-auto">
        <BadgeCheck size={28} className="text-[#3b82f6]" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a5f]/40 border border-[#1a2744] text-[#3b82f6] text-xs font-semibold mb-3">
          <CheckCircle2 size={12} /> Identity Verified
        </div>
        <h2 className="text-white font-semibold text-lg mb-1">Your identity is confirmed</h2>
        <p className="text-[#64748b] text-sm">
          Your trust badge is now visible on your profile.
          {verifiedAt && <span className="block mt-1 text-[#475569] text-xs">Verified on {new Date(verifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
        </p>
      </div>
      <button onClick={() => navigate(-1)}
        className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-xl transition-colors">
        Go to Dashboard
      </button>
    </div>
  );

  if (vstatus === 'pending' || vstatus === 'PENDING' || vstatus === 'UNDER_REVIEW') return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1c1a0a] border border-[#3d3000] flex items-center justify-center mx-auto">
        <Clock size={28} className="text-[#fbbf24]" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1a0a] border border-[#3d3000] text-[#fbbf24] text-xs font-semibold mb-3">
          <Clock size={12} /> Under Review
        </div>
        <h2 className="text-white font-semibold text-lg mb-1">Verification in progress</h2>
        <p className="text-[#64748b] text-sm">We're reviewing your documents. This usually takes 1–3 business days.</p>
      </div>
    </div>
  );

  if (vstatus === 'rejected' || vstatus === 'REJECTED') return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#1a0a0a] border border-[#3a1a1a] flex items-center justify-center mx-auto">
        <XCircle size={28} className="text-[#f87171]" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a0a0a] border border-[#3a1a1a] text-[#f87171] text-xs font-semibold mb-3">
          <XCircle size={12} /> Rejected
        </div>
        <h2 className="text-white font-semibold text-lg mb-1">Verification failed</h2>
        {rejectionReason && (
          <div className="px-4 py-3 bg-[#1a0a0a] border border-[#3a1a1a] rounded-xl text-[#f87171] text-sm mb-4 text-left">
            {rejectionReason}
          </div>
        )}
      </div>
      <button onClick={onResubmit}
        className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-xl transition-colors">
        Resubmit Documents
      </button>
    </div>
  );

  return null;
}

// ── Main Component ────────────────────────────────────────────
export default function KYCPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [vstatus, setVstatus] = useState(null);
  const [verifiedAt, setVerifiedAt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);

  // Form state
  const [step, setStep] = useState(1); // 1=doc type, 2=upload doc, 3=selfie
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [ocr, setOcr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getIdentityStatus()
      .then(res => {
        // Handle all response shapes: { data: {...} }, { verification_status }, or raw object
        const d = res?.data ?? res;
        const inner = d?.data ?? d; // handle double-wrapped { data: { data: {...} } }
        const s = (
          inner?.verification_status ||
          inner?.status ||
          d?.verification_status ||
          d?.status ||
          'NOT_SUBMITTED'
        ).toLowerCase();
        setVstatus(s);
        setVerifiedAt(inner?.verified_at || inner?.approved_at || d?.verified_at || null);
        setRejectionReason(inner?.rejection_reason || d?.rejection_reason || null);
      })
      .catch(() => setVstatus('not_submitted'))
      .finally(() => setPageLoading(false));
  }, []);

  const handleDocUpload = async () => {
    if (!docFile) { setError('Please select a document image'); return; }
    setUploading(true);
    setError('');
    try {
      const res = await uploadAndScanIdentity(docFile, docType);
      const d = res?.data ?? res;
      setDocUrl(d?.document_url || d?.url || d?.file_url);
      setOcr(d?.extracted_data || d?.ocr_data || d?.ocr || null);
      setStep(3);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("You've reached the maximum submission attempts. Contact support.");
      } else if (status === 400) {
        setVstatus('verified');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSelfieUpload = async () => {
    if (!selfieFile) return null;
    try {
      const res = await uploadIdentityDocument(selfieFile);
      const d = res?.data ?? res;
      return d?.document_url || d?.url || d?.file_url;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (skipSelfie = false) => {
    setSubmitting(true);
    setError('');
    try {
      let sUrl = selfieUrl;
      if (!skipSelfie && selfieFile && !selfieUrl) {
        sUrl = await handleSelfieUpload();
        if (sUrl) setSelfieUrl(sUrl);
      }
      await submitIdentityVerification({
        document_type: docType,
        document_front_url: docUrl,
        ...(sUrl ? { selfie_url: sUrl } : {}),
      });
      setVstatus('pending');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) setError("You've reached the maximum submission attempts. Contact support.");
      else if (status === 400) setVstatus('verified');
      else setError(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setVstatus('not_submitted');
    setStep(1); setDocType(''); setDocFile(null); setSelfieFile(null);
    setDocUrl(null); setSelfieUrl(null); setOcr(null); setError('');
  };

  if (pageLoading) return (
    <div className="w-full flex items-center justify-center py-32">
      <InfinityLoader/>
    </div>
  );

  // Show form for any status that isn't a known terminal state
  const TERMINAL = ['verified', 'approved', 'pending', 'under_review', 'verifying', 'rejected'];
  const showStatus = vstatus && TERMINAL.includes(vstatus.toLowerCase().replace(/ /g, '_'));
  const showForm = !showStatus;

  return (
    <div className="w-full max-w-[640px] mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <ShieldCheck size={18} className="text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-base">Identity Verification</h1>
          <p className="text-[#475569] text-xs mt-0.5">Verify your identity to build trust and unlock features</p>
        </div>
      </div>

      <div className="bg-[#0d1526] border border-[#1a2744] rounded-2xl p-7">

        {/* Status screens */}
        {showStatus && (
          <StatusScreen
            vstatus={vstatus}
            verifiedAt={verifiedAt}
            rejectionReason={rejectionReason}
            onResubmit={resetForm}
          />
        )}

        {/* Submission form */}
        {showForm && (
          <>
            <StepBar current={step} total={3} />

            <AnimatePresence mode="wait">

              {/* Step 1 — Document Type */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-white font-semibold text-base mb-1">Select Document Type</h2>
                  <p className="text-[#64748b] text-sm mb-5">Choose a government-issued ID to verify your identity</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {DOC_TYPES.map(d => (
                      <button key={d.value} type="button" onClick={() => setDocType(d.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          docType === d.value
                            ? 'border-[#3b82f6] bg-[#1e3a5f]/40'
                            : 'border-[#1a2744] bg-[#0a0f1e] hover:border-[#2a3a5a]'
                        }`}>
                        <div className="text-2xl mb-2">{d.icon}</div>
                        <p className={`text-sm font-medium ${docType === d.value ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}>{d.label}</p>
                      </button>
                    ))}
                  </div>
                  {error && <p className="text-red-400 text-xs mb-4 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
                  <button onClick={() => { if (!docType) { setError('Please select a document type'); return; } setError(''); setStep(2); }}
                    className="max-sm:w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-xl transition-colors sm:ml-auto">
                    Continue <ChevronRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* Step 2 — Upload Document */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-white font-semibold text-base mb-1">Upload Document</h2>
                  <p className="text-[#64748b] text-sm mb-5">
                    Upload a clear photo of your <span className="text-[#94a3b8] font-medium">{DOC_TYPES.find(d => d.value === docType)?.label}</span>
                  </p>
                  <DropZone file={docFile} onFile={setDocFile} uploading={uploading} label="Click or drag your document here" />
                  <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-[#1e3a5f]/20 border border-[#1a2744] rounded-xl">
                    <AlertCircle size={13} className="text-[#3b82f6] shrink-0 mt-0.5" />
                    <p className="text-[#64748b] text-xs">Ensure all text is clearly visible. OCR will extract your details automatically.</p>
                  </div>
                  {error && <p className="text-red-400 text-xs mt-3 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
                  <div className="max-sm:flex-col-reverse flex sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6">
                    <button onClick={() => { setStep(1); setError(''); }}
                      className="flex items-center justify-center gap-1.5 text-[#475569] hover:text-white text-sm transition-colors py-2.5">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button onClick={handleDocUpload} disabled={uploading || !docFile}
                      className="max-sm:w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                      {uploading ? <><Loader2 size={15} className="animate-spin" /> Scanning…</> : <>Upload &amp; Scan <ChevronRight size={15} /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — Selfie + OCR preview + Submit */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-white font-semibold text-base mb-1">Selfie & Review</h2>
                  <p className="text-[#64748b] text-sm mb-5">Optionally upload a selfie, then review extracted data and submit</p>

                  {/* OCR result */}
                  {ocr !== undefined && (
                    <div className="mb-5">
                      <p className="text-[#475569] text-[10px] font-semibold uppercase tracking-wider mb-2">Extracted Information</p>
                      <OCRPreview ocr={ocr} />
                    </div>
                  )}

                  {/* Selfie upload */}
                  <div className="mb-5">
                    <p className="text-[#475569] text-[10px] font-semibold uppercase tracking-wider mb-2">Selfie <span className="text-[#334155] normal-case font-normal">(optional)</span></p>
                    <DropZone file={selfieFile} onFile={setSelfieFile} uploading={false} label="Upload a selfie holding your document" />
                  </div>

                  {error && <p className="text-red-400 text-xs mb-4 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

                  <div className="max-sm:flex-col-reverse flex sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button onClick={() => { setStep(2); setError(''); }}
                      className="flex items-center justify-center gap-1.5 text-[#475569] hover:text-white text-sm transition-colors py-2.5">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <div className="max-sm:flex-col flex sm:flex-row items-stretch sm:items-center gap-2">
                      {!selfieFile && (
                        <button onClick={() => handleSubmit(true)} disabled={submitting}
                          className="max-sm:w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#1a2744] text-[#64748b] hover:text-white hover:border-[#2a3a5a] text-sm rounded-xl transition-colors disabled:opacity-40">
                          <SkipForward size={14} /> Skip
                        </button>
                      )}
                      <button onClick={() => handleSubmit(false)} disabled={submitting}
                        className="max-sm:w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                        {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : 'Submit for Review'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
