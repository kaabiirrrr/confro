import React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  HelpCircle,
  Accessibility,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
import { getGlobalStats } from "../services/apiService";

const Footer = () => {
  const [stats, setStats] = React.useState({ registeredUsers: 0, totalJobs: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getGlobalStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch footer stats:", err);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <footer className="bg-primary border-t border-white/5 mt-12 sm:mt-20">
      <div className="max-w-[1630px] mx-auto px-4 md:px-6 lg:px-10 py-12 sm:py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10">

          {/* Logo */}
          <div className="ml-[-5px] col-span-2 sm:col-span-3 lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center justify-start">
              <img
                src="/Logo2.png"
                alt="Connect Logo"
                className="h-6 sm:h-10 object-contain invert dark:invert-0"
              />
            </Link>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">About</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-light-text/70">
              <li>
                <Link to="/about" className="hover:text-accent">About Us</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-accent">How it Works</Link>
              </li>
              <li>
                <Link to="/for-freelancers" className="hover:text-accent">For Freelancers</Link>
              </li>
              <li>
                <Link to="/for-clients" className="hover:text-accent">For Clients</Link>
              </li>
              <li>
                <Link to="/about/mission" className="hover:text-accent">Mission & Vision</Link>
              </li>
              <li>
                <Link to="/about/team" className="hover:text-accent">Meet Team</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-light-text/70">
              <li>
                <Link to="/legal#privacy-policy" className="hover:text-accent">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/legal#terms" className="hover:text-accent">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/legal#cookie-policy" className="hover:text-accent">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/legal#refund-policy" className="hover:text-accent">Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Partners</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-light-text/70">
              <li>
                <a href="https://www.escrow.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Escrow.com</a>
              </li>
              <li>
                <a href="https://www.loadshift.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Loadshift</a>
              </li>
              <li>
                <a href="https://www.warriorforum.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">Warrior Forum</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Contact Info</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-light-text/70">
              <li>
                <a href="mailto:admin@connectfreelance.in" className="hover:text-accent break-words flex items-center gap-2">
                  <span>admin@connectfreelance.in</span>
                </a>
              </li>
              <li>
                <p className="hover:text-accent">+91 XXXXXXXX58</p>
              </li>
              <li>
                <p className="hover:text-accent">Nashik, Maharashtra</p>
              </li>
              <li>
                <a href="https://connectfreelance.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent">connectfreelance.in</a>
              </li>
            </ul>
          </div>

          {/* Apps */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col items-center sm:items-start">
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Apps</h4>
            <div className="flex flex-col items-center sm:items-start gap-3">
              <a href="/app-download" target="_blank" rel="noopener noreferrer" className="w-[140px] sm:w-[160px]">
                <img src="https://www.f-cdn.com/assets/main/en/assets/footer/app-store.svg" alt="App Store" className="w-full invert dark:invert-0" />
              </a>
              <a href="/app-download" target="_blank" rel="noopener noreferrer" className="w-[140px] sm:w-[160px]">
                <img src="https://www.f-cdn.com/assets/main/en/assets/footer/google-play.svg" alt="Google Play" className="w-full invert dark:invert-0" />
              </a>
            </div>

            {/* Social */}
            <div className="flex justify-center sm:justify-start lg:justify-center w-[140px] sm:w-[160px] gap-4 mt-6 text-light-text/70">
              <a href="https://www.facebook.com/profile.php?id=61570676549371" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <Facebook size={18} />
              </a>
              <a href="https://x.com/connectfreelanc" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <Twitter size={18} />
              </a>
              <a href="https://www.instagram.com/connectfreelance.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <Instagram size={18} />
              </a>
              <a href="https://www.linkedin.com/company/115777310" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Divider & Bottom Section */}
        <div className="border-t border-white/10 mt-12 sm:mt-16 pt-8 flex flex-col items-center gap-10 text-center">

          {/* Quick Links */}
          <div className="flex gap-6 sm:gap-10 text-xs sm:text-sm text-light-text/70 flex-wrap justify-center">
            <Link to="/" className="hover:text-accent font-medium tracking-wide">Home</Link>
            <Link to="/about" className="hover:text-accent font-medium tracking-wide">About</Link>
            <Link to="/how-it-works" className="hover:text-accent font-medium tracking-wide">How It Works</Link>
            <Link to="/for-freelancers" className="hover:text-accent font-medium tracking-wide">For Freelancers</Link>
            <Link to="/for-clients" className="hover:text-accent font-medium tracking-wide">For Clients</Link>
            <Link to="/blog/how-to-find-freelancers-in-india" className="hover:text-accent font-medium tracking-wide">Hire in India</Link>
            <Link to="/solutions#contact-cta" className="hover:text-accent font-medium tracking-wide">Contact</Link>
            <Link to="/legal" className="hover:text-accent font-medium tracking-wide">Legal</Link>
          </div>

          <div className="flex gap-8 sm:gap-20 justify-center">
            <div>
              <p className="font-bold text-xl sm:text-3xl text-slate-950 dark:text-white leading-none mb-2">{formatNumber(stats.registeredUsers)}</p>
              <p className="text-slate-900/60 dark:text-white/60 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium">Registered Users</p>
            </div>
            <div>
              <p className="font-bold text-xl sm:text-3xl text-slate-950 dark:text-white leading-none mb-2">{formatNumber(stats.totalJobs)}</p>
              <p className="text-slate-900/60 dark:text-white/60 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium">Total Jobs Posted</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-[10px] sm:text-xs text-slate-950 dark:text-white font-medium max-w-xl">
            ©️ 2026 Connect Freelance. All rights reserved.
            <br className="sm:hidden" />
            Designed and Developed by <span className="text-accent font-bold">Skimmers❤️‍🔥</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;