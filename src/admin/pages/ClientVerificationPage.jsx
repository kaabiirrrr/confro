import { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, X, Search, Eye, FileText } from 'lucide-react';
import { getAdminVerifications, approveVerification, rejectVerification } from '../../services/apiService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';

const ClientVerificationPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actioning, setActioning] = useState(false);
    const [statusFilter, setStatusFilter] = useState('PENDING'); // ALL, PENDING, APPROVED, REJECTED
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        loadRequests();
    }, [statusFilter]); // Reload when filter changes

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await getAdminVerifications('client', statusFilter === 'ALL' ? 'ALL' : statusFilter);
            setRequests(response.data || []);
        } catch (error) {
            toast.error('Failed to load client verification requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActioning(true);
        try {
            if (action === 'approve') {
                await approveVerification(id);
                toast.success('Verification approved');
            } else {
                await rejectVerification(id);
                toast.success('Verification rejected');
            }
            setIsModalOpen(false);
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
        return name.includes(search) || email.includes(search);
    });

    const StatusBadge = ({ status }) => {
        const s = (status || 'PENDING').toLowerCase();
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            approved: 'bg-green-500/10 text-green-500 border-green-500/20',
            rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[s] || styles.pending} uppercase`}>
                {status}
            </span>
        );
    };

    const maskNumber = (num, type) => {
        if (!num) return 'N/A';
        if (type === 'aadhaar') return 'XXXX-XXXX-' + num.slice(-4);
        if (type === 'pan') return num.slice(0, 2) + 'XXXX' + num.slice(-2);
        return num.slice(0, 4) + 'XXXX'; // DL
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="text-accent" size={28} />
                            Client Verification Requests
                        </h1>
                        <p className="text-white/60 text-xs sm:text-sm mt-1">Review OCR-extracted data and approve client identity documents</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-accent transition-all"
                            />
                        </div>
                        <button onClick={loadRequests} className="p-2 hover:bg-white/5 rounded-lg text-white/60 transition group flex-shrink-0">
                            <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto no-scrollbar pt-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`relative pb-4 px-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                                statusFilter === status
                                    ? 'text-accent'
                                    : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            {status}
                            {statusFilter === status && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_rgba(75,181,229,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto admin-table-wrap">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Client</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Doc Type</th>
                            <th className="px-6 py-4 font-medium">Submitted</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                <InfinityLoader fullScreen={false} size="md" text="Loading requests..." />
                            </td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-16 text-center text-white/40">
                                <div className="flex flex-col items-center gap-2">
                                    <ShieldCheck size={32} className="opacity-20" />
                                    <p>No client verifications found.</p>
                                </div>
                            </td></tr>
                        ) : filteredRequests.map((req) => {
                            const name = req.profile?.name || req.user?.email || 'Unknown User';
                            const avatar = req.profile?.avatar_url;

                            return (
                                <tr key={req.id} className="hover:bg-white/[0.02] transition">
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
                                                <span className="text-white/40 text-xs">{req.user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white/80 text-sm font-medium uppercase">
                                            {req.document_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/60 text-sm">
                                        {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-accent rounded-lg transition text-sm font-medium border-none cursor-pointer"
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

            {/* Review Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-primary border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="px-6 py-4 flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                {selectedRequest.profile?.avatar_url && (
                                    <img src={selectedRequest.profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        Review Client: {selectedRequest.profile?.name || selectedRequest.user?.email}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase">
                                        <span>Document: {selectedRequest.document_type}</span>
                                        <span>•</span>
                                        <span>Status: <StatusBadge status={selectedRequest.status} /></span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-accent transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Document Preview */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Document Preview</h3>
                                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                    <div className="aspect-[4/3] bg-black/40 flex items-center justify-center">
                                        {(selectedRequest.document_front_url || '').toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center gap-2 text-white/60">
                                                <FileText size={48} />
                                                <span>PDF Document</span>
                                            </div>
                                        ) : (
                                            <img src={selectedRequest.document_front_url} alt="Document" className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                    <div className="p-3 bg-white/[0.02] flex justify-end">
                                        <a href={selectedRequest.document_front_url} target="_blank" rel="noreferrer" className="text-accent text-sm hover:underline">
                                            Open Full Screen
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Extracted Data */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Extracted Data (OCR)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Extracted Name</p>
                                        <p className="text-white font-medium">{selectedRequest.extracted_name || 'N/A'}</p>
                                        {selectedRequest.profile?.name && selectedRequest.profile.name !== selectedRequest.extracted_name && (
                                            <p className="text-xs text-yellow-500 mt-1">Profile name: {selectedRequest.profile.name}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Date of Birth</p>
                                            <p className="text-white font-medium">{selectedRequest.extracted_dob || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Gender</p>
                                            <p className="text-white font-medium">{selectedRequest.extracted_gender || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Document Number</p>
                                        <p className="text-white font-medium font-mono text-lg bg-white/5 p-2 rounded-lg inline-block border border-white/10">
                                            {selectedRequest.document_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(selectedRequest.status || '').toLowerCase() === 'pending' && (
                            <div className="px-6 py-4 bg-white/[0.02] flex items-center justify-end gap-3">
                                <button
                                    onClick={() => handleAction(selectedRequest.id, 'reject')}
                                    disabled={actioning}
                                    className="px-6 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition font-bold disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(selectedRequest.id, 'approve')}
                                    disabled={actioning}
                                    className="px-10 py-2.5 bg-accent text-white hover:bg-accent/90 rounded-full transition font-bold shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientVerificationPage;
