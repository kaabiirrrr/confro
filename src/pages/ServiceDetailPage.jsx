import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, RefreshCcw, Check, Shield, MessageSquare, ArrowRight, AlertCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServiceById, orderService, getOrCreateConversation } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import logger from '../utils/logger';
import InfinityLoader from '../components/common/InfinityLoader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

  if (loading) return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <InfinityLoader/>
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

  const pkg = packages[selectedPackage];
  const imgs = service.images?.filter(Boolean).length > 0 ? service.images.filter(Boolean) : ['/service1.jpeg'];

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
            <Star className="w-5 h-5 text-accent fill-accent shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Rating</p>
              <p className="font-bold text-sm">
                {service.rating ? Number(service.rating).toFixed(1) : service.freelancer?.rating ? Number(service.freelancer.rating).toFixed(1) : 'New'}
                {service.orders_count > 0 && (
                  <span className="text-white/40 font-normal"> ({service.orders_count} reviews)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-3">
          {/* Main image — card style */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-secondary shadow-xl flex items-center justify-center" style={{ minHeight: '400px' }}>
            <img
              src={imgs[activeImg] ?? imgs[0]}
              className="w-full h-auto max-h-[500px] object-contain"
              alt={service.title}
              onError={e => { e.target.src = '/service1.jpeg'; }}
            />
          </div>
          {/* Thumbnails */}
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

        {/* Order Card with package tabs */}
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
    </div>
  );
};

export default ServiceDetailPage;
