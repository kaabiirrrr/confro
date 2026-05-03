import React from "react";
import { 
  Rocket, Search, FileEdit, UserCheck, 
  MessageSquare, CheckCircle2, ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../../ui/Button";

const steps = [
  {
    icon: <FileEdit size={24} className="text-blue-400" />,
    title: "Post your project",
    desc: "Describe what you need. A clear job title and detailed description help attract the right talent. You can set a fixed price or hourly rate.",
    color: "bg-blue-500/10"
  },
  {
    icon: <Search size={24} className="text-purple-400" />,
    title: "Review proposals",
    desc: "Talented freelancers will submit proposals with their rates and past work samples. Review their profiles, ratings, and portfolios to find a match.",
    color: "bg-purple-500/10"
  },
  {
    icon: <UserCheck size={24} className="text-emerald-400" />,
    title: "Hire and fund",
    desc: "Once you find the right freelancer, hire them and fund the secure escrow system. Your payment is held safely until the work is delivered.",
    color: "bg-emerald-500/10"
  },
  {
    icon: <MessageSquare size={24} className="text-amber-400" />,
    title: "Collaborate",
    desc: "Use our built-in messages and milestone tools to stay in touch. View work in progress and provide feedback directly within the platform.",
    color: "bg-amber-500/10"
  },
  {
    icon: <CheckCircle2 size={24} className="text-indigo-400" />,
    title: "Approve and Release",
    desc: "When you're satisfied with the work, approve the milestone to release the funds. Leave a review to help other clients find great talent.",
    color: "bg-indigo-500/10"
  }
];

const GettingStartedGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 sm:py-8 text-light-text font-sans tracking-tight animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border-0">
            <Rocket className="text-accent" size={24} />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            How Connect works for Clients
          </h1>
        </div>
        <p className="text-base text-light-text/60 max-w-2xl leading-relaxed">
          Follow these 5 simple steps to get your project done by top-tier global talent.
        </p>
      </div>

      {/* POINTS-WISE GUIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        
        {/* Step List */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6 items-start relative group"
            >
              {/* Vertical line connecting steps */}
              {index !== steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-[-48px] w-[1px] bg-white/5 group-hover:bg-accent/20 transition-colors" />
              )}
              
              {/* Step Number/Icon */}
              <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 border-0`}>
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-[10px] font-black uppercase text-accent tracking-tighter bg-accent/5 px-2 py-0.5 rounded border-0">Step {index + 1}</span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-light-text/50 text-[15px] leading-relaxed max-w-3xl">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 lg:border-l lg:border-white/5 lg:pl-12 space-y-12">
          <div className="space-y-4">
             <h4 className="text-sm font-bold uppercase tracking-widest text-white/30">Why choose us?</h4>
             <ul className="space-y-4">
               {[
                 "Verified quality freelancers",
                 "Secure milestone-based payments",
                 "Dedicated support & mediation",
                 "Proprietary collaboration tools"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm text-light-text/70">
                   <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                   {item}
                 </li>
               ))}
             </ul>
          </div>

          <div className="p-6 bg-accent/10 rounded-2xl border border-accent/20 space-y-4">
            <h4 className="font-semibold text-light-text">Ready to start?</h4>
            <p className="text-sm text-light-text/60">
              Thousands of business owners use Connect to build their dream teams.
            </p>
            <Button 
              onClick={() => navigate('/client/post-job')}
              className="w-full h-11 rounded-full text-sm font-bold"
              icon={ChevronRight}
              iconPosition="right"
            >
              Post a job now
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GettingStartedGuide;
