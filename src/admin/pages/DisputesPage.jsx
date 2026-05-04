import { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const DisputesPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, [statusFilter]);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchDisputes({ status: statusFilter });
            if (result.success) {
                setDisputes(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch disputes', err);
            toast.error('Failed to load disputes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (id, action) => {
        const resolution = prompt(`Provide resolution notes for action: ${action}`);
        if (!resolution) return;

        try {
            const result = await adminService.resolveDispute(id, { action, resolution });
            if (result.success) {
                toast.success('Dispute resolved successfully');
                fetchDisputes();
            }
        } catch (err) {
            toast.error('Action failed');
            console.error(err);
        }
    };

    const filteredDisputes = disputes.filter(d =>
        (d.contract_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.raiser?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-disputes-100.png" alt="Disputes" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Dispute Resolution Desk
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Mediate and resolve conflicts between clients and freelancers</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search disputes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                        />
                    </div>
                    <CustomDropdown
                        options={[
                            { label: 'All Statuses', value: '' },
                            { label: 'Open', value: 'OPEN' },
                            { label: 'Reviewing', value: 'REVIEWING' },
                            { label: 'Resolved', value: 'RESOLVED' },
                            { label: 'Closed', value: 'CLOSED' }
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
                                <th className="px-6 py-4 font-medium">Contract Ref</th>
                                <th className="px-6 py-4 font-medium">Raised By</th>
                                <th className="px-6 py-4 font-medium">Reason</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} text="Loading disputes..."/>
                                </td></tr>
                            ) : filteredDisputes.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-white/50">No disputes found.</td></tr>
                            ) : (
                                filteredDisputes.map(dispute => (
                                    <tr key={dispute.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-white font-mono text-[11px] truncate block w-24">{dispute.contract_id}</span>
                                            <span className="text-white/40 text-[10px]">{new Date(dispute.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">{dispute.raiser?.email || 'Unknown'}</td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="truncate text-white" title={dispute.reason}>{dispute.reason}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1 ${dispute.status === 'OPEN' ? 'bg-red-500/10 text-red-400' :
                                                dispute.status === 'REVIEWING' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-green-500/10 text-green-400'
                                                }`}>
                                                {dispute.status === 'OPEN' || dispute.status === 'REVIEWING' ? <ShieldAlert size={12} /> : <CheckCircle size={12} />}
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <button onClick={() => handleResolve(dispute.id, 'REFUND_CLIENT')} className="text-[10px] text-red-300 hover:text-white transition bg-red-500/10 px-2 py-1 rounded">Refund Client</button>
                                                    <button onClick={() => handleResolve(dispute.id, 'RELEASE_FREELANCER')} className="text-[10px] text-green-300 hover:text-white transition bg-green-500/10 px-2 py-1 rounded">Pay Freelancer</button>
                                                    <button onClick={() => handleResolve(dispute.id, 'SPLIT')} className="text-[10px] text-yellow-300 hover:text-white transition bg-yellow-500/10 px-2 py-1 rounded">Split 50/50</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DisputesPage;
