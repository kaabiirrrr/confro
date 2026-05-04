import React, { useState, useEffect } from 'react';
import { Trash2, Search, Eye, FileText, X, IndianRupee, Clock, Calendar, User, Mail, Briefcase, ChevronRight } from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import RelationshipIntelligence from '../../components/profile/RelationshipIntelligence';
import { useAuth } from '../../context/AuthContext';

const ProposalsPage = () => {
    const { user } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedProposal, setSelectedProposal] = useState(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchProposals();
            if (result.success) {
                setProposals(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch proposals', err);
            toast.error('Failed to load proposals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this proposal?')) return;
        try {
            const result = await adminService.deleteProposal(id);
            if (result.success) {
                toast.success('Proposal deleted');
                setProposals(proposals.filter(p => p.id !== id));
            }
        } catch (err) {
            toast.error('Deletion failed');
            console.error(err);
        }
    };

    const filteredProposals = proposals.filter(p =>
        (p.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.freelancer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.freelancer?.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.job?.client?.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.job?.client?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                        <img src="/Icons/icons8-new-job-100.png" alt="Proposals" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Proposal Board
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Review and manage job proposals submitted by freelancers</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                        type="text"
                        placeholder="Search proposals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="border-b border-white/10 text-white/90">
                            <tr>
                                <th className="px-6 py-4 font-medium">Job Title</th>
                                <th className="px-6 py-4 font-medium">Client</th>
                                <th className="px-6 py-4 font-medium">Freelancer</th>
                                <th className="px-6 py-4 font-medium">Budget</th>
                                <th className="px-6 py-4 font-medium">Proposed Rate</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} text="Loading proposals..."/>
                                </td></tr>
                            ) : filteredProposals.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-white/50">No proposals found.</td></tr>
                            ) : (
                                filteredProposals.map(proposal => (
                                    <tr key={proposal.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium truncate block max-w-[200px]" title={proposal.job?.title}>
                                                    {proposal.job?.title || 'Deleted Job'}
                                                </span>
                                                <span className="text-white/30 text-[10px] block mt-1">
                                                    {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-sm shadow-black/20">
                                                    {proposal.job?.client?.profiles?.avatar_url ? (
                                                        <img src={proposal.job.client.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs text-accent font-bold">
                                                            {(proposal.job?.client?.profiles?.name || 'C').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-medium text-xs">{proposal.job?.client?.profiles?.name || 'Unknown'}</span>
                                                    <span className="text-white/40 text-[10px]">{proposal.job?.client?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-sm shadow-black/20">
                                                    {proposal.freelancer?.profiles?.avatar_url ? (
                                                        <img src={proposal.freelancer.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs text-accent font-bold">
                                                            {(proposal.freelancer?.profiles?.name || 'F').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-medium text-xs">{proposal.freelancer?.profiles?.name || 'Freelancer'}</span>
                                                    <span className="text-white/40 text-[10px]">{proposal.freelancer?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium flex items-center gap-1">
                                                    <IndianRupee size={12} className="text-white/40" />
                                                    {formatINR(proposal.job?.budget_amount || proposal.job?.budget || '0').replace('₹', '')}
                                                </span>
                                                <span className="text-white/30 text-[10px] capitalize">{proposal.job?.budget_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-accent flex items-center gap-1">
                                            <IndianRupee size={12} className="text-accent/60" />
                                            {formatINR(proposal.proposed_rate).replace('₹', '')}{proposal.job?.budget_type === 'hourly' ? '/hr' : ''}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${proposal.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                'bg-white/5 text-white/40 border border-white/10'
                                                }`}>
                                                {proposal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedJob(proposal.job)}
                                                    className="p-2 text-white/40 hover:text-accent transition-all"
                                                    title="View Job Details"
                                                >
                                                    <Briefcase size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedProposal(proposal)}
                                                    className="p-2 text-white/40 hover:text-accent transition-all"
                                                    title="View Proposal Details"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                                <button
                                                    onClick={() => handleDelete(proposal.id)}
                                                    className="p-2 text-white/40 hover:text-rose-400 transition-all"
                                                    title="Delete Proposal"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Job Details Modal */}
            <Modal
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                title="Job Details"
                icon="/Icons/icons8-bag-100.png"
            >
                {selectedJob && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Job Title</h4>
                            <p className="text-base sm:text-xl font-bold text-white leading-tight">{selectedJob.title}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-transparent border border-white/10 p-3 rounded-2xl">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Budget</p>
                                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-base">
                                    <IndianRupee size={14} className="text-white/40" />
                                    <span>{formatINR(selectedJob.budget_amount || selectedJob.budget || '0').replace('₹', '')}</span>
                                    <span className="text-[10px] text-white/30 font-normal capitalize">({selectedJob.budget_type})</span>
                                </div>
                            </div>
                            <div className="bg-transparent border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Category</p>
                                <div className="flex items-center gap-2 text-white font-semibold capitalize text-xs sm:text-base">
                                    <Briefcase size={14} className="text-accent" />
                                    <span>{selectedJob.category || 'General'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Description</h4>
                            <div className="bg-transparent border border-white/10 p-4 rounded-2xl">
                                <p className="text-white/70 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>
                        </div>

                        {selectedJob.skills?.length > 0 && (
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">Required Skills</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {selectedJob.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Client Information</h4>
                            <div className="flex items-center gap-4">
                                {selectedJob.client?.profiles?.avatar_url ? (
                                    <img 
                                        src={selectedJob.client.profiles.avatar_url} 
                                        alt="" 
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 shadow-lg" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shadow-sm border border-white/10">
                                        <User size={24} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold text-xs sm:text-base">{selectedJob.client?.profiles?.name || 'Unknown Client'}</p>
                                    <p className="text-white/40 text-[10px] flex items-center gap-1.5 mt-0.5">
                                        <Mail size={12} /> {selectedJob.client?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Proposal Details Modal */}
            <Modal
                isOpen={!!selectedProposal}
                onClose={() => setSelectedProposal(null)}
                title="Proposal Details"
                icon="/Icons/icons8-new-job-100.png"
            >
                {selectedProposal && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Freelancer</h4>
                                <div className="flex items-center gap-3">
                                    {selectedProposal.freelancer?.profiles?.avatar_url ? (
                                        <img 
                                            src={selectedProposal.freelancer.profiles.avatar_url} 
                                            alt="" 
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5 shadow-lg" 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shadow-sm">
                                            {(selectedProposal.freelancer?.profiles?.name || 'F')[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-bold text-xs sm:text-base">{selectedProposal.freelancer?.profiles?.name || 'Freelancer'}</p>
                                        <p className="text-white/40 text-[10px]">{selectedProposal.freelancer?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg sm:text-2xl font-black text-accent flex items-center justify-end gap-1">
                                    <IndianRupee size={20} className="text-accent/60" />
                                    {formatINR(selectedProposal.proposed_rate).replace('₹', '')}
                                    {selectedProposal.job?.budget_type === 'hourly' ? <span className="text-[10px] font-normal text-white/30 truncate ml-1">/hr</span> : ''}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-accent" />
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Estimated Duration</p>
                                    <p className="text-white font-medium text-sm">{selectedProposal.estimated_duration || 'Not specified'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-accent" />
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Submitted On</p>
                                    <p className="text-white font-medium text-sm">{new Date(selectedProposal.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Admin Relationship Intelligence View (Trust Graph v2) */}
                        <div className="pt-6">
                            <RelationshipIntelligence 
                                freelancerId={selectedProposal.freelancer_id}
                                clientId={selectedProposal.job?.client_id}
                                userRole={user?.role || 'ADMIN'}
                            />
                        </div>

                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Cover Letter</h4>
                            <div className="border border-white/10 p-5 rounded-3xl min-h-[150px]">
                                <p className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{selectedProposal.cover_letter}</p>
                            </div>
                        </div>

                        <div className="group bg-transparent hover:bg-accent/5 p-4 rounded-2xl transition-all cursor-pointer" 
                             onClick={() => {
                                 setSelectedJob(selectedProposal.job);
                                 setSelectedProposal(null);
                             }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/Icons/icons8-bag-100.png" alt="Job" className="w-8 h-8 object-contain" />
                                    <div>
                                        <p className="text-[10px] text-accent/60 uppercase font-bold tracking-wider">Job Application For</p>
                                        <p className="text-white font-bold text-sm truncate max-w-[200px]">{selectedProposal.job?.title}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-accent group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProposalsPage;
