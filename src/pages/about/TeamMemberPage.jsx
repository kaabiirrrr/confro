import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaGithub, FaFacebookF } from "react-icons/fa";
import { ArrowLeft, MapPin, Download, Mail, ExternalLink, Zap, ChevronRight, Globe } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { members } from "./teamData";

/* ── Variants ─────────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ── Badge colour map ─────────────────────────────────── */
const BADGE = {
  "co-founder": { bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.25)", label: "CO-FOUNDER" },
  cto: { bg: "rgba(168,85,247,0.1)", color: "#a855f7", border: "rgba(168,85,247,0.25)", label: "CTO" },
  cpo: { bg: "rgba(236,72,153,0.1)", color: "#ec4899", border: "rgba(236,72,153,0.25)", label: "CPO" },
  cmo: { bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.25)", label: "CMO" },
  "growth-lead": { bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.25)", label: "GROWTH LEAD" },
  coo: { bg: "rgba(20,184,166,0.1)", color: "#14b8a6", border: "rgba(20,184,166,0.25)", label: "COO" },
};

/* ── Timeline type colours ────────────────────────────── */
const TL_COLORS = {
  project: { color: "#38bdf8", icon: "🚀" },
  internship: { color: "#10b981", icon: "💼" },
  education: { color: "#a855f7", icon: "🎓" },
  certification: { color: "#f59e0b", icon: "📜" },
  achievement: { color: "#eab308", icon: "🏆" },
};

