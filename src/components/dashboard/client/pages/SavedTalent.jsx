import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSavedFreelancers,
  removeSavedFreelancer,
} from '../../../../services/apiService';
import { Bookmark, MessageCircle, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import SectionHeader from '../../../ui/SectionHeader';
import EmptyState from '../../../ui/EmptyState';

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
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-6">
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
          icon={Bookmark}
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
              <Card key={id} className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 md:w-56 shrink-0">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/10 bg-white/5 shrink-0"
                  />
                  <div className="flex flex-col justify-center min-h-16">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-lg leading-tight text-white truncate">{name}</h3>
                      {f.is_verified && (
                        <ShieldCheck size={15} className="text-blue-400 shrink-0" title="Identity Verified" />
                      )}
                      {f.has_availability_badge && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 animate-pulse ml-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Available</span>
                        </div>
                      )}
                    </div>
                    {title && <p className="text-sm text-white/50 mt-1 line-clamp-2">{title}</p>}
                  </div>
                </div>

                {/* Skills */}
                <div className="flex-1 flex flex-wrap gap-2">
                  {(f.skills || []).slice(0, 6).map((skill, i) => (
                    <span key={i} className="text-xs bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    loading={busy}
                    onClick={() => handleRemove(id)}
                    icon={Trash2}
                    className={busy ? 'opacity-50' : ''}
                  >
                    {busy ? 'Removing…' : 'Remove'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/freelancer/${id}`)}
                    icon={ExternalLink}
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleMessage(id)}
                    icon={MessageCircle}
                  >
                    Message
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

export default SavedTalent;
