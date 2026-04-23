import { useState, useEffect } from 'react';
import { Clock, User, Briefcase, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { fetchAdminLogs } from '../../services/adminService';

const LiveActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                // Fetch latest 10 logs
                const response = await fetchAdminLogs({ limit: 10 });
                setActivities(response.data || []);
            } catch (error) {
                console.error("Failed to load activity feed", error);
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
        const interval = setInterval(loadActivities, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const getActivityIcon = (type) => {
        if (type.includes('USER')) return <User className="text-blue-400" size={14} />;
        if (type.includes('JOB')) return <Briefcase className="text-purple-400" size={14} />;
        if (type.includes('PAYMENT') || type.includes('WITHDRAWAL')) return <CreditCard className="text-green-400" size={14} />;
        if (type.includes('VERIFICATION')) return <ShieldCheck className="text-accent" size={14} />;
        return <Zap className="text-yellow-400" size={14} />;
    };

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return past.toLocaleDateString();
    };

    return (
        <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-transparent">
                <h3 className="text-white font-medium flex items-center gap-2 text-sm uppercase tracking-wider">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    Live Platform Activity
                </h3>
                <Clock size={16} className="text-white/40" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {loading ? (
                    <div className="p-8 text-center text-white/20 text-xs">Syncing logs...</div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center text-white/20 text-xs italic">No recent activity detected.</div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity) => (
                            <div key={activity.id} className="p-3 hover:bg-white/[0.03] rounded-lg transition-colors border border-transparent hover:border-white/5 group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-white/5 rounded-md group-hover:bg-white/10 transition-colors">
                                        {getActivityIcon(activity.action_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/80 leading-snug break-words">
                                            <span className="font-bold text-white">{activity.admin_email?.split('@')[0]}</span> {activity.description}
                                        </p>
                                        <p className="text-[10px] text-white/40 mt-1 font-medium">{formatTime(activity.timestamp)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 text-center border-t border-white/10 bg-transparent">
                <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">View All Logs</button>
            </div>
        </div>
    );
};

export default LiveActivityFeed;
