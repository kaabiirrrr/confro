import React from "react";
import { ShieldCheck, MessageSquare, CreditCard, Crosshair, Star, CheckCircle, Lightbulb, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const practices = [
  {
    image: "/Icons/icons8-communication-100.png",
    title: "Clear Communication",
    desc: "Always be clear about project requirements and deadlines. Responsive communication helps establish a smooth workflow and prevents misunderstandings.",
    color: "from-blue-500/20 to-transparent",
    border: "group-hover:border-blue-500/50"
  },
  {
    image: "/Icons/icons8-payment-80.png",
    title: "Secure Payments",
    desc: "Maintain all payments securely within the platform. Reaching out to freelancers for off-platform payment violates Trust & Safety and voids protection.",
    color: "from-emerald-500/20 to-transparent",
    border: "group-hover:border-emerald-500/50"
  },
  {
    image: "/Icons/icons8-milestone-100.png",
    title: "Define Milestones",
    desc: "Break up large projects into specific, measurable milestones. This aligns expectations and ensures you only pay for completed deliverables.",
    color: "from-purple-500/20 to-transparent",
    border: "group-hover:border-purple-500/50"
  },
  {
    image: "/Icons/icons8-facebook-like-100.png",
    title: "Fair Feedback",
    desc: "Provide constructive, timely feedback after project completion. Reviews help maintain a high-quality environment for everyone.",
    color: "from-amber-500/20 to-transparent",
    border: "group-hover:border-amber-500/50"
  }
];

const BestPractices = () => {
  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-12 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Back Button and Header Section */}
      <div className="space-y-4">
        <Link
          to="/client/account-health"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        {/* Header Banner (No Card Style) */}
        <div className="relative pt-2 pb-5 border-b border-white/10 mb-6">
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 text-accent text-[9px] font-black uppercase tracking-[0.3em]">
              <Lightbulb size={14} />
              <span>Success Guide Protocol</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Client Best Practices</h1>
              <p className="text-white/40 text-[11px] sm:text-sm mt-1 font-medium leading-relaxed max-w-2xl">Follow these essential Trust &amp; Safety tips to build successful relationships with freelancers, maintain perfect account standing, and achieve exactly what you need.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {practices.map((practice, index) => (
          <div
            key={index}
            className={`group relative bg-transparent border border-white/10 rounded-[2rem] p-6 sm:p-10 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 ${practice.border}`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${practice.color}`} />

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 flex items-center justify-center mb-6">
                {practice.image ? (
                  <img src={practice.image} alt={practice.title} className="w-14 h-14 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center border border-white/10">
                    {practice.icon}
                  </div>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-3">
                {practice.title}
              </h3>
              <p className="text-white/40 leading-relaxed text-[11px] sm:text-xs flex-grow font-medium">
                {practice.desc}
              </p>
              <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-accent transition-colors">
                <CheckCircle size={14} className="opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-300" />
                <span>Protocol: Recommended</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="bg-transparent border border-white/10 rounded-[2rem] px-10 py-10 flex flex-col md:flex-row gap-8 items-center justify-between mt-12">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center relative">
            <ShieldCheck size={36} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Stay Protected</h3>
            <p className="text-white/40 text-[11px] sm:text-sm font-medium leading-relaxed">Review your Account Health standing at any time.</p>
          </div>
        </div>

        <Link
          to="/client/account-health"
          className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
        >
          Return to Account Health
        </Link>
      </div>

    </div>
  );
};

export default BestPractices;
