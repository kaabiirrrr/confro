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
    <div className="w-full lg:max-w-[1400px] mx-auto mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Account health</h1>
        <p className="text-white/50 text-sm mt-1 font-medium">
          Manage your account access and stay on track with platform Trust &amp; Safety guidelines
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PLATFORM ACCESS */}
        <div className="bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="w-full sm:max-w-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Platform access</h3>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              {isRestricted
                ? "Your account currently has restricted access due to policy violations. Please review your enforcement history."
                : "Your account currently has full platform access. Continue to follow Trust & Safety policies to maintain uninterrupted access."}
            </p>
            <Link to="/freelancer/policies" className="w-full sm:w-auto flex sm:inline-flex items-center justify-center px-6 py-3 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-all">
              Learn about our policies
            </Link>
          </div>
          <div className="flex sm:flex-col items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center justify-center">
              <ShieldCheck size={32} className={isRestricted ? "text-red-500" : "text-accent"} />
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full relative transition-all ${!isRestricted ? "bg-accent" : "bg-white/10"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${!isRestricted ? "translate-x-6" : ""}`} />
              </div>
              <span className={`${isRestricted ? "text-red-500" : "text-accent"} text-xs font-bold uppercase tracking-widest`}>
                {!isRestricted ? "Full Access" : "Restricted"}
              </span>
            </div>
          </div>
        </div>

        {/* ACCOUNT STANDING */}
        <div className="bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="w-full sm:max-w-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Account standing</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Based on your enforcement history, your account is in {statusData.account_status.toLowerCase()} standing.
              {statusData.account_status === "GOOD" ? " Continue following best practices to maintain your status." : " Please review platform rules."}
            </p>
          </div>
          <div className="flex sm:flex-col items-center gap-2 shrink-0 mx-auto sm:mx-0">
            <div className={`w-20 h-10 border-t-[5px] ${statusData.account_status === 'GOOD' ? 'border-accent' : 'border-orange-500'} rounded-t-full`} />
            <span className={`text-xs font-bold uppercase tracking-widest mt-2 ${statusData.account_status === 'GOOD' ? 'text-accent' : 'text-orange-500'}`}>
              {statusData.account_status === 'GOOD' ? 'Good' : statusData.account_status}
            </span>
          </div>
        </div>
      </div>

      {/* ENFORCEMENT HISTORY */}
      <div className="bg-transparent border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="px-5 sm:px-8 pt-8 pb-0">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6">Enforcement history</h3>

          {/* TABS */}
          <div className="flex gap-4 sm:gap-8 border-b border-white/10">
            <button
              onClick={() => setTab("violations")}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-none text-left ${tab === "violations"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Policy violations <span className="ml-1 text-white/40">{enforcementData.violations_count}</span>
            </button>
            <button
              onClick={() => setTab("appeals")}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-none text-left ${tab === "appeals"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Submitted appeals <span className="ml-1 text-white/40">{enforcementData.appeals_count}</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-transparent border-t border-white/10 py-24 text-center px-4">
          {tab === "violations" && enforcementData.history.length === 0 && (
            <>
              <div className="mx-auto mb-6 flex items-center justify-center">
                <Lock size={48} className="text-accent/60" strokeWidth={1.5} />
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
              <div className="mx-auto mb-6 flex items-center justify-center">
                <Lock size={48} className="text-accent/60" strokeWidth={1.5} />
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
      <div className="bg-accent/10 border border-accent/30 rounded-[2rem] px-6 sm:px-10 py-8 sm:py-10 flex justify-between items-center relative overflow-hidden group gap-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 blur-[120px] -mr-40 -mt-40 rounded-full pointer-events-none group-hover:bg-accent/30 transition-all duration-700"></div>

        <div className="relative z-10 w-full sm:max-w-[560px]">
          <p className="text-accent text-xs uppercase tracking-widest font-bold mb-3">
            Trust &amp; Safety tips
          </p>
          <h3 className="text-white text-xl sm:text-2xl font-bold leading-snug mb-6">
            Learn how to maintain full access, improve your account standing, and avoid policy violations.
          </h3>
          <Link
            to="/freelancer/best-practices"
            className="w-full sm:w-auto flex sm:inline-flex items-center justify-center px-8 py-3 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-all shadow-lg shadow-accent/30"
          >
            See best practices
          </Link>
        </div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/427/427735.png"
          className="hidden sm:block w-32 opacity-90 shrink-0"
          alt="Trust &amp; Safety"
        />
      </div>

    </div>
  );
};

export default FreelancerAccountHealth;
