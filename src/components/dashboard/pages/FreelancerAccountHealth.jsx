import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../../lib/supabase";
import InfinityLoader from "../../common/InfinityLoader";

import { getApiUrl } from '../../../utils/authUtils';
 
const API_URL = getApiUrl();

const FreelancerAccountHealth = () => {
  const [tab, setTab] = useState("violations");
  const [loading, setLoading] = useState(true);

  const [statusData, setStatusData] = useState({
    profile_completion: 0,
    account_status: "GOOD"
  });

  const [scoreData, setScoreData] = useState({ health_score: 100 });
  const [enforcementData, setEnforcementData] = useState({
    violations_count: 0,
    appeals_count: 0,
    history: [],
    appeals: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [statusRes, scoreRes, violationsRes] = await Promise.all([
          axios.get(`${API_URL}/api/freelancer/account-health/status`, { headers }),
          axios.get(`${API_URL}/api/freelancer/account-health/score`, { headers }),
          axios.get(`${API_URL}/api/freelancer/account-health/violations`, { headers })
        ]);

        if (statusRes.data?.success) setStatusData(statusRes.data.data);
        if (scoreRes.data?.success) setScoreData(scoreRes.data.data);
        if (violationsRes.data?.success) setEnforcementData(violationsRes.data.data);

      } catch (error) {
        console.error("Failed to load account health data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader size={20} />
        <p className="text-light-text/60 animate-pulse">Initializing health diagnostics...</p>
      </div>
    );
  }

  const isRestricted = statusData.account_status === "RESTRICTED";

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* TITLE */}
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Account health</h1>
        <p className="text-white/50 text-xs sm:text-sm mt-1 font-medium">
          Manage your account access and stay on track with platform Trust &amp; Safety guidelines
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PLATFORM ACCESS */}
        <div className="bg-transparent border border-white/10 rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0">
          <div className="max-w-[400px]">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Platform access</h3>
            <p className="text-white/50 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
              {isRestricted
                ? "Your account currently has restricted access due to policy violations. Please review your enforcement history."
                : "Your account currently has full platform access. Continue to follow Trust & Safety policies to maintain uninterrupted access."}
            </p>
            <Link to="/freelancer/policies" className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-accent text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-accent/90 transition-all font-bold">
              Learn about our policies
            </Link>
          </div>
          <div className="flex flex-row sm:flex-col items-center gap-3 shrink-0">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent flex items-center justify-center border border-white/10 ${isRestricted ? "border-red-500/50" : ""}`}>
              <ShieldCheck size={22} className={isRestricted ? "text-red-500" : "text-accent"} />
            </div>
            <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-all ${!isRestricted ? "bg-accent" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 sm:top-1 left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all ${!isRestricted ? "translate-x-5 sm:translate-x-6" : ""}`} />
            </div>
            <span className={`${isRestricted ? "text-red-500" : "text-accent"} text-[10px] font-bold uppercase tracking-widest`}>
              {!isRestricted ? "Full Access" : "Restricted"}
            </span>
          </div>
        </div>

        {/* ACCOUNT STANDING */}
        <div className="bg-transparent border border-white/10 rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0">
          <div className="max-w-[400px]">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Account standing</h3>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              Based on your enforcement history, your account is in {statusData.account_status.toLowerCase()} standing.
              {statusData.account_status === "GOOD" ? " Continue following best practices to maintain your status." : " Please review platform rules."}
            </p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-16 sm:w-20 h-8 sm:h-10 border-t-[5px] ${statusData.account_status === 'GOOD' ? 'border-accent' : 'border-orange-500'} rounded-t-full`} />
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2 ${statusData.account_status === 'GOOD' ? 'text-accent' : 'text-orange-500'}`}>
              {statusData.account_status === 'GOOD' ? 'Good' : statusData.account_status}
            </span>
          </div>
        </div>
      </div>

      {/* ENFORCEMENT HISTORY */}
      <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-0">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6">Enforcement history</h3>

          {/* TABS */}
          <div className="flex gap-8 border-b border-white/10">
            <button
              onClick={() => setTab("violations")}
              className={`pb-3 text-sm font-semibold transition-colors ${tab === "violations"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Policy violations <span className="ml-1 text-white/40">{enforcementData.violations_count}</span>
            </button>
            <button
              onClick={() => setTab("appeals")}
              className={`pb-3 text-sm font-semibold transition-colors ${tab === "appeals"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Submitted appeals <span className="ml-1 text-white/40">{enforcementData.appeals_count}</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-transparent border-t border-white/10 py-24 text-center">
          {tab === "violations" && enforcementData.history.length === 0 && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                <Lock size={40} className="text-accent/60" strokeWidth={1.5} />
              </div>
              <p className="text-white font-bold text-xl tracking-tight mb-2">
                You don&apos;t have any policy violations.
              </p>
              <p className="text-white/30 text-xs uppercase tracking-widest font-medium italic">
                Thanks for following platform guidelines.
              </p>
            </>
          )}

          {tab === "appeals" && enforcementData.appeals.length === 0 && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                <Lock size={40} className="text-accent/60" strokeWidth={1.5} />
              </div>
              <p className="text-white font-bold text-xl tracking-tight mb-2">
                No appeals submitted
              </p>
              <p className="text-white/30 text-xs uppercase tracking-widest font-medium italic">
                If a policy violation occurs, you can submit an appeal here.
              </p>
            </>
          )}

          {/* Real violations list if available */}
          {tab === "violations" && enforcementData.history.length > 0 && (
            <div className="px-8 text-left space-y-4">
              {enforcementData.history.map(item => (
                <div key={item.id} className="p-4 border border-white/5 rounded-xl bg-white/5">
                  <div className="flex justify-between">
                    <h4 className="text-white font-bold capitalize">{item.violation_type.replace('_', ' ')}</h4>
                    <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${item.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mt-2">{item.description}</p>
                  <div className="text-white/40 text-xs mt-3">Status: {item.status} | Date: {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRUST & SAFETY BANNER */}
      <div className="bg-accent/10 border border-accent/30 rounded-2xl px-6 sm:px-10 py-7 sm:py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 blur-[120px] -mr-40 -mt-40 rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-[560px]">
          <p className="text-accent text-xs uppercase tracking-widest font-bold mb-2 sm:mb-3">Trust &amp; Safety tips</p>
          <h3 className="text-white text-lg sm:text-2xl font-bold leading-snug mb-4 sm:mb-6">
            Learn how to maintain full access, improve your account standing, and avoid policy violations.
          </h3>
          <Link to="/freelancer/best-practices" className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-accent text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
            See best practices
          </Link>
        </div>
        <img src="https://cdn-icons-png.flaticon.com/512/427/427735.png" className="w-20 sm:w-32 opacity-90 shrink-0 relative z-10 self-end sm:self-auto" alt="Trust &amp; Safety" />
      </div>

    </div>
  );
};

export default FreelancerAccountHealth;
