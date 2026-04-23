import React, { useState } from "react";
import { Shield, FileText, Cookie, RefreshCcw, Lock, ChevronLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";

const policies = [
  {
    id: "legal-info",
    image: "/Icons/icons8-legal-80.png",
    title: "Legal Information",
    desc: "A comprehensive overview of our legal framework and our commitment to providing a transparent marketplace for all users.",
  },
  {
    id: "privacy",
    image: "/Icons/icons8-privacy-100.png",
    title: "Privacy Policy",
    desc: "Details on how we collect, use, and protect your data. We never sell your personal information to third parties.",
  },
  {
    id: "terms",
    image: "/Icons/icons8-terms-and-conditions-80.png",
    title: "Terms & Conditions",
    desc: "The fundamental rules and guidelines governing your use of our platform and services.",
  },
  {
    id: "cookie",
    image: "/Icons/icons8-cookies-100.png",
    title: "Cookie Policy",
    desc: "Information regarding how we use cookies and similar technologies to enhance your browsing experience.",
  },
  {
    id: "refund",
    image: "/Icons/icons8-refund-80.png",
    title: "Refund Policy",
    desc: "Guidelines explaining the circumstances and processes under which escrowed funds or fees may be refunded.",
  }
];

const ClientPolicies = () => {
  const [activePolicy, setActivePolicy] = useState(policies[0]);
  const isRefundActive = activePolicy.id === 'refund';

  return (
    <div className="min-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Back Button and Header Section */}
      <div className="space-y-6">
        <Link
          to="/client/account-health"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <div className="relative pt-4 pb-6 border-b border-white/10 mb-8">
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
              <Lock size={16} />
              <span>Platform Policies</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
              Trust &amp; Safety Guidelines
            </h1>
            <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xl">
              Our policies are designed to create a safe, fair, and professional environment for both clients and freelancers. Adhering to these guidelines ensures you maintain full platform access.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-14 items-start">

        {/* Sidebar (Matching Image 3 Style) */}
        <div className="w-full md:w-[190px] shrink-0 flex flex-col gap-2">
          {policies.map((policy) => {
            const isActive = activePolicy.id === policy.id;
            const isRefund = policy.id === 'refund';

            return (
              <button
                key={policy.id}
                onClick={() => setActivePolicy(policy)}
                className={`relative text-left pl-6 py-3 transition-all duration-300 ${isActive
                    ? isRefund ? 'text-red-500 font-medium' : 'text-white font-medium'
                    : isRefund ? 'text-red-500/60 hover:text-red-500' : 'text-light-text/60 hover:text-light-text'
                  }`}
              >
                {isActive && (
                  <span className={`absolute left-0 top-0 h-full w-[3px] ${isRefund ? 'bg-red-500' : 'bg-accent'}`}></span>
                )}
                <span className="text-sm">
                  {policy.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-transparent border border-white/10 rounded-2xl p-8 md:p-10 min-h-[400px]">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/10">
            <div className="w-16 h-16 flex items-center justify-center">
              {activePolicy.image ? (
                <img src={activePolicy.image} alt={activePolicy.title} className="w-16 h-16 object-contain" />
              ) : (
                <div className="text-accent">{activePolicy.icon}</div>
              )}
            </div>
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${isRefundActive ? 'text-red-500' : 'text-white'}`}>
                {activePolicy.title}
              </h2>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Last updated: Today</p>
            </div>
          </div>

          <div className={`prose prose-invert max-w-none text-sm leading-relaxed space-y-6 ${isRefundActive ? 'text-red-500/70' : 'text-white/50'}`}>
            <p className={`text-base font-medium ${isRefundActive ? 'text-red-500' : 'text-white/80'}`}>
              {activePolicy.desc}
            </p>
            <p>
              At Connect, we are committed to maintaining a secure and transparent marketplace. It is critical that all users review and understand these parameters.
            </p>
            <h3 className={`text-lg font-bold mt-8 mb-4 ${isRefundActive ? 'text-red-500' : 'text-white'}`}>Core Principles</h3>
            <ul className={`list-disc pl-5 space-y-3 ${isRefundActive ? 'marker:text-red-500 text-red-500/80' : 'marker:text-accent text-white/50'}`}>
              <li>Maintain transparency and honesty in all transactions.</li>
              <li>Respect the intellectual property and confidentiality of others.</li>
              <li>Communicate professionally and promptly.</li>
              <li>Report any suspicious activity immediately to our support team.</li>
            </ul>
            <div className={`mt-10 p-6 bg-transparent rounded-xl border ${isRefundActive ? 'border-red-500/20' : 'border-white/10'}`}>
              <p className={`text-xs uppercase tracking-widest leading-relaxed font-bold ${isRefundActive ? 'text-red-500/60' : 'text-white/40'}`}>
                Note: These terms are subject to change. As an active user, it is your responsibility to stay up-to-date with our Trust &amp; Safety policies to avoid account restriction.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ClientPolicies;
