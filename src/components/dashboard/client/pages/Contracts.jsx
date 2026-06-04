import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight,
} from 'lucide-react';
import { getMyContracts } from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { formatINR } from '../../../../utils/currencyUtils';
import Tabs from '../../../ui/Tabs';

/* ─── Status badge config ─── */
const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border border-green-500/20',   Icon: CheckCircle2 },
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', Icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',      Icon: CheckCircle2 },
  DISPUTED:  { label: 'Disputed',  cls: 'bg-red-500/10 text-red-400 border border-red-500/20',         Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status || 'Unknown', cls: 'bg-white/5 text-white/20 border border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${cfg.cls}`}>
      <cfg.Icon size={11} className="opacity-70" />{cfg.label}
    </span>
  );
};

/* ─── Skeleton ─── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-transparent border border-white/5 rounded-xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <div className="h-2 bg-white/10 rounded w-16" />
          <div className="h-3 bg-white/10 rounded w-24" />
        </div>
      </div>
      <div className="h-4 bg-white/10 rounded w-20" />
    </div>
    <div className="w-full h-px bg-white/5" />
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

/* ─── Helpers ─── */
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

/* ─── Main Component ─── */
const Contracts = () => {
  const [contracts, setContracts]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [activeTab, setActiveTab]   = useState('all');
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
    { key: 'all',       label: 'All' },
    { key: 'ACTIVE',    label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'DISPUTED',  label: 'Disputed' },
  ];

  const filtered = activeTab === 'all'
    ? contracts
    : contracts.filter(c => c.status === activeTab);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Contracts</h1>
        <p className="text-white/50 text-xs sm:text-sm mt-1">
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''} active or historical
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs.map(t => ({
          ...t,
          count: t.key === 'all' ? contracts.length : contracts.filter(c => c.status === t.key).length,
        }))}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-2 justify-between sm:justify-start"
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <img
            src="/ChatGPT Image Jun 1, 2026, 01_04_54 PM.png"
            alt="No contracts yet"
            style={{ width: 220, height: 220 }}
            className="object-contain mx-auto"
          />
          <h3 className="text-white font-bold text-base mb-2">No contracts yet</h3>
          <p className="text-white/30 text-sm max-w-xs mx-auto leading-relaxed mb-6">
            Accept a proposal to create a contract and start working with talent.
          </p>
          <button
            onClick={() => navigate('/client/jobs')}
            className="px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Manage your jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(contract => {
            const freelancer      = contract.freelancer || contract.profiles || {};
            const name            = freelancer.name || contract.freelancerName || 'Unknown Freelancer';
            const avatar          = freelancer.avatar_url || contract.freelancerImage || null;
            const freelancerTitle = freelancer.title || null;
            const contractTitle   = contract.title || contract.job?.title || 'Untitled Contract';
            const description     = contract.description || contract.job?.description || null;

            const rawRate = contract.amount != null
              ? parseFloat(contract.amount)
              : contract.agreed_rate != null
              ? parseFloat(contract.agreed_rate)
              : null;

            const rateDisplay = rawRate != null
              ? `${formatINR(rawRate)}${contract.project_type === 'HOURLY' ? '/hr' : ''}`
              : null;

            const startDate = fmtDate(contract.start_date || contract.created_at);
            const endDate   = fmtDate(contract.end_date);

            return (
              <div
                key={contract.id}
                className="group relative flex flex-col bg-transparent border border-white/10 hover:border-accent/40 rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.02]"
              >
                {/* ── TOP ROW: Freelancer info + Rate ── */}
                <div className="flex items-center justify-between gap-3 mb-4">
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

                  {rateDisplay && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 leading-none mb-0.5">Value</p>
                      <p className="text-sm font-black text-accent tracking-tight">{rateDisplay}</p>
                    </div>
                  )}
                </div>

                {/* ── DIVIDER ── */}
                <div className="w-full h-px bg-white/5 mb-4" />

                {/* ── MIDDLE: Title + Description + Meta chips ── */}
                <div className="flex-1 space-y-2 mb-4">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-2">{contractTitle}</h3>
                  {description && (
                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{description}</p>
                  )}

                  {/* Meta chips */}
                  <div className="flex flex-col items-end sm:flex-row sm:items-center sm:justify-start gap-2 pt-1">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                      <img src="/Icons/icons8-bag-100.png" alt="Contract Type" className="w-3.5 h-3.5 object-contain shrink-0" />
                      {contract.project_type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}
                    </span>
                    {startDate && (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                        <img src="/Icons/icons8-desk-calender-96.png" alt="Date" className="w-3.5 h-3.5 object-contain shrink-0" />
                        {startDate}
                        {endDate && (
                          <><ArrowRight size={8} className="mx-0.5 text-white/20" />{endDate}</>
                        )}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/20 ml-auto sm:ml-0">
                      ID: {contract.id?.substring(0, 8)}
                    </span>
                  </div>
                </div>

                {/* ── BOTTOM ROW: Status left | View Details right ── */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={contract.status} />
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">
                      {contract.project_type === 'HOURLY' ? 'Hourly' : 'Fixed'}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/client/contracts/${contract.id}`)}
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
};

export default Contracts;