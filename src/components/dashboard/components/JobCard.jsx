import { useState, memo } from "react";
import { Bookmark, ThumbsDown, Star, Clock, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../../utils/currencyUtils";

const HighlightedText = ({ text, query }) => {
  if (!query?.trim()) return <span>{text}</span>;
  const parts = (text || "").split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="bg-accent/30 text-white rounded-[2px] px-0.5 font-bold">{part}</span> 
          : part
      )}
    </span>
  );
};

function JobCard({ job, isSaved = false, onToggleSave, searchQuery = "" }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const alreadyApplied = job.already_applied;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60)); // hours
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatBudget = () => {
    if (job.budget_type === "hourly") return `${formatINR(job.budget_amount)}/hr`;
    return formatINR(Number(job.budget_amount || 0));
  };

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;

    // Optimistic update
    const next = !saved;
    setSaved(next);
    setSaving(true);

    try {
      if (onToggleSave) await onToggleSave(job.id, next);
    } catch (err) {
      // Revert on failure
      setSaved(!next);
      console.error("Failed to toggle save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/freelancer/jobs/${job.id}`)}
      className="group p-4 sm:p-5 border border-white/10 rounded-2xl hover:border-accent transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/20">
          Posted {formatDate(job.created_at)}
        </p>
        <div className="flex gap-3 sm:gap-4 items-center">
          {alreadyApplied && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              Applied
            </span>
          )}
          <button className="text-light-text/10 hover:text-red-400 transition-colors transform hover:scale-110 active:scale-95">
            <ThumbsDown size={15} />
          </button>
          <button
            onClick={handleToggleSave}
            disabled={saving}
            title={saved ? "Unsave job" : "Save job"}
            className={`transition-all transform hover:scale-110 active:scale-95 ${saved ? "text-accent" : "text-light-text/20 hover:text-accent"} ${saving ? "opacity-50 cursor-wait" : ""}`}
          >
            <Bookmark size={15} className={`transition-all ${saved ? "fill-accent" : ""}`} />
          </button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-2 sm:mb-3">
        <HighlightedText text={job.title} query={searchQuery} />
      </h3>

      <div className="flex flex-wrap gap-3 sm:gap-5 text-[11px] sm:text-[12px] mb-3 sm:mb-5 items-center">
        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
           <IndianRupee size={12} className="text-accent/60" /> {formatBudget()}
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
           <Clock size={12} className="text-accent/60" /> {job.experience_level || "Intermediate"}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20">
          Est. Time: {job.duration}
        </span>
      </div>

      <p className="text-xs sm:text-[13.5px] text-light-text/50 mb-4 sm:mb-6 line-clamp-2 leading-relaxed font-normal">
        <HighlightedText text={job.description} query={searchQuery} />
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {(job.skills || []).map((skill, i) => (
          <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-light-text/30 group-hover:text-light-text/50 transition-colors">
            {skill}
          </span>
        ))}
      </div>

      {/* Client Info */}
      <div className="flex items-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-light-text/20">
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-yellow-500/80 fill-yellow-500/20" />
          <span className="text-light-text/30 whitespace-nowrap">
            {job.client?.rating ? `${job.client.rating} (${job.client.reviews_count || 0})` : "NEW CLIENT"}
          </span>
        </div>
        <span className="truncate max-w-[80px] sm:max-w-[150px]">{job.client?.location || job.client?.country || "INTL"}</span>
        <span className="ml-auto flex items-center gap-1 text-accent/40 font-extrabold">
          PROPOSALS: <span className="text-light-text/40">{job.proposal_count ?? job.proposals?.length ?? 0}</span>
        </span>
      </div>
    </div>
  );
}

export default memo(JobCard);