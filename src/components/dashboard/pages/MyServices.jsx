import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Package, ShoppingBag,
  ToggleLeft, ToggleRight, Image as ImageIcon,
  Clock, RefreshCw, Star, IndianRupee, Search, X
} from 'lucide-react';
import {
  getMyServices, updateService, deleteService,
  getMyServiceOrders, updateServiceOrderStatus,
} from '../../../services/apiService';
import { toastApiError } from '../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import { formatINR } from '../../../utils/currencyUtils';
import InfinityLoader from '../../common/InfinityLoader';

const STATUS_CFG = {
  PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Pending' },
  IN_PROGRESS: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'In Progress' },
  DELIVERED: { cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Delivered' },
  REVISION: { cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Revision' },
  COMPLETED: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Completed' },
  CANCELLED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: 'bg-white/5 text-white/40 border-white/10', label: status };
  return <span className={`px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`}>{cfg.label}</span>;
};

export default function MyServices() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [search, setSearch] = useState('');

  const loadServices = useCallback(async () => {
    setLoading(true);
    try { const res = await getMyServices(); setServices(res?.data ?? res ?? []); }
    catch (err) { toastApiError(err, 'Could not load services'); }
    finally { setLoading(false); }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try { const res = await getMyServiceOrders(); setOrders(res?.data ?? res ?? []); }
    catch (err) { toastApiError(err, 'Could not load orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { tab === 'services' ? loadServices() : loadOrders(); }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    setDeletingId(id);
    try { await deleteService(id); setServices(p => p.filter(s => s.id !== id)); toast.success('Service deleted'); }
    catch (err) { toastApiError(err, 'Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (svc) => {
    setTogglingId(svc.id);
    try {
      const res = await updateService(svc.id, { is_active: !svc.is_active });
      const u = res?.data ?? res;
      setServices(p => p.map(s => s.id === svc.id ? { ...s, is_active: u?.is_active ?? !svc.is_active } : s));
      toast.success(svc.is_active ? 'Deactivated' : 'Activated');
    } catch (err) { toastApiError(err, 'Failed'); }
    finally { setTogglingId(null); }
  };

  const handleOrderStatus = async (order, status) => {
    setUpdatingOrderId(order.id);
    try {
      await updateServiceOrderStatus(order.id, status);
      setOrders(p => p.map(o => o.id === order.id ? { ...o, status } : o));
      toast.success('Order updated');
    } catch (err) { toastApiError(err, 'Failed'); }
    finally { setUpdatingOrderId(null); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-light-text">My Services</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">Manage your offerings and incoming orders</p>
        </div>
        <button onClick={() => navigate('/freelancer/services/new')}
          className="flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 h-10 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition-all flex-shrink-0 mt-1 sm:mt-0"
        >
          CREATE NEW SERVICE
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text/20" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for services or keywords..."
          className="w-full bg-secondary border border-border rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-light-text focus:outline-none focus:border-accent/40 shadow-sm transition-all placeholder:text-light-text/20"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex max-sm:justify-between sm:gap-10 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] border-b border-border overflow-x-auto no-scrollbar">
        {[{ key: 'services', label: 'MY SERVICES', Icon: Package },
        { key: 'orders', label: 'ORDERS', Icon: ShoppingBag }].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 sm:flex-none pb-3 sm:pb-4 transition-all relative whitespace-nowrap flex items-center justify-center sm:justify-start gap-2 ${tab === key ? "text-accent" : "text-light-text/40 hover:text-light-text"}`}>
            {label}
            {tab === key && <motion.div layoutId="activeTabServices" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── SERVICES ── */}
      {tab === 'services' && (
        loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-transparent border border-white/5 rounded-2xl h-[180px]" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-transparent border border-white/5 rounded-[24px] sm:rounded-[40px] text-center px-4">
            <div className="mx-auto mb-6 text-white/20">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white/30 mb-2 uppercase tracking-widest leading-none">No services yet</h3>
            <p className="text-white/20 text-xs sm:text-sm mb-10 max-w-sm mx-auto font-medium">Create your first service to start receiving orders from clients.</p>
            <button onClick={() => navigate('/freelancer/services/new')}
              className="px-6 h-9 sm:h-10 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition">
              Create Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {services
              .filter(s =>
                s.title?.toLowerCase().includes(search.toLowerCase()) ||
                s.description?.toLowerCase().includes(search.toLowerCase()) ||
                s.category?.toLowerCase().includes(search.toLowerCase()) ||
                s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
              )
              .map(svc => (
                <div key={svc.id} className="group p-5 bg-transparent border border-white/10 rounded-2xl hover:border-accent transition-all shadow-sm hover:shadow-2xl hover:shadow-accent/5 flex flex-col md:flex-row gap-6">
                  {/* Left: Thumbnail (Find Work style integrated) */}
                  <div className="w-full md:w-64 h-40 md:h-auto rounded-xl overflow-hidden bg-transparent border border-white/5 shrink-0 relative">
                    {svc.images?.[0] ? (
                      <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${svc.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-black/60 text-white/40 border-white/10'}`}>
                      {svc.is_active ? 'Active' : 'Paused'}
                    </div>
                  </div>

                  {/* Right: Content (Mirroring JobCard) */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent truncate pr-2">
                          {svc.category || 'Service'}
                        </p>
                        <div className="hidden sm:block h-1 w-1 rounded-full bg-white/10 shrink-0" />
                        <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.1em] text-light-text/20">
                          Created {fmtDate(svc.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex gap-4 items-center">
                          <button
                            onClick={() => handleToggle(svc)}
                            disabled={togglingId === svc.id}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${svc.is_active ? 'bg-accent' : 'bg-white/10'
                              } ${togglingId === svc.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={svc.is_active ? "Deactivate service" : "Activate service"}
                          >
                            <motion.div
                              animate={{ x: svc.is_active ? 18 : 2 }}
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                          <button onClick={() => navigate(`/freelancer/services/edit/${svc.id}`)}
                            className="text-light-text/20 hover:text-accent transition-colors transform hover:scale-110 active:scale-95">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(svc.id)} disabled={deletingId === svc.id}
                            className="text-light-text/20 hover:text-red-400 transition-colors transform hover:scale-110 active:scale-95">
                            {deletingId === svc.id ? <InfinityLoader size={20} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                        <p className="sm:hidden text-[9px] font-bold uppercase tracking-[0.1em] text-light-text/20">
                          {fmtDate(svc.created_at)}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-3 truncate">
                      {svc.title}
                    </h3>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-y-3 sm:gap-y-0 gap-x-5 text-[12px] mb-4 items-center">
                      <span className="flex items-center gap-1.5 font-bold text-light-text/60 col-span-1">
                        <IndianRupee size={13} className="text-accent/60" /> Starting {formatINR(svc.price)}
                      </span>
                      <span className="flex items-center justify-end sm:justify-start gap-1.5 font-bold text-light-text/60 col-span-1">
                        <Clock size={13} className="text-accent/60" /> {svc.delivery_days}d Delivery
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-light-text/60 col-span-1">
                        <RefreshCw size={13} className="text-accent/60" /> {svc.revisions} Revisions
                      </span>
                      {svc.orders_count > 0 && (
                        <div className="flex justify-end sm:justify-start col-span-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent/40 bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10 whitespace-nowrap">
                            {svc.orders_count} Active Orders
                          </span>
                        </div>
                      )}
                      {svc.rating > 0 && (
                        <span className="flex items-center gap-1 font-bold text-yellow-400 text-[12px] col-span-1">
                          ★ {Number(svc.rating).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-light-text/40 mb-4 line-clamp-2 leading-relaxed font-normal">
                      {svc.description || 'No description provided.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(svc.tags || []).slice(0, 5).map((tag, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-light-text/30 group-hover:text-light-text/50 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Bottom row — stats + action */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4 text-[10px] text-light-text/20 font-bold uppercase tracking-widest">
                        {svc.subcategory && (
                          <span className="text-accent/50">{svc.subcategory}</span>
                        )}
                        {svc.profile_views > 0 && (
                          <span>{svc.profile_views} views</span>
                        )}
                        <span className={svc.is_active ? 'text-emerald-400' : 'text-white/20'}>
                          {svc.is_active ? 'Live' : 'Paused'}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/service/${svc.id}`)}
                        className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-accent/40 hover:text-accent text-white/50 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        {'View \u2192'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-transparent border border-white/10 rounded-3xl h-24" />)}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-transparent border border-white/5 rounded-[24px] sm:rounded-[40px] text-center px-4">
            <div className="mx-auto mb-6 text-white/20">
              <ShoppingBag size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white/30 mb-2 uppercase tracking-widest leading-none">No orders yet</h3>
            <p className="text-white/20 text-xs sm:text-sm max-w-sm mx-auto font-medium">Orders from clients will appear here once they purchase your services.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map(order => {
              const client = order.other_party || order.client?.profiles || order.client || {};
              const name = client.name || 'Client';
              const isUpdating = updatingOrderId === order.id;
              return (
                <div key={order.id} className="bg-transparent border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-accent/40 transition-all duration-300 group">
                  {/* Top: Client + Date (Justified on Mobile) */}
                  <div className="flex items-center justify-between md:justify-start gap-4 md:w-1/4 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {client.avatar_url
                          ? <img src={client.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover" />
                          : <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-base">{name[0]}</div>
                        }
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-primary rounded-full" title="Client Active" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-light-text text-sm truncate">{name}</p>
                        <p className="text-light-text/30 text-[10px] uppercase font-bold tracking-wider md:hidden mt-0.5">{fmtDate(order.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-light-text/30 text-[10px] uppercase font-bold tracking-wider hidden md:block">{fmtDate(order.created_at)}</p>
                  </div>

                  {/* Middle: Title & Package */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-light-text truncate text-base group-hover:text-accent transition-colors">{order.service?.title || 'Service Title'}</p>
                    {order.package_name && <p className="text-light-text/40 text-[10px] font-medium mt-0.5">{order.package_name} package</p>}
                  </div>

                  {/* Bottom: Price + Status/Action (Justified on Mobile) */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="flex items-center gap-1 text-accent font-bold text-lg tracking-tight shrink-0">
                      <span className="text-xs font-bold text-accent/60">₹</span>{parseFloat(order.price * 92.74 || 0).toFixed(0)}
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <div className="w-px h-6 bg-white/5 hidden md:block" />
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleOrderStatus(order, 'IN_PROGRESS')} disabled={isUpdating}
                          className="h-9 px-5 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-accent/90 transition disabled:opacity-50">
                          {isUpdating ? <InfinityLoader size={18} /> : 'Start Order'}
                        </button>
                      )}
                      {(order.status === 'IN_PROGRESS' || order.status === 'REVISION') && (
                        <button onClick={() => handleOrderStatus(order, 'DELIVERED')} disabled={isUpdating}
                          className="h-9 px-5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500/20 transition disabled:opacity-50">
                          {isUpdating ? <InfinityLoader size={18} /> : 'Deliver Work'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
