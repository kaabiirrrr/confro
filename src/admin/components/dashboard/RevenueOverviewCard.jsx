import React from 'react';
import { MoreHorizontal, ArrowUpRight, TrendingUp } from 'lucide-react';
import SalesGauge from './SalesGauge';
import { formatINR } from '../../../utils/currencyUtils';

const RevenueOverviewCard = ({ 
  totalCommission = 0, 
  totalRevenue = 0, 
  growth = 0,
  commissionTrend = "+0%",
  revenueTrend = "+0%"
}) => {
  return (
    <div className="bg-transparent border border-white/5 rounded-[32px] p-8 shadow-sm hover:border-white/10 transition-all group flex flex-col h-full relative overflow-hidden">
      {/* Glossy Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-700"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-40">
          Revenue Overview
        </h3>
        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <SalesGauge percentage={growth} label="Revenue Growth" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {/* Total Commission */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition-all">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Commission</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white tracking-tighter">
              ₹{(totalCommission / 1000).toFixed(1)}k
            </span>
            <div className={`px-2 py-0.5 rounded-full ${parseFloat(commissionTrend) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-[9px] font-black uppercase tracking-tighter`}>
              {commissionTrend}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition-all">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Revenue</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white tracking-tighter">
              ₹{(totalRevenue / 1000).toFixed(1)}k
            </span>
            <div className={`px-2 py-0.5 rounded-full ${parseFloat(revenueTrend) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} text-[9px] font-black flex items-center gap-1 uppercase tracking-tighter`}>
              <TrendingUp size={8} />
              {revenueTrend}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverviewCard;
