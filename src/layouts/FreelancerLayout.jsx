import React, { useState, useMemo, memo } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/FreelancerTopbar";
import Footer from "../components/Footer";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import InfinityLoader from "../components/common/InfinityLoader";
import OfferBanner from "../components/shared/OfferBanner";
import { Menu, X } from "lucide-react";

const FreelancerLayout = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { status, loading: profileLoading } = useProfile();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isFullWidth = useMemo(() => {
    const path = location.pathname.replace(/\/$/, '');
    return path === '/freelancer/jobs' ||
      path.startsWith('/freelancer/jobs/') ||
      path === '/freelancer/job' ||
      path.startsWith('/freelancer/job/') ||
      path === '/freelancer/proposals' ||
      path === '/freelancer/my-proposals' ||
      path === '/freelancer/services' ||
      path.startsWith('/freelancer/services/') ||
      path === '/freelancer/find-work' ||
      path === '/freelancer/saved-jobs' ||
      path === '/freelancer/settings' ||
      path.startsWith('/freelancer/settings/') ||
      path === '/freelancer/membership' ||
      path.startsWith('/freelancer/direct-contracts') ||
      path.startsWith('/freelancer/contracts') ||
      path === '/freelancer/contract-history' ||
      path === '/freelancer/work-diary' ||
      path === '/freelancer/earnings' ||
      path === '/freelancer/transactions' ||
      path === '/freelancer/withdraw' ||
      path === '/freelancer/account-health' ||
      path === '/freelancer/policies' ||
      path === '/freelancer/best-practices' ||
      path === '/freelancer/work-activity' ||
      path === '/freelancer/ai' ||
      path === '/freelancer/promote';
  }, [location.pathname]);

  if (authLoading || profileLoading) {
    return <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen w-full"><InfinityLoader /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-primary">
        <Topbar />
        <div className="max-w-[1200px] mx-auto p-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Viewing Freelancer View</h1>
          <p className="text-gray-400 mb-8">You are currently viewing the platform as a freelancer. Some features may be restricted.</p>
          <Navigate to="/admin/dashboard" replace className="px-6 py-3 bg-accent text-white rounded-lg font-bold">
            Back to Admin Dashboard
          </Navigate>
          <div className="mt-8 opacity-50">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status && !status.profile_completed && (status.profile_completion_percentage ?? 0) < 75) {
    if (location.pathname !== '/freelancer/setup-profile') {
      return <Navigate to="/freelancer/setup-profile" replace />;
    }
  }

  const isMessages = location.pathname === '/freelancer/messages';

  return (
    <div className={`bg-primary text-[var(--color-light-text)] transition-colors duration-300 ${isMessages ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen font-sans'}`}>
      <Topbar />
      <OfferBanner />

      {/* Mobile sidebar toggle — floating button bottom-left */}
      {!isFullWidth && (
        <button
          className="lg:hidden fixed bottom-6 left-4 z-[300] w-11 h-11 bg-accent text-white rounded-full flex items-center justify-center transition-all duration-300"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 h-[100dvh] z-[9999] w-[300px] bg-primary border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto p-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-light-text">Dashboard</span>
          <button onClick={() => setSidebarOpen(false)} className="text-text-muted hover:text-accent transition-colors">
            <X size={18} />
          </button>
        </div>
        <div onClick={() => setSidebarOpen(false)}>
          <Sidebar />
        </div>
      </div>

      {isMessages ? (
        <div className="flex-1 min-h-0 max-w-[1630px] w-full mx-auto px-4 md:px-6 lg:px-10 pt-6 overflow-visible">
          <Outlet />
        </div>
      ) : (
        <div className={`max-w-[1630px] mx-auto ${location.pathname === '/freelancer/ai' ? 'px-6 pt-0' : 'px-4 md:px-6 lg:px-10 pt-1 md:pt-3'} transition-all duration-500 min-w-0 overflow-visible`}>
          <div className={isFullWidth ? 'w-full min-w-0' : 'grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 lg:gap-12 w-full min-w-0'}>
            {!isFullWidth && (
              <div className="hidden lg:block pr-2">
                <Sidebar />
              </div>
            )}
            <div className="flex flex-col gap-6 lg:gap-10 min-w-0 pb-20 min-h-[80vh]">
              <Outlet />
            </div>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default memo(FreelancerLayout);
