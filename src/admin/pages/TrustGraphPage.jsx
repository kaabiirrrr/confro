import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    ShieldAlert, 
    Link as LinkIcon, 
    RefreshCcw, 
    AlertTriangle,
    CheckCircle,
    UserX,
    ExternalLink,
    Zap,
    MapPin,
    Smartphone
} from 'lucide-react';
import { fetchFraudClusters, recalculateTrustScore, flagFraudUser } from '../../services/adminService';
import InfinityLoader from '../../components/common/InfinityLoader';
import { toast } from 'react-hot-toast';

const TrustGraphPage = () => {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const loadClusters = async () => {
        setLoading(true);
        try {
            const response = await fetchFraudClusters();
            if (response.success) {
                setClusters(response.data);
            }
        } catch (error) {
            toast.error('Failed to load trust clusters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClusters();
    }, []);

    const handleRecalculate = async (userId) => {
        setActionLoading(userId);
        try {
            const response = await recalculateTrustScore(userId);
            if (response.success) {
                toast.success('Reputation recalculated');
                loadClusters();
            }
        } catch (error) {
            toast.error('Recalculation failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFlagFraud = async (userId) => {
        if (!window.confirm('Are you sure you want to flag this user as fraud? This will significantly penalize their trust score.')) return;
        
        setActionLoading(`flag-${userId}`);
        try {
            const response = await flagFraudUser(userId, 'Detected in TrustGraph cluster');
            if (response.success) {
                toast.success('User flagged as fraud');
                loadClusters();
            }
        } catch (error) {
            toast.error('Flagging failed');
        } finally {
            setActionLoading(null);
        }
    };

    const getLinkTypeIcon = (type) => {
        switch (type) {
            case 'DEVICE': return <Smartphone size={14} />;
            case 'PAYOUT': return <Zap size={14} />;
            case 'IP': return <MapPin size={14} />;
            default: return <LinkIcon size={14} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-8">
                <div className="animate-in slide-in-from-left duration-700">
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-trust-64.png" alt="TrustGraph" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" /> TrustGraph Intelligence
                    </h1>
                    <p className="text-white/40 text-xs mt-1 font-medium hidden sm:block">Link-based Sybil detection & Reputation Shield monitoring.</p>
                </div>

                <button 
                    onClick={loadClusters}
                    disabled={loading}
                    title="Refresh Clusters"
                    className="text-white/40 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                    {loading ? <InfinityLoader /> : <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-y border-white/5 py-6">
                {[
                    { label: 'Identified Clusters', value: clusters.length, icon: <ShieldAlert size={18} />, color: 'text-accent', bg: 'bg-accent/10' },
                    { label: 'Linked Identities', value: clusters.reduce((acc, c) => acc + (c.userIds?.length || 0), 0), icon: <Users size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Critical Links', value: clusters.filter(c => c.type === 'DEVICE' || c.type === 'PAYOUT').length, icon: <AlertTriangle size={18} />, color: 'text-rose-400', bg: 'bg-rose-400/10' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-full"
                    >
                        <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                            <div className={`${stat.color} mb-0.5`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">{stat.value}</h3>
                            <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Cluster List & Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* List */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={12} /> Detected Clusters
                        </h2>
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{clusters.length} Active</span>
                    </div>
                    
                    {loading ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex justify-center items-center">
                            <InfinityLoader text="Analyzing graph..."/>
                        </div>
                    ) : clusters.length === 0 ? (
                        <div className="rounded-2xl p-12 text-center">
                            <img src="/Icons/icons8-trust-64.png" alt="No clusters" className="w-12 h-12 mx-auto mb-4 opacity-30 grayscale" />
                            <p className="text-white font-bold text-sm">No suspicious clusters detected</p>
                            <p className="text-white/40 text-[10px] mt-1">Behavioral links are automatically monitored.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            {clusters.map((cluster, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => setSelectedCluster(cluster)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                        selectedCluster === cluster 
                                        ? 'bg-accent/10 border-accent/30 ring-1 ring-accent/20' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                                    }`}
                                >
                                    {selectedCluster === cluster && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-[8px] font-black rounded-md border ${
                                                cluster.type === 'DEVICE' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 
                                                cluster.type === 'PAYOUT' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 
                                                'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {cluster.type}
                                            </span>
                                            <span className="text-white/80 font-bold text-xs uppercase tracking-tight">Cluster #{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-white/30 text-[10px] font-bold">
                                            <Users size={10} /> {cluster.userIds?.length || 0}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {(cluster.users || []).slice(0, 4).map((u, i) => (
                                                <img 
                                                    key={i} 
                                                    src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                                                    className="w-6 h-6 border-2 border-primary rounded-full object-cover shadow-sm shadow-black/40"
                                                    alt={u.name}
                                                />
                                            ))}
                                            {(cluster.users?.length || 0) > 4 && (
                                                <div className="w-6 h-6 border-2 border-primary rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-white">
                                                    +{(cluster.users?.length || 0) - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={12} className="text-accent" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View / Visualizer */}
                <div className="lg:col-span-8">
                    {selectedCluster ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 h-full flex flex-col space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white tracking-tight">Cluster Analysis</h3>
                                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-black rounded-full border border-accent/20 uppercase tracking-widest">{selectedCluster.type}</span>
                                    </div>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Discovered Nodes & Reputation Impact</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedCluster(null)}
                                    className="p-2 text-white/30 hover:text-white transition-colors"
                                >
                                    <RefreshCcw size={18} className="rotate-45" />
                                </button>
                            </div>

                            {/* Node Visualization Area */}
                            <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl h-80 flex items-center justify-center overflow-hidden group/viz shadow-inner">
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                
                                {/* Central Link Type */}
                                <div className="z-10 bg-primary/90 backdrop-blur-md text-accent p-4 rounded-2xl border border-accent/30 shadow-2xl shadow-accent/10 flex flex-col items-center gap-2 group-hover/viz:scale-110 transition-transform duration-500">
                                    <div className="p-3 bg-accent/20 rounded-xl border border-accent/30">
                                        {getLinkTypeIcon(selectedCluster.type)}
                                    </div>
                                    <span className="font-black text-[9px] uppercase tracking-[0.2em]">{selectedCluster.type} SIGNAL</span>
                                </div>

                                {/* Connections Visualization */}
                                {(selectedCluster.users || []).map((user, i) => {
                                    const angle = (i * 360) / (selectedCluster.users?.length || 1);
                                    const radius = 120;
                                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                                    return (
                                        <div 
                                            key={user.user_id}
                                            className="absolute transition-all duration-1000 ease-out flex flex-col items-center z-0"
                                            style={{ transform: `translate(${x}px, ${y}px)` }}
                                        >
                                            <div className="w-px bg-gradient-to-t from-accent/40 to-transparent absolute bottom-full h-24 origin-bottom" style={{ transform: `rotate(${angle + 90}deg)` }}></div>
                                            <div className={`w-12 h-12 border-2 rounded-full overflow-hidden mb-2 shadow-2xl transition-all hover:scale-125 hover:z-50 ${user.fraud_flag ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-white/20 hover:border-accent'}`}>
                                                <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="text-[9px] font-bold text-white/50 bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap">{user.name.split(' ')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User List Detail */}
                            <div className="space-y-3 flex-grow overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                {(selectedCluster.users || []).map((user) => (
                                    <div key={user.user_id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img 
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                                                    className="w-10 h-10 border border-white/20 rounded-full object-cover shadow-lg"
                                                    alt=""
                                                />
                                                {user.fraud_flag && (
                                                    <div className="absolute -top-1 -right-1 bg-rose-500 border border-primary rounded-full p-1 shadow-lg">
                                                        <ShieldAlert size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                                    {user.name}
                                                    {user.fraud_flag && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-rose-500/20">Flagged</span>}
                                                </h4>
                                                <p className="text-white/30 text-[10px] font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Reputation</p>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <div className={`h-1.5 w-8 rounded-full ${user.trust_score > 70 ? 'bg-accent' : user.trust_score > 40 ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
                                                    <span className={`text-sm font-bold ${
                                                        user.trust_score > 70 ? 'text-accent' : 
                                                        user.trust_score > 40 ? 'text-amber-400' : 
                                                        'text-rose-400'
                                                    }`}>
                                                        {user.trust_score}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-2 group-hover/item:translate-x-0">
                                                <button 
                                                    onClick={() => handleRecalculate(user.user_id)}
                                                    disabled={actionLoading === user.user_id}
                                                    className="p-2.5 bg-white/5 border border-white/10 text-white hover:text-accent hover:border-accent/50 rounded-xl transition-all active:scale-90"
                                                    title="Recalculate Score"
                                                >
                                                    {actionLoading === user.user_id ? <InfinityLoader /> : <RefreshCcw size={14} />}
                                                </button>
                                                {!user.fraud_flag && (
                                                    <button 
                                                        onClick={() => handleFlagFraud(user.user_id)}
                                                        disabled={actionLoading === `flag-${user.user_id}`}
                                                        className="p-2.5 bg-white/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-xl transition-all active:scale-90"
                                                        title="Flag as Fraud"
                                                    >
                                                        {actionLoading === `flag-${user.user_id}` ? <InfinityLoader /> : <UserX size={14} />}
                                                    </button>
                                                )}
                                                <a 
                                                    href={`/admin/users?search=${user.email}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2.5 bg-white/5 border border-white/10 text-white hover:text-accent hover:border-accent/50 rounded-xl transition-all active:scale-90"
                                                    title="View Profile"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-accent/5 border border-accent/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest mb-1.5">
                                    <ShieldAlert size={14} /> Intelligence Advice
                                </div>
                                <p className="text-white/50 text-[10px] leading-relaxed">
                                    Shared <strong>{selectedCluster.type}</strong> signals indicate a very high probability of Sybil behavior. 
                                    Platform policies suggest bulk monitoring or immediate restriction for clusters with critical link weights.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="border border-white/10 border-dashed rounded-[32px] h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                            <div className="mb-6">
                                <img src="/Icons/icons8-trust-80.png" alt="Select" className="w-16 h-16" />
                            </div>
                            <h3 className="text-lg font-bold text-white/40 uppercase tracking-tight">Select a Cluster</h3>
                            <p className="text-white/30 text-xs font-medium max-w-xs mt-2 leading-relaxed">
                                Choose a detected fraud group from the list to analyze shared signals and take moderation actions.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustGraphPage;