/* ── Skill Bar ────────────────────────────────────────── */
function SkillBar({ skill, animate }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--color-light-text)", fontWeight: 600 }}>{skill.name}</span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{skill.level}%</span>
      </div>
      <div style={{ height: 6, background: "var(--color-hover)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animate ? `${skill.level}%` : 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          style={{ height: "100%", background: "linear-gradient(90deg, rgba(56,189,248,0.6), #38bdf8)", borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

/* ── Animated Counter ─────────────────────────────────── */
function AnimatedCount({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 15);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

/* ── TABS ─────────────────────────────────────────────── */
const TABS = ["About", "Contributions", "Skills", "Portfolio", "Timeline"];

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function TeamMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("About");

  const member = members.find(m => m.id === id);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!member) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-primary)", color: "var(--color-light-text)" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <h2>Team Member Not Found</h2>
          <button onClick={() => navigate("/about/team")} style={{ background: "transparent", border: "1px solid var(--color-border)", padding: "10px 20px", borderRadius: 8, cursor: "pointer", color: "inherit" }}>
            Back to Team
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const badge = BADGE[member.badgeType] || BADGE["co-founder"];
  const skillsByCategory = member.skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--color-primary)", color: "var(--color-light-text)" }}>
        <Navbar />

        {/* ── Back bar ── */}
        <div style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 24px 0" }}>
          <button
            onClick={() => navigate("/about/team")}
            style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: 14, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Team
          </button>
        </div>

        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          style={{ maxWidth: 1500, margin: "0 auto", padding: "32px 24px 24px" }}
        >

          {/* ══ HERO ══════════════════════════════════════════════ */}
          <motion.div variants={fadeUp} className="hero-card" style={{
            background: "transparent", border: "1px solid var(--color-border)",
            borderRadius: 12, padding: "36px 40px", marginBottom: 28,
            display: "flex", gap: 36, flexWrap: "wrap", alignItems: "flex-start"
          }}>
            {/* Avatar */}
            <div className="team-avatar-wrap" style={{ flexShrink: 0, padding: 8 }}>
              {member.website ? (
                <a href={member.website} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                  <img
                    src={member.img} alt={member.name}
                    className="team-avatar-img img-hover-zoom"
                    style={{
                      width: 200, height: 220, objectFit: "cover",
                      objectPosition: member.position?.replace("object-[", "").replace("]", "") || "50% 30%",
                      borderRadius: 10, border: "3px solid #38bdf8",
                      cursor: "pointer", transition: "transform 0.3s ease"
                    }}
                  />
                </a>
              ) : (
                <img
                  src={member.img} alt={member.name}
                  className="team-avatar-img"
                  style={{
                    width: 200, height: 220, objectFit: "cover",
                    objectPosition: member.position?.replace("object-[", "").replace("]", "") || "50% 30%",
                    borderRadius: 10, border: "3px solid #38bdf8",
                  }}
                />
              )}
            </div>

            {/* Info */}
            <div className="member-info-wrap" style={{ flex: 1, minWidth: 0 }}>
              {/* Name + Socials + Buttons row */}
              <div className="member-name-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                <h1 className="member-name-title" style={{ fontSize: 34, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{member.name}</h1>
                <div className="member-socials-buttons-wrap" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  {/* Social icons */}
                  <div className="member-social-icons" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {member.website && <a href={member.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: 15 }}><Globe size={15} /></a>}
                    {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: 15 }}><FaGithub /></a>}
                    {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: 15 }}><FaLinkedinIn /></a>}
                    {member.instagram && <a href={member.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: 15 }}><FaInstagram /></a>}
                    {member.facebook && <a href={member.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: 15 }}><FaFacebookF /></a>}
                  </div>
                  {/* Divider */}
                  <span className="member-divider" style={{ width: 1, height: 16, background: "var(--color-border)", display: "inline-block" }} />
                  {/* Buttons */}
                  <div className="member-buttons-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {member.website && (
                      <a href={member.website} target="_blank" rel="noopener noreferrer" className="member-btn-portfolio" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, border: "1px solid var(--color-accent)", background: "var(--color-accent)", color: "#ffffff", textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s ease" }}>
                        <Globe size={11} /> PORTFOLIO
                      </a>
                    )}
                    {member.resumeUrl ? (
                      <a href={member.resumeUrl} target="_blank" rel="noopener noreferrer" className="member-btn-resume" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s ease" }}>
                        <Download size={11} /> RESUME
                      </a>
                    ) : (
                      <span className="member-btn-resume" style={{ fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, border: "1px solid var(--color-border)", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>Resume Soon</span>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="member-btn-contact" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 99, background: "var(--color-accent)", border: "1px solid var(--color-accent)", color: "#ffffff", textDecoration: "none", transition: "all 0.2s ease" }}>
                        <Mail size={11} /> CONTACT
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <p className="member-role-title" style={{ color: "#38bdf8", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>{member.shortRole}</p>
              <p className="member-tagline-text" style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>{member.tagline}</p>

              <div className="member-meta-row" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: "var(--color-text-muted)" }}>
                <span className="member-meta-loc" style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{member.location}</span>
                <span className="member-meta-dot" style={{ display: "inline" }}>·</span>
                <span className="member-meta-exp">{member.experience} Exp.</span>
                <span className="member-meta-dot" style={{ display: "inline" }}>·</span>
                <span className="member-meta-avail" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: member.availability === "open" ? "#10b981" : "#f59e0b", display: "inline-block" }} />
                  {member.availability === "open" ? "Available" : member.availability === "busy" ? "In a Project" : "Not Available"}
                </span>
              </div>

              {/* Top skills */}
              <div className="member-skills-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {(member.skillsTags ?? member.skills.slice(0, 8)).map(s => {
                  const tagName = typeof s === "string" ? s : s.name;
                  return (
                    <span key={tagName} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "var(--color-hover)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
                      {tagName}
                    </span>
                  );
                })}
              </div>


            </div>
          </motion.div>

          {/* ══ AI SUMMARY ════════════════════════════════════════ */}
          {member.aiSummary && (
            <motion.div variants={fadeUp} style={{
              border: "1px solid rgba(56,189,248,0.3)", borderRadius: 10,
              padding: "18px 24px", marginBottom: 28,
              background: "rgba(56,189,248,0.05)",
              display: "flex", gap: 14, alignItems: "flex-start"
            }}>
              <Zap size={18} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "#38bdf8", margin: "0 0 6px" }}>AI SUMMARY</p>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: 0 }}>{member.aiSummary}</p>
              </div>
            </motion.div>
          )}

          {/* ══ TAB NAV ═══════════════════════════════════════════ */}
          <motion.div className="no-scrollbar" variants={fadeUp} style={{
            display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)",
            marginBottom: 32, overflowX: "auto"
          }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 22px", fontSize: 13, fontWeight: 700,
                color: activeTab === tab ? "#38bdf8" : "var(--color-text-muted)",
                borderBottom: `2px solid ${activeTab === tab ? "#38bdf8" : "transparent"}`,
                transition: "all 0.2s", letterSpacing: "0.05em",
                whiteSpace: "nowrap"
              }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </motion.div>

          {/* ══ TAB CONTENT ═══════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            >

              {/* ── ABOUT ── */}
              {activeTab === "About" && (
                <div>
                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
                    {member.stats.map(s => (
                      <div key={s.label} style={{
                        background: "transparent", border: "1px solid var(--color-border)",
                        borderRadius: 8, padding: "22px 20px", textAlign: "center"
                      }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-light-text)", letterSpacing: "-0.02em" }}>
                          <AnimatedCount target={s.value} suffix={s.suffix} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-muted)", marginTop: 6, textTransform: "uppercase" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  <div>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-text-secondary)", marginBottom: 16 }}>{member.bio1}</p>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-text-secondary)", marginBottom: 28 }}>{member.bio2}</p>

                    {member.philosophy && (
                      <blockquote style={{
                        borderLeft: "4px solid #38bdf8", paddingLeft: 20, paddingTop: 14, paddingBottom: 14,
                        paddingRight: 20, borderRadius: "0 10px 10px 0",
                        background: "var(--color-hover)", margin: 0,
                        fontStyle: "italic", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75
                      }}>
                        {member.philosophy}
                      </blockquote>
                    )}
                  </div>
                </div>
              )}

              {/* ── CONTRIBUTIONS ── */}
              {activeTab === "Contributions" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
                  {member.contributions.map((c, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        background: "transparent", border: "1px solid var(--color-border)",
                        borderRadius: 8, padding: "22px 22px", cursor: "default",
                        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s"
                      }}
                      whileHover={{ borderColor: "#38bdf8", boxShadow: "3px 3px 0 rgba(56,189,248,0.3)", y: -2 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>{c.icon}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 99, background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>
                          {c.tag}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>{c.title}</h4>
                      <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── SKILLS ── */}
              {activeTab === "Skills" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 28 }}>
                  {Object.entries(skillsByCategory).map(([cat, skills]) => (
                    <div key={cat} style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: 8, padding: "22px 24px" }}>
                      <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#38bdf8", textTransform: "uppercase", marginBottom: 20 }}>{cat}</h4>
                      {skills.map(s => <SkillBar key={s.name} skill={s} animate={activeTab === "Skills"} />)}
                    </div>
                  ))}
                </div>
              )}

              {/* ── PORTFOLIO ── */}
              {activeTab === "Portfolio" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
                  {member.portfolio.map((p, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}
                    >
                      {/* Project thumbnail */}
                      {p.image ? (
                        <a href={p.demo || member.website || "https://kabirmoreportfolio.vercel.app/"} target="_blank" rel="noopener noreferrer" style={{ display: "block", overflow: "hidden" }}>
                          <img src={p.image} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.3s ease", cursor: "pointer" }} />
                        </a>
                      ) : (
                        <div style={{ height: 160, background: `linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.15))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🚀</div>
                      )}
                      <div style={{ padding: "16px 18px" }}>
                        {/* Title + Tech on one line, wrapping if necessary, showing full name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{p.title}</h4>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: "var(--color-hover)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>
                            {p.techStack}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
                        {/* Full-width 2-col fully rounded buttons */}
                        <div style={{ display: "grid", gridTemplateColumns: p.demo && p.github ? "1fr 1fr" : "1fr", gap: 8 }}>
                          {p.demo ? (
                            <a href={p.demo} target="_blank" rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "9px 0", borderRadius: 99, background: "rgba(56,189,248,0.12)", color: "#38bdf8", textDecoration: "none", border: "1px solid rgba(56,189,248,0.25)" }}>
                              <ExternalLink size={12} /> Live Demo
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>Demo on Request</span>
                          )}
                          {p.github && (
                            <a href={p.github} target="_blank" rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "9px 0", borderRadius: 99, background: "var(--color-hover)", color: "var(--color-text-secondary)", textDecoration: "none", border: "1px solid var(--color-border)" }}>
                              <FaGithub /> GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── TIMELINE ── */}
              {activeTab === "Timeline" && (
                <div style={{ position: "relative", paddingLeft: 32 }}>
                  {/* Spine */}
                  <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--color-border)", borderRadius: 2 }} />

                  {member.timeline.map((t, i) => {
                    const tl = TL_COLORS[t.type] || TL_COLORS.project;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        style={{ position: "relative", marginBottom: 32 }}
                      >
                        {/* Dot */}
                        <div style={{
                          position: "absolute", left: -32, top: 4, width: 16, height: 16,
                          borderRadius: "50%", background: tl.color, border: "3px solid var(--color-primary)",
                          boxShadow: `0 0 0 2px ${tl.color}40`
                        }} />

                        <div style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: 8, padding: "18px 22px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: tl.color }}>{t.year}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 99, background: `${tl.color}15`, color: tl.color, border: `1px solid ${tl.color}30` }}>
                              {tl.icon} {t.type.toUpperCase()}
                            </span>
                          </div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{t.title}</h4>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8 }}>{t.org}</p>
                          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </motion.div>
      </div>
      <div className="max-w-[1500px] mx-auto w-full px-6">
        <Footer />
      </div>
    </>
  );
}
