import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingOffers, updateProposalStatus } from '../../../../services/proposalService';
import { Inbox, Check, X, IndianRupee, ShieldCheck } from 'lucide-react';
import SectionHeader from '../../../ui/SectionHeader';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import EmptyState from '../../../ui/EmptyState';
import Avatar from '../../../Avatar';
import { toast } from 'react-hot-toast';
import { formatINR } from '../../../../utils/currencyUtils';

const PendingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log("PendingOffers rendered");

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingOffers();
      setOffers(response?.data || response || []);
    } catch (err) {
      console.error('Failed to fetch pending offers:', err);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await updateProposalStatus(id, action);
      toast.success(action === 'ACCEPTED' ? 'Offer accepted!' : 'Offer rejected');
      loadOffers();
    } catch (err) {
      console.error(`${action} error:`, err);
      toast.error(err?.response?.data?.message || `Failed to ${action.toLowerCase()} offer`);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
      <SectionHeader
        title="Pending Offers"
        subtext="Review and manage proposals from freelancers for your jobs."
      />
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        /* LOADING SKELETON */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-secondary border border-white/5 rounded-xl p-6 shadow-md flex flex-col md:flex-row gap-6">
              <div className="flex items-center md:items-start gap-4 md:w-1/5 shrink-0">
                <div className="w-16 h-16 bg-white/10 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-2 w-full pt-2">
                  <div className="w-24 h-4 bg-white/10 rounded"></div>
                  <div className="w-16 h-3 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                <div className="w-3/4 h-5 bg-white/10 rounded"></div>
                <div className="w-full h-4 bg-white/10 rounded"></div>
                <div className="w-1/4 h-5 bg-white/10 rounded mt-1"></div>
              </div>
              <div className="flex flex-col gap-3 md:w-32 justify-center shrink-0">
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No pending offers yet"
          description="Once freelancers apply to your jobs, their proposals will appear here for your review."
          action={
            <Button onClick={() => navigate('/client/jobs')}>
              View My Jobs
            </Button>
          }
        />
      ) : (
        /* OFFERS LIST */
        <div className="space-y-4">
          {offers.map((offer) => {
            const offerId = offer.id || offer._id;
            const jobTitle = offer.jobTitle || offer.job?.title || 'Unknown Job';
            const freelancerName = offer.freelancerName || offer.freelancer?.name || 'Unknown';
            const freelancerAvatar = offer.freelancerImage || offer.freelancer?.avatar_url || null;
            const bidAmount = offer.bidAmount || offer.bid_amount || offer.amount || 0;
            const coverLetter = offer.coverLetter || offer.cover_letter || 'No cover letter provided';

            return (
              <Card 
                key={offerId} 
                className="flex flex-col md:flex-row gap-6"
              >
                {/* LEFT: Freelancer Info */}
                <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
                  <Avatar
                    src={freelancerAvatar}
                    name={freelancerName}
                    size="w-14 h-14"
                    className="rounded-full border border-white/10"
                  />
                  <div className="flex flex-col justify-center min-h-16">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="text-white font-bold text-base leading-tight truncate max-w-[150px]">{freelancerName}</div>
                      {offer.freelancer?.is_verified && (
                        <ShieldCheck size={14} className="text-blue-400 shrink-0" title="Identity Verified" />
                      )}
                    </div>
                    <span className="bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5 text-[8px] mt-1 inline-block uppercase font-bold tracking-wider self-start">Freelancer</span>
                  </div>
                </div>

                {/* CENTER: Proposal Details */}
                <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div>
                      <p className="text-[10px] text-slate-900/40 dark:text-white/30 uppercase font-bold tracking-wider mb-1">Proposal For</p>
                      <h3 className="text-slate-950 dark:text-white font-medium text-base leading-tight">{jobTitle}</h3>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4 shrink-0 mt-1 sm:mt-0">
                      <div className="flex items-center gap-1 text-accent font-black text-sm sm:text-base">
                        <IndianRupee size={14} />
                        {bidAmount}
                      </div>
                      {offer.createdAt && (
                        <div className="flex items-center gap-1.5 text-slate-900/50 dark:text-white/40 text-[10px] sm:text-xs font-medium">
                          <span className="opacity-70">Submitted:</span>
                          {new Date(offer.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-900/60 dark:text-white/40 text-sm line-clamp-2 md:line-clamp-3 mb-1 mt-1 text-justify">
                    {coverLetter}
                  </p>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex flex-col gap-2 w-full md:w-32 shrink-0 self-stretch md:self-center mt-2 md:mt-0">
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction(offerId, "ACCEPTED")}
                    icon={Check}
                    className="w-full !text-slate-950 dark:!text-slate-950 shadow-none font-bold"
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(offerId, "REJECTED")}
                    icon={X}
                    className="w-full !bg-red-500 hover:!bg-red-600 !text-white !border-red-500 shadow-none font-bold"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingOffers;
