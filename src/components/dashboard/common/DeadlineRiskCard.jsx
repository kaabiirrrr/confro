import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Zap, Info, ChevronRight, Sparkles } from 'lucide-react';
import { getDeadlineRisk, getContractDeadlineRisk } from '../../../services/apiService';

const DeadlineRiskCard = ({ jobId, contractId, title = "Deadline Failure Prediction" }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!jobId && !contractId) return;
        setLoading(true);
        
        const fetchRisk = jobId ? getDeadlineRisk(jobId) : getContractDeadlineRisk(contractId);
        
        fetchRisk
            .then(res => setData(res.data))
            .catch(err => console.error("Risk fetch error:", err))
            .finally(() => setLoading(false));
    }, [jobId, contractId]);

    if (loading) {
        return (
            <div className="bg-secondary/40 border border-white/5 rounded-2xl p-6 h-[200px] animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-12 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
        );
    }

    if (!data) return null;

    const { probability, risk_level, ai_analysis } = data;
    
    const colors = {
        low: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            progress: 'bg-emerald-500',
            shadow: 'shadow-emerald-500/10',
            icon: ShieldCheck
        },
        medium: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            progress: 'bg-amber-500',
            shadow: 'shadow-amber-500/10',
            icon: Info
        },
        high: {
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            text: 'text-rose-500',
            progress: 'bg-rose-500',
            shadow: 'shadow-rose-500/10',
            icon: AlertTriangle
        }
    };

    const config = colors[risk_level] || colors.medium;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden bg-secondary/60 border ${config.border} rounded-2xl p-6 transition-all duration-500 ${isHovered ? 'shadow-2xl ' + config.shadow : ''}`}
        >
            {/* Background Gradient */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-700 ${config.bg}`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${config.border} ${config.bg}`}>
                            <Icon size={18} className={config.text} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">AI Assessment Control</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${config.bg} ${config.text} ${config.border}`}>
                        {risk_level} Risk
                    </div>
                </div>

                {/* Probability Gauge */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Failure Probability</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black tabular-nums tracking-tighter ${config.text}`}>
                                {probability}%
                            </span>
                            <span className="text-white/20 text-xs font-bold font-sans">%</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${probability}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={`h-full ${config.progress} relative shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/40 blur-[2px]" />
                        </motion.div>
                    </div>
                </div>

                {/* AI Insights Section */}
                <AnimatePresence>
                    {ai_analysis && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-white/5"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={12} className="text-accent" />
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">AI Summary</span>
                                </div>
                                <p className="text-[13px] text-white/70 leading-relaxed font-medium line-clamp-3 hover:line-clamp-none transition-all duration-300 decoration-accent/20">
                                    {ai_analysis.summary}
                                </p>
                            </div>

                            <motion.div 
                                className={`p-4 rounded-xl border border-white/5 bg-white/[0.02] group/suggestion cursor-default`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-accent/10 rounded-lg shrink-0 mt-0.5 group-hover/suggestion:scale-110 transition-transform">
                                        <Zap size={14} className="text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Expert Suggestion</p>
                                        <p className="text-[12px] text-white/50 leading-snug group-hover/suggestion:text-white/80 transition-colors">
                                            {ai_analysis.suggestion}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 flex justify-center">
                    <button className="text-[9px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center gap-2 group">
                        Detailed Analytics Report <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DeadlineRiskCard;
