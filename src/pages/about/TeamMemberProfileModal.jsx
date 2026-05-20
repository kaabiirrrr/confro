import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaGithub, FaFacebookF } from "react-icons/fa";
import { X, MapPin, Download, Mail, Globe, Zap, Star, ChevronRight, ArrowLeft } from "lucide-react";
import {
  AboutTab,
  ContributionsTab,
  SkillsTab,
  PortfolioTab,
  TimelineTab,
  ResumeTab,
} from "./TeamModalSections";

/* ── Tab config ────────────────────────────────────────────────── */
const TABS = [
  { id: "about",         label: "About"         },
  { id: "contributions", label: "Contributions" },
  { id: "skills",        label: "Skills"        },
  { id: "portfolio",     label: "Portfolio"     },
  { id: "timeline",      label: "Timeline"      },
  { id: "resume",        label: "Resume"        },
];

const ROLE_BADGE = {
  "co-founder": "bg-violet-500/10 text-violet-500 border-violet-500/30",
  cto:          "bg-blue-500/10   text-blue-500   border-blue-500/30",
  cpo:          "bg-pink-500/10   text-pink-500   border-pink-500/30",
  cmo:          "bg-orange-500/10 text-orange-500 border-orange-500/30",
  "growth-lead": "bg-orange-500/10 text-orange-500 border-orange-500/30",
  coo:          "bg-teal-500/10   text-teal-500   border-teal-500/30",
};

