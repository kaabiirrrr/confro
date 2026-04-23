import { useState, useEffect } from 'react';
import { UserSearch, AlertTriangle, ShieldCheck, ShieldAlert, Clock, Mail } from 'lucide-react';
import { fetchSuspiciousUsers, toggleUserStatus } from '../../services/adminService';
import toast from 'react-hot-toast';

const FraudPage = () => {
    const [suspiciousUsers, setSuspiciousUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSuspicious();
    }, []);

    const loadSuspicious = async () => {
        try {
            setLoading(true);
            const response = await fetchSuspiciousUsers();
            setSuspiciousUsers(response.data);
        } catch (error) {
            toast.error('Failed to load fraud data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        try {
            // action: SUSPEND or IGNORE
            if (action === 'SUSPEND') {
                await toggleUserStatus(userId, true);
                toast.success('User suspended successfully');
            } else {
                toast.success('User marked as safe');
            }
            loadSuspicious();
        } catch (error) {
            toast.error('Action failed');
        }
    };



    const filteredUsers = suspiciousUsers.filter(user => {
        const name = (user.profiles?.[0]?.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-fraud-80.png" alt="Fraud" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Fraud & Suspicious Activity
                    </h1>
                    <p className="text-white/60 text-sm mt-1">Monitor potentially fraudulent behavior and multiple account attempts</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
                        />
                    </div>
                    <button onClick={loadSuspicious} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition flex items-center gap-2 text-sm font-medium shrink-0">
                        <Clock size={16} /> Refresh Feed
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center text-white/40">Analyzing platform activity...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No matches found</h3>
                        <p className="text-white/60 max-w-sm mx-auto">None of the flagged users match your search query.</p>
                    </div>
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className="bg-transparent border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-500/20 transition-all duration-300 group">
                        <div className="flex gap-4 items-center">
                            <div className="text-rose-500/60 group-hover:text-rose-500 transition-colors shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white/90 tracking-tight">{user.profiles?.[0]?.name || 'Anonymous User'}</h3>
                                    <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[8px] font-black rounded uppercase tracking-widest">High Risk</span>
                                </div>
                                <p className="text-white/30 text-xs flex items-center gap-1.5 font-medium"><Mail size={12} className="opacity-50" /> {user.email}</p>
                                <div className="pt-1.5 flex flex-wrap gap-1.5">
                                    <span className="px-2 py-0.5 bg-white/[0.02] rounded-md text-[9px] text-white/40 border border-white/10 font-medium">Frequent Cancellations</span>
                                    <span className="px-2 py-0.5 bg-white/[0.02] rounded-md text-[9px] text-white/40 border border-white/10 font-medium">Recent Large Refund</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 shrink-0 items-center">
                            <button
                                onClick={() => handleAction(user.id, 'IGNORE')}
                                className="px-4 py-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all text-[11px] font-bold"
                            >
                                Mark as Safe
                            </button>
                            <button
                                onClick={() => handleAction(user.id, 'SUSPEND')}
                                className="px-5 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-2 active:scale-95 shadow-lg shadow-rose-600/5 hover:shadow-rose-600/20"
                            >
                                <ShieldAlert size={14} /> Suspend Account
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FraudPage;
