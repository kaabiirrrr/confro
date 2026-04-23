import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, ShieldAlert, X, Zap } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { getApiUrl } from '../../../utils/authUtils';

const API_URL = getApiUrl();

const InterventionBanner = () => {
    const { user } = useAuth();
    const [interventions, setInterventions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchInterventions = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/interventions/active`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
                });
                if (res.data?.success) {
                    setInterventions(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch interventions", err);
            }
        };

        if (user) {
            fetchInterventions();
            const interval = setInterval(fetchInterventions, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleResolve = async (id) => {
        try {
            await axios.post(`${API_URL}/api/interventions/${id}/resolve`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setInterventions(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error("Failed to resolve intervention", err);
        }
    };

    if (interventions.length === 0) return null;

    const current = interventions[currentIndex];

    // Contextual Label Mapping
    const getLabel = (type) => {
        switch(type) {
            case 'warning': return "Needs Attention";
            case 'client_alert': return "High Delay Risk";
            case 'escalation': return "Critical Escalation";
            default: return "System Alert";
        }
    };

    // Contextual Icon
    const getIcon = (type) => {
        if (type === 'escalation') return <ShieldAlert size={20} className="text-rose-500" />;
        if (type === 'client_alert') return <AlertCircle size={20} className="text-amber-500" />;
        return <Zap size={20} className="text-accent" />;
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key={current.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative group border-b pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden transition-all ${
                    current.priority === 'high' ? 'border-rose-500/20' : 'border-white/5'
                }`}
            >
                <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1">
                    <div className="shrink-0 flex items-center justify-center">
                        {current.priority === 'high' ? (
                            <div className="bg-rose-500/10 text-rose-500 p-2 rounded-lg">
                                <AlertCircle size={14} />
                            </div>
                        ) : (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <img src="/icons8-mail-perfomance-64.png" alt="Connect AI" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>



                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                current.priority === 'high' ? 'text-rose-500' : 'text-accent'
                            }`}>{getLabel(current.type)}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                {current.job?.title || "Active Project"}
                            </span>
                        </div>
                        <h4 className="text-white font-black text-sm sm:text-lg tracking-tight">
                            {current.metadata?.reason === 'inactivity_high_risk' ? 'No updates in 48 hours detected' :
                             current.metadata?.reason === 'deadline_probability_high' ? 'High delay probability detected' :
                             current.metadata?.reason === 'risk_threshold_crossed' ? 'Performance risk threshold crossed' :
                             current.metadata?.reason || 'Project requires monitoring'}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <button 
                        onClick={() => handleResolve(current.id)}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest rounded-full transition-all"
                    >
                        Dismiss
                    </button>
                    <a 
                        href={user?.role === 'FREELANCER' ? `/freelancer/contracts/${current.contract_id}` : `/client/contracts/${current.contract_id}`}
                        className={`h-11 px-6 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
                            current.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-accent text-white'
                        }`}
                    >
                        View Project <ArrowRight size={14} />
                    </a>
                </div>

                {interventions.length > 1 && (
                    <div className="absolute top-2 right-4 flex gap-1">
                        {interventions.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-accent w-4' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default InterventionBanner;
