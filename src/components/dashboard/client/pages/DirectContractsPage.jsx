import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getDirectContracts } from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', cls: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: CheckCircle2 },
  PENDING: { label: 'Pending', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: XCircle },
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
  <div className="animate-pulse bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
    <div className="flex items-center gap-3 md:w-1/4">
      <div className="w-14 h-14 bg-white/10 rounded-full shrink-0" />
      <div className="h-4 bg-white/10 rounded w-28" />
    </div>
    <div className="flex-1 h-4 bg-white/10 rounded w-1/2" />
    <div className="h-6 bg-white/10 rounded-full w-20" />
    <div className="h-4 bg-white/10 rounded w-16" />
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
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Direct Contracts</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Contracts created directly with freelancers.</p>
        </div>
        <button
          onClick={() => navigate('/client/direct-contracts/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 focus:ring-2 focus:ring-accent/40 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Direct Contract
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-24 bg-transparent border border-white/10 rounded-2xl">
          <FileSignature className="mx-auto text-white/10 mb-6" size={56} strokeWidth={1.5} />
          <h3 className="text-white font-bold text-xl tracking-tight mb-2">No direct contracts yet</h3>
          <p className="text-white/30 text-xs max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest italic mb-8">
            Create a contract directly with a freelancer without posting a job.
          </p>
          <button
            onClick={() => navigate('/client/direct-contracts/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
          >
            <Plus size={16} />
            New Direct Contract
          </button>
        </div>
      ) : (
        <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden mb-4">
          <div className="grid grid-cols-[1fr_2fr_100px_120px_100px] gap-4 px-8 py-5 border-b border-white/5 text-[9px] text-white/20 font-black uppercase tracking-widest">
            <span>Freelancer</span>
            <span>Contract Area</span>
            <span className="text-right">Rate</span>
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

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/client/direct-contracts/${c.id}`)}
                className="grid grid-cols-[1fr_2fr_100px_120px_100px] gap-4 px-8 py-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition items-center group cursor-pointer"
              >
                {/* Freelancer */}
                <div className="flex items-center gap-3 min-w-0">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-base shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-white/80 text-sm truncate">{name}</span>
                </div>

                {/* Title + type */}
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-white text-sm truncate group-hover:text-accent transition-colors">{c.title}</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">{c.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}</p>
                </div>

                {/* Rate */}
                <div className="text-right text-accent font-black text-sm shrink-0">{rate}</div>

                {/* Status */}
                <div className="flex justify-end shrink-0"><StatusBadge status={c.status} /></div>

                {/* Start date */}
                <div className="text-right text-white/50 font-medium text-sm shrink-0">{startDate}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
