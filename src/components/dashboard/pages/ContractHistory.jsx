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
  X,
  Zap,
  CheckCircle2
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
    <div className="max-w-[1500px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in px-4 sm:ml-10 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Contract History</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">A complete record of your work on the platform.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
        <div className="border border-slate-200 dark:border-white/5 rounded-xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 leading-tight">Total Revenue</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatINR(totalEarnings)}</p>
          <div className="flex items-center gap-1 mt-2 text-[8px] sm:text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest leading-tight">
            <TrendingUp size={9} /> <span className="hidden xs:inline">+12% this month</span><span className="xs:hidden">+12%</span>
          </div>
        </div>
        <div className="border border-slate-200 dark:border-white/5 rounded-xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 leading-tight">Active Projects</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{contracts.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS').length}</p>
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-light-text/20 uppercase tracking-widest mt-2 leading-tight">In progress</p>
        </div>
        <div className="border border-slate-200 dark:border-white/5 rounded-xl px-3 sm:px-6 py-3 sm:py-5">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-light-text/30 mb-2 leading-tight">Completed</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{contracts.filter(c => c.status === 'COMPLETED').length}</p>
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-light-text/20 uppercase tracking-widest mt-2 leading-tight">Delivered</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center justify-start gap-6 sm:gap-10 border-b border-slate-200 dark:border-white/5 lg:border-none overflow-x-auto no-scrollbar lg:pt-2 w-full lg:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-2 sm:pb-3 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap group/tab ${filter === f ? 'text-accent' : 'text-slate-400 dark:text-light-text/20 hover:text-slate-700 dark:hover:text-white'}`}
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

        <div className="relative group w-full lg:w-[520px]">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-light-text/20 group-focus-within:text-accent transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by job title or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-2.5 sm:py-3.5 bg-transparent border border-slate-200 dark:border-white/5 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-light-text/20 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all text-xs sm:text-sm"
          />
        </div>
      </div>

      {filteredContracts.length === 0 ? (
        <div className="p-8 sm:p-16 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <img src="/ChatGPT Image May 24, 2026, 10_33_47 PM.png" alt="No history" className="w-40 h-40 object-contain" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No history found</h3>
          <p className="text-slate-400 dark:text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            {searchTerm ? 'No contracts match your search criteria.' : "You haven't completed any contracts yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
                className="border border-slate-200 dark:border-white/10 rounded-xl bg-transparent hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-200 cursor-pointer group p-4 sm:p-5"
              >
                {/* Top row: avatar + title + earnings */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {clientAvatar
                      ? <img src={clientAvatar} alt={clientName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">{clientName[0]?.toUpperCase()}</div>
                    }
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white font-bold text-sm tracking-tight truncate max-w-[180px] sm:max-w-[320px] group-hover:text-accent transition-colors">
                        {contract.job?.title || 'Contract'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-light-text/30 font-bold uppercase tracking-widest mt-0.5">with {clientName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{formatINR(contract.agreed_rate)}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${contract.payment_status === 'PAID' ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                      {contract.payment_status?.replace(/_/g, ' ') || 'In Escrow'}
                    </p>
                  </div>
                </div>

                {/* Info chips row */}
                {/* Mobile: justify-between — [status + fixed price] on left, [ID] on right */}
                {/* Desktop (sm+): normal flex-wrap row */}
                <div className="flex items-center justify-between sm:flex-wrap sm:justify-start gap-2 mb-3">
                  {/* Left group on mobile: status badge + project type */}
                  <div className="flex items-center gap-2 sm:contents">
                    {/* Status */}
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${contract.status === 'COMPLETED' ? 'bg-blue-500/15 text-blue-400' : contract.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                      {contract.status === 'IN_PROGRESS' ? 'Active' : contract.status}
                    </span>
                    {/* Project type */}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-accent sm:text-slate-500 sm:dark:text-white/40 sm:bg-white/5 sm:border sm:border-white/10 sm:rounded-full sm:px-2 sm:py-1">
                      {contract.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </span>
                    {/* Milestones — inline on desktop */}
                    {milestonesTotal > 0 && (
                      <span className="hidden sm:inline-flex px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">
                        {milestonesDone}/{milestonesTotal} Milestones
                      </span>
                    )}
                  </div>
                  {/* Milestones — shown on mobile outside the left group */}
                  {milestonesTotal > 0 && (
                    <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-accent">
                      {milestonesDone}/{milestonesTotal} Milestones
                    </span>
                  )}
                  {/* Contract ID — right-aligned on mobile, inline on desktop */}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent sm:text-slate-400 sm:dark:text-white/20 sm:bg-white/5 sm:border sm:border-white/10 sm:rounded-full sm:px-2 sm:py-1 ml-auto sm:ml-0">
                    ID: {contract.id?.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                {/* Bottom row: timeline + extra details */}
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-3 border-t border-slate-200 dark:border-white/5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {/* Timeline */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-0.5">Started</p>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-white/70">{formatDate(contract.start_date || contract.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-0.5">Ended</p>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-white/70">{contract.end_date ? formatDate(contract.end_date) : 'Present'}</p>
                    </div>
                    {/* Last updated */}
                    {contract.updated_at && (
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-0.5">Last Update</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-white/70">{formatDate(contract.updated_at)}</p>
                      </div>
                    )}
                    {/* Connects used */}
                    {contract.connects_used != null && (
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-0.5">Connects Used</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-white/70">{contract.connects_used}</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={15} className="text-slate-300 dark:text-white/20 group-hover:text-accent transition-colors shrink-0" />
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
