import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Clock, RefreshCcw, Check, 
  Shield, MessageSquare, Share2, AlertCircle,
  ChevronRight, ArrowRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServiceById, orderService, getOrCreateConversation } from '../../../../services/apiService';
import SectionHeader from '../../../ui/SectionHeader';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import InfinityLoader from '../../../common/InfinityLoader';

const ClientServiceDetailPage = () => {
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
        if (data.success) {
          setService(data.data);
        } else {
          toast.error('Service not found');
        }
      } catch (err) {
        toast.error('Failed to load service details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-20">
        <InfinityLoader size={60} />
        <p className="text-white/40 font-medium">Fetching service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="w-20 h-20 text-white/10 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
        <p className="text-white/40 mb-10 max-w-lg mx-auto text-lg">
          The service offering you're looking for might have been retired by the freelancer or is no longer available in the marketplace.
        </p>
        <Button onClick={() => navigate('/client/dashboard')} variant="secondary">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const defaultPackages = [
    { name: 'Basic', price: service.price || 0, delivery: service.delivery_days || 3, revisions: service.revisions || 1, description: 'Basic starter package for this service.', features: ['Standard Support', '1 Revision', 'High Quality Delivery'] },
    { name: 'Standard', price: Math.round((service.price || 0) * 1.5), delivery: Math.max(1, (service.delivery_days || 3) - 1), revisions: (service.revisions || 1) + 2, description: 'Expanded features with faster turnaround.', features: ['Priority Support', '3 Revisions', 'Source Files', 'Expanded Scope'] },
    { name: 'Premium', price: (service.price || 0) * 2, delivery: Math.max(1, (service.delivery_days || 3) - 2), revisions: 99, description: 'Elite professional package with full commercial rights.', features: ['24/7 VIP Support', 'Unlimited Revisions', 'Full Source Files', 'Commercial Rights', 'Rush Delivery'] }
  ];

  const packages = (service.packages && Array.isArray(service.packages) && service.packages.length > 0) 
    ? service.packages.map((p, i) => ({
        ...defaultPackages[i],
        ...p,
        features: Array.isArray(p.features) ? p.features : (defaultPackages[i]?.features || [])
      }))
    : defaultPackages;

  const currentPkg = packages[selectedPackage] || packages[0];

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    try {
      const res = await orderService(service.id, {
        package_name: currentPkg?.name || 'Basic',
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
      const convId = res.data?.id || res.id;
      navigate(`/client/messages${convId ? `?conv=${convId}` : ''}`);
    } catch (err) {
      toast.error('Failed to start conversation');
    } finally { setContacting(false); }
  };


  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
      
      {/* PAGE HEADER (Matched to Proposals/Jobs) */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-accent text-sm hover:underline mb-4 font-medium"
        >
          <ArrowLeft size={14} /> Back to Marketplace
        </button>
        <SectionHeader 
          title={service.title}
          subtext={`Service ID: ${service.id?.split('-')[0]} • Published by ${service.freelancer?.name || 'Verified Expert'}`}
          action={
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" icon={MessageSquare} onClick={handleContact} disabled={contacting}>
                {contacting ? 'Opening...' : 'Contact Expert'}
              </Button>
              <Button size="sm" icon={ArrowRight} onClick={handleOrder} disabled={ordering}>
                {ordering ? 'Ordering...' : 'Hire Now'}
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SERVICE INFO */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* MEDIA SHOWCASE (REDUCED SIZE) */}
          <div className="rounded-xl overflow-hidden bg-transparent border border-white/10 h-[350px]">
            <img 
              src={service.images?.[0] || '/service1.jpeg'} 
              className="w-full h-full object-cover"
              alt="Service showcase"
            />
          </div>

          {/* SERVICE STATS (MORE COMPACT) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Category', value: service.category, icon: Info },
              { label: 'Rating', value: '4.9/5.0', icon: Star, color: 'text-yellow-400' },
              { label: 'Orders', value: '124+', icon: Check },
              { label: 'Delivery', value: `${service.delivery_days} Days`, icon: Clock }
            ].map((stat, i) => (
              <div key={i} className="bg-transparent border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color || 'text-accent'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider leading-none mb-1">{stat.label}</p>
                  <p className="font-semibold text-xs text-white/80 truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PROJECT DESCRIPTION */}
          <div className="bg-transparent border border-white/5 rounded-xl p-5">
            <h2 className="text-md font-semibold mb-3 flex items-center gap-2 text-white/90">
              <div className="w-0.5 h-3.5 bg-accent rounded-full" />
              Description
            </h2>
            <div className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap">
              {service.description || "No detailed description available."}
            </div>
          </div>

          {/* SELLER CARD (COMPACT) */}
          <div className="bg-transparent border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg overflow-hidden border border-accent/20">
              {service.freelancer?.avatar_url 
                ? <img src={service.freelancer.avatar_url} className="w-full h-full object-cover" />
                : service.freelancer?.name?.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="font-semibold text-sm text-white mb-0.5">{service.freelancer?.name || 'Expert'}</h3>
               <p className="text-white/40 text-[11px] truncate">{service.freelancer?.title || 'Professional Freelancer'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-accent hover:text-accent font-medium text-xs"
              onClick={() => navigate(`/freelancer/${service.freelancer?.user_id || service.freelancer?.id}`)}
            >
              View Profile
            </Button>
          </div>

        </div>

        {/* SIDEBAR: PRICING (MATCHED TO PROPOSAL STYLE) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            
            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm">
              {/* TABS (FLAT STYLE) */}
              <div className="flex border-b border-white/5">
                {packages.map((pkg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPackage(idx)}
                    className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest transition border-b-2 ${
                      selectedPackage === idx 
                        ? 'text-accent border-accent bg-transparent' 
                        : 'text-white/40 border-transparent hover:text-white'
                    }`}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-0.5">Total Price</p>
                  <h3 className="text-2xl font-bold text-white">${currentPkg.price}</h3>
                </div>

                <p className="text-white/50 text-[11px] mb-4 leading-relaxed">
                  {currentPkg.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span className="flex items-center gap-2 font-medium"><Clock size={12} /> Delivery Time</span>
                    <span className="font-bold text-white/80">{currentPkg.delivery} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span className="flex items-center gap-2 font-medium"><RefreshCcw size={12} /> Revisions</span>
                    <span className="font-bold text-white/80">
                      {currentPkg.revisions === 99 ? 'Unlimited' : currentPkg.revisions}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 pt-3 border-t border-white/5">
                  {(currentPkg.features || []).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/60">
                      <Check className="w-2.5 h-2.5 text-accent shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full h-10 rounded-lg text-sm font-semibold bg-accent hover:bg-accent/90" onClick={handleOrder} disabled={ordering}>
                  {ordering ? 'Placing Order...' : 'Select and Hire'}
                </Button>
              </div>
            </div>

            <div className="bg-transparent rounded-xl p-6 border border-white/5">
               <div className="flex items-center gap-3 mb-2">
                 <Shield className="w-4 h-4 text-accent" />
                 <h4 className="text-sm font-semibold text-white/80">Safe & Protected</h4>
               </div>
               <p className="text-white/30 text-xs leading-relaxed">
                 Funds are securely held in escrow and released only when you approve the final delivery.
               </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );

};

export default ClientServiceDetailPage;
