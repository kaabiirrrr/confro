import React, { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const AccountHealthSection = () => {
  const [tab, setTab] = useState("violations");
  const [fullAccess, setFullAccess] = useState(true);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
              Your account currently has full platform access. Continue to follow Trust &amp; Safety policies to maintain uninterrupted access.
            </p>
            <Link
              to="/client/policies"
              className="w-full sm:w-auto flex sm:inline-flex items-center justify-center px-6 py-3 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-all"
            >
              Learn about our policies
            </Link>
          </div>

          <div className="flex sm:flex-col items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center justify-center">
              <ShieldCheck size={32} className="text-accent" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFullAccess(!fullAccess)}
                className={`w-12 h-6 rounded-full relative transition-all ${fullAccess ? "bg-accent" : "bg-white/10"}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${fullAccess ? "translate-x-6" : ""}`}
                />
              </button>
              <span className="text-accent text-xs font-bold uppercase tracking-widest">
                {fullAccess ? "Full Access" : "Restricted"}
              </span>
            </div>
          </div>
        </div>

        {/* ACCOUNT STANDING */}
        <div className="bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="w-full sm:max-w-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Account standing</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Based on your enforcement history, your account is in good standing and meets our guidelines.
              Continue following best practices to maintain your status and avoid future enforcement.
            </p>
            <Link
              to="/client/identity-verification"
              className="w-full sm:w-auto flex sm:inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-all"
            >
              Verify Identity
            </Link>
          </div>

          <div className="flex sm:flex-col items-center gap-2 shrink-0 mx-auto sm:mx-0">
            <div className="w-20 h-10 border-t-[5px] border-accent rounded-t-full" />
            <span className="text-accent text-xs font-bold uppercase tracking-widest mt-2">Good</span>
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
              Policy violations <span className="ml-1 text-white/40">0</span>
            </button>
            <button
              onClick={() => setTab("appeals")}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-none text-left ${tab === "appeals"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Submitted appeals <span className="ml-1 text-white/40">0</span>
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        <div className="bg-transparent border-t border-white/10 py-24 text-center px-4">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <Lock size={48} className="text-accent/60" strokeWidth={1.5} />
          </div>

          {tab === "violations" && (
            <>
              <p className="text-white font-bold text-xl tracking-tight mb-2">
                You don&apos;t have any policy violations.
              </p>
              <p className="text-white/30 text-xs uppercase tracking-widest font-medium italic">
                Thanks for following platform guidelines.
              </p>
            </>
          )}

          {tab === "appeals" && (
            <>
              <p className="text-white font-bold text-xl tracking-tight mb-2">
                No appeals submitted
              </p>
              <p className="text-white/30 text-xs uppercase tracking-widest font-medium italic">
                If a policy violation occurs, you can submit an appeal here.
              </p>
            </>
          )}
        </div>
      </div>

      {/* TRUST & SAFETY BANNER */}
      <div className="bg-accent/10 border border-accent/30 rounded-[2rem] px-6 sm:px-10 py-8 sm:py-10 flex justify-between items-center relative overflow-hidden group gap-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue blur-[120px] -mr-40 -mt-40 rounded-full pointer-events-none group-hover:bg-accent/30 transition-all duration-700"></div>

        <div className="relative z-10 w-full sm:max-w-[560px]">
          <p className="text-accent text-xs uppercase tracking-widest font-bold mb-3">
            Trust &amp; Safety tips
          </p>
          <h3 className="text-white text-xl sm:text-2xl font-bold leading-snug mb-6">
            Learn how to maintain full access, improve your account standing, and avoid policy violations.
          </h3>
          <Link
            to="/client/trust-safety"
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

export default AccountHealthSection;