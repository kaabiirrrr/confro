import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import ClientTopbar from "./components/ClientTopbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import InfinityLoader from "../components/common/InfinityLoader";
import OfferBanner from "../components/shared/OfferBanner";

const ClientLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMessages = location.pathname === '/client/messages';

  if (loading) {
    return <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen w-full"><InfinityLoader/></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`bg-primary ${isMessages ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen flex flex-col'}`}>
      <ClientTopbar />
      <OfferBanner />
      {isMessages ? (
        <div className="flex-1 min-h-0 max-w-[1630px] w-full mx-auto px-4 py-4">
          <Outlet />
        </div>
      ) : (
        <>
          <main className="flex-1 max-w-[1630px] mx-auto w-full px-4 sm:px-6 md:px-10 pt-4 sm:pt-6">
            <Outlet />
            <Footer />
          </main>
        </>
      )}
    </div>
  );
};

export default ClientLayout;