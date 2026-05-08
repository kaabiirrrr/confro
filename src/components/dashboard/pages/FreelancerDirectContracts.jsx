import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, Clock, CheckCircle2, XCircle, AlertCircle, Check, X, Calendar, Briefcase, User } from 'lucide-react';
import { getDirectContracts, updateDirectContractStatus } from '../../../services/apiService';
import { toast } from 'react-hot-toast';

const STATUS_CFG = {
  ACTIVE: { cls: 'bg-green-500/10 text-green-400 border border-green-500/20', Icon: CheckCircle2, label: 'Active' },
  PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', Icon: Clock, label: 'Pending' },
  COMPLETED: { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', Icon: CheckCircle2, label: 'Completed' },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border border-red-500/20', Icon: XCircle, label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-white/5 text-white/20 border border-white/10', Icon: AlertCircle, label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${cfg.cls}`}>
      <cfg.Icon size={11} className="opacity-70" />{cfg.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-transparent border border-white/5 rounded-2xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-full shrink-0" />
        <div className="h-3 bg-white/10 rounded w-24" />
      </div>
      <div className="h-4 bg-white/10 rounded w-20" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-white/10 rounded-lg w-16" />
      <div className="flex gap-2">
        <div className="h-8 bg-white/10 rounded-xl w-20" />
        <div className="h-8 bg-white/10 rounded-xl w-20" />
      </div>
    </div>
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

  useEffect(() => { fetchContracts(); }, []);

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation();
    if (updatingId) return;
    setUpdatingId(id);
    const loadingToast = toast.loading(`${newStatus === 'ACTIVE' ? 'Accepting' : 'Rejecting'} contract...`);
    try {
      await updateDirectContractStatus(id, newStatus);
      toast.success(`Contract ${newStatus === 'ACTIVE' ? 'accepted' : 'rejected'} successfully`, { id: loadingToast });
      fetchContracts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update contract status', { id: loadingToast });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      <div className="flex flex-col gap-1 mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight leading-tight">Direct Contracts</h1>
        <p className="text-light-text/60 text-xs sm:text-sm">Contracts sent to you directly by clients.</p>
      </div>

      {loading && contracts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 sm:py-24 bg-transparent border border-dashed border-white/10 rounded-2xl text-center px-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-transparent flex items-center justify-center mb-4 sm:mb-6">
            <img src="/Icons/icons8-empty-box-80.png" alt="No contracts" className="w-10 h-10 object-contain invert opacity-20" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No direct contracts yet</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            Clients can send you direct contract offers without posting a job. They'll appear here when available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map(c => {
            const clientProfiles = c.client?.profiles || {};
            const name = clientProfiles.name || c.client?.name || 'Client';
            const avatar = clientProfiles.avatar_url || c.client?.avatar_url || null;
            const rate = c.agreed_rate != null
              ? `₹${Number(c.agreed_rate).toLocaleString('en-IN')}${c.project_type === 'HOURLY' ? '/hr' : ''}`
              : '—';
            const startDate = c.start_date
              ? new Date(c.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;
            const endDate = c.end_date
              ? new Date(c.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/freelancer/direct-contracts/${c.id}`)}
                className="group relative flex flex-col bg-transparent border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:bg-white/[0.02]"
              >
                {/* ── TOP ROW: Client info + Budget ── */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  {/* Client */}
                  <div className="flex items-center gap-3 min-w-0">
                    {avatar
                      ? <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                      : (
                        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                          {name[0]?.toUpperCase()}
                        </div>
                      )
                    }
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 leading-none mb-0.5">Client</p>
                      <p className="text-sm font-bold text-white truncate group-hover:text-accent transition">{name}</p>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 leading-none mb-0.5">Budget</p>
                    <p className="text-sm font-black text-accent tracking-tight">{rate}</p>
                  </div>
                </div>

                {/* ── DIVIDER ── */}
                <div className="w-full h-px bg-white/5 mb-4" />

                {/* ── MIDDLE: Contract info ── */}
                <div className="flex-1 space-y-2 mb-4">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-2">{c.title}</h3>
                  {c.description && (
                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{c.description}</p>
                  )}

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-md">
                      <Briefcase size={9} />
                      {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </span>
                    {startDate && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-md">
                        <Calendar size={9} />
                        Start: {startDate}
                      </span>
                    )}
                    {endDate && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-md">
                        <Calendar size={9} />
                        End: {endDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── BOTTOM ROW: Status left + Actions right ── */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                  {/* Status badge */}
                  <StatusBadge status={c.status} />

                  {/* Accept/Reject for PENDING, or start date for others */}
                  {c.status === 'PENDING' ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleStatusUpdate(e, c.id, 'ACTIVE')}
                        disabled={updatingId === c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Check size={12} strokeWidth={2.5} />
                        Accept
                      </button>
                      <button
                        onClick={(e) => handleStatusUpdate(e, c.id, 'CANCELLED')}
                        disabled={updatingId === c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/40 hover:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        <X size={12} strokeWidth={2.5} />
                        Reject
                      </button>
                    </div>
                  ) : startDate ? (
                    <span className="text-[10px] text-white/20 font-medium">Started {startDate}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
