import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DemoBadge = () => {
    if (import.meta.env.VITE_ESCROW_MODE !== 'FAKE') return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/30 animate-pulse transition-all hover:scale-105 group cursor-default">
            <div className="bg-white/20 p-1.5 rounded-full">
                <ShieldAlert size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 leading-none">Demo Mode</span>
                <span className="text-[12px] font-bold text-white leading-tight">Fake Escrow Active</span>
            </div>
        </div>
    );
};

export default DemoBadge;