/* ── Modal ─────────────────────────────────────────────────────── */
const TeamMemberProfileModal = ({ member, onClose }) => {
  const [activeTab, setActiveTab]   = useState("about");
  const [aboutActive, setAboutActive] = useState(false);
  const tabsRef  = useRef(null);
  const scrollRef = useRef(null);

  /* ESC to close */
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  /* Trigger stat counters when About tab is active */
  useEffect(() => {
    if (activeTab === "about") {
      const t = setTimeout(() => setAboutActive(true), 200);
      return () => clearTimeout(t);
    } else {
      setAboutActive(false);
    }
  }, [activeTab]);

  /* Reset scroll + active tab when member changes */
  useEffect(() => {
    setActiveTab("about");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [member]);

  const roleBadge = ROLE_BADGE[member.badgeType] ?? ROLE_BADGE["co-founder"];

  const renderTab = () => {
    switch (activeTab) {
      case "about":         return <AboutTab         member={member} active={aboutActive} />;
      case "contributions": return <ContributionsTab member={member} />;
      case "skills":        return <SkillsTab        member={member} active={activeTab === "skills"} />;
      case "portfolio":     return <PortfolioTab      member={member} />;
      case "timeline":      return <TimelineTab       member={member} />;
      case "resume":        return <ResumeTab         member={member} />;
      default:              return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex justify-end"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        {/* ── Panel ─────────────────────────────────────────── */}
        <motion.div
          key="panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          onClick={e => e.stopPropagation()}
          ref={scrollRef}
          className="relative flex flex-col bg-primary w-full md:max-w-[95vw] lg:max-w-[1000px] h-full overflow-y-auto"
          style={{ borderLeft: "2px solid var(--color-light-text)" }}
        >

          {/* ── Sticky top bar ──────────────────────────────── */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
            style={{ background: "var(--color-card-bg)", borderBottom: "1px solid var(--color-border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-3">
              <button onClick={onClose}
                className="p-1.5 rounded-full text-text-muted hover:text-light-text hover:bg-hover transition-all">
                <ArrowLeft size={18} />
              </button>
              <div>
                <p className="text-sm font-bold text-light-text leading-tight">{member.name}</p>
                <p className="text-[11px] text-accent">{member.shortRole}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-full text-text-muted hover:text-light-text hover:bg-hover transition-all">
              <X size={20} />
            </button>
          </div>

          {/* ── Hero ────────────────────────────────────────── */}
          <div className="px-5 sm:px-8 pt-8 pb-6"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-secondary)" }}>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden"
                  style={{ border: "3px solid var(--color-accent)", boxShadow: "6px 6px 0 var(--color-light-text)" }}>
                  <img src={member.img} alt={member.name}
                    className={`w-full h-full object-cover ${member.position}`} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${roleBadge}`}>
                    {(member.badgeType ?? "").replace("-", " ")}
                  </span>
                  {member.availability === "open" && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent border-accent/20">
                    ✓ Core Team
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-light-text mb-1">{member.name}</h1>
                <p className="text-accent font-semibold mb-1">{member.shortRole}</p>
                <p className="text-xs font-medium text-text-muted mb-1">{member.tagline}</p>

                <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                  <span className="flex items-center gap-1"><MapPin size={11}/> {member.location}</span>
                  <span>· {member.experience} Exp.</span>
                </div>

                {/* Top skill chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(member.skillsTags ?? (member.skills ?? []).slice(0, 5)).map((sk, i) => {
                    const tagName = typeof sk === "string" ? sk : sk.name;
                    return (
                      <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-text-secondary"
                        style={{ background: "var(--color-hover)", border: "1px solid var(--color-border)" }}>
                        {tagName}
                      </span>
                    );
                  })}
                </div>

                {/* Action row */}
                <div className="flex flex-wrap items-center gap-2">
                  {member.resumeUrl ? (
                    <a href={member.resumeUrl} download
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white"
                      style={{ background: "var(--color-accent)", border: "2px solid var(--color-light-text)", boxShadow: "3px 3px 0 var(--color-light-text)" }}>
                      <Download size={13}/> Resume PDF
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-full text-xs font-bold text-text-muted"
                      style={{ border: "2px solid var(--color-border)" }}>
                      Resume Coming Soon
                    </span>
                  )}
                  {/* Socials */}
                  {[
                    { href: member.github,    Icon: FaGithub },
                    { href: member.linkedin,  Icon: FaLinkedinIn },
                    { href: member.instagram, Icon: FaInstagram },
                    { href: member.facebook,  Icon: FaFacebookF },
                  ].filter(s => s.href).map(({ href, Icon }, i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full text-text-muted hover:text-accent transition-colors"
                      style={{ border: "1px solid var(--color-border)" }}>
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Summary ──────────────────────────────────── */}
          {member.aiSummary && (
            <div className="mx-5 sm:mx-8 mt-6">
              <div className="p-4 rounded-xl relative overflow-hidden"
                style={{ border: "1px solid var(--color-accent)", background: "var(--color-hover)" }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl"
                  style={{ background: "var(--color-accent)", opacity: 0.06 }} />
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <Zap size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">AI Summary</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{member.aiSummary}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Sticky Tab Navigation ───────────────────────── */}
          <div ref={tabsRef} className="sticky top-[53px] z-10 mt-6 px-5 sm:px-8"
            style={{ background: "var(--color-primary)", borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex gap-0 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors shrink-0"
                  style={{ color: activeTab === tab.id ? "var(--color-light-text)" : "var(--color-text-muted)" }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tabLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "var(--color-accent)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ─────────────────────────────────── */}
          <div className="flex-1 px-5 sm:px-8 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Sticky Footer ───────────────────────────────── */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-8 py-3 flex-wrap"
            style={{ background: "var(--color-card-bg)", borderTop: "1px solid var(--color-border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { href: member.github,    Icon: FaGithub,    label: "GitHub" },
                { href: member.linkedin,  Icon: FaLinkedinIn, label: "LinkedIn" },
                { href: member.instagram, Icon: FaInstagram, label: "Instagram" },
              ].filter(s => s.href).map(({ href, Icon, label }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-text-secondary hover:text-accent transition-colors"
                  style={{ border: "1px solid var(--color-border)" }}>
                  <Icon size={12}/> {label}
                </a>
              ))}
            </div>
            {member.email && (
              <a href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white"
                style={{ background: "var(--color-accent)", border: "2px solid var(--color-light-text)", boxShadow: "3px 3px 0 var(--color-light-text)" }}>
                <Mail size={13}/> Contact
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamMemberProfileModal;
