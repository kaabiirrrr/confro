import React, { useState, useEffect } from 'react';
import { Clock, User, Briefcase, CreditCard, ShieldCheck, Zap, RefreshCcw } from 'lucide-react';
import { fetchPlatformActivity } from '../../../services/adminService';

const ActivityPanel = ({ limit = 6 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await fetchPlatformActivity({ limit });
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
    switch (type) {
      case 'USER_SIGNUP':
        return <User size={18} className="text-blue-500 dark:text-blue-400" />;
      case 'JOB_POSTED':
        return <Briefcase size={18} className="text-purple-500 dark:text-purple-400" />;
      case 'PROPOSAL_SUBMITTED':
        return <img src="/Icons/icons8-light-100.png" alt="Activity" className="w-[18px] h-[18px] object-contain" />;
      case 'ADMIN_ACTION':
        return <ShieldCheck size={18} className="text-emerald-500 dark:text-emerald-400" />;
      default:
        return <img src="/Icons/icons8-light-100.png" alt="Activity" className="w-[18px] h-[18px] object-contain" />;
    }
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
      <h4 className="text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        {title}
      </h4>
      <div className="space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100 dark:bg-white/5 z-0" />
        
        {items.map((activity, idx) => (
          <div key={activity.id} className="flex gap-4 group relative z-10">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center transition-all group-hover:scale-110">
              {getActivityIcon(activity.action_type || 'SYSTEM')}
            </div>
            
            <div className="flex-1 min-w-0 -mt-0.5">
              <p className="text-[10px] text-slate-500 dark:text-white/40 font-black uppercase tracking-tight mb-1">
                {formatTime(activity.created_at)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <span className="font-bold text-slate-900 dark:text-white pr-1">{activity.admin_email ? activity.admin_email.split('@')[0] : 'System'}</span>
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div className={`bg-transparent border border-white/5 rounded-2xl p-8 h-full shadow-sm transition-all ${loading ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Recent Activities
        </h3>
        <button 
            onClick={() => loadActivities()}
            className="p-2 transition-all text-white/20 hover:text-accent bg-transparent flex items-center justify-center"
            title="Refresh Activities"
        >
          <RefreshCcw size={16} className={`${loading ? 'animate-spin' : ''} transition-all`} />
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
