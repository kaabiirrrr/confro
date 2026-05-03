import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import FindWorkDropdown from "./dropdown/FindWorkDropdown";
import DeliverWorkDropdown from "./dropdown/DeliverWorkDropdown";
import FinanceDropdown from "./dropdown/FinanceDropdown";
import NotificationDropdown from "./dropdown/NotificationDropdown";
import SearchItem from "./SearchDropdown";
import ProfileMenu from "./FreelancerProfileMenu";
import { fetchUnifiedNotifications, getUnifiedUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import AIAssistant from "../../components/shared/AIAssistant";
import HelpSupportModal from "../../components/shared/HelpSupportModal";
import JoinMeetingModal from "../../components/shared/JoinMeetingModal";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Link2 } from 'lucide-react';




import api from "../../lib/api";
import { getApiUrl } from "../../utils/authUtils";

const AI_LOGO = 'https://ogtkjtbvbkyddutnmcov.supabase.co/storage/v1/object/sign/ai-logo/ChatGPT_Image_Apr_2__2026__11_31_42_PM-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNThiNmMxZi1hM2EyLTQ4MTYtOThmYS02YjlmMTQ0ODI3NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhaS1sb2dvL0NoYXRHUFRfSW1hZ2VfQXByXzJfXzIwMjZfXzExXzMxXzQyX1BNLXJlbW92ZWJnLXByZXZpZXcucG5nIiwiaWF0IjoxNzc1MTUzMDQ1LCJleHAiOjQ4OTcyMTcwNDV9.AGpHIM1DPw7QmLiVhq1jix9Jg-X5cx5hZ3uWbtip8Ek';

