import React, { useState, useEffect } from 'react';
import { Search, Eye, XCircle, AlertTriangle, X, IndianRupee, Calendar, Clock, User, Mail, Briefcase, FileText } from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import Button from '../../components/ui/Button';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import RelationshipIntelligence from '../../components/profile/RelationshipIntelligence';
import { useAuth } from '../../context/AuthContext';

const ContractsPage = () => {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);

    useEffect(() => {
        if (!selectedContract) {
            setShowRequirements(false);
        }
    }, [selectedContract]);

    useEffect(() => {
        fetchContracts();
    }, [statusFilter]);

    const fetchContracts = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchContracts({ status: statusFilter });
            if (result.success) {
                setContracts(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch contracts', err);
            toast.error('Failed to load contracts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (contractId) => {
        const reason = window.prompt('Please enter a reason for cancellation:');
        if (reason === null) return;

        setIsCancelling(true);
        try {
            const result = await adminService.cancelContract(contractId, reason);
            if (result.success) {
                toast.success('Contract cancelled successfully');
                fetchContracts();
            }
        } catch (err) {
            console.error('Failed to cancel contract', err);
            toast.error('Failed to cancel contract');
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredContracts = contracts.filter(c =>
        (c.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.client?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.freelancer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.client?.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.freelancer?.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const Modal = ({ isOpen, onClose, title, children, icon }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm pt-8 sm:pt-12 overflow-y-auto no-scrollbar">
                <div className="bg-primary border border-white/10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl flex flex-col my-auto sm:my-0">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {icon && <img src={icon} alt="" className="w-5 h-5 object-contain" />}
                            {title}
                        </h3>
                        <button onClick={onClose} className="p-2 text-white/40 hover:text-accent transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 pt-0 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-contract-60.png" alt="Contracts" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Active Contracts
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Monitor and manage all ongoing agreements between clients and freelancers</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                        />
                    </div>
                    <CustomDropdown
                        options={[
                            { label: 'All Statuses', value: '' },
                            { label: 'Active', value: 'ACTIVE' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Cancelled', value: 'CANCELLED' },
                            { label: 'Disputed', value: 'DISPUTED' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        variant="transparent"
                        className="w-full sm:w-44"
                    />
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="border-b border-white/10 text-white/90">
                            <tr>
                                <th className="px-6 py-4 font-medium">Job</th>
                                <th className="px-6 py-4 font-medium">Client</th>
                                <th className="px-6 py-4 font-medium">Freelancer</th>
                                <th className="px-6 py-4 font-medium">Agreed Rate</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40 font-medium">
                                    <InfinityLoader fullScreen={false} size="md" text="Loading contracts..." />
                                </td></tr>
                            ) : filteredContracts.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">No contracts found.</td></tr>
                            ) : (
                                filteredContracts.map(contract => (
                                    <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium truncate block max-w-xs">{contract.job?.title || 'Deleted'}</span>
                                            <span className="text-white/40 text-[10px] break-all">{contract.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-sm shadow-black/20">
                                                    {contract.client?.profiles?.avatar_url ? (
                                                        <img src={contract.client.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-accent font-bold">
                                                            {(contract.client?.profiles?.name || contract.client?.name || 'C').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-medium text-xs">{contract.client?.profiles?.name || contract.client?.name || 'Client'}</span>
                                                    <div className="text-white/40 text-[10px]">{contract.client?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-sm shadow-black/20">
                                                    {contract.freelancer?.profiles?.avatar_url ? (
                                                        <img src={contract.freelancer.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-accent font-bold">
                                                            {(contract.freelancer?.profiles?.name || contract.freelancer?.name || 'F').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-medium text-xs">{contract.freelancer?.profiles?.name || contract.freelancer?.name || 'Freelancer'}</span>
                                                    <div className="text-white/40 text-[10px]">{contract.freelancer?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-accent">{formatINR(contract.agreed_rate)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${contract.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                                contract.status === 'DISPUTED' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-white/10 text-white/60'
                                                }`}>
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedContract(contract)}
                                                    className="p-1.5 text-white/40 hover:text-accent transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {contract.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleCancel(contract.id)}
                                                        disabled={isCancelling}
                                                        className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                                                        title="Cancel Contract"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                                {contract.status === 'DISPUTED' && (
                                                    <button
                                                        onClick={() => {/* Link to disputes page or handle */ }}
                                                        className="p-1.5 text-yellow-400/60 hover:text-yellow-400 transition-colors"
                                                        title="View Dispute"
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contract Details Modal */}
            <Modal
                isOpen={!!selectedContract}
                onClose={() => setSelectedContract(null)}
                title="Contract Details"
                icon="/Icons/icons8-contract-60.png"
            >
                {selectedContract && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Contract ID</h4>
                                <p className="text-xs font-mono text-white/60">{selectedContract.id}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Status</h4>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedContract.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                    selectedContract.status === 'DISPUTED' ? 'bg-red-500/10 text-red-400' :
                                        'bg-white/10 text-white/60'
                                    }`}>
                                    {selectedContract.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Project Title</h4>
                            <p className="text-base sm:text-xl font-bold text-white leading-tight">{selectedContract.job?.title || 'Deleted Job'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="py-4">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Agreed Rate</p>
                                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-base">
                                    <span className="text-accent text-lg sm:text-xl font-black">{formatINR(selectedContract.agreed_rate)}</span>
                                </div>
                            </div>
                            <div className="py-4">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Agreement Date</p>
                                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-base">
                                    <Calendar size={14} className="text-accent" />
                                    <span className="text-sm">{new Date(selectedContract.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Client</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center text-accent border border-white/10 shrink-0">
                                        {selectedContract.client?.profiles?.avatar_url ? (
                                            <img
                                                src={selectedContract.client.profiles.avatar_url}
                                                alt={selectedContract.client?.profiles?.name || 'Client'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate">
                                            {selectedContract.client?.profiles?.name || selectedContract.client?.name || 'Client'}
                                        </p>
                                        <p className="text-white/40 text-[10px] truncate mt-0.5">{selectedContract.client?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Freelancer</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center text-accent border border-white/10 shrink-0">
                                        {selectedContract.freelancer?.profiles?.avatar_url ? (
                                            <img
                                                src={selectedContract.freelancer.profiles.avatar_url}
                                                alt={selectedContract.freelancer?.profiles?.name || 'Freelancer'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate">
                                            {selectedContract.freelancer?.profiles?.name || selectedContract.freelancer?.name || 'Freelancer'}
                                        </p>
                                        <p className="text-white/40 text-[10px] truncate mt-0.5">{selectedContract.freelancer?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Relationship Intelligence View (Trust Graph v2) */}
                        <div className="pt-6">
                            <RelationshipIntelligence 
                                freelancerId={selectedContract.freelancer_id}
                                clientId={selectedContract.client_id}
                                userRole={user?.role || 'ADMIN'}
                            />
                        </div>

                        <div className="bg-transparent rounded-2xl transition-all duration-300 overflow-hidden hover:bg-white/[0.02]">
                            <div className="p-4 cursor-pointer group" onClick={() => setShowRequirements(!showRequirements)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src="/Icons/icons8-bag-100.png" alt="Job" className="w-8 h-8 object-contain" />
                                        <div>
                                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Related Job Post</p>
                                            <p className="text-white font-medium text-sm">
                                                {showRequirements ? 'Hide requirements' : 'View full requirements'}
                                            </p>
                                        </div>
                                    </div>
                                    {showRequirements ?
                                        <X size={18} className="text-white/20 hover:text-white transition-colors" /> :
                                        <FileText size={18} className="text-white/20 group-hover:text-accent transition-colors" />
                                    }
                                </div>
                            </div>

                            {showRequirements && (
                                <div className="px-5 pb-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Category</p>
                                            <p className="text-white text-sm font-medium">{selectedContract.job?.category || 'General'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Original Budget</p>
                                            <p className="text-white text-sm font-medium">
                                                {formatINR(selectedContract.job?.budget_amount || selectedContract.job?.budget || 0)}
                                                <span className="text-[10px] text-white/30 ml-1 uppercase">{selectedContract.job?.budget_type}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Detailed Description</h4>
                                        <div className="border border-white/10 p-4 rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar">
                                            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                                                {selectedContract.job?.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedContract.job?.skills?.length > 0 && (
                                        <div>
                                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Required Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedContract.job.skills.map(skill => (
                                                    <span key={skill} className="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ContractsPage;
