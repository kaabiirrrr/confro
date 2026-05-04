import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileSignature, Clock, CheckCircle2, XCircle,
  AlertCircle, MessageCircle, Calendar, DollarSign, User, Video
} from 'lucide-react';import {
  getDirectContractById, updateDirectContractStatus, getOrCreateConversation
} from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';

const STATUS_CFG = {
  ACTIVE:    { cls: 'bg-green-500/10 text-green-400 border-green-500/20',   Icon: CheckCircle2 },
  PENDING:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  COMPLETED: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      Icon: CheckCircle2 },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20',         Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-white/5 text-white/20 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/5 bg-secondary/40 ${cfg.cls}`}>
      <cfg.Icon size={12} className="opacity-70" />{status}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-lg">
      <Icon size={16} className="text-accent/60" />
    </div>
    <div>
      <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-white text-[15px] font-bold tracking-tight">{value || '—'}</p>
    </div>
  </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-secondary border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <p className="text-light-text text-sm mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-border text-light-text/60 hover:text-light-text text-sm transition">
          Go back
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <InfinityLoader/>}
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default function FreelancerDirectContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [messaging, setMessaging] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const canAct = contract && !['COMPLETED', 'CANCELLED'].includes(contract.status);

  useEffect(() => {
    getDirectContractById(id)
      .then(res => setContract(res?.data ?? res))
      .catch(err => toastApiError(err, 'Could not load contract'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdating(status);
    setConfirm(null);
    try {
      await updateDirectContractStatus(id, status);
      setContract(prev => ({ ...prev, status }));
      if (status === 'ACTIVE') toast.success('Contract accepted');
      else toast.success('Contract cancelled');
    } catch (err) {
      toastApiError(err, 'Failed to update contract');
    } finally {
      setUpdating(null);
    }
  };

  const handleMessage = async () => {
    const clientId = contract?.client?.id;
    if (!clientId) return;
    setMessaging(true);
    try {
      await getOrCreateConversation(clientId);
      navigate('/freelancer/messages');
    } catch {
      navigate('/freelancer/messages');
    } finally {
      setMessaging(false);
    }
  };

  if (loading) return (
    <div className="w-full space-y-6 pb-20 animate-pulse">
      <div className="h-6 bg-white/5 rounded w-32" />
      <div className="bg-secondary/40 border border-white/5 rounded-2xl h-80" />
    </div>
  );

  if (!contract) return (
    <div className="w-full flex flex-col items-center justify-center py-24 bg-secondary/40 border border-white/5 rounded-3xl text-center shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        <FileSignature className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Contract not found</h3>
      <p className="text-light-text/40 text-sm max-w-sm leading-relaxed mb-8">
        The contract you are looking for does not exist or has been removed.
      </p>
      <button onClick={() => navigate('/freelancer/direct-contracts')} 
        className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition">
        Back to contracts
      </button>
    </div>
  );

  const clientProfiles = contract.client?.profiles || {};
  const name   = clientProfiles.name   || contract.client?.name   || 'Client';
  const avatar = clientProfiles.avatar_url || contract.client?.avatar_url || null;
  const rate   = contract.agreed_rate != null
    ? `$${parseFloat(contract.agreed_rate).toFixed(2)}${contract.project_type === 'HOURLY' ? '/hr' : ' fixed'}`
    : '—';

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Back Link */}
      <button onClick={() => navigate('/freelancer/direct-contracts')}
        className="flex items-center gap-2 text-light-text/30 hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] transition group w-fit mb-4">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Contracts
      </button>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight leading-tight">{contract.title}</h1>
          <p className="text-light-text/60 text-sm">
             {contract.project_type === 'HOURLY' ? 'Hourly Contractual Agreement' : 'Fixed Price Project Agreement'}
          </p>
        </div>
        <div className="mt-1">
          <StatusBadge status={contract.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Box */}
          <div className="border border-white/5 rounded-2xl p-8 space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <InfoRow icon={DollarSign} label="Rate / Budget" value={rate} />
              {contract.weekly_limit && <InfoRow icon={Clock} label="Weekly Limit" value={`${contract.weekly_limit} hrs`} />}
              <InfoRow icon={Calendar} label="Start Date" value={contract.start_date ? new Date(contract.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null} />
              <InfoRow icon={Calendar} label="End Date"   value={contract.end_date   ? new Date(contract.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })   : 'Ongoing'} />
            </div>

            {contract.description && (
              <div className="pt-10 border-t border-white/5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-light-text/20 mb-6">Project Description</h4>
                <p className="text-white/80 text-[15px] leading-relaxed whitespace-pre-wrap tracking-wide">{contract.description}</p>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          {canAct && (
            <div className="flex flex-wrap gap-4 pt-4">
              {contract.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => setConfirm({ status: 'ACTIVE', message: 'By accepting this contract, you agree to the terms and timeline specified by the client.' })}
                    disabled={!!updating}
                    className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                  >
                    {updating === 'ACTIVE' ? <InfinityLoader/> : <CheckCircle2 size={16} className="text-emerald-400" />}
                    Accept Contract
                  </button>
                  <button
                    onClick={() => setConfirm({ status: 'CANCELLED', message: 'Are you sure you want to decline this contract offer? This action is permanent.' })}
                    disabled={!!updating}
                    className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-light-text/40 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:text-red-400 hover:border-red-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {updating === 'CANCELLED' ? <InfinityLoader/> : <XCircle size={16} />}
                    Decline
                  </button>
                </>
              )}

              {contract.status === 'ACTIVE' && (
                <button
                  onClick={() => setConfirm({ status: 'CANCELLED', message: 'Terminating this contract will notify the client immediately. This action cannot be undone.' })}
                  disabled={!!updating}
                  className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-red-400/80 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {updating === 'CANCELLED' ? <InfinityLoader/> : <XCircle size={16} />}
                  Terminate Contract
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Client Profile */}
        <div className="space-y-6">
          <div className="border border-white/5 rounded-2xl p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-light-text/20 mb-8 font-primary">Contracting Client</h4>
            <div className="flex items-center gap-4 mb-10">
              {avatar
                ? <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover shadow-2xl border border-white/5" />
                : <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xl">{name[0]?.toUpperCase()}</div>
              }
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white tracking-tight truncate text-[16px]">{name}</span>
                <span className="text-light-text/30 text-[11px] font-bold uppercase tracking-widest mt-0.5">Verified Client</span>
              </div>
            </div>
            
            <button onClick={handleMessage} disabled={messaging}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl">
              {messaging ? <InfinityLoader/> : <MessageCircle size={14} className="text-accent" />}
              Send Message
            </button>

            {contract.status === 'ACTIVE' && (
              <button
                onClick={() => navigate(`/meeting/create?projectId=${contract.job_id}&clientId=${contract.client_id}&freelancerId=${contract.freelancer_id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600/20 active:scale-[0.98] transition-all shadow-xl"
              >
                <Video size={14} /> Start Meeting
              </button>
            )}
          </div>

          <div className="border border-white/5 rounded-2xl p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-light-text/20 mb-6 border-b border-white/5 pb-4">Agreement Timeline</h4>
            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-light-text/20 font-bold uppercase tracking-[0.2em]">Created on</span>
                <span className="text-white font-bold text-[14px] tracking-tight">{contract.created_at ? new Date(contract.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-light-text/20 font-bold uppercase tracking-[0.2em]">Last Updated</span>
                <span className="text-white font-bold text-[14px] tracking-tight">{contract.updated_at ? new Date(contract.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          loading={!!updating}
          onConfirm={() => handleStatusUpdate(confirm.status)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
