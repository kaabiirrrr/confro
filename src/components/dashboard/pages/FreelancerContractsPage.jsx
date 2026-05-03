import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle,
  IndianRupee, Calendar, MessageCircle, ChevronRight,
  TrendingUp, FileSignature, Zap
} from 'lucide-react';
import { getDirectContracts, getOrCreateConversation } from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import InfinityLoader from '../../common/InfinityLoader';
import { formatINR } from '../../../utils/currencyUtils';

const STATUS_CFG = {
  ACTIVE:      { cls: 'bg-green-500/10 text-green-400 border-green-500/20',    label: 'Active',      dot: 'bg-green-400' },
  IN_PROGRESS: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       label: 'In Progress', dot: 'bg-blue-400' },
  PENDING:     { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Pending',     dot: 'bg-yellow-400' },
  COMPLETED:   { cls: 'bg-white/5 text-white/40 border-white/10',              label: 'Completed',   dot: 'bg-white/30' },
  CANCELLED:   { cls: 'bg-red-500/10 text-red-400 border-red-500/20',          label: 'Cancelled',   dot: 'bg-red-400' },
  DISPUTED:    { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Disputed',    dot: 'bg-orange-400' },
};

const isActive = (s) => ['ACTIVE','IN_PROGRESS','PENDING'].includes((s||'').toUpperCase());
const isDone   = (s) => ['COMPLETED','CANCELLED','DISPUTED'].includes((s||'').toUpperCase());

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const fmtINR = (v) => formatINR(v);

const StatusBadge = ({ status }) => {
  const s = (status || '').toUpperCase();
  const cfg = STATUS_CFG[s] || { cls: 'bg-white/5 text-white/40 border-white/10', label: status, dot: 'bg-white/20' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default function FreelancerContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Use direct-contracts with role=FREELANCER — returns fully populated client data
      const res = await getDirectContracts({ role: 'FREELANCER' });
      const list = res?.data ?? res ?? [];
      setContracts(Array.isArray(list) ? list : []);
    } catch (err) {
      toastApiError(err, 'Could not load contracts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active    = contracts.filter(c => isActive(c.status));
  const completed = contracts.filter(c => isDone(c.status));
  const totalEarned = completed
    .filter(c => (c.status||'').toUpperCase() === 'COMPLETED')
    .reduce((s, c) => s + parseFloat(c.agreed_rate || c.amount || 0), 0);

  const filtered = tab === 'active' ? active : tab === 'completed' ? completed : contracts;

  const [messagingId, setMessagingId] = useState(null);

  const handleMessage = async (clientId) => {
    if (!clientId) { navigate('/freelancer/messages'); return; }
    setMessagingId(clientId);
    try {
      await getOrCreateConversation(clientId);
      navigate('/freelancer/messages');
    } catch {
      navigate('/freelancer/messages');
    } finally {
      setMessagingId(null);
    }
  };

  const TABS = [
    { key: 'all',       label: 'All',       count: contracts.length },
    { key: 'active',    label: 'Active',    count: active.length },
    { key: 'completed', label: 'Completed', count: completed.length },
  ];

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-7 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Contracts</h1>
        <p className="text-white/40 text-sm mt-1">Track and manage all your client contracts</p>
      </div>

      {/* Stats */}
      {!loading && contracts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-secondary border border-white/10 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
              <Zap size={17} className="text-green-400" />
            </div>
            <p className="text-white/40 text-xs mb-1">Active Contracts</p>
            <p className="text-2xl font-bold text-green-400">{active.length}</p>
          </div>
          <div className="bg-secondary border border-white/10 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 size={17} className="text-blue-400" />
            </div>
            <p className="text-white/40 text-xs mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">{completed.filter(c => (c.status||'').toUpperCase() === 'COMPLETED').length}</p>
          </div>
          <div className="bg-secondary border border-white/10 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <TrendingUp size={17} className="text-accent" />
            </div>
            <p className="text-white/40 text-xs mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-accent">{fmtINR(totalEarned)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex max-sm:justify-between sm:gap-2 border-b border-white/8 pb-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-medium transition border-b-2 -mb-px ${tab === t.key ? 'border-accent text-accent' : 'border-transparent text-white/40 hover:text-white'}`}>
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/30'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-secondary border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-48" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-secondary border border-white/5 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FileSignature size={28} className="text-white/20" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            {tab === 'active' ? 'No active contracts' : tab === 'completed' ? 'No completed contracts yet' : 'No contracts yet'}
          </h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm">
            {tab === 'all' ? 'Once you accept a job offer, your contracts will appear here.' : `No ${tab} contracts to show.`}
          </p>
          {tab !== 'completed' && (
            <button onClick={() => navigate('/freelancer/find-work')}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition">
              Find Work <ChevronRight size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(contract => {
            // Handle both API response shapes:
            // direct-contracts: { client: { id, profiles: { name, avatar_url } } }
            // contracts/user:   { client: { name, avatar_url } }
            const clientObj = contract.client || {};
            const clientProfiles = clientObj.profiles || {};
            const clientName = clientProfiles.name || clientObj.name || contract.client_name || 'Client';
            const clientAvatar = clientProfiles.avatar_url || clientObj.avatar_url || null;
            const title = contract.title || contract.job?.title || 'Contract';
            const rate = contract.agreed_rate ?? contract.amount;
            const rawType = contract.project_type || contract.type || '';
            const type = rawType === 'HOURLY' ? 'Hourly' : rawType === 'FIXED' ? 'Fixed Price' : rawType.replace('_', ' ');
            const startDate = fmtDate(contract.start_date);
            const endDate = fmtDate(contract.end_date);

            return (
              <div key={contract.id}
                className="bg-secondary border border-white/10 rounded-2xl p-5 hover:border-white/20 transition group"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Client avatar */}
                    <div className="shrink-0 mt-0.5">
                      {clientAvatar
                        ? <img src={clientAvatar} alt={clientName} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" />
                        : <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold ring-2 ring-white/10">{clientName[0]?.toUpperCase()}</div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-semibold text-white group-hover:text-accent transition truncate">{title}</h3>
                        <StatusBadge status={contract.status} />
                        {type && (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/8 text-white/30 text-[10px] rounded-full uppercase tracking-wide">{type}</span>
                        )}
                      </div>

                      {/* Client name */}
                      <p className="text-white/40 text-sm mb-3">with {clientName}</p>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-4 text-xs text-white/30">
                        {rate != null && (
                          <span className="flex items-center gap-1 text-accent font-semibold text-sm">
                            <IndianRupee size={13} />{fmtINR(rate)}{rawType === 'HOURLY' ? '/hr' : ''}
                          </span>
                        )}
                        {startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> Started {startDate}
                          </span>
                        )}
                        {endDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> Ends {endDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 mt-1">
                    <button
                      onClick={() => handleMessage(contract.client?.id)}
                      disabled={messagingId === contract.client?.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition disabled:opacity-50"
                    >
                      {messagingId === contract.client?.id
                        ? <InfinityLoader size={20} />
                        : <MessageCircle size={13} />
                      }
                      Message
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
}
