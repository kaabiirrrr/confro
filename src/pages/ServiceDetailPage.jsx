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
      <InfinityLoader size={20} />
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

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-[1480pxPOST http://127.0.0.1:5001/api/activity/track 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
httpMethod @ axios.js?v=dd335d66:2476
wrap @ axios.js?v=dd335d66:8
track @ analytics.service.js:42
trackVisit @ analytics.service.js:57
(anonymous) @ App.jsx:351
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11265
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11265
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11265
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11265
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
analytics.service.js:42  POST http://127.0.0.1:5001/api/activity/track 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
httpMethod @ axios.js?v=dd335d66:2476
wrap @ axios.js?v=dd335d66:8
track @ analytics.service.js:42
trackVisit @ analytics.service.js:57
(anonymous) @ App.jsx:351
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
profileApi.js:6  GET http://127.0.0.1:5001/api/profile/status 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ profileApi.js:6
(anonymous) @ ProfileContext.jsx:41
(anonymous) @ ProfileContext.jsx:68
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ProfileProvider>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:361
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
api.js:118 [API Interceptor] 401 on /api/profile/status — token present, skipping logout.
(anonymous) @ api.js:118
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ profileApi.js:6
(anonymous) @ ProfileContext.jsx:41
(anonymous) @ ProfileContext.jsx:68
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ProfileProvider>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:361
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this warning
4api.js:64 [API Interceptor] Token attached from storage: eyJhbGciOi...wivnREzXuA
notificationService.js:40  GET http://127.0.0.1:5001/api/notifications/announcements 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ notificationService.js:40
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
logger.js:14 NotificationService: Failed to fetch announcements AxiosError: Request failed with status code 401
    at settle (axios.js?v=dd335d66:1319:7)
    at XMLHttpRequest.onloadend (axios.js?v=dd335d66:1682:7)
    at Axios.request (axios.js?v=dd335d66:2328:41)
    at async fetchUnifiedNotifications (notificationService.js:40:33)
    at async loadUnreadCount (ClientTopbar.jsx:47:20)
(anonymous) @ logger.js:14
(anonymous) @ notificationService.js:47
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
RelationshipIntelligence.jsx?t=1777231192336:35  GET http://127.0.0.1:5001/api/relationship/stats/aa5251e3-3faa-4121-9276-17d71d2341e8 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ RelationshipIntelligence.jsx:35
(anonymous) @ RelationshipIntelligence.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<RelationshipIntelligence>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:565
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
api.js:118 [API Interceptor] 401 on /api/relationship/stats/aa5251e3-3faa-4121-9276-17d71d2341e8 — token present, skipping logout.
(anonymous) @ api.js:118
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ RelationshipIntelligence.jsx:35
(anonymous) @ RelationshipIntelligence.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<RelationshipIntelligence>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:565
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this warning
notificationService.js:55  GET http://127.0.0.1:5001/api/notifications 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ notificationService.js:55
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
logger.js:14 NotificationService: Failed to fetch private notifications AxiosError: Request failed with status code 401
    at settle (axios.js?v=dd335d66:1319:7)
    at XMLHttpRequest.onloadend (axios.js?v=dd335d66:1682:7)
    at Axios.request (axios.js?v=dd335d66:2328:41)
    at async fetchUnifiedNotifications (notificationService.js:55:30)
    at async loadUnreadCount (ClientTopbar.jsx:47:20)
(anonymous) @ logger.js:14
(anonymous) @ notificationService.js:58
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11040
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11167
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11141
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11055
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11033
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11201
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=dd335d66:11010
commitPassiveMountOnFiber @ react-dom_client.js?v=dd335d66:11066
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13150
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
notificationService.js:40  GET http://127.0.0.1:5001/api/notifications/announcements 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ notificationService.js:40
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
logger.js:14 NotificationService: Failed to fetch announcements AxiosError: Request failed with status code 401
    at settle (axios.js?v=dd335d66:1319:7)
    at XMLHttpRequest.onloadend (axios.js?v=dd335d66:1682:7)
    at Axios.request (axios.js?v=dd335d66:2328:41)
    at async fetchUnifiedNotifications (notificationService.js:40:33)
    at async loadUnreadCount (ClientTopbar.jsx:47:20)
(anonymous) @ logger.js:14
(anonymous) @ notificationService.js:47
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
RelationshipIntelligence.jsx?t=1777231192336:35  GET http://127.0.0.1:5001/api/relationship/stats/aa5251e3-3faa-4121-9276-17d71d2341e8 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ RelationshipIntelligence.jsx:35
(anonymous) @ RelationshipIntelligence.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<RelationshipIntelligence>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:565
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
api.js:118 [API Interceptor] 401 on /api/relationship/stats/aa5251e3-3faa-4121-9276-17d71d2341e8 — token present, skipping logout.
(anonymous) @ api.js:118
Promise.then
_request @ axios.js?v=dd335d66:2428
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ RelationshipIntelligence.jsx:35
(anonymous) @ RelationshipIntelligence.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11240
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11317
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<RelationshipIntelligence>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:565
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this warning
notificationService.js:55  GET http://127.0.0.1:5001/api/notifications 401 (Unauthorized)
dispatchXhrRequest @ axios.js?v=dd335d66:1784
xhr @ axios.js?v=dd335d66:1649
dispatchRequest @ axios.js?v=dd335d66:2210
_request @ axios.js?v=dd335d66:2445
request @ axios.js?v=dd335d66:2324
Axios.<computed> @ axios.js?v=dd335d66:2464
wrap @ axios.js?v=dd335d66:8
(anonymous) @ notificationService.js:55
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error
logger.js:14 NotificationService: Failed to fetch private notifications AxiosError: Request failed with status code 401
    at settle (axios.js?v=dd335d66:1319:7)
    at XMLHttpRequest.onloadend (axios.js?v=dd335d66:1682:7)
    at Axios.request (axios.js?v=dd335d66:2328:41)
    at async fetchUnifiedNotifications (notificationService.js:55:30)
    at async loadUnreadCount (ClientTopbar.jsx:47:20)
(anonymous) @ logger.js:14
(anonymous) @ notificationService.js:58
await in (anonymous)
(anonymous) @ ClientTopbar.jsx:47
(anonymous) @ ClientTopbar.jsx:50
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18567
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
commitHookEffectListMount @ react-dom_client.js?v=dd335d66:9411
commitHookPassiveMountEffects @ react-dom_client.js?v=dd335d66:9465
reconnectPassiveEffects @ react-dom_client.js?v=dd335d66:11273
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=dd335d66:13339
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13312
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:999
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13326
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13317
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=dd335d66:13347
flushPassiveEffects @ react-dom_client.js?v=dd335d66:13157
(anonymous) @ react-dom_client.js?v=dd335d66:12776
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<ClientTopbar>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
FreelancerProfilePage @ FreelancerProfilePage.jsx:264
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
App @ App.jsx:481
react_stack_bottom_frame @ react-dom_client.js?v=dd335d66:18509
renderWithHooksAgain @ react-dom_client.js?v=dd335d66:5729
renderWithHooks @ react-dom_client.js?v=dd335d66:5665
updateFunctionComponent @ react-dom_client.js?v=dd335d66:7475
beginWork @ react-dom_client.js?v=dd335d66:8525
runWithFiberInDEV @ react-dom_client.js?v=dd335d66:997
performUnitOfWork @ react-dom_client.js?v=dd335d66:12561
workLoopSync @ react-dom_client.js?v=dd335d66:12424
renderRootSync @ react-dom_client.js?v=dd335d66:12408
performWorkOnRoot @ react-dom_client.js?v=dd335d66:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=dd335d66:13505
performWorkUntilDeadline @ react-dom_client.js?v=dd335d66:36
_ @ inpage.js:166
w @ inpage.js:166
Y @ inpage.js:166
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=dd335d66:247
(anonymous) @ main.jsx:28Understand this error] mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-8">

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
              <p className="font-bold text-sm">4.9 <span className="text-white/40 font-normal">(124 reviews)</span></p>
            </div>
          </div>
        </div>

        {/* Images Gallery */}
        {(() => {
          const display = service.images?.filter(Boolean).length > 0
            ? service.images.filter(Boolean)
            : ['/service1.jpeg'];
          return (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 overflow-hidden h-56 sm:h-80 bg-white/5">
                <img
                  src={display[activeImg] ?? display[0]}
                  className="w-full h-full object-contain"
                  alt={service.title}
                  onError={e => { e.target.src = '/service1.jpeg'; }}
                />
              </div>
              {display.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {display.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-16 rounded-xl border overflow-hidden transition ${activeImg === i ? 'border-accent' : 'border-white/10 hover:border-white/30'}`}>
                      <img src={img} className="w-full h-full object-cover" alt={`img-${i}`}
                        onError={e => { e.target.src = '/service1.jpeg'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* About */}
        <div className="rounded-3xl border border-white/5 p-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6 pb-4 border-b border-white/5">About this service</h2>
          <div className="text-white/70 text-sm leading-relaxed space-y-4">
            {(service.description || 'No description provided.').split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
          </div>
        </div>

        {/* Order Card — with package type tabs */}
        <div className="rounded-3xl border border-white/10 overflow-hidden">
          {/* Package type selector */}
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
            {pkg?.description && (
              <p className="text-white/50 text-xs leading-relaxed">{pkg.description}</p>
            )}
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
