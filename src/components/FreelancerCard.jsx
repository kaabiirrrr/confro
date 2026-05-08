import { motion } from "framer-motion";
import {
  Star,
  BadgeCheck,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Bookmark,
  FileSignature,
  IndianRupee,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import Avatar from "./Avatar";
import { formatINR } from "../utils/currencyUtils";

const CATEGORY_LABELS = {
  development: "Development & IT",
  ai: "AI Services",
  marketing: "Marketing",
  design: "Design",
  writing: "Writing & Translation",
  admin: "Administration",
};

const CATEGORY_COLORS = {
  development: "bg-blue-500/10 text-blue-400",
  ai: "bg-purple-500/10 text-purple-400",
  marketing: "bg-orange-500/10 text-orange-400",
  design: "bg-pink-500/10 text-pink-400",
  writing: "bg-green-500/10 text-green-400",
  admin: "bg-yellow-500/10 text-yellow-400",
};

const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= stars ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
        />
      ))}
      <span className="text-light-text/50 text-xs ml-1">
        {rating ? Number(rating).toFixed(1) : "New"}
      </span>
    </div>
  );
};

const FreelancerCard = ({
  freelancer,
  showSave = false,
  isSaved = false,
  saveLoading = false,
  onToggleSave,
  showDirectContract = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  const {
    id,
    name,
    avatar_url,
    title,
    bio,
    skills = [],
    hourly_rate,
    category,
    is_verified,
    rating,
    has_availability_badge,
    profile_completed,
    reliability_score,
  } = freelancer;

  const categoryLabel = CATEGORY_LABELS[category] || category || "Freelancer";
  const categoryColor = CATEGORY_COLORS[category] || "bg-white/5 text-white/50 border-white/10";

  const handleMessage = (e) => {
    e?.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (role === 'FREELANCER') {
      toast.error("As a freelancer, you can only message clients within active contracts or job posts.");
      return;
    }
    navigate(`/client/messages?userId=${id}`);
  };

  const handleHire = (e) => {
    e?.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (role !== 'CLIENT') {
      toast.error("Only clients can hire freelancers directly.");
      return;
    }
    navigate(`/client/direct-contracts/new?freelancer_id=${id}`);
  };

  // Hide action buttons for freelancers viewing other freelancers (unless unauthenticated guest)
  const showActions = !user || role === 'CLIENT';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full bg-transparent border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-accent/40 transition-all shadow-sm group flex flex-col gap-3 sm:gap-4 relative"
    >
      {/* Save Button */}
      {showSave && (
        <button
          type="button"
          disabled={saveLoading}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(freelancer);
          }}
          className={`absolute top-6 right-6 transition-all duration-300 transform hover:scale-110 active:scale-95 ${isSaved
            ? "text-accent"
            : "text-white/20 hover:text-accent"
            } ${saveLoading ? "opacity-50 cursor-wait" : ""}`}
          title={isSaved ? "Remove from saved" : "Save talent"}
        >
          <Bookmark size={18} className={`transition-all duration-300 ${isSaved ? "fill-accent" : ""}`} />
        </button>
      )}

      {/* TOP ROW: Avatar + Name + Verified */}
      <div className={`flex items-start gap-3 ${showSave ? "pr-10" : ""}`}>
        <Link
          to={`/freelancer/${id}`}
          className="relative flex-shrink-0 cursor-pointer block group-hover:scale-105 transition-transform"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            src={avatar_url}
            name={name}
            size="w-10 h-10 sm:w-12 sm:h-12"
            className="ring-2 ring-border group-hover:ring-accent/40 group-active:ring-accent group-active:ring-offset-2 ring-offset-primary transition-all duration-300 group-active:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
          {is_verified && (
            <span className="absolute -bottom-0.5 -right-0.5 bg-accent rounded-full p-0.5">
              <BadgeCheck size={10} className="text-white" />
            </span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/freelancer/${id}`}
            className="flex items-center gap-1.5 flex-wrap group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-white group-hover/link:text-accent transition-colors truncate tracking-tight text-sm sm:text-base">{name || "Unnamed"}</h3>
              {is_verified && (
                <span title="Identity Verified" className="text-blue-400 shrink-0">
                  <ShieldCheck size={15} />
                </span>
              )}
              {has_availability_badge && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 shadow-sm shadow-emerald-500/5 animate-pulse ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Available</span>
                </div>
              )}
            </div>
          </Link>
          <p className="text-light-text/60 text-xs truncate mt-1">
            {title || "Freelancer"}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={rating} />
            <div className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10" title="Reliability Score">
              <ShieldCheck size={10} />
              {reliability_score ?? 100}%
            </div>
          </div>
        </div>

        {hourly_rate != null ? (
          <div className="text-right flex-shrink-0 ml-1">
            <p className="text-white font-black text-base sm:text-lg leading-none">{formatINR(Number(hourly_rate))}</p>
            <p className="text-light-text/30 text-[10px] uppercase font-bold tracking-widest mt-1">/hr</p>
          </div>
        ) : (
          <div className="text-right flex-shrink-0 ml-1">
            <p className="text-light-text/20 text-[10px] uppercase font-bold tracking-widest">{profile_completed ? "Contact\nfor rate" : "Rate\nnot set"}</p>
          </div>
        )}
      </div>

      {/* CATEGORY BADGE */}
      {category && (
        <span className={`self-start text-[10px] font-medium px-2.5 py-1 rounded-full ${categoryColor}`}>
          {categoryLabel}
        </span>
      )}

      {/* BIO */}
      {bio && (
        <p className="text-light-text/50 text-xs leading-relaxed line-clamp-2">{bio}</p>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-light-text/60">
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[10px] text-light-text/30">+{skills.length - 5} more</span>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {showActions && (
        <div className="flex flex-col gap-3 pt-2 mt-auto">
          <div className="flex gap-3">
            <button
              onClick={handleMessage}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 text-white/70 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-sm"
            >
              <MessageSquare size={14} />
              Message
            </button>
            <button
              onClick={handleHire}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-accent text-white border border-accent rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-all"
            >
              <Briefcase size={14} />
              Hire
            </button>
          </div>

          {showDirectContract && id && (
            <Link
              to={`/client/direct-contracts/new?freelancer_id=${id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-white/5 text-white/50 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:border-accent/40 hover:text-accent transition-all"
            >
              <FileSignature size={14} />
              Direct Contract
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FreelancerCard;
