import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import { PremiumToaster } from './components/shared/Toast';
import { useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { NotificationProvider, useNotificationContext } from './context/NotificationContext';
import { DashboardCacheProvider } from './context/DashboardCacheContext';
import { useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import analytics from './services/analytics.service';
import InfinityLoader from './components/common/InfinityLoader';
import { AliveScope, KeepAlive } from 'react-activation';
import { ModerationProvider } from './ModerationContext';
import { checkProfileCompletion } from './utils/authUtils';
import { RealtimeProvider } from './context/RealtimeContext';
import { logger } from './utils/logger';
import AIAssistant from './components/shared/AIAssistant';


/* Landing Components */

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Popularservices from "./components/Popularservices";
import Fortalent from "./components/Foetalent";
import HowItWorks from "./components/HowItWorks";
import Whychooseus from "./components/Whychooseus";
import Testimonials from "./components/Testimonials";
import ExperiencedFreelancers from "./components/ExperiencedFreelancers";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import DemoBadge from "./components/common/DemoBadge";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToHash from "./components/ScrollToHash";
import GlobalCallManager from "./components/shared/GlobalCallManager";
import IOSNotification from "./components/ui/IOSNotification";


/* Pages */
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const SignupFreelancer = lazy(() => import("./pages/SignupFreelancer"));
const SignupClient = lazy(() => import("./pages/SignupClient"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const ClientWelcome = lazy(() => import("./pages/ClientWelcome"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const FindFreelancers = lazy(() => import("./pages/FindFreelancers"));
const FindWork = lazy(() => import("./pages/FindWork"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Logout = lazy(() => import("./pages/Logout"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

const MissionVision = lazy(() => import("./pages/about/MissionVision"));
const WhatWeProvide = lazy(() => import("./pages/about/WhatWeProvide"));
const Team = lazy(() => import("./pages/about/Team"));

const Solutions = lazy(() => import("./pages/Solutions"));
const AppComingSoon = lazy(() => import("./pages/AppComingSoon"));
const Legal = lazy(() => import("./pages/legal/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GetStarted = lazy(() => import("./pages/help/GetStarted"));

/* SEO Content Pages */
const AboutPage = lazy(() => import("./pages/seo/AboutPage"));
const HowItWorksPage = lazy(() => import("./pages/seo/HowItWorksPage"));
const ForFreelancersPage = lazy(() => import("./pages/seo/ForFreelancersPage"));
const ForClientsPage = lazy(() => import("./pages/seo/ForClientsPage"));

/* Blog / Guide Pages */
const HowToFindFreelancersIndia = lazy(() => import("./pages/blog/HowToFindFreelancersIndia"));
const FreelancerProfilePage = lazy(() => import("./pages/FreelancerProfilePage"));
const CreateMeeting = lazy(() => import("./pages/CreateMeeting"));
const MeetingRoom = lazy(() => import("./pages/MeetingRoom"));
const VerifyEmailWaiting = lazy(() => import("./pages/VerifyEmailWaiting"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const LotteryPage = lazy(() => import("./components/dashboard/pages/LotteryPage"));
const KYCUpload = lazy(() => import("./pages/KYCUpload"));
const KYCStatus = lazy(() => import("./pages/KYCStatus"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const ServicesMarketplace = lazy(() => import("./pages/ServicesMarketplace"));


/* Freelancer Dashboard */
const FreelancerLayout = lazy(() => import("./layouts/FreelancerLayout"));
const DashboardHome = lazy(() => import("./components/dashboard/pages/DashboardHome"));
const MyProposals = lazy(() => import("./components/dashboard/pages/MyProposals"));
const Projects = lazy(() => import("./components/dashboard/pages/Projects"));
const Messages = lazy(() => import("./components/dashboard/pages/Messages"));
const Earnings = lazy(() => import("./components/dashboard/pages/Earnings"));
const Profile = lazy(() => import("./components/dashboard/pages/Profile"));
const ConnectsHistory = lazy(() => import("./components/dashboard/pages/ConnectsHistory"));
const MembershipPage = lazy(() => import("./components/dashboard/pages/MembershipPage"));
const FreelancerAccountHealth = lazy(() => import("./components/dashboard/pages/FreelancerAccountHealth"));
const FreelancerPolicies = lazy(() => import("./components/dashboard/pages/FreelancerPolicies"));
const FreelancerBestPractices = lazy(() => import("./components/dashboard/pages/FreelancerBestPractices"));
const FreelancerFindWork = lazy(() => import("./components/dashboard/pages/FindWork"));
const SavedJobs = lazy(() => import("./components/dashboard/pages/SavedJobs"));
const JobDetail = lazy(() => import("./components/dashboard/pages/JobDetail"));
const MyServices = lazy(() => import("./components/dashboard/pages/MyServices"));
const ServiceFormPage = lazy(() => import("./components/dashboard/pages/ServiceFormPage"));
const PromotePage = lazy(() => import("./components/dashboard/pages/PromotePage"));
const FreelancerDirectContractsPage = lazy(() => import("./components/dashboard/pages/FreelancerDirectContracts"));
const FreelancerDirectContractDetail = lazy(() => import("./components/dashboard/pages/FreelancerDirectContractDetail"));
const IdentityVerificationPage = lazy(() => import("./components/dashboard/pages/IdentityVerificationPage"));
const FreelancerSettings = lazy(() => import("./components/dashboard/pages/FreelancerSettings"));
const ContractsFreelancer = lazy(() => import("./components/dashboard/pages/Contracts"));
const ContractHistory = lazy(() => import("./components/dashboard/pages/ContractHistory"));
const ContractDetails = lazy(() => import("./components/dashboard/pages/ContractDetails"));
const WorkDiary = lazy(() => import("./components/dashboard/pages/WorkDiary"));
const WorkActivity = lazy(() => import("./components/dashboard/pages/WorkActivity"));
const TransactionsFreelancer = lazy(() => import("./components/dashboard/pages/TransactionsPage"));
const FreelancerWithdrawals = lazy(() => import("./components/dashboard/pages/WithdrawalsPage"));

/* Onboarding */
const ProfileWizard = lazy(() => import("./components/freelancer/ProfileWizard"));
const ClientProfileWizard = lazy(() => import("./components/client/ProfileWizard"));
const BuyConnects = lazy(() => import("./components/dashboard/pages/BuyConnects"));
const SubmitProposal = lazy(() => import("./components/dashboard/pages/SubmitProposal"));

/* Client Dashboard */
const ClientLayout = lazy(() => import("./layouts/ClientLayout"));
const ClientDashboardHome = lazy(() => import("./components/dashboard/client/pages/ClientDashboardHome"));
const PostJob = lazy(() => import("./components/dashboard/client/pages/PostJob"));
const MyJobs = lazy(() => import("./components/dashboard/client/pages/MyJobs"));
const Proposals = lazy(() => import("./components/dashboard/client/pages/Proposals"));
const Contracts = lazy(() => import("./components/dashboard/client/pages/Contracts"));
const Payments = lazy(() => import("./components/dashboard/client/pages/Payments"));
const ConsultationsPage = lazy(() => import('./components/dashboard/client/pages/ConsultationsPage'));
const ClientServiceDetailPage = lazy(() => import('./components/dashboard/client/pages/ClientServiceDetailPage'));
const PendingOffers = lazy(() => import('./components/dashboard/client/pages/PendingOffers'));
const GettingStartedGuide = lazy(() => import("./components/dashboard/client/pages/GettingStartedGuide"));
const ClientWorkActivityPage = lazy(() => import("./components/dashboard/client/pages/ClientWorkActivityPage"));
const HiredTalent = lazy(() => import("./components/dashboard/client/pages/HiredTalent"));
const SavedTalent = lazy(() => import("./components/dashboard/client/pages/SavedTalent"));
const DirectContractsPage = lazy(() => import("./components/dashboard/client/pages/DirectContractsPage"));
const DirectContractDetailPage = lazy(() => import("./components/dashboard/client/pages/DirectContractDetailPage"));
const NewDirectContractPage = lazy(() => import("./components/dashboard/client/pages/NewDirectContractPage"));
const ClientVerificationPage = lazy(() => import("./components/dashboard/client/pages/ClientVerificationPage"));

/* Hourly Activity */
const TimesheetsPage = lazy(() => import("./components/dashboard/client/pages/hourly/TimesheetsPage"));
const TimeByFreelancerPage = lazy(() => import("./components/dashboard/client/pages/hourly/TimeByFreelancerPage"));
const WorkDiariesPage = lazy(() => import("./components/dashboard/client/pages/hourly/WorkDiariesPage"));
const CustomExportPage = lazy(() => import("./components/dashboard/client/pages/hourly/CustomExportPage"));

/* Reports */
const WeeklySummaryPage = lazy(() => import("./components/dashboard/client/pages/reports/WeeklySummaryPage"));
const TransactionsPage = lazy(() => import("./components/dashboard/client/pages/reports/TransactionsPage"));
const SpendingByActivityPage = lazy(() => import("./components/dashboard/client/pages/reports/SpendingByActivityPage"));
const ClientSearchTalentPage = lazy(() => import("./components/dashboard/client/pages/ClientSearchTalentPage"));
const BillingPage = lazy(() => import("./components/dashboard/client/pages/BillingPage"));

/* Settings */
const ClientSettings = lazy(() => import("./components/dashboard/client/settings/SettingsPage"));
const InviteTeammate = lazy(() => import("./components/dashboard/client/settings/InviteTeammate"));
const AccountHealthSection = lazy(() => import("./components/dashboard/client/settings/AccountHealthSection"));
const ClientPolicies = lazy(() => import("./components/dashboard/client/settings/ClientPolicies"));
const BestPractices = lazy(() => import("./components/dashboard/client/settings/BestPractices"));

/* Shared Dashboard Components */


/* Admin Dashboard */
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// ── CONFIGURATION SANITY GUARD ──────────────────────────────────────────
// Detects if Supabase keys have been swapped with Stripe keys
const ConfigGuard = () => {
  const isStripeInSupabase = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').startsWith('sb_');
  if (!isStripeInSupabase) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #ff4b2b, #ff416c)',
      color: 'white', padding: '12px 20px', textAlign: 'center',
      fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid rgba(255,255,255,0.3)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: '15px'
    }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <div>
        <strong style={{ display: 'block', fontSize: '16px' }}>CRITICAL CONFIG ERROR DETECTED</strong>
        <span>You are using a Stripe Key for Supabase. Fix VITE_SUPABASE_ANON_KEY in your Render/Local environment variables.</span>
      </div>
      <button
        onClick={(e) => e.target.parentElement.style.display = 'none'}
        style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
      >Dismiss</button>
    </div>
  );
};
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const UsersPage = lazy(() => import("./admin/pages/UsersPage"));
const JobsPage = lazy(() => import("./admin/pages/JobsPage"));
const ProposalsPage = lazy(() => import("./admin/pages/ProposalsPage"));
const ContractsPage = lazy(() => import("./admin/pages/ContractsPage"));
const PaymentsPage = lazy(() => import("./admin/pages/PaymentsPage"));
const DisputesPage = lazy(() => import("./admin/pages/DisputesPage"));
const ModerationPage = lazy(() => import("./admin/pages/ModerationPage"));
const AdminNotificationsPage = lazy(() => import("./admin/pages/NotificationsPage"));
const AdminSettings = lazy(() => import("./admin/pages/SettingsPage"));
const AdminClientVerificationPage = lazy(() => import("./admin/pages/ClientVerificationPage"));
const AdminFreelancerVerificationPage = lazy(() => import("./admin/pages/FreelancerVerificationPage"));
const WithdrawalsPage = lazy(() => import("./admin/pages/WithdrawalsPage"));
const LogsPage = lazy(() => import("./admin/pages/LogsPage"));
const SkillsPage = lazy(() => import("./admin/pages/SkillsPage"));
const AnnouncementsPage = lazy(() => import("./admin/pages/AnnouncementsPage"));
const OffersPage = lazy(() => import("./admin/pages/OffersPage"));
const FraudPage = lazy(() => import("./admin/pages/FraudPage"));
const AdminProfilePage = lazy(() => import("./admin/pages/AdminProfilePage"));
const AdminManagementPage = lazy(() => import("./admin/pages/AdminManagementPage"));
const ProblemsPage = lazy(() => import("./admin/pages/ProblemsPage"));
const FAQManagementPage = lazy(() => import("./admin/pages/FAQManagementPage"));
const ReviewsManagementPage = lazy(() => import("./admin/pages/ReviewsManagementPage"));
const SupportTicketsPage = lazy(() => import("./admin/pages/SupportTicketsPage"));
const SupportTicketDetailPage = lazy(() => import("./admin/pages/SupportTicketDetailPage"));
const AdminActivityInsights = lazy(() => import("./admin/pages/AdminActivityInsights"));
const PlansManagement = lazy(() => import("./admin/components/dashboard/plans/PlansManagement"));
const AnnouncementsManagement = lazy(() => import("./admin/components/dashboard/announcements/AnnouncementsManagement"));
const LotteryAdminPage = lazy(() => import("./admin/pages/LotteryAdminPage"));
const ConnectsManagementPage = lazy(() => import("./admin/pages/ConnectsManagementPage"));

/* Loading Component */
const LoadingSpinner = () => <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen w-full"><InfinityLoader/></div>;

/* Landing Page */
function LandingPage() {
  const { user, role, profile, getDashboardRoute, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const dashboardRoute = getDashboardRoute(role, profile);
      logger.log(`[LandingPage] Authenticated user detected. Rapid redirect to: ${dashboardRoute}`);
      navigate(dashboardRoute, { replace: true });
    }
  }, [isAuthenticated, loading, role, profile, navigate, getDashboardRoute]);

  // We no longer return any loader here to ensure the landing page shows immediately.
  return (
    <>
      <Navbar />
      <Hero />
      <Popularservices />
      <Fortalent />
      <HowItWorks />
      <Whychooseus />
      <Testimonials />
      <ExperiencedFreelancers />
      <CTASection />
      <Footer />
    </>
  );
}

const DashboardDispatcher = () => {
  const { role, profile, user, getDashboardRoute, loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Support the unified dashboard route by redirecting to role-specific dashboard
  const dashboardRoute = getDashboardRoute(role, user || profile);
  // Ensure we don't cause a loop if getDashboardRoute ever returns /dashboard
  const finalRoute = dashboardRoute === '/dashboard' ? (role === 'CLIENT' ? '/client/dashboard' : '/freelancer/dashboard') : dashboardRoute;

  return <Navigate to={finalRoute} replace />;
};

function ProfileSetupGuard() {
  const { user, role, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  const isProfileCompleted = checkProfileCompletion(user, role, profile);

  // Diagnostic logging for the redirect loop
  logger.log('[ProfileSetupGuard] Check:', {
    role,
    path: location.pathname,
    isProfileCompleted,
    profileDetails: {
      perc: profile?.profile_completion_percentage,
      completed: profile?.profile_completed,
      clientCompleted: profile?.is_client_profile_complete
    }
  });

  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If already at setup and incomplete, STAY HERE.
  if (location.pathname.includes('setup-profile') || location.pathname.includes('profile-wizard')) {
    if (isProfileCompleted) {
      logger.log('[ProfileSetupGuard] Profile complete, redirecting from setup to dashboard');
      return <Navigate to={role === 'CLIENT' ? "/client/dashboard" : "/freelancer/dashboard"} replace />;
    }
    return role === 'CLIENT' ? <ClientProfileWizard /> : <ProfileWizard />;
  }

  if (isProfileCompleted) {
    const dashboard = role === 'CLIENT' ? "/client/dashboard" : "/freelancer/dashboard";
    return <Navigate to={dashboard} replace />;
  }

  // Not complete and not at setup -> go to setup
  const setup = role === 'CLIENT' ? "/client/setup-profile" : "/freelancer/setup-profile";
  return <Navigate to={setup} replace />;
};


/* Main App */

/* Main App */

function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const publicRoutes = [
      '/', '/login', '/signup', '/forgot-password', '/reset-password',
      '/verify-email', '/auth/callback', '/success', '/client-welcome',
      '/about', '/solutions', '/app-download', '/legal', '/services', '/service',
      '/find-freelancers', '/find-work', '/signup-freelancer', '/signup-client',
      '/registration-success', '/verify-email-waiting',
      '/kyc', '/kyc/status',
      '/how-it-works', '/for-freelancers', '/for-clients', '/blog', '/meeting',
      // Onboarding routes – handled by internal ProfileSetupGuard
      '/profile-wizard', '/freelancer/setup-profile', '/client/setup-profile'
    ];

    const isPublicRoute = publicRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));

    // Check both memory state and persisted token for safety
    if (!loading && !token && !isAuthenticated && !isPublicRoute) {
      logger.log('[App] Unauthenticated access, redirecting to login', { path: location.pathname });
      navigate("/login");
    }

    // Track Page Visit (Only if authenticated to avoid 401 spam)
    if (isAuthenticated) {
      analytics.trackVisit(location.pathname);
    }

    return () => { };
  }, [location.pathname, navigate, user, isAuthenticated, loading]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <RealtimeProvider>
          <ProfileProvider>
            <DashboardCacheProvider>
              <ModerationProvider>
                <AliveScope>

                  <NotificationWrapper />
                  <ConfigGuard />
                  <div className="min-h-screen bg-primary">

                    <PremiumToaster />

                    <GlobalCallManager />
                    <ScrollToTop />
                    <ScrollToHash />
                    <Suspense fallback={location.pathname === '/' ? null : <LoadingSpinner />}>
                      <Routes location={location}>
                        {/* Landing page is now the default entry point for all users */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Authentication */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/join" element={<Navigate to="/signup" replace />} />
                        <Route path="/signup-freelancer" element={<SignupFreelancer />} />
                        <Route path="/signup-client" element={<SignupClient />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/success" element={<SuccessPage />} />
                        <Route path="/client-welcome" element={<ClientWelcome />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Unified Dashboard & Wizard Routes */}
                        <Route path="/dashboard" element={<DashboardDispatcher />} />
                        <Route path="/profile-wizard" element={<ProfileSetupGuard />} />

                        {/* Profile Setup */}
                        <Route path="/freelancer/setup-profile" element={<ProfileSetupGuard />} />
                        <Route path="/client/setup-profile" element={<ProfileSetupGuard />} />

                        {/* Meetings */}
                        <Route path="/meeting/create" element={<CreateMeeting />} />
                        <Route path="/meeting/:id" element={<MeetingRoom />} />
                        <Route path="/verify-email-waiting" element={<VerifyEmailWaiting />} />
                        <Route path="/registration-success" element={<RegistrationSuccess />} />
                        <Route path="/kyc" element={<KYCUpload />} />
                        <Route path="/kyc/status" element={<KYCStatus />} />

                        {/* Marketplace */}
                        <Route path="/find-freelancers" element={<FindFreelancers />} />
                        <Route path="/find-work" element={<FindWork />} />
                        <Route path="/services" element={<Suspense fallback={<InfinityLoader/>}><ServicesMarketplace /></Suspense>} />
                        <Route path="/service/:id" element={<Suspense fallback={<InfinityLoader/>}><ServiceDetailPage /></Suspense>} />

                        <Route path="/find-talent" element={<Navigate to="/find-work" replace />} />

                        {/* About */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/about/mission" element={<MissionVision />} />
                        <Route path="/about/services" element={<WhatWeProvide />} />
                        <Route path="/about/team" element={<Team />} />

                        {/* SEO Content Pages */}
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                        <Route path="/for-freelancers" element={<ForFreelancersPage />} />
                        <Route path="/for-clients" element={<ForClientsPage />} />

                        {/* Blog / Guide Pages */}
                        <Route path="/blog/how-to-find-freelancers-in-india" element={<HowToFindFreelancersIndia />} />

                        {/* Solutions */}
                        <Route path="/solutions" element={<Solutions />} />

                        {/* App */}
                        <Route path="/app-download" element={<AppComingSoon />} />

                        {/* Legal */}
                        <Route path="/legal" element={<Legal />} />

                        <Route element={<ProtectedRoute allowedRoles={['FREELANCER']} />}>
                          <Route path="/freelancer" element={<FreelancerLayout />}>
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="find-work" element={<FreelancerFindWork />} />
                            <Route path="saved-jobs" element={<SavedJobs />} />
                            <Route path="jobs/:id" element={<JobDetail />} />
                            <Route path="jobs/:jobId/apply" element={<SubmitProposal />} />
                            <Route path="proposals" element={<MyProposals />} />
                            <Route path="my-proposals" element={<MyProposals />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="messages" element={<Messages />} />
                            <Route path="earnings" element={<Earnings />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="connects" element={<ConnectsHistory />} />
                            <Route path="buy-connects" element={<BuyConnects />} />
                            <Route path="membership" element={<MembershipPage />} />
                            <Route path="services" element={<MyServices />} />
                            <Route path="services/new" element={<ServiceFormPage />} />
                            <Route path="services/edit/:id" element={<ServiceFormPage />} />
                            <Route path="direct-contracts" element={<FreelancerDirectContractsPage />} />
                            <Route path="direct-contracts/:id" element={<FreelancerDirectContractDetail />} />
                            <Route path="identity-verification" element={<IdentityVerificationPage />} />
                            <Route path="account-health" element={<FreelancerAccountHealth />} />
                            <Route path="policies" element={<FreelancerPolicies />} />
                            <Route path="best-practices" element={<FreelancerBestPractices />} />
                            <Route path="contracts" element={<ContractsFreelancer />} />
                            <Route path="contracts/:id" element={<ContractDetails />} />
                            <Route path="contract-history" element={<ContractHistory />} />
                            <Route path="work-activity" element={<WorkActivity />} />
                            <Route path="work-diary" element={<WorkDiary />} />
                            <Route path="transactions" element={<TransactionsFreelancer />} />
                            <Route path="withdraw" element={<FreelancerWithdrawals />} />
                            <Route path="withdrawals" element={<Navigate to="/freelancer/withdraw" replace />} />
                            <Route path="promote" element={<PromotePage />} />
                            <Route path="settings" element={<FreelancerSettings />} />
                            <Route path="ai" element={<div className="bg-primary min-h-[80vh] flex flex-col pt-4"><AIAssistant userRole="freelancer" externalOpen /></div>} />
                            <Route path="lottery" element={<LotteryPage />} />
                          </Route>
                        </Route>

                        {/* Freelancer public profile */}
                        <Route path="/freelancer/:id" element={<FreelancerProfilePage />} />

                        {/* Client Dashboard */}
                        <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
                          <Route path="/client" element={<ClientLayout />}>
                            <Route index element={<ClientDashboardHome />} />
                            <Route path="dashboard" element={<ClientDashboardHome />} />
                            <Route path="post-job" element={<PostJob />} />
                            <Route path="jobs" element={<MyJobs />} />
                            <Route path="work-activity" element={<ClientWorkActivityPage />} />
                            <Route path="proposals" element={<Proposals />} />
                            <Route path="contracts" element={<Contracts />} />
                            <Route path="contracts/:id" element={<ContractDetails />} />
                            <Route path="hired-talent" element={<HiredTalent />} />
                            <Route path="saved-talent" element={<SavedTalent />} />
                            <Route path="direct-contracts" element={<DirectContractsPage />} />
                            <Route path="direct-contracts/new" element={<NewDirectContractPage />} />
                            <Route path="direct-contracts/:id" element={<DirectContractDetailPage />} />
                            <Route path="hourly/timesheets" element={<TimesheetsPage />} />
                            <Route path="hourly/time-by-freelancer" element={<TimeByFreelancerPage />} />
                            <Route path="hourly/work-diaries" element={<WorkDiariesPage />} />
                            <Route path="hourly/export" element={<CustomExportPage />} />
                            <Route path="reports/weekly-summary" element={<WeeklySummaryPage />} />
                            <Route path="reports/transactions" element={<TransactionsPage />} />
                            <Route path="reports/spending-by-activity" element={<SpendingByActivityPage />} />
                            <Route path="search-talent" element={<ClientSearchTalentPage />} />
                            <Route path="billing" element={<BillingPage />} />
                            <Route path="consultations" element={<ConsultationsPage />} />
                            <Route path="service/:id" element={<ClientServiceDetailPage />} />
                            <Route path="pending-offers" element={<PendingOffers />} />
                            <Route path="messages" element={<Messages />} />
                            <Route path="payments" element={<Payments />} />
                            <Route path="settings" element={<ClientSettings />} />
                            <Route path="ai" element={<div className="bg-primary min-h-[80vh] flex flex-col pt-4"><AIAssistant userRole="client" externalOpen /></div>} />
                            <Route path="invite" element={<InviteTeammate />} />
                            <Route path="identity-verification" element={<IdentityVerificationPage />} />
                            <Route path="account-health" element={<AccountHealthSection />} />
                            <Route path="policies" element={<ClientPolicies />} />
                            <Route path="trust-safety" element={<BestPractices />} />
                            <Route path="membership" element={<MembershipPage />} />
                            <Route path="buy-connects" element={<BuyConnects />} />
                            <Route path="connects" element={<ConnectsHistory />} />
                            <Route path="getting-started" element={<GettingStartedGuide />} />
                            <Route path="identity-verification" element={<ClientVerificationPage />} />
                          </Route>
                        </Route>

                        {/* Admin Dashboard */}
                        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN']} />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UsersPage />} />
                            <Route path="jobs" element={<JobsPage />} />
                            <Route path="proposals" element={<ProposalsPage />} />
                            <Route path="contracts" element={<ContractsPage />} />
                            <Route path="payments" element={<PaymentsPage />} />
                            <Route path="disputes" element={<DisputesPage />} />
                            <Route path="reports" element={<ModerationPage />} />
                            <Route path="notifications" element={<AdminNotificationsPage />} />
                            <Route path="moderation" element={<ModerationPage />} />
                            <Route path="client-verification" element={<AdminClientVerificationPage />} />
                            <Route path="freelancer-verification" element={<AdminFreelancerVerificationPage />} />
                            <Route path="withdrawals" element={<WithdrawalsPage />} />
                            <Route path="admin-management" element={<AdminManagementPage />} />
                            <Route path="admin-logs" element={<LogsPage />} />
                            <Route path="insights" element={<AdminActivityInsights />} />
                            <Route path="logs" element={<Navigate to="/admin/admin-logs" replace />} />
                            <Route path="skills" element={<SkillsPage />} />
                            <Route path="offers" element={<OffersPage />} />
                            <Route path="announcements" element={<AnnouncementsPage />} />
                            <Route path="fraud" element={<FraudPage />} />
                            <Route path="problems" element={<ProblemsPage />} />
                            <Route path="support-tickets" element={<SupportTicketsPage />} />
                            <Route path="support-tickets/:id" element={<SupportTicketDetailPage />} />
                            <Route path="faqs" element={<FAQManagementPage />} />
                            <Route path="reviews" element={<ReviewsManagementPage />} />
                            <Route path="plans" element={<PlansManagement />} />
                            <Route path="lottery" element={<LotteryAdminPage />} />
                            <Route path="connects" element={<ConnectsManagementPage />} />
                            <Route path="settings" element={<AdminSettings />} />
                            <Route path="profile" element={<AdminProfilePage />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                </AliveScope>
              </ModerationProvider>
            </DashboardCacheProvider>
          </ProfileProvider>
        </RealtimeProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

function NotificationWrapper() {
  const { notification, hideNotification } = useNotificationContext();

  return (
    <IOSNotification
      show={notification.show}
      title={notification.title}
      message={notification.message}
      type={notification.type}
      onClose={hideNotification}
    />
  );
}


export default App;