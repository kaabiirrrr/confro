import React, { useState } from "react";
import { ChevronDown, Menu, X, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, role, profile, getDashboardRoute } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const dashboardRoute = getDashboardRoute(role, profile);

  return (
    <>
    <nav className="sticky top-0 z-50 bg-primary/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1630px] mx-auto h-14 md:h-20 px-4 md:px-8 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center md:flex-1">
          <Link to="/" className="flex items-center group" aria-label="Connect Home">
            <img
              src="/Logo-LightMode-trimmed.png"
              alt="Connect - Freelance Marketplace Logo"
              className="h-7 md:h-12 object-contain block dark:hidden transition-all duration-300"
            />
            <img
              src="/Logo2.png"
              alt="Connect - Freelance Marketplace Logo"
              className="h-6 md:h-10 object-contain hidden dark:block transition-all duration-300"
            />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-none">
          <Link
            to="/find-freelancers"
            className="text-light-text/70 hover:text-accent transition-colors duration-300 text-sm font-medium"
            aria-label="Find and hire freelancers"
          >
            Find Freelancers
          </Link>

          <Link
            to="/find-work"
            className="text-light-text/70 hover:text-accent transition-colors duration-300 text-sm font-medium"
            aria-label="Find freelance jobs and work"
          >
            Find Jobs
          </Link>

          {/* About Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-light-text/70 hover:text-accent transition-colors duration-300 text-sm font-medium">
              About
              <ChevronDown
                size={14}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
            </button>

            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 
                            bg-secondary rounded-xl shadow-2xl 
                            border border-white/10 
                            opacity-0 invisible translate-y-4
                            group-hover:opacity-100 
                            group-hover:visible 
                            group-hover:translate-y-0
                            transition-all duration-300 ease-out
                            w-56 overflow-hidden">

              <Link
                to="/about"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                About Us
              </Link>

              <Link
                to="/how-it-works"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                How It Works
              </Link>

              <Link
                to="/for-freelancers"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                For Freelancers
              </Link>

              <Link
                to="/for-clients"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                For Clients
              </Link>

              <Link
                to="/about/mission"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                Mission & Vision
              </Link>

              <Link
                to="/about/team"
                className="block px-5 py-3 text-sm hover:bg-primary transition"
              >
                Our Team
              </Link>
            </div>
          </div>

          <Link
            to="/solutions"
            className="text-light-text/70 hover:text-accent transition-colors duration-300 text-sm font-medium"
          >
            Solutions
          </Link>

          <Link
            to="/solutions#contact-cta"
            className="text-light-text/70 hover:text-accent transition-colors duration-300 text-sm font-medium"
          >
            Contact
          </Link>
        </div>

        {/* Auth Buttons & Theme - Desktop */}
        <div className="hidden md:flex items-center justify-end gap-4 flex-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-light-text/70 hover:text-accent transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <Link
            to="/login"
            className="text-light-text border border-white/20 hover:border-accent hover:text-accent px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="bg-accent hover:scale-105 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
          >
            Join Us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-light-text hover:text-accent transition-colors focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Overlay — outside nav so no backdrop bleed */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu Drawer — outside nav, fully isolated */}
      <div
        className={`fixed top-0 right-0 h-full z-[1000] w-[75vw] max-w-[300px] border-l transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl`}
        style={{
          backgroundColor: isDark ? '#0F172A' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
        >
          <span className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#111827' }}>Menu</span>
          <button onClick={toggleMenu} style={{ color: isDark ? '#94A3B8' : '#6b7280' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex flex-col flex-1 px-4 py-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/find-freelancers', label: 'Find Freelancers' },
            { to: '/find-work', label: 'Find Jobs' },
            { to: '/solutions', label: 'Solutions' },
            { to: '/solutions#contact-cta', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={toggleMenu}
              className="text-[14px] font-medium py-2 transition-colors duration-200"
              style={{
                color: isDark ? '#F8FAFC' : '#111827',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              {label}
            </Link>
          ))}

          {/* About */}
          <div style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }} className="py-2">
            <p className="text-[14px] font-medium mb-1" style={{ color: isDark ? '#F8FAFC' : '#111827' }}>About</p>
            <div className="flex flex-col gap-1 pl-3" style={{ borderLeft: '2px solid rgba(56,189,248,0.3)' }}>
              {[
                { to: '/about', label: 'About Us' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/for-freelancers', label: 'For Freelancers' },
                { to: '/for-clients', label: 'For Clients' },
                { to: '/about/mission', label: 'Mission & Vision' },
                { to: '/about/team', label: 'Our Team' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={toggleMenu} className="text-[13px] py-0.5 transition-colors duration-200"
                  style={{ color: isDark ? '#94A3B8' : '#6b7280' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom — Auth + Theme */}
        <div
          className="px-4 py-3 flex flex-col gap-1.5 flex-shrink-0"
          style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
        >
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              color: isDark ? '#94A3B8' : '#6b7280',
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link
            to="/login"
            onClick={toggleMenu}
            className="w-full text-center py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              color: isDark ? '#F8FAFC' : '#111827',
            }}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            onClick={toggleMenu}
            className="w-full text-center py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Join Us
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;