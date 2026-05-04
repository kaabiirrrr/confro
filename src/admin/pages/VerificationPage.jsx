import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Clock, Check, X, AlertCircle, RefreshCw, ShieldCheck,
    ExternalLink, CheckCircle, XCircle, Search, User, Eye, FileText
} from 'lucide-react';
import { adminReviewIdentity } from '../../services/apiService';
import { fetchVerificationRequests } from '../../services/adminService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';

const VerificationPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [actioning, setActioning] = useState(false);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await fetchVerificationRequests({ status: statusFilter });
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, reason = '') => {
        setActioning(true);
        try {
            await adminReviewIdentity(id, action, reason);
            toast.success(`Verification ${action === 'approve' ? 'approved' : 'rejected'}`);
            setIsModalOpen(false);
            setShowRejectInput(false);
            setRejectionReason('');
            loadRequests();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActioning(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const name = (req.profile?.name || '').toLowerCase();
        const email = (req.user?.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        // Check all possible locations the role might be stored
        const role = (
            req.profile?.role ||
            req.user?.role ||
            req.role ||
            ''
        ).toUpperCase();
        const matchesSearch = name.includes(search) || email.includes(search);
        const matchesRole = roleFilter === 'ALL' || role === roleFilter || (roleFilter === 'FREELANCER' && !role);
        return matchesSearch && matchesRole;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
            REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
            RE_UPLOAD_REQUESTED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <img src="/Icons/icons8-verification-100.png" alt="Verification" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            Identity Verification
                        </h1>
                        <p className="text-white/40 text-xs mt-1">Review and approve identity documents for freelancers and clients</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-accent transition-all"
                            />
                        </div>
                        <button
                            onClick={loadRequests}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-white/60 transition group flex-shrink-0 border border-white/10"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                </div>
                {/* Status tabs */}
                <div className="flex items-center overflow-x-auto no-scrollbar">
                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`relative px-3 sm:px-4 pb-3 pt-1 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${statusFilter === status ? 'text-accent' : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                            {statusFilter === status && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Role filter pills */}
                <div className="flex items-center gap-2">
                    {[['ALL', 'All Users'], ['FREELANCER', 'Freelancers'], ['CLIENT', 'Clients']].map(([val, label]) => (
                        <button key={val} onClick={() => setRoleFilter(val)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${roleFilter === val
                                    ? 'bg-accent/10 text-accent border-accent/30'
                                    : 'border-white/10 text-white/30 hover:text-white/60'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Docs</th>
                                <th className="px-6 py-4 font-medium">Submitted</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} text="Loading requests..."/>
                                </td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-16 text-center text-white/40">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldCheck size={32} className="opacity-20" />
                                        <p>No results found matching your search</p>
                                    </div>
                                </td></tr>
                            ) : filteredRequests.map((req) => {
                                const name = req.profile?.name || req.user?.email || 'Unknown User';
                                const avatar = req.profile?.avatar_url;
                                const docCount = [
                                    req.document_front_url,
                                    req.document_back_url,
                                    req.selfie_url
                                ].filter(Boolean).length;

                                return (
                                    <tr key={req.user_id || req.id} className="hover:bg-white/[0.02] transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {avatar ? (
                                                    <img
                                                        src={avatar}
                                                        alt={name}
                                                        className="w-10 h-10 rounded-full object-cover bg-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold uppercase">
                                                        {name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{name}</span>
                                                    {(req.user?.email && req.user.email !== name) && (
                                                        <span className="text-white/40 text-xs">{req.user.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const role = (
                                                    req.profile?.role ||
                                                    req.user?.role ||
                                                    req.role ||
                                                    'FREELANCER'
                                                ).toUpperCase();
                                                const isClient = role === 'CLIENT';
                                                return (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isClient
                                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        }`}>
                                                        {isClient ? 'Client' : 'Freelancer'}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status || req.verification_status || 'PENDING'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/60 text-sm">
                                                {docCount > 0 ? `${docCount} file${docCount !== 1 ? 's' : ''}` : 'No Files'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/60 text-sm">
                                            {new Date(req.submitted_at || req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition text-sm font-medium"
                                            >
                                                <Eye size={14} /> Review
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal — rendered via portal to escape layout stacking context */}
            {isModalOpen && selectedRequest && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)' }}>
                    <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between" style={{ background: '#0d1117' }}>
                            <div className="flex items-start gap-4">
                                {selectedRequest.profile?.avatar_url && (
                                    <img src={selectedRequest.profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        Reviewing: {selectedRequest.profile?.name || selectedRequest.user?.email || 'Unknown User'}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-white/60">
                                        <p>Document: <span className="text-white/80">{selectedRequest.document_type?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}</span></p>
                                        <p>Submitted: <span className="text-white/80">{new Date(selectedRequest.submitted_at || selectedRequest.created_at).toLocaleDateString()}</span></p>
                                        {(() => {
                                            const role = (selectedRequest.profile?.role || selectedRequest.user?.role || selectedRequest.role || 'FREELANCER').toUpperCase();
                                            const isClient = role === 'CLIENT';
                                            return (
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isClient ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                                    {isClient ? 'Client' : 'Freelancer'}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ background: '#0d1117' }}>

                            {/* OCR Extracted Data */}
                            {(() => {
                                const ocr = selectedRequest.extracted_data || selectedRequest.ocr_data || selectedRequest.ocr || {};
                                const name = ocr.name || ocr.full_name;
                                const dob = ocr.dob || ocr.date_of_birth;
                                const docNum = ocr.document_number || ocr.doc_number || ocr.id_number;
                                const addr = ocr.address;
                                const hasOCR = name || dob || docNum;
                                if (!hasOCR) return null;
                                return (
                                    <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-4">
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">OCR Extracted Data</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {name && <div><p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Name</p><p className="text-white text-sm font-medium">{name}</p></div>}
                                            {dob && <div><p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Date of Birth</p><p className="text-white text-sm font-medium">{dob}</p></div>}
                                            {docNum && <div><p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Doc Number</p><p className="text-white text-sm font-mono">{'****' + String(docNum).slice(-4)}</p></div>}
                                            {addr && <div><p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Address</p><p className="text-white text-xs leading-relaxed">{addr}</p></div>}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Document images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { url: selectedRequest.document_front_url, title: "Front of Document" },
                                    { url: selectedRequest.document_back_url, title: "Back of Document" },
                                    { url: selectedRequest.selfie_url, title: "Selfie with Document" }
                                ].filter(d => Boolean(d.url)).map((doc, idx) => (
                                    <div key={idx} className="rounded-xl border border-white/10 overflow-hidden group" style={{ background: '#0a0f1e' }}>
                                        <div className="p-3 bg-white/[0.02] border-b border-white/10">
                                            <span className="text-sm font-medium text-white/80">{doc.title}</span>
                                        </div>
                                        <div className="aspect-video bg-black/40 flex items-center justify-center text-white/20">
                                            {doc.url.toLowerCase().endsWith('.pdf') ? (
                                                <div className="flex flex-col items-center gap-2 text-center p-4">
                                                    <FileText size={48} />
                                                    <span className="text-sm font-medium text-white/60">PDF Document</span>
                                                </div>
                                            ) : (
                                                <img src={doc.url} alt={doc.title} className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-end">
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline">View Full Screen</a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="text-blue-500 shrink-0" />
                                <div className="text-sm text-blue-500/80">
                                    Please ensure all documents clearly show the user's name and match the profile information provided during registration.
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between" style={{ background: '#0d1117' }}>
                            <div className="flex flex-col gap-2 flex-1 mr-4">
                                {showRejectInput && (
                                    <div className="flex gap-2">
                                        <input
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            placeholder="Reason for rejection..."
                                            className="flex-1 bg-white/5 border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                                        />
                                        <button
                                            onClick={() => handleAction(selectedRequest.id, 'reject', rejectionReason)}
                                            disabled={actioning || !rejectionReason.trim()}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition"
                                        >
                                            Confirm Reject
                                        </button>
                                        <button onClick={() => setShowRejectInput(false)} className="px-3 py-2 text-white/40 hover:text-white text-sm transition">
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                {!showRejectInput && (
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition text-sm font-bold self-start"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleAction(selectedRequest.id, 'approve')}
                                disabled={actioning}
                                className="px-6 py-2 bg-accent text-white hover:bg-accent/90 rounded-xl transition text-sm font-bold shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle size={18} /> Approve {selectedRequest?.profile?.role === 'CLIENT' ? 'Client' : 'Freelancer'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default VerificationPage;
