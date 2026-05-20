const fs = require('fs');
const path = '/Users/kabirmore/FinalProject-Freelancing/Project-Freelancing 3/frontend/src/components/dashboard/freelancer/JobMatchCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add lucide imports
content = content.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useNavigate } from 'react-router-dom';\nimport { Star, Clock, IndianRupee } from 'lucide-react';"
);

// Replace the return statement
const newReturn = `    if (dismissed && undoVisible) {
        return (
            <div className="jmc-undo-toast">
                <span>{DISMISS_LABELS[dismissAction] || 'Job removed'}</span>
                <button onClick={handleUndo} className="jmc-undo-btn">Undo</button>
            </div>
        );
    }

    return (
        <>
            <div 
              onClick={handleView}
              className="group relative p-4 sm:p-5 border border-white/10 rounded-2xl hover:border-accent transition-all cursor-pointer bg-transparent"
            >
                {/* Top row: match badge + Posted time + Dismiss menu */}
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                            style={{ background: matchConfig.bg, border: \`1px solid \${matchConfig.border}\`, color: matchConfig.color }}
                        >
                            <span className="text-[11px]">{matchConfig.icon}</span>
                            <span>{matchScore}% Match</span>
                        </div>
                        <button
                            className="text-[10px] font-bold uppercase tracking-widest text-light-text/30 hover:text-accent transition-colors border border-white/10 hover:border-accent/30 rounded-full px-2 py-0.5"
                            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                            title="Why was this recommended?"
                        >
                            Why this?
                        </button>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mr-2">
                            Posted {formatTimeAgo(job.created_at)}
                        </p>
                        
                        {/* Dismiss kebab menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                className="text-light-text/20 hover:text-white transition-colors text-lg font-bold pb-1"
                                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-6 w-48 bg-[#1a1d27] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col">
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2" onClick={(e) => { e.stopPropagation(); handleDismiss('hide_job'); }}>👁 Hide this job</button>
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 border-t border-white/5" onClick={(e) => { e.stopPropagation(); handleDismiss('not_relevant'); }}>🚫 Not relevant</button>
                                    <button className="text-left px-4 py-2.5 text-xs text-light-text/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 border-t border-white/5" onClick={(e) => { e.stopPropagation(); handleDismiss('dont_show_similar'); }}>✕ Don't show similar</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-accent transition-colors tracking-tight leading-snug mb-2 sm:mb-3">
                    {job.title}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-5 text-[11px] sm:text-[12px] mb-3 sm:mb-5">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-5">
                        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
                            <IndianRupee size={12} className="text-accent/60" /> {formatBudget(job)}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-light-text/60">
                            <Clock size={12} className="text-accent/60" /> {job.experience_level || "Intermediate"}
                        </span>
                    </div>
                    {job.duration && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/20 mt-0.5 sm:mt-0">
                            Est. Time: {job.duration}
                        </span>
                    )}
                </div>

                {matchReason && (
                    <p className="text-xs font-medium italic text-accent/70 mb-3">"{matchReason}"</p>
                )}

                <p className="text-xs sm:text-[13.5px] text-light-text/50 mb-4 sm:mb-6 line-clamp-2 leading-relaxed font-normal">
                    {job.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {(job.skills || []).map((skill, i) => {
                        const isMatched = skillsMatched.includes(skill);
                        return (
                            <span key={i} className={\`text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors \${
                                isMatched 
                                ? "bg-accent/10 border border-accent/20 text-accent" 
                                : "bg-white/5 border border-white/5 text-light-text/30 group-hover:text-light-text/50"
                            }\`}>
                                {isMatched && "✓ "} {skill}
                            </span>
                        );
                    })}
                </div>

                {/* Client Info */}
                <div className="flex justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-white/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-light-text/20">
                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0">
                        <Star size={11} className="text-yellow-500/80 fill-yellow-500/20" />
                        <span className="text-light-text/30 whitespace-nowrap">
                            {job.client?.rating ? \`\${job.client.rating} (\${job.client.reviews_count || 0})\` : "NEW CLIENT"}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 text-right">
                        <span className="opacity-80 break-words text-right max-w-[150px] sm:max-w-none">{job.client?.location || job.client?.country || "INTL"}</span>
                        <span className="flex items-center gap-1 text-accent/40 font-extrabold whitespace-nowrap">
                            PROPOSALS: <span className="text-light-text/40">{job.proposal_count ?? job.proposals?.length ?? 0}</span>
                        </span>
                    </div>
                </div>
            </div>

            <WhyMatchModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                job={job}
                recommendation={rec}
            />
        </>
    );
};`;

const startIndex = content.indexOf('    if (dismissed && undoVisible) {');
const endIndex = content.lastIndexOf('};');
content = content.substring(0, startIndex) + newReturn + '\n' + content.substring(endIndex);

fs.writeFileSync(path, content);
