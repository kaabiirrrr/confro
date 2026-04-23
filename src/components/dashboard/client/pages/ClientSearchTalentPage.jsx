import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bookmark, FileSignature, MessageCircle, SlidersHorizontal, X, Star, ShieldCheck,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  getFreelancers,
  getSavedFreelancers,
  saveFreelancer,
  removeSavedFreelancer,
  getOrCreateConversation,
} from '../../../../services/apiService';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../common/InfinityLoader';
import CustomDropdown from '../../../ui/CustomDropdown';
import { formatINR } from '../../../../utils/currencyUtils';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Design & Creative',
  'Writing & Translation', 'Data Science & ML', 'DevOps & Cloud',
  'Marketing & SEO', 'Finance & Accounting', 'Video & Animation', 'Other',
];

const SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Vue.js',
  'PHP', 'Laravel', 'Django', 'Flutter', 'Swift', 'AWS', 'Docker',
  'UI/UX Design', 'Figma', 'SEO', 'Content Writing', 'Data Analysis',
];

const LIMIT = 20;

const normalizeSavedIds = (payload) => {
  const list = payload?.data ?? payload;
  const arr = Array.isArray(list) ? list
    : Array.isArray(list?.freelancers) ? list.freelancers
    : Array.isArray(list?.data) ? list.data : [];
  const ids = new Set();
  arr.forEach(row => {
    const f = row.freelancer || row;
    const id = f.id || row.freelancer_id || row.id;
    if (id) ids.add(String(id));
  });
  return ids;
};

const Stars = ({ rating }) => {
  const r = parseFloat(rating) || 0;
  if (!r) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          className={i <= Math.round(r) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
      ))}
      <span className="text-white/40 text-xs ml-1">{r.toFixed(1)}</span>
    </div>
  );
};

