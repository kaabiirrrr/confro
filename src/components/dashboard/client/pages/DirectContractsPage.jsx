import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSignature, Plus, Clock, CheckCircle2, XCircle,
  AlertCircle, Calendar, ArrowRight, Briefcase, User
} from 'lucide-react';
import { getDirectContracts } from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border border-green-500/20',   Icon: CheckCircle2 },
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', Icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',      Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border border-red-500/20',         Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/5 text-white/20 border border-white/10', Icon: AlertCircle };
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
      <div className="flex gap-2">
        <div className="h-6 bg-white/10 rounded-lg w-16" />
        <div className="h-6 bg-white/10 rounded-lg w-14" />
      </div>
      <div className="h-7 bg-white/10 rounded-lg w-24" />
    </div>
  </div>
);

export default function DirectContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await getDirectContracts();
      setContracts(res?.data ?? res ?? []);
    } catch (err) {
      toastApiError(err, 'Could not load direct contracts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Direct Contracts</h1>
          <p className="text-white/50 text-xs sm:text-sm mt-1">Contracts created directly with freelancers.</p>
        </div>
        <button
          onClick={() => navigate('/client/direct-contracts/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Direct Contract
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-transparent border border-dashed border-white/10 rounded-2xl text-center px-4">
          <div className="w-16 h-16 flex items-center justify-center mb-5">
            <img src="/Icons/icons8-empty-box-80.png" alt="No contracts" className="w-10 h-10 object-contain invert opacity-20" />
          </div>
          <h3 className="text-white font-bold text-base mb-2">No direct contracts yet</h3>
          <p className="text-white/30 text-xs max-w-xs mx-auto leading-relaxed mb-6">
            Create a contract directly with a freelancer without posting a job.
          </p>
          <button
            onClick={() => navigate('/client/direct-contracts/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
          >
            <Plus size={14} />
            New Direct Contract
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map(c => {
            const freelancer = c.freelancer || {};
            const name = freelancer.name || c.freelancer_name || 'Freelancer';
            const avatar = freelancer.avatar_url || c.freelancer_avatar || null;
            const freelancerTitle = freelancer.title || null;

            const rawRate = c.agreed_rate != null ? parseFloat(c.agreed_rate) : null;
            const rateDisplay = rawRate != null
              ? `₹${rawRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}${c.project_type === 'HOURLY' ? '/hr' : ''}`
              : '—';

            const startDate = c.start_date
              ? new Date(c.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : null;
            const endDate = c.end_date
              ? new Date(c.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : null;

            return (
              <div
                key={c.id}
                className="group relative flex flex-col bg-transparent border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.02]"
              >
                {/* ── TOP ROW: Freelancer info + Budget ── */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  {/* Freelancer */}
                  <div className="flex items-center gap-3 min-w-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 border border-accent/10">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 leading-none mb-0.5">Freelancer</p>
                      <p className="text-sm font-bold text-white truncate group-hover:text-accent transition">{name}</p>
                      {freelancerTitle && (
                        <p className="text-[10px] text-white/30 truncate mt-0.5">{freelancerTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  {rawRate != null && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 leading-none mb-0.5">Budget</p>
                      <p className="text-sm font-black text-accent tracking-tight">{rateDisplay}</p>
                    </div>
                  )}
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
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                      <Briefcase size={9} />
                      {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </span>
                    {startDate && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                        <Calendar size={9} />
                        {startDate}
                        {endDate && (
                          <><ArrowRight size={8} className="mx-0.5 text-white/20" />{endDate}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── BOTTOM ROW: Status+Type left | Timestamp+View Details right ── */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                  {/* Left: status + type */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">
                      {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed'}
                    </span>
                  </div>

                  {/* Right: View Details button */}
                  <button
                    onClick={() => navigate(`/client/direct-contracts/${c.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 bg-transparent hover:bg-white/5 text-[9px] font-bold uppercase tracking-widest transition-all"
                  >
                    View Details
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
