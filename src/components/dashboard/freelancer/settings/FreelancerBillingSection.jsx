import React from "react";
import { Wallet, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsCard from "../../../ui/SettingsCard";

const FreelancerBillingSection = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* EARNINGS CARD */}
        <SettingsCard padding="p-8" headerBorder={false} className="hover:border-accent/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4 mb-6">
            <img src="/Icons/rupee.png" alt="Earnings" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Available for Withdrawal</p>
              <h3 className="text-4xl font-black text-white">$0.00</h3>
            </div>
          </div>
          <button className="w-full h-12 rounded-xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all">
            Get Paid Now
          </button>
        </SettingsCard>

        {/* CONNECTS CARD */}
        <SettingsCard padding="p-8" headerBorder={false} className="hover:border-accent/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4 mb-6">
            <img src="/Icons/link.png" alt="Connects" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Available Connects</p>
              <h3 className="text-4xl font-black text-white">40</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate("/freelancer/connects")}
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all"
          >
            Buy Connects
          </button>
        </SettingsCard>
      </div>

      {/* WITHDRAWAL METHODS */}
      <SettingsCard title="Withdrawal Methods" subtitle="Configure how you receive your professional earnings" icon={Wallet}>
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center group hover:border-white/20 transition-all">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Wallet size={32} className="text-white/20" />
          </div>
          <p className="text-white font-medium mb-2 text-lg">No withdrawal methods configured</p>
          <p className="text-white/40 text-sm max-w-xs mx-auto mb-8 font-medium">Link a bank account or digital wallet to start receiving funds.</p>
          <button className="bg-accent text-white font-black h-12 px-8 rounded-xl hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-accent/20">
            Add Method
          </button>
        </div>
      </SettingsCard>

      {/* TRANSACTION HISTORY SHORTCUT */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 flex items-center justify-between group cursor-pointer hover:from-accent/20 transition-all">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
               <Clock size={18} />
            </div>
            <div>
               <p className="text-white font-bold">Transaction History</p>
               <p className="text-white/40 text-xs">View all your incoming and outgoing professional transactions</p>
            </div>
         </div>
         <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
      </div>

    </div>
  );
};

export default FreelancerBillingSection;
