import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSavedFreelancers,
  removeSavedFreelancer,
} from '../../../../services/apiService';
import { ShieldCheck, Trash2, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';
import Avatar from '../../../Avatar';

const normalizeList = (payload) => {
  if (!payload) return [];
  const raw = payload.data ?? payload;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.freelancers)) return raw.freelancers;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const SavedTalent = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const fetchGen = useRef(0);

  const fetchSaved = useCallback(async () => {
    const gen = ++fetchGen.current;
    try {
      setLoading(true);
      const response = await getSavedFreelancers();
      if (gen !== fetchGen.current) return;
      setFreelancers(normalizeList(response));
    } catch (error) {
      if (gen !== fetchGen.current) return;
      console.error('Error fetching saved talent:', error);
      toastApiError(error, 'Could not load saved talent');
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleRemove = async (freelancerId) => {
    if (!freelancerId) return;
    try {
      setRemovingId(freelancerId);
      await removeSavedFreelancer(freelancerId);
      setFreelancers((prev) => prev.filter((f) => (f.id || f.freelancer_id) !== freelancerId));
      toast.success('Removed from saved');
    } catch (error) {
      toastApiError(error, 'Could not remove');
    } finally {
      setRemovingId(null);
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
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
      <SectionHeader
        title="Saved Talent"
        subtext={`${freelancers.length} freelancer${freelancers.length !== 1 ? 's' : ''} saved`}
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                <div className="w-16 h-16 bg-white/10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-24" />
                  <div className="h-5 bg-white/10 rounded-full w-20" />
                </div>
              </div>
              <div className="flex-1 w-full mt-2 md:mt-0">
                <div className="h-5 bg-white/10 rounded w-1/2" />
              </div>
              <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0 md:w-64 shrink-0">
                <div className="h-10 w-full md:w-1/2 bg-white/10 rounded-lg" />
                <div className="h-10 w-full md:w-1/2 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          imageSrc="/ChatGPT Image Jun 1, 2026, 12_33_58 PM.png"
          title="No saved talent yet"
          description="Save freelancers while browsing to quickly find them later."
          action={
            <Button onClick={() => navigate('/find-freelancers')}>
              Browse Talent
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {freelancers.map((row) => {
            const f = row.freelancer || row;
            const id = f.id || row.freelancer_id || row.id;
            const name = f.name || 'Unknown';
            const avatarUrl = f.image || f.avatar_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23334155%22/%3E%3Ccircle cx=%2232%22 cy=%2226%22 r=%2212%22 fill=%22%2394a3b8%22/%3E%3Cellipse cx=%2232%22 cy=%2252%22 rx=%2218%22 ry=%2212%22 fill=%22%2394a3b8%22/%3E%3C/svg%3E';
            const title = f.title || f.headline || '';
            const busy = removingId === id;

            return (
              <div
                key={id}
                className="bg-transparent border border-white/10 rounded-xl p-5 hover:border-accent/40 transition-all shadow-sm group relative flex flex-col md:flex-row md:items-start gap-5"
              >
                {/* Bookmark & Delete absolute buttons on top-right */}
                <div className="absolute top-5 right-5 flex items-center gap-3">
                  <button
                    disabled={busy}
                    onClick={() => handleRemove(id)}
                    className="p-1 text-accent/80 hover:text-accent transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Unsave Freelancer"
                  >
                    <Bookmark size={15} className="fill-accent text-accent" />
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => handleRemove(id)}
                    className="p-1 text-white/40 hover:text-red-500 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-start gap-4 md:w-64 shrink-0 pr-16 md:pr-0">
                  <div className="relative">
                    <Avatar
                      src={f.image || f.avatar_url}
                      name={name}
                      size="lg"
                      className="ring-2 ring-border group-hover:ring-accent/40 transition-all"
                    />
                    {f.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5">
                        <ShieldCheck size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-white font-semibold text-sm truncate group-hover:text-accent transition-colors">{name}</h3>
                      {f.has_availability_badge && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 animate-pulse shrink-0">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Available</span>
                        </div>
                      )}
                    </div>
                    {title && <p className="text-white/40 text-[10px] mt-0.5 italic leading-relaxed">{title}</p>}
                    {f.price && <p className="text-[10px] font-bold text-accent mt-1">{f.price}</p>}
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0 flex flex-col gap-3.5 w-full md:w-auto">
                  {/* Top: Skills */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1.5">Skills</p>
                    {f.skills && f.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {f.skills.slice(0, 6).map((skill, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-light-text/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/30 italic">No skills listed</p>
                    )}
                  </div>

                  {/* Bottom: Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2.5 border-t border-white/5">
                    {/* Experience */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">Experience</p>
                      <p className="text-xs text-white/60 font-medium">
                        {f.experience_years ? (String(f.experience_years).toLowerCase().includes('year') || String(f.experience_years).toLowerCase().includes('yr') ? f.experience_years : `${f.experience_years} years`) : 'Not specified'}
                      </p>
                    </div>
                    {/* Reliability */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">Reliability Score</p>
                      <p className="text-xs text-white/60 font-medium">
                        {f.reliability_score != null ? `${f.reliability_score}%` : '100%'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-1.5 sm:gap-3 shrink-0 self-end md:self-end mt-2 md:mt-0 flex-wrap">
                  <button
                    onClick={() => navigate(`/client/direct-contracts/new?freelancer_id=${id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 text-white/50 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:border-accent/40 hover:text-accent transition-all cursor-pointer whitespace-nowrap"
                  >
                    Direct Contract
                  </button>
                  <button
                    onClick={() => navigate(`/freelancer/${id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 text-white/70 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleMessage(id)}
                    className="flex-1 md:flex-none flex items-center justify-center px-3 sm:px-5 py-1.5 sm:py-2 bg-accent text-white border border-accent rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Message
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

export default SavedTalent;
