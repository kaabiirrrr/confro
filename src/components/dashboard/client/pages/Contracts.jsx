import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, Clock, CheckCircle, AlertCircle, DollarSign, Loader2, MessageCircle } from 'lucide-react';
import { getMyContracts } from '../../../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Avatar from '../../../Avatar';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { formatINR } from '../../../../utils/currencyUtils';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';
import Tabs from '../../../ui/Tabs';

const STATUS_BADGE = {
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
  COMPLETED: 'bg-white/5 text-white/40 border-white/10',
  DISPUTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { loadContracts(); }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const res = await getMyContracts();
      if (res.success) setContracts(res.data || []);
    } catch (err) {
      toastApiError(err, 'Failed to load contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'DISPUTED', label: 'Disputed' },
  ];

  const filtered = activeTab === 'all' ? contracts : contracts.filter(c => c.status === activeTab);
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const formatAmount = a => a ? formatINR(a) : '—';

  return (
    <div className="max-w-[1500px] mx-auto py-6 sm:py-8 text-light-text font-sans tracking-tight animate-in fade-in duration-700">
      <div className="space-y-1 mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Contracts</h1>
        <p className="text-[13px] text-light-text/70">{contracts.length} contract{contracts.length !== 1 ? 's' : ''} active or historical</p>
      </div>

      {/* Tabs System - Premium Underlined Style */}
      <Tabs
        tabs={tabs.map(t => ({
          ...t,
          count: t.key === 'all' ? contracts.length : contracts.filter(c => c.status === t.key).length
        }))}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-transparent border border-white/10 rounded-2xl text-center shadow-lg">
          <FileSignature className="w-12 h-12 text-light-text/20 mb-6" />
          <h3 className="text-lg font-semibold text-white mb-2">No contracts yet</h3>
          <p className="text-light-text/50 text-base mb-8 max-w-md mx-auto">
            Accept a proposal to create a contract and start working with talent.
          </p>
          <Button 
            onClick={() => navigate('/client/jobs')} 
            variant="primary" 
            className="rounded-full px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
          >
            Manage your jobs →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(contract => {
            const badge = STATUS_BADGE[contract.status] || 'bg-white/5 text-white/40 border-white/10';
            const freelancer = contract.freelancer || contract.profiles;
            const freelancerName = freelancer?.name || contract.freelancerName || 'Unknown Freelancer';
            const freelancerAvatar = freelancer?.avatar_url || contract.freelancerImage || null;
            const contractTitle = contract.title || contract.job?.title || 'Untitled Contract';

            return (
              <div key={contract.id} className="bg-transparent border border-white/10 rounded-2xl p-6 hover:border-accent/40 transition-all shadow-sm group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={freelancerAvatar} 
                      name={freelancerName} 
                      size="w-12 h-12"
                      className="ring-2 ring-border group-hover:ring-accent/40 group-active:ring-accent transition-all duration-300" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-white font-semibold text-base truncate group-hover:text-accent transition-colors tracking-tight">
                          {contractTitle}
                        </h3>
                        <span className={`md:hidden px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-widest shrink-0 ${badge}`}>
                          {contract.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-light-text/60 text-sm font-medium">{freelancerName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-light-text/30">ID: {contract.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 self-end md:self-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shrink-0 ${badge}`}>
                      {contract.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Contract Value</span>
                    <span className="text-sm font-semibold text-white">{formatAmount(contract.amount || contract.agreed_rate)}</span>
                  </div>
                  <div className="flex flex-col items-end md:items-start text-right md:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Start Date</span>
                    <span className="text-sm font-semibold text-white">{formatDate(contract.start_date || contract.created_at)}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Estimated End</span>
                    <span className="text-sm font-semibold text-white">{formatDate(contract.end_date)}</span>
                  </div>
                  <div className="flex flex-col items-end md:items-start text-right md:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mb-1">Last Updated</span>
                    <span className="text-sm font-semibold text-white">{formatDate(contract.updated_at || contract.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-6 gap-3">
                  <button
                    onClick={() => navigate('/client/messages')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-9 bg-white/[0.02] text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-sm"
                  >
                    <MessageCircle size={14} /> Message
                  </button>
                  <button
                    onClick={() => navigate(`/client/contracts/${contract.id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-9 bg-accent text-white border border-accent rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                  >
                    View Details
                  </button>
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