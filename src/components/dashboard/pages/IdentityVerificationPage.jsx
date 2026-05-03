import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, BadgeCheck, Upload, CheckCircle2, Clock,
  XCircle, AlertCircle, ArrowLeft, ArrowRight, Eye, RefreshCw, FileText
} from 'lucide-react';
import { getMyDualVerification, uploadIdentityDocument, submitDualVerification, extractVerificationData } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import { useAuth } from '../../../context/AuthContext';

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card', hasBack: true },
  { value: 'pan', label: 'PAN Card', hasBack: false },
  { value: 'dl', label: "Driver's License", hasBack: true },
];

const BENEFITS = [
  { icon: '🏅', title: 'IDV Badge', desc: 'Display a verified badge on your profile' },
  { icon: '🔍', title: 'Higher Visibility', desc: 'Appear higher in search results' },
  { icon: '🤝', title: 'More Trust', desc: 'Clients prefer verified users' },
  { icon: '💼', title: 'More Contracts', desc: 'Verified accounts get 3x more contracts' },
];

// ── Upload Drop Zone ──────────────────────────────────────────
function UploadZone({ label, url, onUpload, uploading }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    await onUpload(file);
  };

  return (
    <div>
      <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">{label}</p>
      <div
        onClick={() => !url && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative rounded-xl border-2 border-dashed transition cursor-pointer overflow-hidden
          ${url ? 'border-green-500/30 bg-green-500/5' : dragging ? 'border-accent/60 bg-accent/5' : 'border-white/10 bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04]'}`}
        style={{ minHeight: '140px' }}
      >
        {url ? (
          <>
            <img src={url} alt={label} className="w-full h-full object-cover" style={{ maxHeight: '180px' }} />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition">
                <Upload size={16} className="text-white" />
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition">
                <Eye size={16} className="text-white" />
              </a>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            {uploading
              ? <InfinityLoader size={20} />
              : <><Upload size={24} className="text-white/20" /><p className="text-white/30 text-xs">Click or drag & drop</p></>
            }
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />
      <p className="text-white/20 text-[10px] mt-1.5 flex items-center gap-1">
        <span>⚠</span> Max 1MB · JPG, PNG, WebP
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function IdentityVerificationPage() {
  const { role } = useAuth();
  const userType = role?.toLowerCase() === 'client' ? 'client' : 'freelancer';
  
  const [idvStatus, setIdvStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=status, 2=doc type, 3=upload, 4=extracting, 5=review
  
  const [docType, setDocType] = useState('');
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [extractedData, setExtractedData] = useState({
      name: '',
      dob: '',
      gender: '',
      idNumber: ''
  });

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getMyDualVerification();
      // res returns { status: '...', data: { ... } }
      setIdvStatus(res);
    } catch { setIdvStatus(null); }
    finally { setLoading(false); }
  };

  const handleUpload = async (field, file) => {
    // Client-side 1MB check
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File size must be under 1MB. Please compress or resize the image.');
      return;
    }
    setUploading(field);
    try {
      const res = await uploadIdentityDocument(file);
      const url = res?.data?.url ?? res?.url;
      if (!url) throw new Error('No URL returned');
      if (field === 'front') setFrontUrl(url);
      else if (field === 'back') setBackUrl(url);
      toast.success('Uploaded');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(null);
    }
  };

  const handleExtract = async () => {
      setStep(4); // Extracting state
      try {
          // Send frontURL to backend OCR service
          const res = await extractVerificationData(frontUrl, docType);
          const data = res?.data || {};
          
          setExtractedData({
              name: data.name || '',
              dob: data.dob || '',
              gender: data.gender || '',
              idNumber: data.idNumber || ''
          });
          
          toast.success('Data extracted successfully');
          setStep(5); // Move to review state
      } catch (err) {
          toastApiError(err, 'Failed to extract document data');
          // Still go to step 5 so user can manually enter it if OCR completely failed
          setStep(5);
      }
  };

  const handleSubmit = async () => {
    if (!extractedData.name || !extractedData.idNumber) {
        return toast.error('Name and Document Number are required fields.');
    }
      
    setSubmitting(true);
    try {
      await submitDualVerification({
        userType,
        documentType: docType,
        documentUrl: frontUrl,
        extractedName: extractedData.name,
        extractedDob: extractedData.dob,
        extractedGender: extractedData.gender,
        aadhaarNumber: docType === 'aadhaar' ? extractedData.idNumber : null,
        panNumber: docType === 'pan' ? extractedData.idNumber : null,
        dlNumber: docType === 'dl' ? extractedData.idNumber : null
      });
      toast.success('Verification submitted! We\'ll review within 24–48 hours.');
      await fetchStatus();
      setStep(1);
    } catch (err) {
      toastApiError(err, 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const vstatus = (idvStatus?.status || 'not_started').toUpperCase();
  const verificationInfo = idvStatus?.data || {};
  const selectedDoc = DOC_TYPES.find(d => d.value === docType);

  if (loading) return (
    <div className="w-full mx-auto flex items-center justify-center py-32">
      <InfinityLoader size={20} />
    </div>
  );

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-4 sm:space-y-6 pb-20 px-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <button 
            onClick={() => setStep(step === 5 ? 3 : step - 1)} 
            className="p-1.5 rounded-full bg-white/[0.02] hover:bg-white/5 text-white/50 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className={userType === 'client' ? 'text-accent' : 'text-blue-400'} />
            Identity Verification
          </h1>
          <p className="text-white/40 text-[11px] sm:text-[13px] mt-0.5 font-medium tracking-tight">Verify your identity to get the IDV badge and increase trust</p>
        </div>
      </div>

      {/* ── STEP 1: STATUS ── */}
      {step === 1 && (
        <>
          {/* NOT_STARTER */}
          {(vstatus === 'NOT_STARTED') && (
            <div className="space-y-6">
              <div className="border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-sm bg-white/[0.01]">
                <div className={`w-16 h-16 flex items-center justify-center mx-auto mb-5`}>
                  <ShieldCheck size={32} className="text-accent" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Get Your IDV Badge</h2>
                <p className="text-white/50 text-[13px] mb-6 max-w-sm mx-auto leading-relaxed">
                  Verify your identity to stand out from the crowd. Verified accounts earn more trust and get hired faster.
                </p>
                <button onClick={() => setStep(2)}
                  className={`flex items-center gap-2 px-6 h-10 bg-accent hover:bg-accent/80 text-white rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition mx-auto shadow-lg`}>
                  Start Verification <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BENEFITS.map(b => (
                  <div key={b.title} className="rounded-xl p-4 text-center bg-white/[0.01]">
                    <div className="text-xl mb-2">{b.icon}</div>
                    <p className="text-white font-semibold text-[13px] mb-0.5">{b.title}</p>
                    <p className="text-white/40 text-[11px] leading-tight">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PENDING */}
          {(vstatus === 'PENDING') && (
            <div className="border border-yellow-500/10 rounded-[2rem] p-10 text-center bg-yellow-500/[0.01]">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
                <Clock size={32} className="text-yellow-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Under Review</h2>
              <p className="text-white/50 text-[13px] mb-3 max-w-sm mx-auto leading-relaxed">
                Your documents have been submitted and are being reviewed. This usually takes 24–48 hours.
              </p>
              {verificationInfo.created_at && (
                <p className="text-white/30 text-[11px]">
                  Submitted {new Date(verificationInfo.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* APPROVED */}
          {(vstatus === 'APPROVED') && (
            <div className="border border-green-500/10 rounded-[2rem] p-10 text-center bg-green-500/[0.01]">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
                <BadgeCheck size={32} className="text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Identity Verified ✓</h2>
              <p className="text-white/50 text-[13px] max-w-sm mx-auto leading-relaxed">
                Your identity has been verified. Your IDV badge is now visible on your profile.
              </p>
            </div>
          )}

          {/* REJECTED */}
          {vstatus === 'REJECTED' && (
            <div className="border border-red-500/10 rounded-[2rem] p-10 text-center bg-red-500/[0.01]">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
                <XCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-2">Verification Rejected</h2>
               <button onClick={() => { setFrontUrl(''); setBackUrl(''); setDocType(''); setStep(2); }}
                className="flex items-center gap-2 px-5 h-10 mt-4 bg-red-500/10 text-red-400 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition mx-auto shadow-lg shadow-red-500/5">
                <RefreshCw size={13} /> Resubmit Documents
              </button>
            </div>
          )}
        </>
      )}

      {/* ── STEP 2: SELECT DOC TYPE ── */}
      {step === 2 && (
        <div className="border border-white/10 rounded-[2rem] p-6 space-y-5 bg-white/[0.01]">
          <div>
            <h2 className="text-white font-semibold text-base">Select Document Type</h2>
            <p className="text-white/40 text-[13px] mt-0.5">Choose the type of government-issued ID you'll be uploading</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DOC_TYPES.map(d => (
              <button key={d.value} type="button" onClick={() => setDocType(d.value)}
                className={`p-4 rounded-xl text-left transition ${docType === d.value ? (userType === 'client' ? 'bg-accent/10 border border-accent/30' : 'bg-blue-500/10 border border-blue-500/30') : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'}`}>
                <p className={`font-semibold text-sm ${docType === d.value ? (userType === 'client' ? 'text-accent' : 'text-blue-400') : 'text-white'}`}>{d.label}</p>
                <p className="text-white/30 text-[11px] mt-0.5">{d.hasBack ? 'Front + Back required' : 'Single page'}</p>
              </button>
            ))}
          </div>
          <button 
            onClick={() => docType ? setStep(3) : toast.error('Select a document type')}
            className={`flex items-center gap-2 px-6 h-10 bg-accent hover:bg-accent/80 text-white rounded-full text-[11px] font-bold uppercase tracking-widest transition shadow-lg mt-2`}
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── STEP 3: UPLOAD ── */}
      {step === 3 && (
        <div className="border border-white/10 rounded-[2rem] p-6 space-y-6 bg-white/[0.01]">
          <div>
            <h2 className="text-white font-semibold text-base">Upload Documents</h2>
            <p className="text-white/40 text-[13px] mt-0.5">Make sure images are clear, well-lit, and all text is readable</p>
          </div>

          <div className={`grid gap-4 ${selectedDoc?.hasBack ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
            <UploadZone label="Front of Document" url={frontUrl}
              uploading={uploading === 'front'} onUpload={f => handleUpload('front', f)} />
            {selectedDoc?.hasBack && (
              <UploadZone label="Back of Document" url={backUrl}
                uploading={uploading === 'back'} onUpload={f => handleUpload('back', f)} />
            )}
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-400/80 text-[11px] leading-relaxed">
              Ensure your full name, date of birth, and document number are clearly visible. Blurry or cropped images will be rejected.
            </p>
          </div>

          <button onClick={handleExtract}
            disabled={!frontUrl || (selectedDoc?.hasBack && !backUrl)}
            className={`flex items-center gap-2 px-6 h-10 bg-accent hover:bg-accent/80 text-white rounded-full text-[11px] font-bold uppercase tracking-widest transition disabled:opacity-40 shadow-lg`}>
            Extract Data <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── STEP 4: EXTRACTING ── */}
      {step === 4 && (
        <div className="border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.01]">
            <InfinityLoader size={48} className="mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Document</h2>
            <p className="text-white/50 text-sm">Our AI is extracting data from your document using OCR...</p>
        </div>
      )}

      {/* ── STEP 5: REVIEW / EDITABLE ── */}
      {step === 5 && (
        <div className="border border-white/10 rounded-[2rem] p-6 bg-white/[0.01]">
          <div className="mb-6">
            <h2 className="text-white font-bold text-xl">Review & Confirm Details</h2>
            <p className="text-white/50 text-sm mt-1">Please verify the extracted information. If any details are incorrect, you can edit them directly before submitting.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Side */}
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input 
                          type="text" 
                          value={extractedData.name} 
                          onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-accent transition"
                          placeholder="e.g. John Doe"
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Date of Birth</label>
                          <input 
                              type="text" 
                              value={extractedData.dob} 
                              onChange={(e) => setExtractedData({...extractedData, dob: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-accent transition"
                              placeholder="DD/MM/YYYY"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Gender</label>
                          <select 
                              value={extractedData.gender} 
                              onChange={(e) => setExtractedData({...extractedData, gender: e.target.value})}
                              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-accent transition appearance-none"
                          >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {selectedDoc?.label} Number
                      </label>
                      <input 
                          type="text" 
                          value={extractedData.idNumber} 
                          onChange={(e) => setExtractedData({...extractedData, idNumber: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-accent transition"
                          placeholder={`Enter ${selectedDoc?.label} number`}
                      />
                  </div>
              </div>

              {/* Preview Side */}
              <div>
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Document Preview</h3>
                  <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative group">
                        <img src={frontUrl} alt="Document Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <a href={frontUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium text-sm flex items-center gap-2">
                                <Eye size={16} /> View Full
                            </a>
                        </div>
                  </div>
              </div>
          </div>

          <div className="mt-8 flex justify-end">
              <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/80 text-white rounded-full text-sm font-bold uppercase tracking-widest transition shadow-xl disabled:opacity-50`}
              >
                  {submitting && <InfinityLoader size={16} />}
                  Confirm & Submit
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
