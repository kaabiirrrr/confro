import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getDirectContracts } from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border-green-500/20',  Icon: CheckCircle2 },
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border-red-500/20',       Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-white/60 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 bg-white/10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="h-3 bg-white/10 rounded w-1/3" />
    </div>
    <div className="h-6 bg-white/10 rounded-full w-16" />
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
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Direct Contracts</h1>
          <p className="text-white/50 text-sm mt-1">Contracts created directly with freelancers.</p>
        </div>
        <button
          onClick={() => navigate('/client/direct-contracts/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95 shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Direct Contract
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-20 bg-transparent border border-white/10 rounded-2xl">
          <FileSignature className="mx-auto text-white/10 mb-6" size={48} strokeWidth={1.5} />
          <h3 className="text-white font-bold text-lg mb-2">No direct contracts yet</h3>
          <p className="text-white/30 text-xs max-w-xs mx-auto leading-relaxed mb-8">
            Create a contract directly with a freelancer without posting a job.
          </p>
          <button
            onClick={() => navigate('/client/direct-contracts/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/10 transition-all"
          >
            <Plus size={16} />
            New Direct Contract
          </button>
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden">

          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_2fr_100px_120px_100px] gap-4 px-6 py-4 border-b border-white/5 text-[9px] text-white/20 font-black uppercase tracking-widest">
            <span>Freelancer</span>
            <span>Contract Area</span>
            <span className="text-right md:text-left">Rate</span>
            <span className="text-right">Status</span>
            <span className="text-right">Start Date</span>
          </div>

          {contracts.map((c) => {
            const freelancer = c.freelancer?.profiles || c.freelancer || {};
            const name = freelancer.name || c.freelancer_name || 'Freelancer';
            const avatar = freelancer.avatar_url || c.freelancer_avatar || null;
            const rate = c.agreed_rate != null
              ? `$${parseFloat(c.agreed_rate).toFixed(2)}${c.project_type === 'HOURLY' ? '/hr' : ''}`
              : '—';
            const startDate = c.start_date ? new Date(c.start_date).toLocaleDateString() : '—';

            const Avatar = () => avatar ? (
              <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                {name[0]?.toUpperCase()}
              </div>
            );

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/client/direct-contracts/${c.id}`)}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer group"
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[1fr_2fr_100px_120px_100px] gap-4 px-6 py-4 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar />
                    <span className="font-medium text-white/80 text-sm truncate">{name}</span>
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-white text-sm truncate group-hover:text-accent transition-colors">{c.title}</p>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                      {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </p>
                  </div>
                  <div className="text-right md:text-left text-accent font-black text-sm">{rate}</div>
                  <div className="flex justify-end"><StatusBadge status={c.status} /></div>
                  <div className="text-right text-white/50 text-sm">{startDate}</div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate group-hover:text-accent transition-colors">{c.title}</p>
                        <p className="text-white/50 text-xs truncate">{name}</p>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-white/40 uppercase tracking-widest font-bold">
                      {c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </span>
                    <span className="text-accent font-black">{rate}</span>
                  </div>
                  <p className="text-white/30 text-xs">Start: {startDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
