import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Clock, RefreshCcw, Check, 
  Shield, MessageSquare, Share2, AlertCircle,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServiceById, orderService, getOrCreateConversation } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import logger from '../utils/logger';
import InfinityLoader from '../components/common/InfinityLoader';


const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        setService(data.data);
      } catch (err) {
        toast.error('Failed to load service details');
        logger.error("Failed to fetch service details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <InfinityLoader size={20} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-white/20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
        <p className="text-white/40 mb-8 max-w-md">The service you're looking for might have been removed or is no longer available.</p>
        <Link to="/" className="px-6 py-3 bg-accent text-primary font-bold rounded-xl hover:scale-105 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  const packages = (service.packages && Array.isArray(service.packages) && service.packages.length > 0) 
    ? service.packages 
    : [
    { name: 'Basic', price: service.price || 0, delivery: service.delivery_days || 3, revisions: service.revisions || 1, description: 'Basic starter package for this service.', features: ['Standard Support', '1 Revision', 'High Quality'] },
    { name: 'Standard', price: Math.round((service.price || 0) * 1.5), delivery: Math.max(1, (service.delivery_days || 3) - 1), revisions: (service.revisions || 1) + 2, description: 'Best value package with more features.', features: ['Priority Support', '3 Revisions', 'Source Files', 'High Quality'] },
    { name: 'Premium', price: (service.price || 0) * 2, delivery: Math.max(1, (service.delivery_days || 3) - 2), revisions: 99, description: 'Full professional package for elite clients.', features: ['24/7 Support', 'Unlimited Revisions', 'Full Source Files', 'Commercial Rights', 'High Quality'] }
  ];

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const res = await orderService(service.id, {
        package_name: packages[selectedPackage]?.name || 'Basic',
        requirements: '',
      });
      if (res.success) {
        toast.success('Order placed successfully!');
        navigate(`/client/contracts`);
      }
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
    } catch (err) {
      toast.error('Failed to start conversation');
    } finally { setContacting(false); }
  };


  return (
    <div className="min-h-screen bg-primary text-white font-inter pb-20">
      {/* Header / Nav */}
      <div className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Back to Marketplace</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="px-6 py-2.5 bg-accent text-primary font-bold text-sm rounded-xl hover:scale-105 transition shadow-lg shadow-accent/20"
              onClick={handleOrder} disabled={ordering}>
              {ordering ? 'Placing Order...' : `Order Now — ₹${packages[selectedPackage]?.price ?? 0}`}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Title & Meta */}
            <section>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {service.category}
                </span>
                {service.subcategory && (
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {service.subcategory}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
                {service.title}
              </h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 py-2 px-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {service.freelancer?.name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Expert Freelancer</p>
                    <p className="font-bold text-sm">{service.freelancer?.name || 'Top Rated Talent'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-bold">4.9</span>
                  <span className="text-white/40 text-sm">(124 reviews)</span>
                </div>
              </div>
            </section>

            {/* Main Image Gallery */}
            <section className="bg-secondary rounded-[40px] border border-white/10 overflow-hidden aspect-video relative group">
              <img 
                src={service.images?.[0] || '/service1.jpeg'} 
                className="w-full h-full object-cover"
                alt="Service hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white font-medium">Main showcase image</p>
              </div>
              
              {/* Thumbnails */}
              {(service.images?.length ?? 0) > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                  {(service.images || []).map((img, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:scale-110 transition">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Description */}
            <section className="bg-secondary/30 rounded-[40px] border border-white/5 p-10">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-8 border-b border-white/5 pb-4">
                About this service
              </h2>
              <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6">
                {(service.description || "No description provided.").split('\n').map((para, i) => para.trim() && (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>


            {/* FAQs */}
            {(service.faqs?.length > 0) && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-8 border-b border-white/5 pb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {(service.faqs || []).map((faq, i) => (
                    <div key={i} className="bg-secondary/50 rounded-2xl border border-white/5 p-6 hover:border-white/10 transition">
                      <h3 className="font-bold flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center text-[10px]">Q</span>
                        {faq.question}
                      </h3>
                      <p className="mt-4 text-white/50 text-sm pl-9 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Pricing & Conversion */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="bg-secondary rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                {/* Package Tabs */}
                <div className="flex border-b border-white/5">
                  {packages.map((pkg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPackage(idx)}
                      className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-widest transition relative ${
                        selectedPackage === idx ? 'text-accent' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {pkg.name}
                      {selectedPackage === idx && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-black">₹{packages[selectedPackage]?.price ?? 0}</h3>
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Estimated Total
                    </div>
                  </div>

                  <p className="text-white/50 text-sm mb-8 leading-relaxed">
                    {packages[selectedPackage]?.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>{packages[selectedPackage]?.delivery ?? 3} Days Delivery</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <RefreshCcw className="w-4 h-4 text-accent" />
                      <span>{packages[selectedPackage]?.revisions === 99 ? 'Unlimited' : (packages[selectedPackage]?.revisions ?? 1)} Revisions</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-10">
                    {(packages[selectedPackage]?.features || []).map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                        <Check className="w-4 h-4 text-accent" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleOrder} disabled={ordering}
                    className="w-full py-5 bg-accent text-primary font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-3 text-lg mb-4 shadow-xl shadow-accent/20">
                    {ordering ? 'Placing Order...' : 'Continue to Order'}
                    {!ordering && <ArrowRight className="w-5 h-5" />}
                  </button>
                  
                  <button onClick={handleContact} disabled={contacting}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition flex items-center justify-center gap-3 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    {contacting ? 'Opening chat...' : 'Contact Freelancer'}
                  </button>
                </div>

                <div className="px-8 py-5 bg-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  Payments are secure & protected
                </div>
              </div>

              {/* Badges */}
              <div className="bg-accent/5 rounded-3xl border border-accent/10 p-6 flex items-center gap-5">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Standard Protection</h4>
                  <p className="text-[11px] text-white/40">Escrow protected payments for your peace of mind.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
