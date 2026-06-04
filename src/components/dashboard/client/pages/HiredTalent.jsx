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
            <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-xl h-32" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/ChatGPT Image Jun 1, 2026, 12_27_56 PM.png"
            alt="No freelancers hired yet"
            style={{ width: 300, height: 300 }}
            className="object-contain mx-auto"
          />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No freelancers hired yet</h3>
          <p className="text-slate-500 dark:text-white/40 text-sm max-w-md mx-auto mb-6">
            When you hire talent for your projects, they will appear here.
          </p>
          <button
            onClick={() => navigate('/client/find-talent')}
            className="px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Find Talent
          </button>
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
            const jobBudget = contract.job_budget;
            const budgetType = contract.budget_type;
            const startDate = contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const endDate = contract.end_date ? new Date(contract.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const deadline = contract.bid_deadline ? new Date(contract.bid_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            const createdAt = new Date(contract.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            const getStatusBadgeClass = (statusName) => {
              const s = statusName?.toUpperCase() || '';
              if (s === 'ACTIVE') {
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              }
              if (s === 'PENDING') {
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              }
              return 'bg-white/5 text-white/40 border-white/10';
            };

            return (
              <div
                key={contract.id || Math.random()}
                className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-accent/40 transition-all shadow-sm group relative"
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
                        <span className={`md:hidden absolute top-5 right-5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusBadgeClass(status)}`}>{status}</span>
                      </div>
                      {freelancerTitle && <p className="text-white/40 text-[10px] truncate mt-0.5 italic">{freelancerTitle}</p>}
                      <span className={`hidden md:inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusBadgeClass(status)}`}>{status}</span>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Top Row: Full Contract Title */}
                    <div className="mb-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">Contract Title</p>
                      <h4 className="text-sm font-semibold text-white break-words leading-snug">{jobTitle}</h4>
                    </div>

                    {/* Bottom Row: Other Info (Separate Line) */}
                    {/* Mobile: 2-col grid (Started left, Budget right) + Completion below spanning full width */}
                    {/* Desktop: 3-col grid in one row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2.5 pt-2.5 border-t border-white/5">
                      {/* Started */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Started</p>
                        <p className="text-xs text-white/60">{startDate || createdAt}</p>
                      </div>

                      {/* Budgets — right col on mobile, centre col on desktop */}
                      <div className="text-right md:text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Budget Details</p>
                        <div className="space-y-0.5">
                          {jobBudget != null && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[9px] text-white/40 font-medium">Job:</span>
                              <span className="text-xs font-semibold text-white/70">₹{parseFloat(jobBudget).toLocaleString('en-IN')}{budgetType === 'hourly' ? '/hr' : ''}</span>
                            </div>
                          )}
                          {budget != null && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[9px] text-accent/65 font-medium">Bid:</span>
                              <span className="text-xs font-bold text-accent">₹{parseFloat(budget).toLocaleString('en-IN')}{budgetType === 'hourly' ? '/hr' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Completion / Deadline / Hired On — full-width on mobile, right col on desktop */}
                      <div className="col-span-2 md:col-span-1 md:text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1 md:text-right">
                          {endDate ? 'Completion' : deadline ? 'Bid Deadline' : 'Hired On'}
                        </p>
                        <p className="text-xs text-white/60 md:text-right">
                          {endDate || deadline || createdAt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-3 shrink-0 self-end md:self-start mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        const fid = contract.freelancer_id || contract.freelancer?.id;
                        if (fid) navigate(`/freelancer/${fid}`);
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleMessage(contract.freelancer_id || contract.freelancer?.id)}
                      className="flex-1 md:flex-none flex items-center justify-center px-5 py-2 bg-accent text-white border border-accent rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all"
                    >
                      Message
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
