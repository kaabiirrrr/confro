import React, { useState, useEffect } from 'react';
import { Download, PieChart, Loader2 } from 'lucide-react';
import { generateCustomPDF } from '../../../../../utils/pdfGenerator';
import api from '../../../../../lib/api';

const Spending = () => {
  const [spendingData, setSpendingData] = useState({
    totalSpentYear: "0.00",
    activeContracts: "0",
    totalHoursBilled: "0 hrs"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await api.get('/api/reports/client/spending');
        
        if (data.success && data.data) {
          setSpendingData({
            totalSpentYear: Number(data.data.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            activeContracts: (data.data.activeContracts || 0).toString(),
            totalHoursBilled: `${data.data.totalHoursBilled || 0} hrs`
          });
        }
      } catch (error) {
        console.error("Failed to fetch spending data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const handleDownload = async () => {
    const tableColumns = ["Category", "Total Spent", "Percentage"];
    const tableRows = [
      ["Development & IT", "₹1,200.00", "75%"],
      ["Design", "₹400.00", "25%"]
    ];

    const summaryRows = [
      ["Total spent this year", `₹${spendingData.totalSpentYear}`],
      ["Active contracts", spendingData.activeContracts.toString()],
      ["Total hours billed", spendingData.totalHoursBilled]
    ];

    await generateCustomPDF({
      filename: "spending_by_activity.pdf",
      title: "Spending by Activity",
      tableColumns,
      tableRows,
      summaryRows
    });
  };

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <PieChart size={16} />
                        </div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Fiscal Intelligence</p>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">Expenditure Audit</h1>
                    <p className="text-white/40 text-sm font-medium max-w-xl leading-relaxed">
                        Analyze organizational capital allocation across primary project categories and monitor cumulative fiscal velocity.
                    </p>
                </div>
                <button
                    onClick={handleDownload}
                    className="group relative flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 text-white/40 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95 shadow-xl shadow-black/10"
                >
                    <Download size={16} strokeWidth={2.5} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span>Export Ledger (PDF)</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-secondary/50 border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center min-h-[450px] shadow-2xl shadow-black/20 relative overflow-hidden group">
                    <div className="absolute top-10 left-10 space-y-1">
                        <p className="text-[10px] text-accent/40 font-black uppercase tracking-widest">Asset Distribution</p>
                        <h3 className="text-white font-bold text-lg tracking-tight">Spending Breakdown</h3>
                    </div>

                    <div className="w-full flex flex-col md:flex-row items-center gap-16 relative z-10 px-4">
                        <div className="relative w-56 h-56 rounded-full border-[18px] border-accent/5 flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-700">
                             <div className="absolute w-[224px] h-[224px] rounded-full border-[18px] border-accent border-r-transparent border-t-transparent -rotate-45 opacity-80 shadow-[0_0_20px_rgba(6,182,212,0.2)]"></div>
                             <span className="text-3xl font-black text-white tracking-tighter">₹{spendingData.totalSpentYear}</span>
                             <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Aggregate Yield</span>
                        </div>
                        
                        <div className="flex-1 space-y-8 w-full">
                           <div className="w-full space-y-4">
                             <div className="flex justify-between items-end">
                               <div className="space-y-1.5">
                                 <div className="flex items-center gap-2">
                                     <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                     <span className="text-white font-bold text-xs uppercase tracking-wider">Contracts & Operational Fees</span>
                                 </div>
                                 <p className="text-white/20 text-[10px] font-black uppercase tracking-widest pl-4">Verified Network Transfers</p>
                               </div>
                               <div className="text-right">
                                   <span className="text-white font-black text-sm tracking-tight">₹{spendingData.totalSpentYear}</span>
                                   <span className="text-accent/40 text-[9px] font-black uppercase tracking-widest ml-2">(100%)</span>
                               </div>
                             </div>
                             <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                                 <div className="bg-accent h-full rounded-full w-full shadow-[0_0_15px_rgba(6,182,212,0.3)]"></div>
                             </div>
                           </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-[100px] group-hover:bg-accent/10 transition-colors" />
                </div>
                
                <div className="bg-secondary/40 border border-white/5 rounded-[2rem] p-10 h-fit shadow-2xl shadow-black/20 space-y-10">
                    <div className="space-y-1.5 pb-6 border-b border-white/5">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Global Overview</p>
                        <h3 className="text-white font-bold text-lg tracking-tight">Executive Summary</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="group flex justify-between items-center py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                          <div className="space-y-1">
                            <span className="text-white/30 text-[9px] font-black uppercase tracking-widest block">Annual Output</span>
                            <span className="text-white/70 text-xs font-bold uppercase tracking-tight">Total spent this year</span>
                          </div>
                          <span className="text-white font-black text-base tracking-tight group-hover:text-accent transition-colors">₹{spendingData.totalSpentYear}</span>
                        </div>
                        <div className="group flex justify-between items-center py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                          <div className="space-y-1">
                            <span className="text-white/30 text-[9px] font-black uppercase tracking-widest block">Active Nodes</span>
                            <span className="text-white/70 text-xs font-bold uppercase tracking-tight">Active contracts</span>
                          </div>
                          <span className="text-white font-black text-base tracking-tight group-hover:text-accent transition-colors">{spendingData.activeContracts}</span>
                        </div>
                        <div className="group flex justify-between items-center py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                          <div className="space-y-1">
                            <span className="text-white/30 text-[9px] font-black uppercase tracking-widest block">Temporal Intake</span>
                            <span className="text-white/70 text-xs font-bold uppercase tracking-tight">Total hours billed</span>
                          </div>
                          <span className="text-white font-black text-base tracking-tight group-hover:text-accent transition-colors">{spendingData.totalHoursBilled}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Spending;

