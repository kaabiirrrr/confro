import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Zap, ShieldCheck, Target, MessageSquare, 
    AlertTriangle, Diamond, TrendingUp, Info,
    Calendar, CheckCircle2, Star, Sparkles
} from 'lucide-react';

/**
 * Trust Graph v2 - Relationship Intelligence
 * personalized insights between the current client and freelancer.
 */
const RelationshipIntelligence = ({ freelancerId, userRole, clientId: propClientId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
            const isClient = userRole === 'CLIENT';

            if (!freelancerId || (!isClient && !isAdmin)) {
                setLoading(false);
                return;
            }

            try {
                // Determine effective clientId
                const effectiveClientId = isAdmin ? propClientId : null;
                const url = effectiveClientId 
                    ? `/api/relationship/stats/${freelancerId}?clientId=${effectiveClientId}`
                    : `/api/relationship/stats/${freelancerId}`;

                const response = await axios.get(url);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch relationship stats:', err);
                // The backend provides a failsafe, but we catch network errors here
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [freelancerId, userRole, propClientId]);

    const isAdminView = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    if (userRole !== 'CLIENT' && !isAdminView) return null;
    
    if (loading) return (
        <div className="animate-pulse bg-slate-900/50 rounded-3xl h-64 w-full border border-slate-800" />
    );

    // Standardized structure from Polish Point #4
    const { has_history, relationship, trust, behavior, badges, ai } = data || {};
    
    // Polish Point #3: Minimum data threshold
    const isLimitedData = relationship?.projects_completed < 2;

    return (
        <div className="space-y-6">
            {/* Main intelligence Card */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />
                
                <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold text-white">
                                {isAdminView ? 'Relationship Intelligence' : 'Your History'}
                            </h3>
                            
                            {/* Polish Point #6: Badge Priority Logic */}
                            <div className="flex gap-2">
                                {badges?.includes('RISK') && (
                                    <Badge 
                                        icon={<AlertTriangle className="w-3 h-3" />} 
                                        label="Risk Alert" 
                                        color="bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                    />
                                )}
                                {!badges?.includes('RISK') && badges?.includes('LOYALTY') && (
                                    <Badge 
                                        icon={<Diamond className="w-3 h-3" />} 
                                        label="Loyal Partner" 
                                        color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                                    />
                                )}
                                {!badges?.includes('RISK') && !badges?.includes('LOYALTY') && badges?.includes('HIGH_TRUST') && (
                                    <Badge 
                                        icon={<ShieldCheck className="w-3 h-3" />} 
                                        label="High Trust" 
                                        color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                    />
                                )}
                            </div>
                        </div>

                        {!has_history ? (
                            /* Polish Point #7: First Project Boost */
                            <div className="flex flex-col items-center justify-center py-10 bg-accent/5 rounded-2xl border border-dashed border-accent/20">
                                <Sparkles className="w-10 h-10 text-accent mb-3 opacity-80" />
                                <p className="text-white font-semibold text-lg">New Collaboration Potential</p>
                                <p className="text-slate-400 text-sm mt-1 max-w-sm text-center">
                                    Start working together to unlock personalized trust insights and behavioral mapping.
                                </p>
                                <button className="mt-4 px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-full text-sm font-bold transition-all transform hover:scale-105">
                                    Send First Proposal
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard 
                                    label="Projects" 
                                    value={relationship.projects_completed} 
                                    icon={<Target className="w-4 h-4 text-accent" />} 
                                />
                                <StatCard 
                                    label="Success" 
                                    value={`${relationship.success_rate}%`} 
                                    sub={isLimitedData ? "Emerging" : "Proven"}
                                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} 
                                />
                                <StatCard 
                                    label="On-time" 
                                    value={`${behavior.on_time_rate}%`} 
                                    icon={<TrendingUp className="w-4 h-4 text-amber-400" />} 
                                />
                                <StatCard 
                                    label="Comm." 
                                    value={`${trust.score}%`} 
                                    icon={<MessageSquare className="w-4 h-4 text-cyan-400" />} 
                                />
                            </div>
                        )}

                        {has_history && relationship.last_project_name && (
                            <div className="mt-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Calendar className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Last Project</p>
                                        <p className="text-sm font-medium text-slate-200">{relationship.last_project_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Completed</p>
                                    <p className="text-sm font-medium text-slate-400">
                                        {relationship.last_project_date ? new Date(relationship.last_project_date).toLocaleDateString() : 'Recent'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trust radial - Polish Point #2: Rounded Integer */}
                    {has_history && (
                        <div className="md:w-64 flex flex-col justify-center items-center p-8 bg-accent/5 rounded-3xl border border-accent/10">
                            <div className="relative mb-4">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle
                                        cx="56" cy="56" r="48"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="56" cy="56" r="48"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={301.6}
                                        strokeDashoffset={301.6 - (301.6 * trust.score) / 100}
                                        className={`${trust.score >= 90 ? 'text-emerald-500' : trust.score >= 70 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-bold text-white">{Math.round(trust.score)}%</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{trust.level}</span>
                                </div>
                            </div>
                            <p className="text-xs text-center text-slate-500 font-medium leading-relaxed">
                                {isLimitedData 
                                    ? "Limited data available" 
                                    : "Calculated from your shared history and delivery signals."
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* AI Relationship Summary - Gated by threshold Polish Point #5 */}
                {has_history && ai?.summary && (
                    <div className="mt-8 flex gap-4 p-5 bg-accent/10 border border-accent/20 rounded-3xl">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-accent uppercase font-bold tracking-widest">AI Relationship Summary</span>
                                <div className="flex-1 h-[1px] bg-accent/20" />
                                <span className="text-[10px] text-accent font-bold uppercase">{ai.compatibility}% Compatibility</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                "{ai.summary}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Behavior Insights (shared stats) */}
            {has_history && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <BehaviorCard 
                        title="Comm. Consistency" 
                        value={`${Math.round(100 - behavior.revisions_avg * 10)}%`}
                        description="Frequency of successful milestones without redundant back-and-forth."
                        icon={<MessageSquare className="w-4 h-4" />}
                    />
                    <BehaviorCard 
                        title="Revisions Needed" 
                        value={behavior.revisions_avg}
                        description="Average number of revision cycles required per finalized job."
                        icon={<TrendingUp className="w-4 h-4" />}
                    />
                    <BehaviorCard 
                        title="Response Time" 
                        value={`${behavior.avg_response_time}m`}
                        description="Average speed of collaboration across all shared projects."
                        icon={<Info className="w-4 h-4" />}
                    />
                </div>
            )}
        </div>
    );
};

const Badge = ({ icon, label, color }) => (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
        {icon}
        {label}
    </span>
);

const StatCard = ({ label, value, icon, sub }) => (
    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all hover:bg-slate-800/60">
        <div className="flex items-center gap-2 mb-2 opacity-60">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white">{value}</div>
            {sub && <span className="text-[10px] text-slate-500 font-bold uppercase">{sub}</span>}
        </div>
    </div>
);

const BehaviorCard = ({ title, value, description, icon }) => (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-5 rounded-3xl hover:border-accent/30 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-accent transition-colors">
                    {icon}
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
            </div>
            <span className="text-xl font-bold text-white">{value}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {description}
        </p>
    </div>
);

export default RelationshipIntelligence;
