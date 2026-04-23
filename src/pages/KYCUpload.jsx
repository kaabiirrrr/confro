import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, User, ChevronDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadKYC } from '../services/apiService';
import { toast } from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'AADHAAR',  label: 'Aadhaar Card' },
  { value: 'PAN',      label: 'PAN Card' },
  { value: 'PASSPORT', label: 'Passport' },
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

function DropZone({ label, icon: Icon, file, onFile, onClear, error }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);

  const validate = (f) => {
    if (!ALLOWED.includes(f.type)) { toast.error('Only JPG, PNG or PDF allowed'); return false; }
    if (f.size > MAX_SIZE) { toast.error('File must be under 5MB'); return false; }
    return true;
  };

  const handle = (f) => { if (f && validate(f)) onFile(f); };

  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

  return (
    <div>
      <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">{label}</p>
      {file ? (
        <div className="relative rounded-xl border border-[#1a2744] bg-[#0d1526] overflow-hidden">
          {preview ? (
            <img src={preview} alt={label} className="w-full h-40 object-cover" />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <FileText size={32} className="text-[#3b82f6]" />
              <p className="text-[#94a3b8] text-sm truncate max-w-[200px]">{file.name}</p>
            </div>
          )}
          <button onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition">
            <X size={14} />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-[#4ade80]">
            <CheckCircle2 size={10} /> {(file.size / 1024).toFixed(0)}KB
          </div>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
            ${error ? 'border-red-500/50 bg-red-500/5' : drag ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-[#1a2744] bg-[#0d1526] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5'}`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
            <Icon size={20} className="text-[#3b82f6]" />
          </div>
          <div className="text-center">
            <p className="text-[#94a3b8] text-sm">Click or drag & drop</p>
            <p className="text-[#475569] text-xs mt-0.5">JPG, PNG, PDF · Max 5MB</p>
          </div>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
        onChange={e => handle(e.target.files?.[0])} />
    </div>
  );
}

export default function KYCUpload() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [docOpen, setDocOpen] = useState(false);

  const validate = () => {
    const e = {};
    if (!docType) e.docType = 'Select a document type';
    if (!docFile) e.docFile = 'Document image is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await uploadKYC({ documentType: docType, documentFile: docFile, selfieFile });
      toast.success('KYC submitted! Processing your documents…');
      navigate('/kyc/status');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoc = DOC_TYPES.find(d => d.value === docType);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
        className="w-full max-w-[520px]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f] border border-[#1a2744] flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[#3b82f6]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">KYC Verification</h1>
          <p className="text-[#64748b] text-sm">Upload your identity documents to get verified</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0d1526] border border-[#1a2744] rounded-2xl p-7 space-y-6">

          {/* Document type dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Document Type</label>
            <div className="relative">
              <button type="button" onClick={() => setDocOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors
                  ${errors.docType ? 'border-red-500/50' : 'border-[#1a2744] hover:border-[#3b82f6]/50'} bg-[#0a0f1e] text-left`}>
                <span className={selectedDoc ? 'text-white' : 'text-[#475569]'}>
                  {selectedDoc ? selectedDoc.label : 'Select document type'}
                </span>
                <ChevronDown size={16} className={`text-[#475569] transition-transform ${docOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {docOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-20 top-full mt-1 w-full bg-[#0d1526] border border-[#1a2744] rounded-xl overflow-hidden shadow-xl">
                    {DOC_TYPES.map(d => (
                      <button key={d.value} type="button"
                        onClick={() => { setDocType(d.value); setDocOpen(false); setErrors(p => ({ ...p, docType: undefined })); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[#1e3a5f]/40
                          ${docType === d.value ? 'text-[#3b82f6] bg-[#1e3a5f]/20' : 'text-[#94a3b8]'}`}>
                        {d.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.docType && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.docType}</p>}
          </div>

          {/* Document upload */}
          <DropZone label="Document Image" icon={FileText}
            file={docFile} onFile={f => { setDocFile(f); setErrors(p => ({ ...p, docFile: undefined })); }}
            onClear={() => setDocFile(null)} error={errors.docFile} />

          {/* Selfie upload */}
          <DropZone label="Selfie (optional)" icon={User}
            file={selfieFile} onFile={setSelfieFile} onClear={() => setSelfieFile(null)} />

          {/* Info */}
          <div className="flex items-start gap-3 px-4 py-3 bg-[#1e3a5f]/20 border border-[#1a2744] rounded-xl">
            <AlertCircle size={15} className="text-[#3b82f6] shrink-0 mt-0.5" />
            <p className="text-[#64748b] text-xs leading-relaxed">
              Ensure your document is clearly visible, well-lit, and all text is readable. OCR will extract your details automatically.
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Processing OCR…</> : 'Submit for Verification'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
