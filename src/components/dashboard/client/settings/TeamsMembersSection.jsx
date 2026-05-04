import React, { useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "../../../ui/CustomDropdown";

const TeamsMembersSection = ({ setActive }) => {

const [tab,setTab] = useState("teams");

return (

    <div className="max-w-[1200px]">
      <div className="mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-3">
          Teams & Members
        </h2>
        <p className="text-white/40 text-[11px] sm:text-sm font-medium">
          Collaborate with your colleagues, manage organization roles, and track invitations.
        </p>
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => setActive("info")}
        className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-10 hover:opacity-80 transition-opacity"
      >
        <ArrowLeft size={16} />
        Back to General
      </button>

      {/* TABS */}
      <div className="flex justify-between sm:justify-start gap-4 sm:gap-10 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
        {[
          { id: "teams", label: "Org Teams" },
          { id: "members", label: "Members" },
          { id: "invites", label: "Invitations" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-4 text-[10px] sm:text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0 ${
              tab === t.id ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div className="min-h-[400px]">
        {/* TEAMS TAB */}
        {tab === "teams" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-8 sm:p-16 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                 <img
                  src="https://cdn-icons-png.flaticon.com/512/921/921347.png"
                  className="w-12 h-12 grayscale brightness-125"
                  alt="Teams"
                />
              </div>

              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-3">
                Architect your first team
              </h3>
              <p className="text-white/40 max-w-[420px] mb-10 text-[11px] sm:text-sm font-medium leading-relaxed italic">
                Organize your workflow by creating specialized teams for different projects or departments.
              </p>

              <Link
                to="/client/invite"
                className="h-12 px-8 rounded-full bg-accent text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                <Plus size={18} strokeWidth={3} />
                Invite Teammate
              </Link>
            </div>
          </motion.div>
        )}

        {/* MEMBERS TAB */}
        {tab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
               <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      placeholder="Search members by name or alias..."
                      className="w-full h-12 pl-12 pr-5 glass-card border border-white/10 rounded-full text-white outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all placeholder:text-white/20 text-sm font-medium"
                    />
                  </div>
                  <CustomDropdown
                    options={[{ label: 'All Divisions', value: 'All Divisions' }]}
                    value="All Divisions"
                    onChange={() => {}}
                    className="h-12 w-48"
                  />
               </div>
               <Link
                to="/client/invite"
                className="h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                Invite New
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-8 sm:p-16 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 shadow-xl">
                 <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  className="w-12 h-12 grayscale brightness-125"
                  alt="Members"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                Operational Solo Mode
              </h3>
              <p className="text-white/40 text-[11px] sm:text-sm font-medium">
                No external team members have been onboarded to your organization yet.
              </p>
            </div>
          </motion.div>
        )}

        {/* INVITES TAB */}
        {tab === "invites" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
             <div className="flex sm:justify-end">
               <Link
                to="/client/invite"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-accent text-white font-black text-xs uppercase tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                Draft Invitation
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-8 sm:p-16 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 shadow-xl">
                 <img
                  src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                  className="w-12 h-12 grayscale brightness-125 opacity-40"
                  alt="Invites"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                Queue Empty
              </h3>
              <p className="text-white/40 text-[11px] sm:text-sm font-medium italic">
                There are currently no outbound invitations awaiting acceptance.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>

);

};

export default TeamsMembersSection;