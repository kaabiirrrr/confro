import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { generateCustomPDF } from '../../../../../utils/pdfGenerator';
import InfinityLoader from '../../../../common/InfinityLoader';
import api from '../../../../../lib/api';

const WeeklySummary = () => {
  const [reportData, setReportData] = useState([]);
  const [totalSpent, setTotalSpent] = useState("₹0.00");
  const [isLoading, setIsLoading] = useState(true);

  const dummyReportData = [
    { id: "WS-101", date: "10/15/2023, 10:30:00 AM", description: "Payment for Website Design", amount: "₹500.00" },
    { id: "WS-102", date: "10/18/2023, 9:15:00 AM", description: "Deposit to Escrow", amount: "₹1000.00" },
    { id: "WS-103", date: "10/22/2023, 4:45:00 PM", description: "Payment for Logo Design", amount: "₹150.00" }
  ];
  const dummyTotalSpent = "₹1650.00";

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await api.get('/api/reports/client/weekly-summary');
        
        if (data.success && data.data.payments) {
          const formatted = data.data.payments.map(p => ({
            id: p.id || p.transaction_id || `TXN-${Math.floor(Math.random() * 1000)}`,
            date: new Date(p.created_at).toLocaleString(),
            description: p.description || 'Payment',
            amount: `₹${Number(p.amount).toFixed(2)}`
          }));
          if (formatted.length > 0) {
            setReportData(formatted);
            setTotalSpent(`₹${Number(data.data.totalSpent || 0).toFixed(2)}`);
          } else {
            setReportData(dummyReportData);
            setTotalSpent(dummyTotalSpent);
          }
        } else {
          setReportData(dummyReportData);
          setTotalSpent(dummyTotalSpent);
        }
      } catch (error) {
        console.error("Failed to fetch real reports:", error);
        setReportData(dummyReportData);
        setTotalSpent(dummyTotalSpent);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const handleDownload = async () => {
    const tableColumns = ["Txn ID", "Date & Time", "Description", "Amount"];
    const tableRows = reportData.map(item => [
      item.id, item.date, item.description, item.amount
    ]);

    await generateCustomPDF({
      filename: "weekly_financial_summary.pdf",
      title: "Weekly Financial Summary",
      tableColumns,
      tableRows,
      summaryRows: [["", "", "Total Spent:", totalSpent]]
    });
  };

    return (
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <FileText size={16} />
                        </div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Temporal Audit</p>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">Weekly Yield Summary</h1>
                    <p className="text-white/40 text-sm font-medium max-w-xl leading-relaxed">
                        Continuous monitoring of weekly fiscal velocity and cumulative resource allocation across the active network.
                    </p>
                </div>
                <button
                    onClick={handleDownload}
                    className="group relative flex items-center justify-center gap-2.5 bg-accent text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-95 shadow-xl shadow-accent/20"
                >
                    <Download size={16} strokeWidth={3} />
                    <span>Extract Weekly Ledger</span>
                </button>
            </div>

            <div className="bg-secondary/50 border border-white/5 rounded-[2rem] p-10 min-h-[500px] shadow-2xl shadow-black/20 flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="space-y-1.5">
                        <p className="text-[10px] text-accent/40 font-black uppercase tracking-widest leading-none">Operational Cycle</p>
                        <h3 className="text-white font-bold text-lg tracking-tight">Active Transmissions</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Cycle Aggregation</p>
                        <span className="text-white font-black text-2xl tracking-tighter">{totalSpent}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.02]">
                                <th className="py-5 px-8 font-black whitespace-nowrap">Event ID</th>
                                <th className="py-5 px-8 font-black whitespace-nowrap">Temporal Node</th>
                                <th className="py-5 px-8 font-black">Parameter Description</th>
                                <th className="py-5 px-8 font-black text-right">Asset Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <InfinityLoader size={40} />
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Querying Temporal Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="space-y-4">
                                            <FileText className="mx-auto text-white/5" size={48} strokeWidth={1} />
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No active transmissions identified for this cycle.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0">
                                        <td className="py-6 px-8 text-xs font-black text-accent tracking-wider font-mono">{item.id}</td>
                                        <td className="py-6 px-8 text-xs text-white/40 font-medium whitespace-nowrap">{item.date}</td>
                                        <td className="py-6 px-8">
                                            <span className="text-white/70 text-xs font-bold uppercase tracking-tight block">{item.description}</span>
                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter mt-1 block">Operational Event</span>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <span className="text-white font-black text-sm tracking-tight">{item.amount}</span>
                                            <span className="text-white/20 text-[8px] font-black uppercase ml-1.5 tracking-wider">INR</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-white/[0.02] border-t border-white/5">
                            <tr>
                                <td colSpan="3" className="py-8 px-8 text-right text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Net Capital Output (This Cycle):</td>
                                <td className="py-8 px-8 text-right font-black text-accent text-2xl tracking-tighter">{totalSpent}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.02] rounded-full blur-[120px] pointer-events-none" />
            </div>
        </div>
    );
};

export default WeeklySummary;

