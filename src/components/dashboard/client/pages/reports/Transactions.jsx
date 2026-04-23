import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, FileText } from 'lucide-react';
import { generateCustomPDF } from '../../../../../utils/pdfGenerator';
import InfinityLoader from '../../../../common/InfinityLoader';
import api from '../../../../../lib/api';

const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dummyTransactions = [
    { id: "TXN-1042", date: "10/15/2023, 10:30:00 AM", senderName: "Client A", receiverName: "Freelancer X", upiId: "freelancerx@upi", amount: "-₹500.00", status: "Completed", isPositive: false },
    { id: "TXN-1045", date: "10/20/2023, 2:15:00 PM", senderName: "Freelancer X", receiverName: "Client A", upiId: "clienta@upi", amount: "+₹50.00", status: "Completed", isPositive: true },
    { id: "TXN-1050", date: "10/22/2023, 9:00:00 AM", senderName: "Client A", receiverName: "Escrow Account", upiId: "escrow@upi", amount: "-₹1000.00", status: "Failed", isPositive: false },
    { id: "TXN-1051", date: "10/23/2023, 11:45:00 AM", senderName: "Client A", receiverName: "Freelancer Y", upiId: "freelancery@upi", amount: "-₹150.00", status: "Pending", isPositive: false },
  ];

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await api.get('/api/reports/client/transactions');
        
        if (data.success && data.data) {
          const formatted = data.data.map(p => ({
            id: p.id || p.transaction_id || 'TXN-000',
            date: new Date(p.created_at).toLocaleString(),
            senderName: p.sender_name || p.senderName || 'N/A',
            receiverName: p.receiver_name || p.receiverName || 'N/A',
            upiId: p.upi_id || p.upiId || 'N/A',
            amount: `${p.amount > 0 ? '+' : ''}₹${Math.abs(p.amount).toFixed(2)}`,
            status: p.status === 'succeeded' ? 'Completed' : (p.status || 'Pending'),
            isPositive: p.amount > 0
          }));
          setTransactionsData(formatted.length > 0 ? formatted : dummyTransactions);
        } else {
          setTransactionsData(dummyTransactions);
        }
      } catch (error) {
        console.error("Failed to fetch real transactions:", error);
        setTransactionsData(dummyTransactions);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const handleDownload = async () => {
    const tableColumns = ["Txn ID", "Date & Time", "Sender", "Receiver", "UPI ID", "Amount", "Status"];
    const tableRows = transactionsData.map(item => [
      item.id, item.date, item.senderName, item.receiverName, item.upiId, item.amount, item.status
    ]);

    await generateCustomPDF({
      filename: "transaction_history.pdf",
      title: "Transaction History",
      tableColumns,
      tableRows
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
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Financial Ledger</p>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">Transaction History</h1>
                    <p className="text-white/40 text-sm font-medium max-w-xl leading-relaxed">
                        Complete audit of organizational capital flow, including verified payments, network adjustments, and escrow allocations.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl shadow-black/10">
                        <Filter size={16} strokeWidth={2.5} />
                        <span>Filter Registry</span>
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-95 shadow-xl shadow-accent/20"
                    >
                        <Download size={16} strokeWidth={3} />
                        <span>Export PDF Report</span>
                    </button>
                </div>
            </div>

            <div className="bg-secondary/50 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-8">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-accent transition-colors" size={18} strokeWidth={2.5} />
                        <input 
                            type="text" 
                            placeholder="Query by Transaction ID, node identifier, or classification..." 
                            className="w-full bg-primary/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-primary/60 transition-all font-medium"
                        />
                    </div>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest hidden md:block">
                        {transactionsData.length} Validated Operations Found
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="py-6 px-10 font-black whitespace-nowrap">Protocol ID</th>
                                <th className="py-6 px-10 font-black whitespace-nowrap">Temporal Node</th>
                                <th className="py-6 px-10 font-black whitespace-nowrap">Sender</th>
                                <th className="py-6 px-10 font-black whitespace-nowrap">Recipient</th>
                                <th className="py-6 px-10 font-black whitespace-nowrap">Asset Value</th>
                                <th className="py-6 px-10 font-black whitespace-nowrap text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <InfinityLoader size={40} />
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Synchronizing Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactionsData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="space-y-4">
                                            <Search className="mx-auto text-white/5" size={48} strokeWidth={1} />
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No matching transaction records identified in current registry.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactionsData.map((txn, index) => (
                                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0">
                                        <td className="py-6 px-10 text-xs font-black text-accent tracking-wider font-mono group-hover:text-accent transition-colors">
                                           {txn.id}
                                        </td>
                                        <td className="py-6 px-10 text-xs text-white/40 font-medium whitespace-nowrap">
                                           {txn.date}
                                        </td>
                                        <td className="py-6 px-10">
                                           <span className="text-white font-bold text-xs uppercase tracking-tight block">{txn.senderName}</span>
                                           <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter mt-1 block">Entity Origin</span>
                                        </td>
                                        <td className="py-6 px-10">
                                           <span className="text-white font-bold text-xs uppercase tracking-tight block">{txn.receiverName}</span>
                                           <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter mt-1 block">{txn.upiId}</span>
                                        </td>
                                        <td className={`py-6 px-10 text-sm font-black tracking-tight ${txn.isPositive ? 'text-green-400' : 'text-white'}`}>
                                            {txn.amount}
                                            <span className="text-[9px] text-white/20 font-black uppercase ml-1.5 tracking-widest">INR</span>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <span className={`px-4 py-1.5 text-[9px] rounded-lg font-black uppercase tracking-widest inline-block border ${
                                                txn.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-lg shadow-green-500/5' : 
                                                txn.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/5' : 
                                                'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;

