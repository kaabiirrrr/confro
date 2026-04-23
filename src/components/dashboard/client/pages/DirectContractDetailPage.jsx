import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle, MessageCircle, Calendar, IndianRupee, User,
  CheckCircle2, Clock, XCircle, ArrowLeft, Video
} from 'lucide-react';
import { formatINR } from '../../../../utils/currencyUtils';
import { getDirectContractById, updateDirectContractStatus, getOrCreateConversation } from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import InfinityLoader from '../../../common/InfinityLoader';
import DeadlineRiskCard from '../../common/DeadlineRiskCard';
import WorkDeliverySystem from '../../deliveries/WorkDeliverySystem';

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border-green-500/20',  Icon: CheckCircle2 },
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border-red-500/20',       Icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-white/60 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${cfg.cls}`}>
      <cfg.Icon size={13} />
      {cfg.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-white/40" />
    </div>
    <div>
      <p className="text-white/40 text-xs">{label}</p>
      <p className="text-white text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-secondary border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <p className="text-light-text text-sm mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-border text-light-text/60 hover:text-light-text text-sm transition"
        >
          Go back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <InfinityLoader size={20} />}
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default function DirectContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [messaging, setMessaging] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const isClient = role === 'CLIENT';
  const canAct = contract && !['COMPLETED', 'CANCELLED'].includes(contract.status);

  useEffect(() => { fetchContract(); }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await getDirectContractById(id);
      setContract(res?.data ?? res);
    } catch (err) {
      toastApiError(err, 'Could not load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(status);
    setConfirm(null);
    try {
      await updateDirectContractStatus(id, status);
      setContract((prev) => ({ ...prev, status }));
      toast.success(status === 'COMPLETED' ? 'Contract marked as completed' : 'Contract cancelled');
    } catch (err) {
      toastApiError(err, 'Failed to update contract');
    } finally {
      setUpdating(null);
    }
  };

  const handleMessage = async () => {
    const freelancerId = contract?.freelancer?.id;
    if (!freelancerId) return;
    setMessaging(true);
    try {
      await getOrCreateConversation(freelancerId);
      navigate('/client/messages');
    } catch {
      navigate('/client/messages');
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1630px] mx-auto p-12 flex justify-center">
        <InfinityLoader size={40} />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-8 text-white text-center">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/50">Contract not found.</p>
        <button onClick={() => navigate('/client/direct-contracts')} className="mt-4 text-accent text-sm hover:underline">
          Back to contracts
        </button>
      </div>
    );
  }

  const freelancerProfiles = contract.freelancer?.profiles || {};
  const name = freelancerProfiles.name || contract.freelancer?.name || contract.freelancer_name || 'Freelancer';
  const avatar = freelancerProfiles.avatar_url || contract.freelancer?.avatar_url || null;
  const freelancerTitle = freelancerProfiles.title || contract.freelancer?.title || null;

  const rate = contract.agreed_rate != null
    ? `${formatINR(contract.agreed_rate)}${contract.project_type === 'HOURLY' ? '/hr' : ' fixed'}`
    : '—';

  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/client/direct-contracts')}
            className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Back to Contracts
          </button>
          <h1 className="text-3xl font-bold text-white tracking-tight">{contract.title}</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            {contract.project_type === 'HOURLY' ? 'Hourly Project' : 'Fixed Price Project'}
          </p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Freelancer Profile */}
          <div className="bg-transparent border-none p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-none transition-all">
            <div className="flex items-center gap-5">
              {avatar ? (
                <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/5 shadow-xl" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-bold ring-2 ring-white/5">
                  {name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-white text-lg">{name}</p>
                {freelancerTitle && <p className="text-white/50 text-xs font-medium mt-1">{freelancerTitle}</p>}
              </div>
            </div>
            <button
              onClick={handleMessage}
              disabled={messaging}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {messaging ? <InfinityLoader size={20} /> : <MessageCircle size={16} />}
              Message Freelancer
            </button>

            {contract.status === 'ACTIVE' && (
              <button
                onClick={() => navigate(`/meeting/create?projectId=${contract.job_id}&clientId=${contract.client_id}&freelancerId=${contract.freelancer?.id}`)}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest hover:bg-blue-600/20 transition-all active:scale-95"
              >
                <Video size={16} /> Start Meeting
              </button>
            )}
          </div>

          {/* Work Delivery System Integration */}
          <div id="deliveries-section">
            <WorkDeliverySystem 
              contractId={id} 
              jobId={contract.job_id} 
              isClient={true} 
            />
          </div>

          {/* Contract Description */}
          {contract.description && (
            <div className="bg-transparent border-none p-0 backdrop-blur-none">
              <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Original Description</h3>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{contract.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Deadline Risk (Client Only) */}
          {isClient && contract.status === 'ACTIVE' && (
            <DeadlineRiskCard contractId={id} />
          )}

          {/* Financials & Dates */}
          <div className="bg-transparent border-none p-0 space-y-6 backdrop-blur-none transition-all">
            <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-4 mb-2">Contract Terms</h3>
            <div className="space-y-5">
              <InfoRow icon={IndianRupee} label="Agreed Rate" value={rate} />
              {contract.weekly_limit && (
                <InfoRow icon={Clock} label="Weekly Limit" value={`${contract.weekly_limit} hrs`} />
              )}
              <InfoRow icon={Calendar} label="Start Date" value={contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'Immediate'} />
              <InfoRow icon={Calendar} label="Target End Date" value={contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'Milestone Based'} />
            </div>
          </div>

          {/* Dangerous Actions */}
          {canAct && (
            <div className="bg-transparent border-none p-0 space-y-4 backdrop-blur-none transition-all">
               <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-4 mb-2">Management</h3>
              <div className="flex flex-col gap-3">
                {isClient && (
                  <button
                    onClick={() => setConfirm({ status: 'COMPLETED', message: 'Mark this contract as completed? All milestones and deliveries should be finalized.' })}
                    disabled={!!updating}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {updating === 'COMPLETED' ? <InfinityLoader size={20} /> : <CheckCircle2 size={16} />}
                    Complete Contract
                  </button>
                )}
                <button
                  onClick={() => setConfirm({ status: 'CANCELLED', message: 'Are you sure you want to cancel this contract? Ongoing work will be stopped.' })}
                  disabled={!!updating}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  {updating === 'CANCELLED' ? <InfinityLoader size={20} /> : <XCircle size={16} />}
                  Terminate Contract
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Overlay */}
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
