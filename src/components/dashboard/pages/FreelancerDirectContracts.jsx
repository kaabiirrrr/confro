import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDirectContracts, updateDirectContractStatus } from '../../../services/apiService';
import { toast } from 'react-hot-toast';

const STATUS_CFG = {
  ACTIVE:    { cls: 'bg-green-500 text-white', label: 'Active' },
  PENDING:   { cls: 'bg-yellow-500 text-white', label: 'Pending' },
  COMPLETED: { cls: 'bg-blue-500 text-white', label: 'Completed' },
  CANCELLED: { cls: 'bg-red-500 text-white', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-slate-400 text-white', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-transparent border border-slate-200 dark:border-white/5 rounded-xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full shrink-0" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-24" />
      </div>
      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-20" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-16" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-20" />
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-20" />
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
        <div className="flex flex-col items-center justify-center py-14 sm:py-24 text-center px-4">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img src="/Icons/icons8-empty-box-80.png" alt="No contracts" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">No direct contracts yet</h3>
          <p className="text-light-text/40 text-xs sm:text-[14px] max-w-sm mx-auto leading-relaxed">
            Clients can send you direct contract offers without posting a job. They'll appear here when available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map(c => {
            // API returns client as { name, avatar_url } directly from the join
            const name = c.client?.name || 'Client';
            const avatar = c.client?.avatar_url || null;
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
                className="group flex flex-col bg-transparent border border-slate-200 dark:border-white/5 hover:border-accent/40 dark:hover:border-accent/40 rounded-xl p-5 cursor-pointer transition-all duration-300"
              >
                {/* ── TOP ROW: Status + Budget ── */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <StatusBadge status={c.status} />
                  <div className="text-right shrink-0">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 mb-0.5">Budget</p>
                    <p className="text-sm font-black text-accent tracking-tight">{rate}</p>
                  </div>
                </div>

                {/* ── TITLE + DESCRIPTION ── */}
                <div className="mb-4 space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="text-slate-400 dark:text-white/30 text-xs leading-relaxed line-clamp-2">{c.description}</p>
                  )}
                </div>

                {/* ── META CHIPS ── */}
                <div className="flex items-center justify-between mb-4 sm:justify-start sm:flex-wrap sm:gap-2">
                  {/* Left: project type badge */}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/30 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full shrink-0">
                    {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                  </span>

                  {/* Right on mobile: dates stacked vertically | inline on sm+ */}
                  {(startDate || endDate) && (
                    <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                      {startDate && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/30">
                          Start: {startDate}
                        </span>
                      )}
                      {endDate && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/30">
                          End: {endDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── BOTTOM ROW: Client + Actions ── */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  {/* Client */}
                  <div className="flex items-center gap-2 min-w-0">
                    {avatar
                      ? <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-white/10" />
                      : <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs shrink-0">{name[0]?.toUpperCase()}</div>
                    }
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 leading-none mb-0.5">Client</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                    </div>
                  </div>

                  {/* Accept/Reject for PENDING */}
                  {c.status === 'PENDING' ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleStatusUpdate(e, c.id, 'ACTIVE')}
                        disabled={updatingId === c.id}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => handleStatusUpdate(e, c.id, 'CANCELLED')}
                        disabled={updatingId === c.id}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  ) : startDate ? (
                    <span className="text-[9px] text-slate-400 dark:text-white/20 font-medium">Started {startDate}</span>
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
