import React, { useState } from "react";
import { Search, Bell, HelpCircle, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../Avatar";

const Navbar = ({
  logoLink = "/",
  navLinks = null,
  mobileNavContent = null,
  searchPlaceholder = "Search",
  searchQuery = "",
  onSearchChange = () => { },
  onSearch = () => { },
  onSearchFocus = () => { },
  onSearchBlur = () => { },
  searchType = "Jobs",
  onSearchTypeClick = () => { },
  searchDropdown = null,
  unreadCount = 0,
  onNotificationClick = () => { },
  openNotifications = false,
  notificationDropdown = null,
  profileAvatar = null,
  profileName = "",
  onProfileClick = () => { },
  profileMenu = null,
  rightActions = null,
  onHelpClick = () => { },
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary/80 backdrop-blur-md border-b border-border transition-all duration-300">

        <div className="relative max-w-[1630px] mx-auto h-14 md:h-20 px-4 md:px-6 lg:px-10 flex items-center justify-between">

          {/* LEFT: LOGO + DESKTOP NAV */}
          <div className="flex items-center gap-8">
            <Link to={logoLink} className="shrink-0 transition-transform hover:scale-[1.02] active:scale-95">
              <img
                src="/Logo-LightMode-trimmed.png"
                alt="Connect"
                className="h-7 md:h-10 lg:h-12 object-contain block dark:hidden"
              />
              <img
                src="/Logo2.png"
                alt="Connect"
                className="h-6 md:h-8 lg:h-10 object-contain hidden dark:block"
              />
            </Link>

            {/* Desktop nav links — unchanged */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks}
            </div>
          </div>

          {/* RIGHT: SEARCH + ICONS + PROFILE */}
          <div className="flex items-center gap-2 md:gap-6">

            {/* Search — desktop only */}
            <div className="hidden lg:block relative">
              <form
                onSubmit={(e) => { e.preventDefault(); onSearch(); }}
                className="flex items-center bg-secondary border border-border rounded-full px-4 py-2 w-[300px] transition-all focus-within:border-accent group"
              >
                <button type="submit" className="flex-shrink-0">
                  <Search size={16} className="text-white/40 group-focus-within:text-accent transition-colors" />
                </button>
                <input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  className="bg-transparent outline-none px-3 text-sm w-full text-light-text placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={onSearchTypeClick}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-light-text/60 hover:text-light-text hover:bg-hover rounded-md transition-colors whitespace-nowrap"
                >
                  {searchType}
                  <Arrow />
                </button>
              </form>
              {searchDropdown}
            </div>

            {/* Utility icons */}
            <div className="flex items-center gap-1 md:gap-2 font-sans">
              <button
                onClick={onHelpClick}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-all duration-200 text-light-text/60 hover:text-accent hover:bg-accent/10"
              >
                <HelpCircle size={16} className="md:hidden" />
                <HelpCircle size={20} className="hidden md:block" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={onNotificationClick}
                  className={`relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-all duration-200 ${openNotifications
                    ? "bg-accent/10 text-accent"
                    : "text-light-text/60 hover:text-accent hover:bg-accent/10"
                    }`}
                >
                  <Bell size={16} className="md:hidden" />
                  <Bell size={20} className="hidden md:block" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center z-10 shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {openNotifications && notificationDropdown}
              </div>

              {/* Right actions (AI, etc.) — hide text/large elements on mobile */}
              <div className="scale-90 md:scale-100 origin-center">
                {rightActions}
              </div>

              {/* Profile */}
              <div>
                <div
                  onClick={onProfileClick}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Avatar
                    src={profileAvatar}
                    name={profileName}
                    size="w-7 h-7 md:w-9 md:h-9"
                    className="rounded-full object-cover border border-transparent hover:border-accent/40"
                  />
                </div>
                {profileMenu}
              </div>

              {/* Mobile hamburger */}
              {navLinks && (
                <button
                  className="md:hidden w-7 h-7 flex items-center justify-center rounded-full text-light-text/70 hover:text-accent hover:bg-accent/10 transition-all"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[600] bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile nav drawer — slides from right */}
      <div
        className={`fixed top-0 right-0 h-full z-[700] w-[75vw] max-w-[300px] md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-light-text)' }}>Navigation</span>
          <button
            onClick={() => setMobileNavOpen(false)}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile search */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); onSearch(); setMobileNavOpen(false); }}
            className="flex items-center bg-secondary border border-border rounded-full px-3 py-2 w-full"
          >
            <Search size={14} className="text-white/40 mr-2 flex-shrink-0" />
            <input
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-light-text placeholder:text-white/30"
            />
          </form>
        </div>

        {/* Nav links — use mobileNavContent if provided, else default freelancer links */}
        <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
          {mobileNavContent ? mobileNavContent({ close: () => setMobileNavOpen(false) }) : (
            <>
              {/* Find Work */}
              <p className="text-xs font-black uppercase tracking-widest text-light-text/60 px-3 pt-3 pb-1">Find Work</p>
              {[
                { to: '/freelancer/find-work', label: 'Find jobs' },
                { to: '/freelancer/saved-jobs', label: 'Saved jobs' },
                { to: '/freelancer/proposals', label: 'Proposals & offers' },
                { to: '/freelancer/services', label: 'Your services' },
                { to: '/freelancer/direct-contracts', label: 'Direct Contracts' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}
                  className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-light-text/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
                  {label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {/* Deliver Work */}
              <p className="text-xs font-black uppercase tracking-widest text-light-text/60 px-3 pb-1">Deliver Work</p>
              {[
                { to: '/freelancer/contracts', label: 'Active contracts' },
                { to: '/freelancer/contract-history', label: 'Contract history' },
                { to: '/freelancer/work-diary', label: 'Hourly work diary' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}
                  className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-light-text/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
                  {label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {/* Finances */}
              <p className="text-xs font-black uppercase tracking-widest text-light-text/60 px-3 pb-1">Finances</p>
              {[
                { to: '/freelancer/earnings', label: 'Earnings' },
                { to: '/freelancer/transactions', label: 'Transactions' },
                { to: '/freelancer/withdraw', label: 'Withdraw funds' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}
                  className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-light-text/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
                  {label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {[
                { to: '/freelancer/messages', label: 'Messages' },
                { to: '/meeting/create', label: 'Create Meeting' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}
                  className="pl-6 pr-3 py-1.5 rounded-lg text-[12px] font-medium text-light-text/60 hover:text-accent hover:bg-accent/5 transition-all duration-200">
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      {children}
    </>
  );
};

export default Navbar;

const Arrow = () => (
  <svg
    className="w-3 h-3 transition-transform group-hover:translate-y-0.5"
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
