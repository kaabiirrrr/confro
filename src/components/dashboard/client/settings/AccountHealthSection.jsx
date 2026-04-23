import React, { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const AccountHealthSection = () => {
  const [tab, setTab] = useState("violations");
  const [fullAccess, setFullAccess] = useState(true);

  return (
    <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
        <div className="bg-transparent border border-white/10 rounded-2xl p-8 flex justify-between items-center">
          <div className="max-w-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Platform access</h3>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Your account currently has full platform access. Continue to follow Trust &amp; Safety policies to maintain uninterrupted access.
            </p>
            <Link
              to="/client/policies"
              className="inline-flex items-center px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent/90 transition-all font-bold"
            >
              Learn about our policies
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center border border-white/10">
              <ShieldCheck size={28} className="text-accent" />
            </div>
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

        {/* ACCOUNT STANDING */}
        <div className="bg-transparent border border-white/10 rounded-2xl p-8 flex justify-between items-center">
          <div className="max-w-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Account standing</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Based on your enforcement history, your account is in good standing and meets our guidelines.
              Continue following best practices to maintain your status and avoid future enforcement.
            </p>
            <Link
              to="/client/identity-verification"
              className="inline-flex items-center px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all font-bold"
            >
              Verify Identity
            </Link>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <div className="w-20 h-10 border-t-[5px] border-accent rounded-t-full" />
            <span className="text-accent text-xs font-bold uppercase tracking-widest mt-2">Good</span>
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
              Policy violations <span className="ml-1 text-white/40">0</span>
            </button>
            <button
              onClick={() => setTab("appeals")}
              className={`pb-3 text-sm font-semibold transition-colors ${tab === "appeals"
                ? "border-b-2 border-accent text-white"
                : "text-white/40 hover:text-white"
                }`}
            >
              Submitted appeals <span className="ml-1 text-white/40">0</span>
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        <div className="bg-transparent border-t border-white/10 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
            <Lock size={40} className="text-accent/60" strokeWidth={1.5} />
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
      <div className="bg-accent/10 border border-accent/30 rounded-2xl px-10 py-10 flex justify-between items-center relative overflow-hidden group">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue blur-[120px] -mr-40 -mt-40 rounded-full pointer-events-none group-hover:bg-accent/30 transition-all duration-700"></div>

        <div className="relative z-10 max-w-[560px]">
          <p className="text-accent text-xs uppercase tracking-widest font-bold mb-3">
            Trust &amp; Safety tips
          </p>
          <h3 className="text-white text-2xl font-bold leading-snug mb-6">
            Learn how to maintain full access, improve your account standing, and avoid policy violations.
          </h3>
          <Link
            to="/client/trust-safety"
            className="inline-flex items-center px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30"
          >
            See best practices
          </Link>
        </div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/427/427735.png"
          className="w-32 opacity-90 shrink-0"
          alt="Trust &amp; Safety"
        />
      </div>

    </div>
  );
};

export default AccountHealthSection;