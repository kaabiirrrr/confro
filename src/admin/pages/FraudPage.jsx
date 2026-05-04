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
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-fraud-80.png" alt="Fraud" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Fraud Detection
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Monitor potentially fraudulent behavior and multiple account attempts</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-xl">
                    <div className="relative flex-1">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500/50 transition-all"
                        />
                    </div>
                    <button onClick={loadSuspicious} title="Refresh Feed" className="p-2 text-white/40 hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95">
                        <Clock size={20} />
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
                    <div key={user.id} className="bg-transparent border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between gap-4 sm:gap-6 hover:border-rose-500/20 transition-all duration-300 group">
                        <div className="flex gap-3 sm:gap-4 items-start">
                            <div className="text-rose-500/60 mt-1 group-hover:text-rose-500 transition-colors shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm sm:text-base font-bold text-white/90 tracking-tight leading-none">{user.profiles?.[0]?.name || 'Anonymous User'}</h3>
                                <p className="text-white/30 text-[10px] sm:text-xs flex items-center gap-1.5 font-medium"><Mail size={10} className="opacity-50" /> {user.email}</p>
                                <div className="pt-1.5 flex flex-wrap gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-white/[0.02] rounded-md text-[8px] text-white/40 border border-white/10 font-bold uppercase tracking-widest">Frequent Cancellations</span>
                                    <span className="px-1.5 py-0.5 bg-white/[0.02] rounded-md text-[8px] text-white/40 border border-white/10 font-bold uppercase tracking-widest">Recent Large Refund</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[8px] font-black rounded-full uppercase tracking-widest border border-rose-500/20">
                                High Risk
                            </span>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleAction(user.id, 'IGNORE')}
                                    className="flex-1 md:flex-none px-3 py-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all text-[10px] font-bold border border-transparent hover:border-white/10 whitespace-nowrap"
                                >
                                    Mark as Safe
                                </button>
                                <button
                                    onClick={() => handleAction(user.id, 'SUSPEND')}
                                    className="flex-1 md:flex-none px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-rose-600/5 hover:shadow-rose-600/20 border border-rose-500/20 hover:border-rose-600 whitespace-nowrap"
                                >
                                    <ShieldAlert size={14} /> Suspend Account
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FraudPage;
