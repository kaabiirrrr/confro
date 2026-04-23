import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, Clock, CheckCircle2, XCircle, AlertCircle, Check, X } from 'lucide-react';
import { getDirectContracts, updateDirectContractStatus } from '../../../services/apiService';
import { toast } from 'react-hot-toast';

const STATUS_CFG = {
  ACTIVE: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: CheckCircle2 },
  PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  COMPLETED: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: CheckCircle2 },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-white/5 text-white/20 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-transparent ${cfg.cls}`}>
      <cfg.Icon size={12} className="opacity-70" />{status}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse bg-transparent border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
    <div className="flex items-center gap-3 md:w-1/4">
      <div className="w-10 h-10 bg-white/10 rounded-full shrink-0" />
      <div className="h-4 bg-white/10 rounded w-28" />
    </div>
    <div className="flex-1 h-4 bg-white/10 rounded w-1/2" />
    <div className="h-6 bg-white/10 rounded-full w-20" />
    <div className="h-4 bg-white/10 rounded w-16" />
  </div>
);

export default function FreelancerDirectContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchContracts = () => {
    setLoading(true);
    getDirectContracts({ role: 'FREELANCER' })
      .then(res => {
        const list = res?.data ?? res ?? [];
        setContracts(Array.isArray(list) ? list : []);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation(); // Prevent card click navigation
    if (updatingId) return;

    setUpdatingId(id);
    const loadingToast = toast.loading(`${newStatus === 'ACTIVE' ? 'Accepting' : 'Rejecting'} contract...`);

    try {
      await updateDirectContractStatus(id, newStatus);
      toast.success(`Contract ${newStatus === 'ACTIVE' ? 'accepted' : 'rejected'} successfully`, { id: loadingToast });
      fetchContracts();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update contract status', { id: loadingToast });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col gap-1 mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight leading-tight">Direct Contracts</h1>
        <p className="text-light-text/60 text-xs sm:text-sm">Contracts sent to you directly by clients</p>
      </div>

      {loading && contracts.length === 0 ? (
        <div className="space-y-3 sm:space-y-4">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 sm:py-24 bg-transparent border border-dashed border-white/10 rounded-2xl text-center px-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-transparent flex items-center justify-center mb-4 sm:mb-6">
            <FileSignature className="w-7 h-7 sm:w-10 sm:h-10 text-white/10" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No direct contracts yet</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            Clients can send you direct contract offers without posting a job. They'll appear here when available.
          </p>
        </div>
      ) : (
        <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {contracts.map(c => {
            const clientProfiles = c.client?.profiles || {};
            const name = clientProfiles.name || c.client?.name || 'Client';
            const avatar = clientProfiles.avatar_url || c.client?.avatar_url || null;
            const rate = c.agreed_rate != null
              ? `$${parseFloat(c.agreed_rate).toLocaleString()}${c.project_type === 'HOURLY' ? '/hr' : ''}`
              : '—';
            const startDate = c.start_date
              ? new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—';

            return (
              <div key={c.id}
                onClick={() => navigate(`/freelancer/direct-contracts/${c.id}`)}
                className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 group"
              >
                {/* Client */}
                <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                  {avatar
                    ? <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0 shadow-lg ring-1 ring-white/10" />
                    : <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">{name[0]?.toUpperCase()}</div>
                  }
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/30 mb-0.5">client</span>
                    <span className="font-bold text-[15px] text-white group-hover:text-accent transition">{name}</span>
                  </div>
                </div>

                {/* Title + type */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white tracking-tight truncate mb-1.5">{c.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-transparent rounded-lg text-[9px] font-bold text-light-text/40 uppercase tracking-widest">
                      {c.project_type === 'HOURLY' ? 'Hourly Rate' : 'Fixed Price'}
                    </span>
                  </div>
                </div>

                {/* Rate */}
                <div className="flex flex-col text-right min-w-[120px]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/20 mb-1">Budget</span>
                  <div className="text-white font-bold text-[16px] tracking-tight group-hover:text-accent transition">{rate}</div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/20 mb-0.5">Status</span>
                  <StatusBadge status={c.status} />
                </div>

                {/* Accept/Reject Buttons for Pending */}
                {c.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 min-w-[200px] justify-end">
                    <button
                      onClick={(e) => handleStatusUpdate(e, c.id, 'ACTIVE')}
                      disabled={updatingId === c.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      Accept
                    </button>
                    <button
                      onClick={(e) => handleStatusUpdate(e, c.id, 'CANCELLED')}
                      disabled={updatingId === c.id}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-red-400 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <X size={14} strokeWidth={2.5} />
                      Reject
                    </button>
                  </div>
                ) : (
                  /* Start date - only show if not pending, to keep layout clean for buttons */
                  <div className="flex flex-col text-right min-w-[120px]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/20 mb-1">Started</span>
                    <div className="text-white/40 text-[13px] font-medium">{startDate}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