export default function ClientSearchTalentPage() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [saveBusy, setSaveBusy] = useState(null);
  const [messageBusy, setMessageBusy] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const debounceRef = useRef(null);

  useEffect(() => {
    getSavedFreelancers()
      .then(res => setSavedIds(normalizeSavedIds(res)))
      .catch(() => {});
  }, []);

  const fetchFreelancers = useCallback(async (params) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
      const res = await getFreelancers(clean);
      // handle both paginated and flat responses
      const data = res?.data ?? res ?? [];
      setFreelancers(Array.isArray(data) ? data : data?.data ?? []);
      if (res?.pagination) {
        setPagination(res.pagination);
      } else {
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        setPagination({ total: arr.length, page: 1, pages: 1 });
      }
    } catch (err) {
      toastApiError(err, 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, skill, category, minRate, maxRate]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFreelancers({
        search, skill, category,
        min_rate: minRate, max_rate: maxRate,
        page, limit: LIMIT,
      });
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, skill, category, minRate, maxRate, page, fetchFreelancers]);

  const handleToggleSave = async (freelancer) => {
    const id = String(freelancer.id);
    const wasSaved = savedIds.has(id);
    setSaveBusy(id);
    try {
      if (wasSaved) {
        await removeSavedFreelancer(freelancer.id);
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        toast.success('Removed from saved');
      } else {
        await saveFreelancer(freelancer.id);
        setSavedIds(prev => new Set(prev).add(id));
        toast.success('Saved to your list');
      }
    } catch (err) {
      toastApiError(err, 'Could not update saved talent');
    } finally {
      setSaveBusy(null);
    }
  };

  const handleMessage = async (freelancer) => {
    setMessageBusy(String(freelancer.id));
    try {
      await getOrCreateConversation(freelancer.id);
      navigate('/client/messages');
    } catch {
      navigate('/client/messages');
    } finally {
      setMessageBusy(null);
    }
  };

  const clearFilters = () => { setSkill(''); setCategory(''); setMinRate(''); setMaxRate(''); };
  const hasFilters = skill || category || minRate || maxRate;

  const selectCls = "w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent/50";
  const inputCls  = "w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent/50 placeholder-white/30";

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Find Talent</h1>
        <p className="text-white/50 text-sm">Browse verified freelancers and hire the right person for your project.</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, title, or skill..."
            className="w-full bg-secondary border border-white/10 text-white text-sm rounded-lg pl-9 pr-9 py-2.5 focus:outline-none focus:border-accent/50 placeholder-white/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition ${showFilters || hasFilters ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-white/60 hover:text-white'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-secondary border border-white/10 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">Skill</label>
            <CustomDropdown
              options={SKILLS.map(s => ({ label: s, value: s }))}
              value={skill}
              onChange={val => setSkill(val)}
              placeholder="Any skill"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Category</label>
            <CustomDropdown
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
              value={category}
              onChange={val => setCategory(val)}
              placeholder="Any category"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Min Rate (₹/hr)</label>
            <input type="number" min="0" value={minRate} onChange={e => setMinRate(e.target.value)} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Max Rate (₹/hr)</label>
            <input type="number" min="0" value={maxRate} onChange={e => setMaxRate(e.target.value)} placeholder="Any" className={inputCls} />
          </div>
          {hasFilters && (
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button onClick={clearFilters} className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition">
                <X size={12} /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && pagination.total > 0 && (
        <p className="text-white/40 text-sm mb-4">{pagination.total} freelancer{pagination.total !== 1 ? 's' : ''} found</p>
      )}

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse bg-secondary border border-white/5 rounded-xl p-5 h-52" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-secondary border border-white/5 rounded-xl text-center">
          <Search className="w-12 h-12 text-white/20 mb-3" />
          <h3 className="text-lg font-semibold mb-1">No freelancers found</h3>
          <p className="text-white/40 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {freelancers.map(f => {
              const id = String(f.id);
              const isSaved   = savedIds.has(id);
              const isSaveBusy = saveBusy === id;
              const isMsgBusy  = messageBusy === id;
              const rate = f.hourly_rate ? `${formatINR(f.hourly_rate)}/hr` : f.price ? `${formatINR(f.price)}` : null;
              const avatar = f.avatar_url || f.image;
              const isVerified = f.is_verified || f.verified;

              return (
                <div key={f.id} className="bg-secondary border border-white/10 rounded-xl p-5 hover:border-white/20 transition flex flex-col gap-4">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    {avatar
                      ? <img src={avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-lg shrink-0">{f.name?.[0]?.toUpperCase()}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-white truncate">{f.name}</p>
                        {f.has_availability_badge && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Available Now</span>
                          </div>
                        )}
                        {isVerified && (
                          <ShieldCheck size={15} className="text-blue-400 shrink-0" title="Identity Verified" />
                        )}
                      </div>
                      <p className="text-white/50 text-sm truncate">{f.title}</p>
                      <Stars rating={f.rating} />
                    </div>
                    {rate && <span className="text-accent font-semibold text-sm shrink-0">{rate}</span>}
                  </div>

                  {/* Bio snippet */}
                  {f.bio && (
                    <p className="text-white/40 text-xs line-clamp-2">{f.bio}</p>
                  )}

                  {/* Skills */}
                  {f.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {f.skills.slice(0, 5).map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">{s}</span>
                      ))}
                      {f.skills.length > 5 && (
                        <span className="px-2.5 py-0.5 bg-white/5 text-white/40 text-xs rounded-full">+{f.skills.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleToggleSave(f)}
                      disabled={isSaveBusy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition disabled:opacity-50 ${
                        isSaved
                          ? 'bg-accent/10 border-accent/30 text-accent'
                          : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {isSaveBusy ? <InfinityLoader size={20} /> : <Bookmark size={12} className={isSaved ? 'fill-current' : ''} />}
                      {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={() => navigate(`/client/direct-contracts/new?freelancer_id=${f.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition"
                    >
                      <FileSignature size={12} />
                      Direct Contract
                    </button>

                    <button
                      onClick={() => handleMessage(f)}
                      disabled={isMsgBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition disabled:opacity-50 ml-auto"
                    >
                      {isMsgBusy ? <InfinityLoader size={20} /> : <MessageCircle size={12} />}
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between text-sm text-white/40">
              <span>{pagination.total} freelancer{pagination.total !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-white/60">Page {page} of {pagination.pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
