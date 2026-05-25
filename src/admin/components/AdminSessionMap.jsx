import React, { useState, useEffect } from 'react';
import { Map, ShieldAlert, Wifi, Smartphone, Globe, AlertOctagon } from 'lucide-react';
import { fetchAdmins } from '../../services/adminService';
import InfinityLoader from '../../components/common/InfinityLoader';

const AdminSessionMap = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const response = await fetchAdmins();
            if (response.success && response.data) {
                const mappedSessions = response.data.map((admin) => ({
                    id: admin.id,
                    admin: admin.name || (admin.email ? admin.email.split('@')[0] : 'Unknown'),
                    role: admin.role ? admin.role.replace('_', ' ') : 'ADMIN',
                    ip: admin.last_ip || 'IP Hidden',
                    location: admin.location || 'Location tracking disabled',
                    device: admin.device || 'Device info unavailable',
                    module: admin.current_module || 'Command Center',
                    active: true
                }));
                setSessions(mappedSessions);
            }
        } catch (error) {
            console.error('Failed to load admin sessions', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Lockdown Banner */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className="flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                        <AlertOctagon size={20} />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white mb-0.5">Emergency Lockdown Mode</h2>
                        <p className="text-white/60 text-xs max-w-xl">
                            Instantly freeze all financial transactions, suspend all lower-level admin sessions, and trigger SOC incident response protocols. Use only in critical security events.
                        </p>
                    </div>
                </div>
                <button className="relative z-10 w-full md:w-auto h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95">
                    <ShieldAlert size={16} /> Activate Lockdown
                </button>
            </div>

            <div className="pt-2">
                <div className="flex items-center gap-2 mb-6">
                    <Map size={20} className="text-accent" />
                    <h2 className="text-xl font-bold text-white">Active Admin Sessions</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <InfinityLoader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-transparent border border-white/10 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </div>
                                
                                <div className="mb-3 pr-8">
                                    <h3 className="text-white font-bold text-sm leading-tight">{session.admin}</h3>
                                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{session.role}</span>
                                </div>
                                
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium">
                                        <Globe size={12} className="text-accent/70" />
                                        <span>{session.location} ({session.ip})</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium">
                                        <Smartphone size={12} className="text-accent/70" />
                                        <span>{session.device}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium">
                                        <Wifi size={12} className="text-accent/70" />
                                        <span>Viewing: <span className="text-white font-bold">{session.module}</span></span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
                                        Terminate Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSessionMap;
