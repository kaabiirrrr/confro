import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import HireTalentDropdown from "./dropdown-client/HireTalentDropdown";
import ManageWorkDropdown from "./dropdown-client/ManageWorkDropdown";
import ReportsDropdown from "./dropdown-client/ReportsDropdown";
import NotificationDropdown from "./dropdown/NotificationDropdown";
import SearchItem from "./dropdown-client/SearchDropdown";
import ProfileMenuClient from "./ClientProfileMenu";
import { fetchUnifiedNotifications, getUnifiedUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AIAssistant from "../../components/shared/AIAssistant";
import HelpSupportModal from "../../components/shared/HelpSupportModal";
import JoinMeetingModal from "../../components/shared/JoinMeetingModal";


import { Video, Link2 } from 'lucide-react';

import api from "../../lib/api";
import { getApiUrl } from "../../utils/authUtils";

const AI_LOGO = 'https://ogtkjtbvbkyddutnmcov.supabase.co/storage/v1/object/sign/ai-logo/ChatGPT_Image_Apr_2__2026__11_31_42_PM-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNThiNmMxZi1hM2EyLTQ4MTYtOThmYS02YjlmMTQ0ODI3NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhaS1sb2dvL0NoYXRHUFRfSW1hZ2VfQXByXzJfXzIwMjZfXzExXzMxXzQyX1BNLXJlbW92ZWJnLXByZXZpZXcucG5nIiwiaWF0IjoxNzc1MTUzMDQ1LCJleHAiOjQ4OTcyMTcwNDV9.AGpHIM1DPw7QmLiVhq1jix9Jg-X5cx5hZ3uWbtip8Ek';

const ClientTopbar = () => {
  const { profile, role: userRole, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openSearchType, setOpenSearchType] = useState(false);
  const [searchType, setSearchType] = useState("Talent");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const timeoutRef = useRef(null);
  const userRoleRef = useRef(userRole);
  useEffect(() => { userRoleRef.current = userRole; }, [userRole]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.id) return;
      const data = await fetchUnifiedNotifications(userRoleRef.current);
      setUnreadCount(getUnifiedUnreadCount(data));
    };
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 120000);
    return () => clearInterval(interval);
  }, []);

  const openDropdown = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
    if (menu !== "notifications") setOpenNotifications(false);
  };

  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 250);
  };

  const handleNotificationClick = () => {
    setOpenNotifications(!openNotifications);
    setOpenProfile(false);
    setOpenMenu(null);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    if (searchType === "Talent") navigate(`/find-freelancers?q=${q}`);
    else if (searchType === "Projects") navigate(`/services?q=${q}`);
    setOpenSearchType(false);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Live suggestions fetch
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        let endpoint = '';
        if (searchType === 'Talent') endpoint = `/api/profile/freelancers?search=${encodeURIComponent(searchQuery)}&limit=5`;
        else if (searchType === 'Projects') endpoint = `/api/services?search=${encodeURIComponent(searchQuery)}&limit=5`;
        else if (searchType === 'Jobs') endpoint = `/api/jobs/all?search=${encodeURIComponent(searchQuery)}&limit=5&status=OPEN`;

        if (!endpoint) return;
        
        const res = await api.get(endpoint);
        const items = (res.data?.data || []).slice(0, 5);
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  const navLinks = (
    <>
      <div
        className="relative"
        onMouseEnter={() => openDropdown("hire")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "hire" ? "nav-active" : ""}`}>
          Hire talent
          <Arrow />
        </button>
        {openMenu === "hire" && <HireTalentDropdown />}
      </div>

      <div
        className="relative"
        onMouseEnter={() => openDropdown("manage")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "manage" ? "nav-active" : ""}`}>
          Manage work
          <Arrow />
        </button>
        {openMenu === "manage" && <ManageWorkDropdown />}
      </div>

      <div
        className="relative"
        onMouseEnter={() => openDropdown("reports")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "reports" ? "nav-active" : ""}`}>
          Reports
          <Arrow />
        </button>
        {openMenu === "reports" && <ReportsDropdown />}
      </div>

      <Link to="/client/messages" className="nav-item">
        Messages
      </Link>

      <div className="relative" onMouseEnter={() => openDropdown("meetings")} onMouseLeave={closeDropdown}>
        <button className={`nav-item ${openMenu === "meetings" ? "nav-active" : ""}`}>
          Meetings <Arrow />
        </button>
        {openMenu === "meetings" && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[240px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1">
            <button
              onClick={() => { navigate('/meeting/create'); setOpenMenu(null); }}
              className="dropdown-item w-full text-left"
            >
              Create Meeting
            </button>
            <button
              onClick={() => { setIsJoinModalOpen(true); setOpenMenu(null); }}
              className="dropdown-item w-full text-left"
            >
              Join Meeting
            </button>
          </div>
        )}
      </div>

      <JoinMeetingModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={(id) => { navigate(`/meeting/${id}`); setIsJoinModalOpen(false); }}
      />

      <Link to="/services" className="nav-item">
        Services
      </Link>
    </>
  );

  const searchDropdown = (
    <>
      {/* Type picker dropdown */}
      {openSearchType && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[280px] bg-secondary border border-border rounded-xl shadow-xl p-2 z-50">
          <SearchItem
            title="Talent"
            desc="Find freelancers and agencies"
            active={searchType === "Talent"}
            onClick={() => { setSearchType("Talent"); setOpenSearchType(false); setSuggestions([]); }}
          />
          <SearchItem
            title="Projects"
            desc="See freelancer projects"
            active={searchType === "Projects"}
            onClick={() => { setSearchType("Projects"); setOpenSearchType(false); setSuggestions([]); }}
          />
        </div>
      )}

      {/* Live suggestions dropdown */}
      {showSuggestions && !openSearchType && suggestions.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[500px] p-3 bg-primary/40 backdrop-blur-3xl rounded-2xl shadow-2xl z-50 flex flex-col gap-2 border border-white/10">
          <div className="px-1 py-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/40 dark:text-white/30">Top Results</span>
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
          </div>
          {suggestions.map((item, i) => {
            const rawLabel = item.title || item.name || item.full_name || 'Untitled';
            const label = rawLabel.includes('@') ? rawLabel.split('@')[0] : rawLabel;
            const sub = item.category || item.title || item.skills?.[0] || '';
            const avatar = item.avatar_url;
            const href = searchType === 'Talent'
              ? `/find-freelancers?q=${encodeURIComponent(label)}`
              : `/services?q=${encodeURIComponent(label)}`;
            return (
              <button
                key={i}
                onMouseDown={(e) => { e.preventDefault(); navigate(href); setShowSuggestions(false); setSuggestions([]); setSearchQuery(label); }}
                className="w-full text-left p-1.5 px-2 bg-transparent hover:bg-white/5 border-none rounded-lg transition-all duration-300 flex items-center gap-3 group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50 group-hover:border-accent/50 transition-all duration-300">
                  {avatar ? (
                    <img src={avatar} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-accent text-xs font-bold">{label[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-950 dark:text-white font-semibold truncate group-hover:text-accent transition-colors tracking-tight">{label}</p>
                  {sub && <p className="text-[11px] text-slate-900/40 dark:text-white/40 truncate mt-1 group-hover:text-slate-900/60 dark:hover:text-white/60 transition-colors uppercase tracking-wider font-medium">{sub}</p>}
                </div>
                <div className="mt-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </button>
            );
          })}
          <button
            onMouseDown={(e) => { e.preventDefault(); handleSearch(); }}
            className="w-full mt-1 px-4 py-3.5 hover:bg-white/5 bg-transparent rounded-xl text-accent text-xs font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 group/all"
          >
            See all results for "{searchQuery}"
            <svg className="w-4 h-4 transform group-hover/all:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </>
  );

  const [openAI, setOpenAI] = useState(false);

  return (
    <Navbar
      logoLink={isAdmin ? "/admin/dashboard" : "/client/dashboard"}
      navLinks={navLinks}
      mobileNavContent={({ close }) => (
        <>
          {/* Hire Talent */}
          <p className="text-xs font-black uppercase tracking-widest text-slate-900/60 dark:text-white/60 px-3 pt-3 pb-1">Hire Talent</p>
          {[
            { to: '/client/post-job', label: 'Post a job' },
            { to: '/client/proposals', label: 'Job posts & proposals' },
            { to: '/client/pending-offers', label: 'Pending offers' },
            { to: '/find-freelancers', label: 'Search for talent' },
            { to: '/client/hired-talent', label: "Talent you've hired" },
            { to: '/client/saved-talent', label: "Talent you've saved" },
            { to: '/client/direct-contracts', label: 'Direct contracts' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close}
              className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-900/60 dark:text-white/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
              {label}
            </Link>
          ))}

          <div className="border-t border-border my-2" />

          {/* Manage Work */}
          <p className="text-xs font-black uppercase tracking-widest text-slate-900/60 dark:text-white/60 px-3 pb-1">Manage Work</p>
          {[
            { to: '/client/contracts', label: 'Your contracts' },
            { to: '/client/hourly/timesheets', label: 'Timesheets' },
            { to: '/client/hourly/work-diaries', label: 'Work diaries' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close}
              className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-900/60 dark:text-white/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
              {label}
            </Link>
          ))}

          <div className="border-t border-border my-2" />

          {/* Reports */}
          <p className="text-xs font-black uppercase tracking-widest text-slate-900/60 dark:text-white/60 px-3 pb-1">Reports</p>
          {[
            { to: '/client/reports/weekly-summary', label: 'Weekly summary' },
            { to: '/client/reports/transactions', label: 'Transaction history' },
            { to: '/client/reports/spending-by-activity', label: 'Spending by activity' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close}
              className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-900/60 dark:text-white/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
              {label}
            </Link>
          ))}

          <div className="border-t border-border my-2" />

          {[
            { to: '/client/messages', label: 'Messages' },
            { to: '/services', label: 'Services' },
            { to: '/meeting/create', label: 'Create Meeting' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close}
              className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-900/60 dark:text-white/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
              {label}
            </Link>
          ))}
        </>
      )}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
      onSearchFocus={() => { if (searchQuery.trim()) setShowSuggestions(suggestions.length > 0); }}
      onSearchBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      searchType={searchType}
      onSearchTypeClick={() => setOpenSearchType(!openSearchType)}
      searchDropdown={searchDropdown}
      unreadCount={unreadCount}
      onNotificationClick={handleNotificationClick}
      openNotifications={openNotifications}
      notificationDropdown={<NotificationDropdown role={userRole} />}
      profileAvatar={profile?.avatar_url}
      profileName={profile?.name}
      onProfileClick={() => setOpenProfile(!openProfile)}
      profileMenu={openProfile && <ProfileMenuClient />}
      rightActions={
        <div className="relative">
          <button
            onClick={() => setOpenAI(o => !o)}
            className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 group ${openAI ? 'bg-accent/10' : 'hover:bg-accent/10'}`}
            title="Connect AI"
          >
            <img
              src="/Icons/White-AI-Connect.png"
              alt="Connect AI"
              className={`w-8 h-8 object-contain transition-all mr-2 duration-200 select-none pointer-events-none hidden dark:block grayscale brightness-200 ${openAI ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
            />
            <img
              src="/Icons/AI-Connect.png"
              alt="Connect AI"
              className={`w-8 h-8 object-contain transition-all mr-2 duration-200 select-none pointer-events-none block dark:hidden ${openAI ? 'opacity-100 [filter:invert(67%)_sepia(61%)_saturate(2462%)_hue-rotate(165deg)_brightness(102%)_contrast(100%)]' : 'opacity-50 group-hover:opacity-100 group-hover:[filter:invert(67%)_sepia(61%)_saturate(2462%)_hue-rotate(165deg)_brightness(102%)_contrast(100%)]'}`}
            />
          </button>
          {/* Desktop AI */}
          {openAI && (
            <div className="hidden md:block" style={{ position: 'absolute', top: '110%', right: 0, zIndex: 9999 }}>
              <AIAssistant userRole="client" externalOpen onClose={() => setOpenAI(false)} />
            </div>
          )}
          {/* Mobile AI — centered modal */}
          {openAI && (
            <div
              className="md:hidden ai-panel-mobile-wrapper"
              onClick={e => e.stopPropagation()}
            >
              <AIAssistant userRole="client" externalOpen onClose={() => setOpenAI(false)} />
            </div>
          )}
        </div>
      }
      onHelpClick={() => setIsHelpOpen(true)}
    >
      <HelpSupportModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Navbar>
  );
};

export default ClientTopbar;

const Arrow = () => (
  <svg
    className="w-3 h-3 ml-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);