const Topbar = () => {
  const { profile, role: userRole, isAdmin, user } = useAuth();
  const { status } = useProfile();
  const navigate = useNavigate();
  const topbarAvatar = status?.avatar_url || profile?.avatar_url || null;

  const [openMenu, setOpenMenu] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openSearchType, setOpenSearchType] = useState(false);
  const [searchType, setSearchType] = useState("Jobs");
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
  }, []); // ← run once on mount, use ref inside to avoid re-triggering

  const openDropdown = useCallback((menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
    if (menu !== "notifications") setOpenNotifications(false);
  }, []);

  const closeDropdown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 250);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setOpenNotifications(prev => !prev);
    setUnreadCount(0);
    setOpenProfile(false);
    setOpenMenu(null);
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    if (searchType === "Jobs") navigate(`/freelancer/find-work?q=${q}`);
    else if (searchType === "Projects") navigate(`/services?q=${q}`);
    setOpenSearchType(false);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [searchQuery, searchType, navigate]);

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
        if (searchType === 'Jobs') endpoint = `/api/jobs/all?search=${encodeURIComponent(searchQuery)}&limit=5&status=OPEN`;
        else if (searchType === 'Talent') endpoint = `/api/profile/freelancers?search=${encodeURIComponent(searchQuery)}&limit=5`;
        else if (searchType === 'Projects') endpoint = `/api/services?search=${encodeURIComponent(searchQuery)}&limit=5`;

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

  const navLinks = useMemo(() => (
    <>
      <div
        className="relative"
        onMouseEnter={() => openDropdown("find")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "find" ? "nav-active" : ""}`}>
          Find work
          <Arrow />
        </button>
        {openMenu === "find" && <FindWorkDropdown />}
      </div>

      <div
        className="relative"
        onMouseEnter={() => openDropdown("deliver")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "deliver" ? "nav-active" : ""}`}>
          Deliver work
          <Arrow />
        </button>
        {openMenu === "deliver" && <DeliverWorkDropdown />}
      </div>

      <div
        className="relative"
        onMouseEnter={() => openDropdown("finance")}
        onMouseLeave={closeDropdown}
      >
        <button className={`nav-item ${openMenu === "finance" ? "nav-active" : ""}`}>
          Manage finances
          <Arrow />
        </button>
        {openMenu === "finance" && <FinanceDropdown />}
      </div>

      <Link to="/freelancer/messages" className="nav-item">
        Messages
      </Link>

      <div className="relative" onMouseEnter={() => openDropdown("meetings")} onMouseLeave={closeDropdown}>
        <button className={`nav-item ${openMenu === "meetings" ? "nav-active" : ""}`}>
          Meetings <Arrow />
        </button>
        {openMenu === "meetings" && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[240px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-[2010] flex flex-col gap-1">
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
    </>
  ), [openMenu, openDropdown, closeDropdown, navigate, isJoinModalOpen]);

  const searchDropdown = useMemo(() => (
    <>
      {/* Type picker dropdown */}
      {openSearchType && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[280px] bg-secondary border border-border rounded-xl shadow-xl p-2 z-[2010]">
          <SearchItem
            title="Jobs"
            desc="Apply to jobs posted by clients"
            active={searchType === "Jobs"}
            onClick={() => { setSearchType("Jobs"); setOpenSearchType(false); setSuggestions([]); }}
          />
          <SearchItem
            title="Projects"
            desc="See projects from other pros"
            active={searchType === "Projects"}
            onClick={() => { setSearchType("Projects"); setOpenSearchType(false); setSuggestions([]); }}
          />
        </div>
      )}

      {/* Live suggestions dropdown */}
      {showSuggestions && !openSearchType && suggestions.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[500px] p-3 bg-primary/40 backdrop-blur-3xl rounded-2xl shadow-2xl z-[2010] flex flex-col gap-2 border border-white/10">
          <div className="w-full">
            <div className="px-1 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/40 dark:text-white/30">Top Results</span>
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
            </div>
            {suggestions.map((item, i) => {
              const rawLabel = item.title || item.name || item.full_name || 'Untitled';
              const label = rawLabel.includes('@') ? rawLabel.split('@')[0] : rawLabel;
              const sub = item.category || item.title || item.skills?.[0] || '';
              const avatar = item.avatar_url;
              const href = searchType === 'Jobs'
                ? `/freelancer/find-work?q=${encodeURIComponent(label)}`
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
        </div>
      )}
    </>
  ), [openSearchType, searchType, showSuggestions, suggestions, searchQuery, navigate, handleSearch]);

  const [openAI, setOpenAI] = useState(false);

  const rightActions = useMemo(() => (
    <div className="flex items-center gap-2">
      {/* AI Assistant button */}
      <div className="relative">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              navigate('/freelancer/ai');
            } else {
              setOpenAI(o => !o);
            }
          }}
          className={`relative w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all duration-200 group ${openAI ? 'bg-accent/10' : 'hover:bg-accent/10'} `}
          title="Connect AI"
        >
          <img
            src="/Icons/White-AI-Connect.png"
            alt="Connect AI"
            className={`w-4.5 h-4.5 md:w-6 md:h-6 object-contain transition-all duration-200 select-none pointer-events-none hidden dark:block grayscale brightness-200 ${openAI ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
          />
          <img
            src="/Icons/AI-Connect.png"
            alt="Connect AI"
            className={`w-4.5 h-4.5 md:w-6 md:h-6 object-contain transition-all duration-200 select-none pointer-events-none block dark:hidden ${openAI ? 'opacity-100 [filter:invert(67%)_sepia(61%)_saturate(2462%)_hue-rotate(165deg)_brightness(102%)_contrast(100%)]' : 'opacity-50 group-hover:opacity-100 group-hover:[filter:invert(67%)_sepia(61%)_saturate(2462%)_hue-rotate(165deg)_brightness(102%)_contrast(100%)]'}`}
          />
        </button>
        {openAI && (
          <div className="hidden md:block" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 400, zIndex: 9999, maxWidth: 'calc(100vw - 16px)' }}>
            <AIAssistant userRole="freelancer" externalOpen onClose={() => setOpenAI(false)} />
          </div>
        )}
      </div>

      {/* Admin peek token (admins only) */}
      {(userRole === 'SUPER_ADMIN' || userRole === 'MODERATOR' || userRole === 'SUPPORT_ADMIN' || userRole === 'FINANCE_ADMIN') && (
        <button
          onClick={async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            try {
              const response = await fetch(`${API_URL}/api/admin/debug/peek`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await response.json();
              alert(`AUTH PEEK: ${data.authHeader}`);
              console.log('DEBUG PEEK:', data);
            } catch (err) {
              alert(`PEEK FAILED: ${err.message} (Token: ${token})`);
            }
          }}
          className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded text-[10px] font-bold hover:bg-yellow-500/20 transition-colors"
        >
          Peek Token
        </button>
      )}
    </div>
  ), [openAI, userRole]);

  return (
    <Navbar
      logoLink={isAdmin ? "/admin/dashboard" : (userRole === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard")}
      navLinks={navLinks}
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
      profileAvatar={topbarAvatar}
      profileName={status?.name || profile?.name || user?.user_metadata?.full_name}
      onProfileClick={() => setOpenProfile(!openProfile)}
      profileMenu={openProfile && <ProfileMenu />}
      rightActions={rightActions}
      onHelpClick={() => setIsHelpOpen(true)}
    >
      <HelpSupportModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Navbar>
  );
};

export default memo(Topbar);

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