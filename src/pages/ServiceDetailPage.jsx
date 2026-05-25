import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, RefreshCcw, Check, Shield, MessageSquare, ArrowRight, AlertCircle, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getServiceById, orderService, getOrCreateConversation,
  getServiceReviews, createServiceReview, getOrderReviewStatus, getMyServiceOrders,
} from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import logger from '../utils/logger';
import InfinityLoader from '../components/common/InfinityLoader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ── Star picker ─────────────────────────────────────────────────────────── */
const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className="transition-transform hover:scale-110 focus:outline-none">
        <Star size={28}
          className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
        />
      </button>
    ))}
  </div>
);

/* ── Review modal ────────────────────────────────────────────────────────── */
const ReviewModal = ({ orderId, serviceId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await createServiceReview({ order_id: orderId, rating, comment });
      toast.success('Review submitted!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60"
      onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0f1623] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Rate this Service</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Your Rating</p>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-accent text-sm font-semibold">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this service..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50 resize-none transition"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-full border border-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting || rating === 0}
              className="flex-1 py-3 rounded-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Star display (read-only) ────────────────────────────────────────────── */
const StarDisplay = ({ value, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={size}
        className={n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}
      />
    ))}
  </div>
);

/* ── Main page ───────────────────────────────────────────────────────────── */
const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsAvg, setReviewsAvg] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Client rating eligibility
  const [completedOrder, setCompletedOrder] = useState(null); // order the client can review
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        setService(data.data);
      } catch (err) {
        toast.error('Failed to load service details');
        logger.error('Failed to fetch service details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // Load reviews
  const loadReviews = async (page = 1) => {
    setReviewsLoading(true);
    try {
      const res = await getServiceReviews(id, page);
      const incoming = res?.data?.reviews || [];
      setReviewsAvg(res?.data?.average_rating || 0);
      setReviewsTotal(res?.data?.total_reviews || 0);
      setReviews(prev => page === 1 ? incoming : [...prev, ...incoming]);
      setHasMore(incoming.length === 10);
    } catch {
      // silently fail — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => { loadReviews(1); }, [id]);

  // Check if logged-in client has a completed order for this service and hasn't reviewed yet
  useEffect(() => {
    if (!user || user.role !== 'CLIENT') return;
    const checkEligibility = async () => {
      try {
        const res = await getMyServiceOrders();
        const orders = res?.data || [];
        const eligible = orders.find(o => o.service_id === id && o.status === 'COMPLETED');
        if (!eligible) return;
        setCompletedOrder(eligible);
        const statusRes = await getOrderReviewStatus(eligible.id);
        setAlreadyReviewed(statusRes?.data?.reviewed || false);
      } catch {
        // non-critical
      }
    };
    checkEligibility();
  }, [user, id]);

  if (loading) return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <InfinityLoader />
    </div>
  );

  if (!service) return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-16 h-16 text-white/20 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
      <p className="text-white/40 mb-8 max-w-md">This service may have been removed or is no longer available.</p>
      <Link to="/" className="px-6 py-3 bg-accent text-primary font-bold rounded-full hover:scale-105 transition">Back to Home</Link>
    </div>
  );

  const packages = (service.packages && Array.isArray(service.packages) && service.packages.length > 0)
    ? service.packages
    : [
      { name: 'Basic', price: service.price || 0, delivery: service.delivery_days || 3, revisions: service.revisions || 1, description: 'Basic starter package.', features: ['Standard Support', '1 Revision', 'High Quality'] },
      { name: 'Standard', price: Math.round((service.price || 0) * 1.5), delivery: Math.max(1, (service.delivery_days || 3) - 1), revisions: (service.revisions || 1) + 2, description: 'Best value package.', features: ['Priority Support', '3 Revisions', 'Source Files'] },
      { name: 'Premium', price: (service.price || 0) * 2, delivery: Math.max(1, (service.delivery_days || 3) - 2), revisions: 99, description: 'Full professional package.', features: ['24/7 Support', 'Unlimited Revisions', 'Commercial Rights'] }
    ];

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const res = await orderService(service.id, { package_name: packages[selectedPackage]?.name || 'Basic', requirements: '' });
      if (res.success) { toast.success('Order placed!'); navigate('/client/contracts'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setOrdering(false); }
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    setContacting(true);
    try {
      const res = await getOrCreateConversation(service.freelancer?.user_id);
      if (res.success || res.data) {
        const convId = res.data?.id || res.id;
        navigate(`/client/messages${convId ? `?conv=${convId}` : ''}`);
      }
    } catch { toast.error('Failed to start conversation'); }
    finally { setContacting(false); }
  };

  const handleLoadMore = () => {
    const next = reviewPage + 1;
    setReviewPage(next);
    loadReviews(next);
  };

  const handleReviewSuccess = () => {
    setAlreadyReviewed(true);
    loadReviews(1);
    setReviewPage(1);
  };

  const pkg = packages[selectedPackage];
  const imgs = service.images?.filter(Boolean).length > 0 ? service.images.filter(Boolean) : ['/service1.jpeg'];

  // Real rating display
  const displayRating = reviewsAvg > 0 ? Number(reviewsAvg).toFixed(1) : (service.rating > 0 ? Number(service.rating).toFixed(1) : null);
  const displayCount = reviewsTotal || service.reviews_count || 0;

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-20 space-y-8">

        {/* Category tags */}
        <div className="flex flex-wrap gap-2">
          {service.category && (
            <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full">{service.category}</span>
          )}
          {service.subcategory && (
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider rounded-full">{service.subcategory}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black leading-tight">{service.title}</h1>

        {/* Freelancer + Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10">
            {service.freelancer?.avatar_url ? (
              <img src={service.freelancer.avatar_url} alt={service.freelancer.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                {service.freelancer?.name?.charAt(0) || <User size={18} />}
              </div>
            )}
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Expert Freelancer</p>
              <p className="font-bold text-sm">{service.freelancer?.name || 'Top Rated Talent'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Rating</p>
              <p className="font-bold text-sm">
                {displayRating
                  ? <>{displayRating} <span className="text-white/40 font-normal">({displayCount} {displayCount === 1 ? 'review' : 'reviews'})</span></>
                  : <span className="text-white/40 font-normal">No reviews yet</span>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-3">
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-secondary shadow-xl flex items-center justify-center" style={{ minHeight: '400px' }}>
            <img
              src={imgs[activeImg] ?? imgs[0]}
              className="w-full h-auto max-h-[500px] object-contain"
              alt={service.title}
              onError={e => { e.target.src = '/service1.jpeg'; }}
            />
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imgs.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-24 h-18 rounded-2xl border-2 overflow-hidden transition shadow-md ${activeImg === i ? 'border-accent shadow-accent/20' : 'border-white/10 hover:border-white/30'}`}>
                  <img src={img} className="w-full h-full object-cover" alt={`img-${i}`}
                    onError={e => { e.target.src = '/service1.jpeg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        <div className="rounded-3xl border border-white/5 p-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6 pb-4 border-b border-white/5">About this service</h2>
          <div className="text-white/70 text-sm leading-relaxed space-y-4">
            {(service.description || 'No description provided.').split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
          </div>
        </div>

        {/* Order Card */}
        <div className="rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-white/5">
            {packages.map((p, idx) => (
              <button key={idx} onClick={() => setSelectedPackage(idx)}
                className={`py-4 text-[10px] font-bold uppercase tracking-widest transition relative ${selectedPackage === idx ? 'text-accent' : 'text-white/40 hover:text-white'}`}>
                {p.name}
                {selectedPackage === idx && <motion.div layoutId="pkgTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
              </button>
            ))}
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black">₹{pkg?.price ?? 0}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Estimated Total</span>
            </div>
            {pkg?.description && <p className="text-white/50 text-xs leading-relaxed">{pkg.description}</p>}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 text-sm">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <span>{pkg?.delivery ?? 3} Days Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 text-sm">
                <RefreshCcw className="w-4 h-4 text-accent shrink-0" />
                <span>{pkg?.revisions === 99 ? 'Unlimited' : (pkg?.revisions ?? 1)} Revisions</span>
              </div>
            </div>
            {pkg?.features?.length > 0 && (
              <div className="space-y-2">
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" /><span>{f}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleOrder} disabled={ordering}
              className="w-full py-4 bg-accent text-white font-black rounded-full hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent/20">
              {ordering ? 'Placing Order...' : 'Continue to Order'}
              {!ordering && <ArrowRight className="w-4 h-4" />}
            </button>
            <button onClick={handleContact} disabled={contacting}
              className="w-full py-3.5 border border-white/10 text-white font-bold rounded-full hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4" />
              {contacting ? 'Opening chat...' : 'Contact Freelancer'}
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <Shield className="w-3 h-3" />Payments are secure & protected
            </div>
          </div>
        </div>

        {/* Standard Protection */}
        <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Standard Protection</p>
            <p className="text-[11px] text-white/40">Escrow protected payments for your peace of mind.</p>
          </div>
        </div>

        {/* ── REVIEWS SECTION ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Client Reviews</h2>
              {displayRating && (
                <div className="flex items-center gap-2 mt-2">
                  <StarDisplay value={Number(displayRating)} size={16} />
                  <span className="text-white font-bold text-lg">{displayRating}</span>
                  <span className="text-white/40 text-sm">({displayCount})</span>
                </div>
              )}
            </div>

            {/* Rate button — only for eligible clients */}
            {completedOrder && !alreadyReviewed && (
              <button onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold uppercase tracking-widest rounded-full transition">
                <Star size={13} className="fill-white" /> Rate this Service
              </button>
            )}
            {completedOrder && alreadyReviewed && (
              <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-widest">
                <Check size={13} /> Reviewed
              </span>
            )}
          </div>

          {reviewsLoading && reviews.length === 0 ? (
            <div className="flex justify-center py-10">
              <InfinityLoader />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-white/5">
              <Star size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No reviews yet</p>
              <p className="text-white/20 text-xs mt-1">Be the first to review this service after ordering</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="rounded-2xl border border-white/5 p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/20 overflow-hidden shrink-0">
                        {r.client?.avatar_url
                          ? <img src={r.client.avatar_url} alt={r.client.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-accent font-bold text-sm">
                              {r.client?.name?.charAt(0) || 'C'}
                            </div>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{r.client?.name || 'Client'}</p>
                        <p className="text-[10px] text-white/30">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <StarDisplay value={r.rating} size={13} />
                  </div>
                  {r.comment && (
                    <p className="text-white/60 text-sm leading-relaxed pl-12">{r.comment}</p>
                  )}
                </div>
              ))}

              {hasMore && (
                <button onClick={handleLoadMore} disabled={reviewsLoading}
                  className="w-full py-3 border border-white/10 rounded-full text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition">
                  {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* FAQs */}
        {service.faqs?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6 pb-4 border-b border-white/5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {service.faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-white/5 p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-accent/20 text-accent flex items-center justify-center text-[9px] shrink-0">Q</span>
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-white/50 text-sm pl-7 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />

      {/* Review modal */}
      <AnimatePresence>
        {showReviewModal && completedOrder && (
          <ReviewModal
            orderId={completedOrder.id}
            serviceId={id}
            onClose={() => setShowReviewModal(false)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetailPage;
