import { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, FileDown, RefreshCw } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import { exportTableToPDF } from '../utils/exportPDF';

const DisputesPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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

    const handleExportPDF = () => {
        const dateFiltered = disputes.filter(d => {
            const date = new Date(d.created_at);
            if (dateFrom && date < new Date(dateFrom)) return false;
            if (dateTo && date > new Date(dateTo + 'T23:59:59')) return false;
            return true;
        });
        const result = dateFiltered.filter(d =>
            (d.contract_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.raiser?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (result.length === 0) { toast.error('No data to export'); return; }
        exportTableToPDF({
            title: 'Dispute Resolution Desk',
            filename: 'disputes',
            columns: ['Contract Ref', 'Date', 'Raised By', 'Reason', 'Status'],
            rows: result.map(d => [
                d.contract_id || 'N/A',
                new Date(d.created_at).toLocaleDateString(),
                d.raiser?.email || 'Unknown',
                d.reason || '',
                d.status
            ]),
            filters: { Status: statusFilter || 'All', From: dateFrom || '—', To: dateTo || '—' }
        });
        toast.success('PDF exported');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <img src="/Icons/icons8-disputes-100.png" alt="Disputes" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            Dispute Resolution Desk
                        </h1>
                        <p className="text-white/40 text-xs mt-1">Mediate and resolve conflicts between clients and freelancers</p>
                    </div>
                    {/* Mobile-only Refresh Button */}
                    <button
                        onClick={fetchDisputes}
                        className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {/* Dates: Row 1 on mobile */}
                        <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                            <div className="relative flex-1 sm:w-36">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full h-10 px-3 bg-transparent border border-white/10 rounded-xl text-xs text-white/70 focus:outline-none focus:border-accent [color-scheme:dark]"
                                />
                                <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">From</span>
                            </div>
                            <div className="relative flex-1 sm:w-36">
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full h-10 px-3 bg-transparent border border-white/10 rounded-xl text-xs text-white/70 focus:outline-none focus:border-accent [color-scheme:dark]"
                                />
                                <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">To</span>
                            </div>
                        </div>

                        {/* CustomDropdown & Export: Row 2 on mobile */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2 sm:order-3">
                            <div className="w-full sm:w-auto sm:flex-initial">
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
                            <button
                                onClick={handleExportPDF}
                                className="w-full sm:w-auto sm:flex-initial flex items-center justify-center gap-2 h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
                            >
                                <FileDown size={14} /> Export PDF
                            </button>
                        </div>

                    </div>
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search disputes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-transparent border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={fetchDisputes}
                    className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-white/40 hover:text-accent transition-all group"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden">
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
