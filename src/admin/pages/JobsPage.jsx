import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, CheckSquare, XCircle, X, Briefcase, IndianRupee, User, Mail, Calendar, Clock } from 'lucide-react';
import { formatINR } from '../../utils/currencyUtils';
import Button from '../../components/ui/Button';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, [statusFilter]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchJobs({ status: statusFilter });
            if (result.success) {
                setJobs(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch jobs', err);
            toast.error('Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (jobId) => {
        try {
            const result = await adminService.approveJob(jobId);
            if (result.success) {
                toast.success('Job approved successfully');
                fetchJobs();
            }
        } catch (err) {
            toast.error('Approval failed');
        }
    };

    const handleReject = async (jobId) => {
        const reason = window.prompt('Please enter a reason for rejection:');
        if (reason === null) return;

        try {
            const result = await adminService.rejectJob(jobId, reason);
            if (result.success) {
                toast.success('Job rejected successfully');
                fetchJobs();
            }
        } catch (err) {
            toast.error('Rejection failed');
        }
    };

    const handleDelete = async (jobId) => {
        if (!confirm('Are you sure you want to permanently delete this job?')) return;

        try {
            const result = await adminService.deleteJob(jobId);
            if (result.success) {
                toast.success('Job deleted successfully');
                setJobs(jobs.filter(j => j.id !== jobId));
            }
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const filteredJobs = jobs.filter(j =>
        (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.client?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-bag-100.png" alt="Jobs" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Job Posts Moderation
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Review and manage all job postings across the platform</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                        />
                    </div>
                    <CustomDropdown
                        options={[
                            { label: 'All Statuses', value: '' },
                            { label: 'Open', value: 'OPEN' },
                            { label: 'In Progress', value: 'IN_PROGRESS' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Cancelled', value: 'CANCELLED' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        variant="transparent"
                        className="w-full sm:w-40"
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
                                <th className="px-6 py-4 font-medium">Budget</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} text="Loading jobs..."/>
                                </td></tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-white/50">No jobs found.</td></tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="text-white font-medium truncate">{job.title}</span>
                                                <span className="text-white/50 text-xs">{new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-sm shadow-black/20">
                                                    {job.client?.profiles?.avatar_url ? (
                                                        <img src={job.client.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-accent font-bold">
                                                            {(job.client?.profiles?.name || job.client?.name || 'C').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-medium text-xs">{job.client?.profiles?.name || job.client?.name || 'Unknown'}</span>
                                                    <div className="text-white/40 text-[10px]">{job.client?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-accent">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={14} className="text-accent/60" />
                                                {formatINR(job.budget_amount || job.budget || 0).replace('₹', '')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'OPEN' ? 'bg-green-500/10 text-green-400' :
                                                job.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-white/10 text-white/60'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedJob(job)}
                                                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-accent transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {job.status === 'OPEN' && (
                                                    <>
                                                        <button onClick={() => handleApprove(job.id)} className="text-green-400 hover:text-green-300 transition" title="Approve"><CheckSquare size={16} /></button>
                                                        <button onClick={() => handleReject(job.id)} className="text-orange-400 hover:text-orange-300 transition" title="Reject"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-300 transition" title="Delete job"><Trash2 size={16} /></button>
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
                        {selectedJob.image_url && (
                            <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-white/5 mb-4">
                                <img src={selectedJob.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Job Title</h4>
                            <p className="text-base sm:text-xl font-bold text-white leading-tight">{selectedJob.title}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-white/10 p-3 rounded-2xl">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Budget</p>
                                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-base">
                                    <IndianRupee size={14} className="text-white/40" />
                                    <span>{formatINR(selectedJob.budget_amount || selectedJob.budget || '0').replace('₹', '')}</span>
                                    <span className="text-[10px] text-white/30 font-normal capitalize">({selectedJob.budget_type || 'Fixed'})</span>
                                </div>
                            </div>
                            <div className="border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-1">Category</p>
                                <div className="flex items-center gap-2 text-white font-semibold capitalize text-xs sm:text-base">
                                    <Briefcase size={14} className="text-accent" />
                                    <span>{selectedJob.category || 'General'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                                <Clock size={16} className="text-accent" />
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Experience</p>
                                    <p className="text-white font-medium text-sm capitalize">{selectedJob.experience_level || 'All'}</p>
                                </div>
                            </div>
                            <div className="border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                                <Calendar size={16} className="text-accent" />
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Duration</p>
                                    <p className="text-white font-medium text-sm">{selectedJob.duration || 'Not set'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Description</h4>
                            <div className="border border-white/10 p-4 rounded-2xl">
                                <p className="text-white/70 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>
                        </div>

                        {selectedJob.skills?.length > 0 && (
                            <div>
                                <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium border border-accent/10">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Client Information</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-accent shadow-sm">
                                    {selectedJob.client?.profiles?.avatar_url ? (
                                        <img
                                            src={selectedJob.client.profiles.avatar_url}
                                            alt={selectedJob.client?.profiles?.name || 'Client'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-xs sm:text-base">{selectedJob.client?.profiles?.name || selectedJob.client?.name || 'Unknown Client'}</p>
                                    <p className="text-white/40 text-[10px] flex items-center gap-1.5 mt-0.5">
                                        <Mail size={12} /> {selectedJob.client?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default JobsPage;
