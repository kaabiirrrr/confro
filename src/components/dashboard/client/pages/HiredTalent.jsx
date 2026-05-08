import React, { useState, useEffect } from 'react';
import { getHiredFreelancers } from '../../../../services/apiService';
import { Briefcase, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../../Avatar';
import SectionHeader from '../../../ui/SectionHeader';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import EmptyState from '../../../ui/EmptyState';

const HiredTalent = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHiredTalent();
  }, []);

  const fetchHiredTalent = async () => {
    try {
      setLoading(true);
      const response = await getHiredFreelancers();
      setFreelancers(response?.data || response || []);
    } catch (error) {
      console.error('Error fetching hired talent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (freelancerId) => {
    if (freelancerId) {
      navigate(`/client/messages?userId=${freelancerId}`);
    } else {
      navigate('/client/messages');
    }
  };

  return (
    <div className="max-w-[1460px] mx-auto py-2 sm:py-8 text-light-text font-sans tracking-tight animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Hired Talent</h1>
          <p className="text-[11px] sm:text-sm text-light-text/70">View and manage the freelancers you've hired for your projects.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-32" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-transparent border-none rounded-2xl text-center">
          <Briefcase className="w-12 h-12 text-light-text/20 mb-6" />
          <h3 className="text-lg font-semibold text-white mb-2">No freelancers hired yet</h3>
          <p className="text-light-text/50 text-base mb-8 max-w-md mx-auto">
            When you hire talent for your projects, they will appear here.
          </p>
          <Button onClick={() => navigate('/client/find-talent')} variant="secondary" className="rounded-full px-8">
            Find Talent →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {freelancers?.map((contract) => {
            const freelancerName = contract.freelancer?.name || 'Unknown User';
            const avatarUrl = contract.freelancer?.avatar_url;
            const email = contract.freelancer?.email;
            const freelancerTitle = contract.freelancer?.title;
            const jobTitle = contract.jobTitle || 'Unknown Job';
            const status = contract.status || 'ACTIVE';
            const budget = contract.budget_amount;
            const budgetType = contract.budget_type;
            const startDate = contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const endDate = contract.end_date ? new Date(contract.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const deadline = contract.bid_deadline ? new Date(contract.bid_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const createdAt = new Date(contract.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div
                key={contract.id || Math.random()}
                className="bg-transparent border border-white/10 rounded-2xl p-5 hover:border-accent/40 transition-all shadow-sm group relative"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* Avatar + Name + Email */}
                  <div className="flex items-start gap-4 md:w-56 shrink-0">
                    <div className="relative">
                      <Avatar
                        src={avatarUrl}
                        name={freelancerName}
                        size="lg"
                        className="ring-2 ring-border group-hover:ring-accent/40 transition-all"
                      />
                      {contract.freelancer?.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5">
                          <ShieldCheck size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-sm truncate group-hover:text-accent transition-colors">{freelancerName}</h3>
                        <span className={`md:hidden absolute top-5 right-5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${status.toUpperCase() === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/5 text-white/40 border-white/10'
                          }`}>{status}</span>
                      </div>
                      {freelancerTitle && <p className="text-white/40 text-[10px] truncate mt-0.5 italic">{freelancerTitle}</p>}
                      <span className={`hidden md:inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${status.toUpperCase() === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-white/40 border-white/10'
                        }`}>{status}</span>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Contract Title</p>
                      <p className="text-sm font-medium text-white truncate">{jobTitle}</p>
                    </div>
                    {budget != null && (
                      <div className="text-right sm:text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Bid Budget</p>
                        <p className="text-sm font-semibold text-accent">₹{parseFloat(budget).toLocaleString('en-IN')}{budgetType === 'hourly' ? '/hr' : ''}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Started</p>
                      <p className="text-xs text-white/60">{startDate || createdAt}</p>
                    </div>
                    {deadline && (
                      <div className="text-right sm:text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Bid Deadline</p>
                        <p className="text-xs text-white/60">{deadline}</p>
                      </div>
                    )}
                    {endDate && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Completion</p>
                        <p className="text-xs text-white/60">{endDate}</p>
                      </div>
                    )}

                    {/* Spacer to push 'Hired On' to the right column on mobile (2rd row, 2nd col) */}
                    {!endDate && <div className="sm:hidden" />}

                    <div className="text-right sm:text-left">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Hired On</p>
                      <p className="text-xs text-white/60">{createdAt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-3 shrink-0 self-end md:self-start mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        const fid = contract.freelancer_id || contract.freelancer?.id;
                        if (fid) navigate(`/freelancer/${fid}`);
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                      <ExternalLink size={12} /> Profile
                    </button>
                    <button
                      onClick={() => handleMessage(contract.freelancer_id || contract.freelancer?.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2 bg-accent text-white border border-accent rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
                    >
                      <MessageSquare size={12} /> Message
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
};

export default HiredTalent;
