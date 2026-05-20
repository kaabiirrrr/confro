import React from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa";
import { MapPin, ArrowRight } from "lucide-react";

/* ── Role badge colour map ─────────────────────────────────────── */
const ROLE_STYLES = {
  "co-founder": "bg-violet-500/10 text-violet-500 border-violet-500/30",
  cto:          "bg-blue-500/10   text-blue-500   border-blue-500/30",
  cpo:          "bg-pink-500/10   text-pink-500   border-pink-500/30",
  cmo:          "bg-orange-500/10 text-orange-500 border-orange-500/30",
  "growth-lead": "bg-orange-500/10 text-orange-500 border-orange-500/30",
  coo:          "bg-teal-500/10   text-teal-500   border-teal-500/30",
};

/* ── Availability config ───────────────────────────────────────── */
const AVAIL = {
  open:   { label: "Available",    dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  busy:   { label: "In a Project", dot: "bg-amber-500",   pill: "bg-amber-500/10   text-amber-500   border-amber-500/30" },
  closed: { label: "Unavailable",  dot: "bg-slate-400",   pill: "bg-slate-500/10   text-slate-400   border-slate-500/20" },
};

const TeamMemberCard = ({ member, onViewProfile }) => {
  const avail    = AVAIL[member.availability]    ?? AVAIL.closed;
  const roleCls  = ROLE_STYLES[member.badgeType] ?? ROLE_STYLES["co-founder"];
  const topSkills = member.skillsTags ? member.skillsTags.slice(0, 3) : (member.skills ?? []).slice(0, 3);
  const extra     = member.skillsTags ? member.skillsTags.length - 3 : (member.skills ?? []).length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      whileHover={{ x: -3, y: -3 }}
      onClick={() => onViewProfile(member)}
      className="relative bg-card-bg rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        border:     "2px solid var(--color-light-text)",
        boxShadow:  "6px 6px 0px var(--color-light-text)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow   = "9px 9px 0px var(--color-accent)";
        e.currentTarget.style.borderColor = "var(--color-accent)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow   = "6px 6px 0px var(--color-light-text)";
        e.currentTarget.style.borderColor = "var(--color-light-text)";
      }}
    >
      {/* ── Top-right badge strip ─────────────────────────────── */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${avail.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${avail.dot} ${member.availability === "open" ? "animate-pulse" : ""}`} />
          {avail.label}
        </span>
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${roleCls}`}>
          {(member.badgeType ?? "").replace("-", " ")}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* ── Photo ──────────────────────────────────────────── */}
        <div className="relative w-full sm:w-52 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={member.img}
            alt={member.name}
            className={`w-full h-full object-cover ${member.position} group-hover:scale-105 transition-transform duration-500`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex flex-col justify-between p-5 sm:p-7 flex-1 min-w-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-light-text leading-tight mb-0.5">
              {member.name}
            </h3>
            <p className="text-accent text-sm font-semibold mb-2">{member.shortRole}</p>

            {/* Location + experience */}
            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
              <MapPin size={11} />
              <span>{member.location}</span>
              <span className="opacity-30 mx-0.5">·</span>
              <span>{member.experience} Exp.</span>
            </div>

            {/* Skill pills */}
            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topSkills.map((sk, i) => {
                  const tagName = typeof sk === "string" ? sk : sk.name;
                  return (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-text-secondary"
                      style={{ background: "var(--color-hover)", border: "1px solid var(--color-border)" }}>
                      {tagName}
                    </span>
                  );
                })}
                {extra > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-text-muted"
                    style={{ background: "var(--color-hover)", border: "1px solid var(--color-border)" }}>
                    +{extra}
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">{member.bio1}</p>
          </div>

          {/* ── Footer row ─────────────────────────────────── */}
          <div className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-text-muted hover:text-accent transition-colors">
                  <FaGithub size={15} />
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-text-muted hover:text-accent transition-colors">
                  <FaLinkedinIn size={15} />
                </a>
              )}
              {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-text-muted hover:text-accent transition-colors">
                  <FaInstagram size={15} />
                </a>
              )}
            </div>

            {/* CTA */}
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-200"
              style={{ border: "2px solid var(--color-accent)", color: "var(--color-accent)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-accent)"; }}
            >
              View Profile <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
