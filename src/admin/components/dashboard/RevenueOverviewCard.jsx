import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ArrowUpRight, TrendingUp, Download, FileText, RefreshCcw } from 'lucide-react';
import SalesGauge from './SalesGauge';
import { formatINR } from '../../../utils/currencyUtils';

const RevenueOverviewCard = ({ 
  totalCommission = 0, 
  totalRevenue = 0, 
  growth = 0,
  commissionTrend = "+0%",
  revenueTrend = "+0%",
  onRefresh
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setIsMenuOpen(false);
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    // Keep the "refreshing" feel for a moment
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value', 'Trend'];
    const data = [
      ['Total Commission', totalCommission, commissionTrend],
      ['Total Revenue', totalRevenue, revenueTrend],
      ['Growth', `${growth}%`, 'N/A']
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  };

  // Helper to format small amounts gracefully
  const formatAmount = (amount) => {
    if (amount === 0) return '₹0';
    if (amount < 1) return `₹${amount.toFixed(2)}`;
    if (amount < 1000) return `₹${amount.toFixed(0)}`;
    return `₹${(amount / 1000).toFixed(1)}k`;
  };

  return (
    <div className={`bg-transparent border border-white/5 rounded-2xl p-8 shadow-sm hover:border-white/10 transition-all group flex flex-col h-full relative overflow-hidden ${isRefreshing ? 'animate-pulse pointer-events-none' : ''}`}>
      {isRefreshing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
           <RefreshCcw className="animate-spin text-accent" size={24} />
        </div>
      )}
      {/* Glossy Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-700"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.2em] opacity-40">
          Revenue Overview
        </h3>
        <div className="relative">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-accent transition-all bg-transparent"
            >
                <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                        <button 
                            onClick={() => { navigate('/admin/reports'); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                            <FileText size={14} />
                            Detailed Report
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                        <div className="border-t border-slate-100 dark:border-white/5 my-1" />
                        <button 
                            onClick={handleRefresh}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw size={14} />
                            Reset View
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <SalesGauge percentage={growth} label="Revenue Growth" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {/* Total Commission */}
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Total Commission</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatAmount(totalCommission)}
            </span>
            <div className={`px-2 py-0.5 rounded-full ${parseFloat(commissionTrend) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'} text-[9px] font-black uppercase tracking-tighter border`}>
              {commissionTrend}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Total Revenue</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatAmount(totalRevenue)}
            </span>
            <div className={`px-2 py-0.5 rounded-full ${parseFloat(revenueTrend) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'} text-[9px] font-black flex items-center gap-1 uppercase tracking-tighter border`}>
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
