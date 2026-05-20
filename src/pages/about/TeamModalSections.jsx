import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaGithub, FaFacebookF } from "react-icons/fa";
import { MapPin, Download, ExternalLink, Mail, Globe, FileText, Zap, CheckCircle2, Star } from "lucide-react";

/* ── Animated counter hook ─────────────────────────────────────── */
export const useCounter = (target, active, duration = 1200) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf, start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
};

/* ── Heatmap (GitHub-style, 5 categories × 20 weeks) ─────────── */
const HEAT_CATS = ["Frontend", "Backend", "API", "UI/UX", "Deploy"];
const genHeat = seed =>
  HEAT_CATS.map((cat, ci) => ({
    cat,
    weeks: Array.from({ length: 20 }, (_, wi) =>
      Math.max(0, Math.min(4, Math.round((Math.sin(seed * 3 + ci * 5 + wi * 0.7) + 1) * 2)))
    ),
  }));

const HEAT_COLORS = [
  "bg-border",
  "bg-accent/20",
  "bg-accent/40",
  "bg-accent/70",
  "bg-accent",
];

export const ContributionHeatmap = ({ member }) => {
  const rows = genHeat(member.name.length + (member.skills?.length ?? 5));
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Contribution Activity</p>
      <div className="space-y-1.5">
        {rows.map(({ cat, weeks }) => (
          <div key={cat} className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted w-14 text-right shrink-0">{cat}</span>
            <div className="flex gap-1 flex-wrap">
              {weeks.map((v, i) => (
                <div key={i} title={`${v} contributions`}
                  className={`w-3 h-3 rounded-sm ${HEAT_COLORS[v]} transition-all hover:scale-125 cursor-default`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-text-muted">Less ■ ■ ■ ■ ■ More</p>
    </div>
  );
};

/* ── SVG Radar Chart ───────────────────────────────────────────── */
export const RadarChart = ({ skills = [] }) => {
  const size = 90;
  const cx = size, cy = size;
  const uniqueCats = [...new Set(skills.map(s => s.category))];
  const RADAR_CATS = uniqueCats.length >= 3 ? uniqueCats.slice(0, 5) : ["Frontend", "Backend", "Design", "Database", "DevOps"];

  const getScore = cat => {
    const matched = skills.filter(s =>
      s.category === cat ||
      (cat === "DevOps" && ["Infra", "DevOps"].includes(s.category)) ||
      (cat === "Frontend" && s.category === "Frontend")
    );
    if (!matched.length) return 50;
    return matched.reduce((a, b) => a + b.level, 0) / matched.length;
  };
  const pts = RADAR_CATS.map((cat, i) => {
    const angle = (i * 2 * Math.PI) / RADAR_CATS.length - Math.PI / 2;
    const r = (getScore(cat) / 100) * size * 0.8;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, lx: cx + Math.cos(angle) * (size * 0.88 + 12), ly: cy + Math.sin(angle) * (size * 0.88 + 12), label: cat };
  });
  const gridLvls = [0.25, 0.5, 0.75, 1];
  const gridPts = lvl =>
    RADAR_CATS.map((_, i) => {
      const angle = (i * 2 * Math.PI) / RADAR_CATS.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * size * 0.8 * lvl},${cy + Math.sin(angle) * size * 0.8 * lvl}`;
    }).join(" ");
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${size * 2} ${size * 2}`} className="w-full max-w-[200px] mx-auto">
      {gridLvls.map(lvl => (
        <polygon key={lvl} points={gridPts(lvl)} fill="none"
          stroke="var(--color-border)" strokeWidth="1" />
      ))}
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      <polygon points={polyPts} fill="var(--color-accent)" fillOpacity="0.15"
        stroke="var(--color-accent)" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="var(--color-accent)" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif" fontWeight="600">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ── Skill Bars ────────────────────────────────────────────────── */
export const SkillsTab = ({ member, active }) => {
  const categories = [...new Set((member.skills ?? []).map(s => s.category))];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-5">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">{cat}</p>
              <div className="space-y-3">
                {member.skills.filter(s => s.category === cat).map((sk, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-light-text">{sk.name}</span>
                      <span className="text-xs font-bold text-accent">{sk.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-hover)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: active ? `${sk.level}%` : 0 }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-cta))" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted self-start">Skill Radar</p>
          <RadarChart skills={member.skills ?? []} />
          <div className="flex flex-wrap gap-2">
            {(member.skills ?? []).map((sk, i) => (
              <span key={i}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-text-secondary transition-all hover:text-accent cursor-default"
                style={{ background: "var(--color-hover)", border: "1px solid var(--color-border)" }}>
                {sk.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Contributions Tab ─────────────────────────────────────────── */
const TAG_COLORS = {
  "Frontend":  "bg-blue-500/10   text-blue-500   border-blue-500/20",
  "Backend":   "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Auth":      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Algorithm": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "UI/UX":     "bg-pink-500/10   text-pink-500   border-pink-500/20",
  "AI/ML":     "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "QA":        "bg-teal-500/10   text-teal-500   border-teal-500/20",
  "Growth":    "bg-amber-500/10  text-amber-500  border-amber-500/20",
  "DevOps":    "bg-cyan-500/10   text-cyan-500   border-cyan-500/20",
  "Product":   "bg-rose-500/10   text-rose-500   border-rose-500/20",
};

export const ContributionsTab = ({ member }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {(member.contributions ?? []).map((c, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.07 }}
        className="p-4 rounded-xl group transition-all duration-200"
        style={{ border: "2px solid var(--color-border)", background: "var(--color-hover)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "4px 4px 0 var(--color-accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{c.icon}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${TAG_COLORS[c.tag] ?? "bg-accent/10 text-accent border-accent/20"}`}>
            {c.tag}
          </span>
        </div>
        <h4 className="text-sm font-bold text-light-text mb-1">{c.title}</h4>
        <p className="text-xs text-text-secondary leading-relaxed">{c.desc}</p>
      </motion.div>
    ))}
  </div>
);

/* ── Timeline Tab ──────────────────────────────────────────────── */
const TYPE_CONFIG = {
  project:      { icon: "🚀", color: "bg-accent/10 text-accent border-accent/20" },
  internship:   { icon: "💼", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  education:    { icon: "🎓", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  certification:{ icon: "📜", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  achievement:  { icon: "🏆", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
};

export const TimelineTab = ({ member }) => (
  <div className="relative pl-6">
    <div className="absolute left-0 top-2 bottom-2 w-0.5" style={{ background: "var(--color-border)" }} />
    <div className="space-y-8">
      {(member.timeline ?? []).map((t, i) => {
        const cfg = TYPE_CONFIG[t.type] ?? TYPE_CONFIG.achievement;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2"
              style={{ background: "var(--color-accent)", borderColor: "var(--color-card-bg)" }} />
            <div className="flex items-start gap-3 flex-wrap mb-1">
              <span className="text-xs font-black text-text-muted">{t.year}</span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                {cfg.icon} {t.type}
              </span>
            </div>
            <h4 className="text-sm font-bold text-light-text">{t.title}</h4>
            <p className="text-xs text-accent font-semibold mb-1">{t.org}</p>
            <p className="text-xs text-text-secondary leading-relaxed">{t.desc}</p>
          </motion.div>
        );
      })}
    </div>
  </div>
);

/* ── Portfolio Tab ─────────────────────────────────────────────── */
const GRAD_OVERLAYS = [
  "from-violet-600 via-purple-600 to-blue-600",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-rose-500 via-pink-500 to-purple-500",
  "from-amber-500 via-orange-500 to-red-500",
];

export const PortfolioTab = ({ member }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {(member.portfolio ?? []).map((p, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="rounded-xl overflow-hidden group"
        style={{ border: "2px solid var(--color-light-text)", boxShadow: "4px 4px 0 var(--color-light-text)" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translate(-4px,-4px)"; e.currentTarget.style.boxShadow = "8px 8px 0 var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "4px 4px 0 var(--color-light-text)"; e.currentTarget.style.borderColor = "var(--color-light-text)"; }}
      >
        {/* Gradient preview */}
        <div className={`h-40 bg-gradient-to-br ${GRAD_OVERLAYS[i % GRAD_OVERLAYS.length]} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 flex flex-col gap-2 p-4">
            <div className="h-2 bg-white rounded w-3/4" />
            <div className="h-2 bg-white rounded w-1/2" />
            <div className="h-8 bg-white/50 rounded mt-1" />
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {[1,2,3].map(j => <div key={j} className="h-10 bg-white/40 rounded" />)}
            </div>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded text-white text-[10px] font-bold"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
              {p.techStack}
            </span>
          </div>
        </div>
        {/* Info */}
        <div className="p-4" style={{ background: "var(--color-card-bg)" }}>
          <h4 className="text-sm font-bold text-light-text mb-1">{p.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">{p.desc}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Role: {p.role}</p>
          <div className="flex items-center gap-2">
            {p.demo ? (
              <a href={p.demo} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: "var(--color-accent)" }}
                onClick={e => e.stopPropagation()}>
                <ExternalLink size={11} /> Live Demo
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold text-text-muted"
                style={{ border: "1px solid var(--color-border)" }}>Demo on Request</span>
            )}
            {p.github && (
              <a href={p.github} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-text-secondary transition-colors hover:text-accent"
                style={{ border: "1px solid var(--color-border)" }}
                onClick={e => e.stopPropagation()}>
                <FaGithub size={11} /> GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

/* ── Resume Tab ────────────────────────────────────────────────── */
export const ResumeTab = ({ member }) => (
  <div className="space-y-6">
    <div className="p-6 rounded-2xl text-center space-y-4"
      style={{ border: "2px dashed var(--color-border)", background: "var(--color-hover)" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "var(--color-accent)", boxShadow: "4px 4px 0 var(--color-light-text)" }}>
        <FileText size={28} className="text-white" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-light-text mb-1">{member.name} — Resume</h4>
        <p className="text-sm text-text-muted">{member.shortRole} · Connect Freelance</p>
      </div>
      {member.resumeUrl ? (
        <div className="flex items-center justify-center gap-3">
          <a href={member.resumeUrl} download
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background: "var(--color-accent)", border: "2px solid var(--color-light-text)", boxShadow: "3px 3px 0 var(--color-light-text)" }}>
            <Download size={15} /> Download PDF
          </a>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-text-muted"
          style={{ border: "2px solid var(--color-border)" }}>
          <FileText size={14} /> Resume Coming Soon
        </div>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Experience", items: (member.timeline ?? []).filter(t => t.type === "internship" || t.type === "project") },
        { label: "Education",  items: (member.timeline ?? []).filter(t => t.type === "education") },
        { label: "Certifications", items: (member.timeline ?? []).filter(t => t.type === "certification") },
      ].map(({ label, items }) => (
        <div key={label} className="p-4 rounded-xl space-y-3"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-hover)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
          {items.length > 0 ? items.map((t, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-light-text">{t.title}</p>
              <p className="text-[11px] text-accent">{t.org}</p>
              <p className="text-[11px] text-text-muted">{t.year}</p>
            </div>
          )) : (
            <p className="text-xs text-text-muted italic">Not provided</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ── About Tab ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, suffix, active }) => {
  const count = useCounter(value, active);
  return (
    <div className="p-4 rounded-xl text-center space-y-1"
      style={{ border: "2px solid var(--color-light-text)", boxShadow: "3px 3px 0 var(--color-light-text)", background: "var(--color-card-bg)" }}>
      <p className="text-2xl font-black text-light-text">{count}{suffix}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
    </div>
  );
};

export const AboutTab = ({ member, active }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(member.stats ?? []).map((s, i) => (
        <StatCard key={i} label={s.label} value={s.value} suffix={s.suffix} active={active} />
      ))}
    </div>
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-text-secondary">{member.bio1}</p>
      <p className="text-sm leading-relaxed text-text-secondary">{member.bio2}</p>
    </div>
    {member.philosophy && (
      <blockquote className="pl-5 py-3 text-sm italic text-text-muted leading-relaxed rounded-r-xl"
        style={{ borderLeft: "4px solid var(--color-accent)", background: "var(--color-hover)" }}>
        {member.philosophy}
      </blockquote>
    )}
    <ContributionHeatmap member={member} />
  </div>
);
