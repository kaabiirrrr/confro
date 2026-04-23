import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  FileText,
  Calendar,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  Download,
  X
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';
import { getMyContracts } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import Avatar from '../../Avatar';
import InfinityLoader from '../../common/InfinityLoader';

const ContractHistory = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('hideEarningsBanner') !== 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await getMyContracts();
      if (response.success) {
        setContracts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contract history');
    } finally {
      setLoading(false);
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
    localStorage.setItem('hideEarningsBanner', 'true');
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = (c.jobs?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client?.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'ALL' ||
      (filter === 'ACTIVE' && (c.status === 'ACTIVE' || c.status === 'IN_PROGRESS')) ||
      (filter === 'COMPLETED' && c.status === 'COMPLETED');

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader size={20} />
        <p className="text-light-text/60 animate-pulse">Loading contract history...</p>
      </div>
    );
  }

  const totalEarnings = contracts
    .filter(c => c.status === 'COMPLETED')
    .reduce((sum, c) => sum + Number(c.agreed_rate || 0), 0);

  return (
    <div className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Contract History</h1>
        <p className="text-light-text/60 text-xs sm:text-sm mt-1">A complete record of your work on the platform.</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 sm:space-y-6">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-light-text/20 group-focus-within:text-accent transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by job title or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-transparent border border-white/5 rounded-xl sm:rounded-2xl text-white placeholder-light-text/20 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-5 sm:gap-10 border-b border-white/5 w-full overflow-x-auto no-scrollbar">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 sm:pb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap group/tab ${filter === f ? 'text-accent' : 'text-light-text/20 hover:text-white'}`}
            >
              {f === 'ALL' ? 'All Projects' : f === 'ACTIVE' ? 'In-Progress' : 'Completed'}
              {filter === f ? (
                <motion.div layoutId="activeTabHistory" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent rounded-full" />
              ) : (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent/0 group-hover/tab:bg-accent/40 transition-all duration-300 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredContracts.length === 0 ? (
        <div className="border border-white/5 rounded-2xl p-8 sm:p-16 text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-transparent rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <History className="w-7 h-7 sm:w-10 sm:h-10 text-white/10" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No history found</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            {searchTerm ? 'No contracts match your search criteria.' : "You haven't completed any contracts yet."}
          </p>
        </div>
      ) : (
        <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-transparent">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] border-b border-white/5">Project & Client</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] border-b border-white/5">Status</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] border-b border-white/5 hidden sm:table-cell">Started</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] border-b border-white/5 hidden sm:table-cell">Ended</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-[9px] sm:text-[10px] font-bold text-light-text/40 uppercase tracking-[0.3em] border-b border-white/5 text-right">Amount</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 border-b border-white/5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredContracts.map((contract) => {
                  const client = contract.client || {};
                  const clientName = client.name || 'Client';
                  const clientAvatar = client.avatar_url;

                  return (
                    <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {clientAvatar
                            ? <img src={clientAvatar} alt={clientName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-lg flex-shrink-0" />
                            : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">{clientName[0]?.toUpperCase()}</div>
                          }
                          <div className="min-w-0">
                            <p className="text-white font-bold transition-colors truncate max-w-[120px] sm:max-w-[200px] tracking-tight text-xs sm:text-sm">
                              {contract.jobs?.title || 'Contract'}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-light-text/30 font-bold uppercase tracking-widest">with {clientName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <div className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${contract.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {contract.status === 'IN_PROGRESS' ? 'Active' : contract.status}
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-[11px] sm:text-[13px] text-light-text/50 font-medium hidden sm:table-cell">
                        {formatDate(contract.start_date || contract.created_at)}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-[11px] sm:text-[13px] text-light-text/50 font-medium hidden sm:table-cell">
                        {contract.end_date ? formatDate(contract.end_date) : 'Ongoing'}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                        <p className="text-white font-bold text-sm sm:text-[16px] tracking-tight">{formatINR(contract.agreed_rate)}</p>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <button
                          onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent rounded-xl transition-all text-light-text/30 hover:text-white active:scale-95"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lifetime Earnings Banner */}
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-sky-500 to-sky-600 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 mt-8 sm:mt-12 group cursor-default overflow-hidden"
        >
          <div className="relative z-10 max-w-lg">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2 sm:mb-3">
              Total Lifetime Earnings
            </h2>
            <p className="text-white/80 text-xs sm:text-[15px] font-medium leading-relaxed mb-5 sm:mb-8">
              Congratulations! You've unlocked <span className="text-white font-bold">{formatINR(totalEarnings)}</span> through your work on the platform.
            </p>
            <button 
              onClick={() => navigate('/freelancer/earnings')}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-sky-600 font-bold text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-sky-50 transition shadow-xl shadow-sky-900/20 active:scale-95"
            >
              View Earnings Detail
            </button>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[160px] sm:w-[300px] h-[160px] sm:h-[300px] opacity-100 pointer-events-none z-20">
            <img src="/Coin.png" alt="Earnings" className="w-full h-full object-contain" />
          </div>
          <button onClick={closeBanner} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ContractHistory;
