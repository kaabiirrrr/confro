import React, { useState, useEffect } from "react";
import { Wallet, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsCard from "../../../ui/SettingsCard";
import { connectsApi } from "../../../../services/connectsApi";

const FreelancerBillingSection = () => {
  const navigate = useNavigate();
  const [connectsBalance, setConnectsBalance] = useState("...");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await connectsApi.getBalance();
        if (res.success && res.data) {
          setConnectsBalance(res.data.balance);
        } else {
          setConnectsBalance(0);
        }
      } catch (err) {
        console.error("Failed to fetch connects balance", err);
        setConnectsBalance(0);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-10 w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 pt-4 w-full min-w-0">
        {/* EARNINGS CARD */}
        <SettingsCard padding="p-4 sm:p-8" headerBorder={false} className="hover:border-accent/20 transition-all cursor-pointer w-full min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0 w-full">
            <img src="/Icons/rupee.png" alt="Earnings" className="w-8 h-8 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-white/40 text-[9px] sm:text-[10px] uppercase font-black tracking-widest leading-none mb-1 truncate">Available for Withdrawal</p>
              <h3 className="text-2xl sm:text-4xl font-black text-white truncate">₹0.00</h3>
            </div>
          </div>
          <button className="w-full h-10 sm:h-12 rounded-full bg-accent text-white font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all">
            Get Paid Now
          </button>
        </SettingsCard>

        {/* CONNECTS CARD */}
        <SettingsCard padding="p-4 sm:p-8" headerBorder={false} className="hover:border-accent/20 transition-all cursor-pointer w-full min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0 w-full">
            <img src="/Icons/link.png" alt="Connects" className="w-8 h-8 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-white/40 text-[9px] sm:text-[10px] uppercase font-black tracking-widest leading-none mb-1 truncate">Available Connects</p>
              <h3 className="text-xl sm:text-4xl font-black text-white truncate">{connectsBalance}</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate("/freelancer/connects")}
            className="w-full h-10 sm:h-12 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all"
          >
            Buy Connects
          </button>
        </SettingsCard>
      </div>

      {/* WITHDRAWAL METHODS */}
      <SettingsCard title="Withdrawal Methods" subtitle="Configure how you receive your professional earnings" icon={Wallet} padding="p-4 sm:p-8">
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 sm:p-10 text-center flex flex-col items-center justify-center group hover:border-white/20 transition-all">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
             <Wallet size={24} className="text-white/20 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-lg">No withdrawal methods configured</p>
          <p className="text-white/40 text-[11px] sm:text-sm max-w-xs mx-auto mb-6 sm:mb-8 font-medium leading-relaxed">Link a bank account or digital wallet to start receiving funds.</p>
          <button 
            onClick={() => navigate("/freelancer/withdraw")}
            className="w-full sm:w-auto bg-accent text-white font-black h-10 sm:h-12 px-8 rounded-full hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-accent/20 text-xs sm:text-sm"
          >
            Add Method
          </button>
        </div>
      </SettingsCard>

      {/* TRANSACTION HISTORY SHORTCUT */}
      <div className="p-4 sm:p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 flex items-center justify-between gap-4 group cursor-pointer hover:from-accent/20 transition-all">
         <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-accent shrink-0">
               <Clock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
               <p className="text-white font-bold text-sm sm:text-base truncate">Transaction History</p>
               <p className="text-white/40 text-[10px] sm:text-xs truncate">View all your incoming and outgoing transactions</p>
            </div>
         </div>
         <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors shrink-0 sm:w-5 sm:h-5" />
      </div>

    </div>
  );
};

export default FreelancerBillingSection;
