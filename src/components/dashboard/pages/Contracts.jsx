import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  ExternalLink,
  User
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';
import { getMyContracts } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import Avatar from '../../Avatar';
import InfinityLoader from '../../common/InfinityLoader';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
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
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filter === 'ACTIVE') return c.status === 'ACTIVE' || c.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return c.status === 'COMPLETED';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DISPUTED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader size={20} />
        <p className="text-light-text/60 animate-pulse">Loading your contracts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col gap-1 mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-[22px] font-bold text-white tracking-tight leading-tight">My Contracts</h1>
        <p className="text-light-text/60 text-[11px] sm:text-[13px] font-medium tracking-tight">Manage your active and past work assignments in one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 sm:gap-10 border-b border-white/5 w-full overflow-x-auto no-scrollbar">
        {['ACTIVE', 'COMPLETED', 'ALL'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-2 sm:pb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap group/tab ${filter === f ? 'text-accent' : 'text-light-text/20 hover:text-white'}`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
            {filter === f ? (
              <motion.div layoutId="activeTabContracts" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent rounded-full" />
            ) : (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent/0 group-hover/tab:bg-accent/40 transition-all duration-300 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {filteredContracts.length === 0 ? (
        <div className="bg-transparent border border-white/10 rounded-2xl p-8 sm:p-16 text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-transparent rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="w-7 h-7 sm:w-10 sm:h-10 text-white/10" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No contracts found</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto mb-6 sm:mb-8 leading-relaxed">
            You don't have any {filter.toLowerCase()} contracts at the moment. Once you accept an offer, it will appear here.
          </p>
          <button
            onClick={() => navigate('/freelancer/find-work')}
            className="px-5 h-9 bg-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition shadow-lg shadow-accent/20"
          >
            Find Work
          </button>
        </div>
      ) : (
        <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {filteredContracts.map((contract) => {
            const clientName = contract.client?.name || 'Client';
            const clientAvatar = contract.client?.avatar_url;

            return (
              <div key={contract.id} className="p-4 sm:p-6 hover:bg-white/[0.02] transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-center">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${getStatusColor(contract.status)} bg-transparent`}>
                        {contract.status === 'IN_PROGRESS' ? 'Active' : contract.status}
                      </div>
                      <div className="flex items-center gap-1.5 text-light-text/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                        <Clock size={11} className="text-accent/30" />
                        Started {formatDate(contract.start_date || contract.created_at)}
                      </div>
                    </div>

                    <h2 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight truncate">
                      {contract.job?.title || 'Creative Project'}
                    </h2>

                    <div className="flex flex-wrap gap-5 sm:gap-10 items-center">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {clientAvatar
                          ? <img src={clientAvatar} alt={clientName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                          : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{clientName[0]}</div>
                        }
                        <div>
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Client</p>
                          <p className="text-[13px] font-bold text-white">{clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent rounded-xl flex items-center justify-center">
                          <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-[9px] text-light-text/20 font-bold uppercase tracking-widest mb-0.5">Budget</p>
                          <p className="text-[13px] font-bold text-white tracking-tight">{formatINR(contract.agreed_rate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 lg:min-w-[240px]">
                    <button
                      onClick={() => navigate('/freelancer/messages')}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg text-white text-[11px] font-bold uppercase tracking-widest transition active:scale-[0.98]"
                    >
                      <MessageSquare size={13} className="text-accent" />
                      Message
                    </button>
                    <button
                      onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-accent text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-accent/90 transition shadow-lg shadow-accent/20 active:scale-[0.98]"
                    >
                      Details
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Contracts;
