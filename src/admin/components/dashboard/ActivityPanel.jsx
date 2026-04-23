import React, { useState, useEffect } from 'react';
import { Clock, User, Briefcase, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { fetchAdminLogs } from '../../../services/adminService';

const ActivityPanel = ({ limit = 6 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await fetchAdminLogs({ limit });
        setActivities(response.data || []);
      } catch (error) {
        console.error("Failed to load activities", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const getActivityIcon = (type) => {
    if (type.includes('USER')) return <User size={18} className="text-blue-400" />;
    if (type.includes('JOB')) return <Briefcase size={18} className="text-purple-400" />;
    if (type.includes('PAYMENT') || type.includes('WITHDRAWAL')) return <CreditCard size={18} className="text-green-400" />;
    if (type.includes('VERIFICATION')) return <ShieldCheck size={18} className="text-accent" />;
    return <Zap size={18} className="text-yellow-400" />;
  };


  const formatTime = (date) => {
    if (!date) return '--:--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple grouping: Items from today vs older
  const today = new Date().toDateString();
  const todayActivities = activities.filter(a => new Date(a.created_at).toDateString() === today);
  const otherActivities = activities.filter(a => new Date(a.created_at).toDateString() !== today);

  const ActivityGroup = ({ title, items }) => (
    <div className="space-y-6">
      <h4 className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        {title}
      </h4>
      <div className="space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5 z-0" />
        
        {items.map((activity, idx) => (
          <div key={activity.id} className="flex gap-4 group relative z-10">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center transition-all group-hover:scale-110">
              {getActivityIcon(activity.action_type || 'SYSTEM')}
            </div>
            
            <div className="flex-1 min-w-0 -mt-0.5">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-tight mb-1">
                {formatTime(activity.created_at)}
              </p>
              <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">
                <span className="font-bold text-white pr-1">{activity.admin_email ? activity.admin_email.split('@')[0] : 'System'}</span>
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div className="bg-transparent border border-white/5 rounded-[32px] p-8 h-full shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Recent Activities
        </h3>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Clock size={16} className="text-white/20" />
        </button>
      </div>

      <div className="space-y-12">
        {loading ? (
          <div className="py-10 text-center text-white/20 text-xs italic">Syncing platform events...</div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center text-white/20 text-xs italic">No recent activity detected.</div>
        ) : (
          <>
            {todayActivities.length > 0 && <ActivityGroup title="Today" items={todayActivities} />}
            {otherActivities.length > 0 && <ActivityGroup title="Earlier" items={otherActivities} />}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
