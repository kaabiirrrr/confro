import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  FileText,
  Clock,
  TrendingUp,
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
  const [statsRange, setStatsRange] = useState('ALL'); // ALL, MONTH
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
    const matchesSearch = (c.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

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
        <InfinityLoader/>
        <p className="text-light-text/60 animate-pulse">Loading contract history...</p>
      </div>
    );
  }

  const getFilteredEarnings = () => {
    let filtered = contracts.filter(c => c.status === 'COMPLETED');
    if (statsRange === 'MONTH') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(c => new Date(c.end_date || c.updated_at) >= firstDay);
    }
    return filtered.reduce((sum, c) => sum + Number(c.agreed_rate || 0), 0);
  };

  const totalEarnings = getFilteredEarnings();

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col gap-1 mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-[22px] font-bold text-white tracking-tight leading-tight">Contract History</h1>
        <p className="text-light-text/60 text-[11px] sm:text-[13px] font-medium tracking-tight">A complete record of your work on the platform.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="border border-slate-200 dark:border-white/5 rounded-2xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 whitespace-nowrap">Total Revenue</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatINR(totalEarnings)}</p>
          <div className="flex items-center gap-1 mt-2 text-[8px] sm:text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest leading-tight">
            <TrendingUp size={9} /> <span className="hidden xs:inline">+12% this month</span><span className="xs:hidden">+12%</span>
          </div>
        </div>
        <div className="border border-slate-200 dark:border-white/5 rounded-2xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 whitespace-nowrap">Active Projects</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{contracts.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS').length}</p>
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-light-text/20 uppercase tracking-widest mt-2 leading-tight">In progress</p>
        </div>
        <div className="border border-slate-200 dark:border-white/5 rounded-2xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 whitespace-nowrap">Completed</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{contracts.filter(c => c.status === 'COMPLETED').length}</p>
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-light-text/20 uppercase tracking-widest mt-2 leading-tight">Delivered</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-10 border-b border-white/5 w-full">
        {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 sm:flex-initial pb-2 sm:pb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap group/tab ${filter === f ? 'text-accent' : 'text-light-text/20 hover:text-white'}`}
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

      {/* Search */}
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-light-text/20 group-focus-within:text-accent transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by job title or client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-light-text/20 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all text-xs sm:text-sm"
        />
      </div>

      {filteredContracts.length === 0 ? (
        <div className="p-8 sm:p-16 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <img src="/ChatGPT Image May 24, 2026, 10_33_47 PM.png" alt="No history" className="w-40 h-40 object-contain" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No history found</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            {searchTerm ? 'No contracts match your search criteria.' : "You haven't completed any contracts yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredContracts.map((contract) => {
            const client = contract.client || {};
            const clientName = client.name || 'Client';
            const clientAvatar = client.avatar_url;
            const milestonesDone = contract.milestones?.filter(m => m.status === 'PAID').length ?? 0;
            const milestonesTotal = contract.milestones?.length ?? 0;

            return (
              <div
                key={contract.id}
                onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                className="border border-slate-200 dark:border-white/5 rounded-2xl bg-transparent hover:border-accent dark:hover:border-accent transition-all duration-300 cursor-pointer group p-4 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-center">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                    <div className="flex items-start sm:items-center justify-between sm:justify-start w-full gap-3 sm:gap-4">
                      <span className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shrink-0 mt-0.5 sm:mt-0 ${contract.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : contract.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {contract.status === 'IN_PROGRESS' ? 'Active' : contract.status}
                      </span>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 text-right sm:text-left">
                        <div className="flex items-center gap-1.5 text-light-text/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                          <Clock size={11} className="text-accent/30" />
                          Started {formatDate(contract.start_date || contract.created_at)}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-1.5 text-light-text/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                          <FileText size={11} className="text-accent/30" />
                          ID: {contract.id?.substring(0, 8).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight truncate">
                        {contract.job?.title || 'Contract'}
                      </h2>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 lg:gap-10">
                      <div className="flex items-center justify-between w-full md:w-auto md:gap-6 lg:gap-10">
                        {/* Client */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          {clientAvatar
                            ? <img src={clientAvatar} alt={clientName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" />
                            : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">{clientName[0]?.toUpperCase()}</div>
                          }
                          <div className="min-w-0">
                            <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Client</p>
                            <p className="text-[12px] sm:text-[13px] font-bold text-white truncate">{clientName}</p>
                          </div>
                        </div>
                        {/* Budget */}
                        <div className="text-right md:text-left">
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Budget</p>
                          <p className="text-[12px] sm:text-[13px] font-bold text-white tracking-tight">{formatINR(contract.agreed_rate)}</p>
                        </div>
                      </div>

                      {contract.end_date && (
                        <div>
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Ended</p>
                          <p className="text-[12px] sm:text-[13px] font-bold text-white tracking-tight">{formatDate(contract.end_date)}</p>
                        </div>
                      )}

                      {contract.payment_status && (
                        <div>
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Payment</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${contract.payment_status === 'ESCROW_FUNDED' || contract.payment_status === 'PAID' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                            <p className="text-[12px] sm:text-[13px] font-bold text-white tracking-tight capitalize">{contract.payment_status.replace(/_/g, ' ').toLowerCase()}</p>
                          </div>
                        </div>
                      )}

                      {contract.project_type && (
                        <div>
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Type</p>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/50">
                            {contract.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-2 sm:gap-3 lg:min-w-[160px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/contracts/${contract.id}`); }}
                      className="flex-1 h-9 flex items-center justify-center bg-accent text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-accent/90 transition active:scale-[0.98]"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
