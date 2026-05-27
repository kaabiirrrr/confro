/**
 * InfinityLoader — animated ∞ path loader using SVG stroke-dashoffset.
 * Usage:
 *   <InfinityLoader />                   // default centered full-height wrapper
 *   <InfinityLoader size={60} />          // custom size
 *   <InfinityLoader inline />             // no wrapper, just the SVG (for buttons etc.)
 */
const InfinityLoader = ({ size = 72, inline = false, className = '' }) => {
    const strokeWidth = size * 0.08;
    const w = size;
    const h = size * 0.55;
    // Standard infinity path centered in viewBox
    const path = `M ${w * 0.5} ${h * 0.5}
        C ${w * 0.5} ${h * 0.18}, ${w * 0.72} ${h * 0.05}, ${w * 0.82} ${h * 0.5}
        C ${w * 0.72} ${h * 0.95}, ${w * 0.5} ${h * 0.82}, ${w * 0.5} ${h * 0.5}
        C ${w * 0.5} ${h * 0.18}, ${w * 0.28} ${h * 0.05}, ${w * 0.18} ${h * 0.5}
        C ${w * 0.28} ${h * 0.95}, ${w * 0.5} ${h * 0.82}, ${w * 0.5} ${h * 0.5}`;

    const svg = (
        <svg
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Loading"
            role="status"
            className={className}
        >
            {/* Track (faint) */}
            <path
                d={path}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
            />
            {/* Animated glowing stroke */}
            <path
                d={path}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60 200"
                strokeDashoffset="0"
                className="infinity-stroke"
            />
            <style>{`
                .infinity-stroke {
                    animation: infinity-dash 1.6s ease-in-out infinite;
                }
                @keyframes infinity-dash {
                    0%   { stroke-dashoffset: 260; opacity: 1; }
                    50%  { stroke-dashoffset: 60;  opacity: 0.85; }
                    100% { stroke-dashoffset: -200; opacity: 1; }
                }
            `}</style>
        </svg>
    );

    if (inline) return svg;

    return (
        <div className="flex flex-col items-center justify-center h-96 gap-3 text-accent">
            {svg}
            <span className="text-xs text-slate-400 dark:text-white/30 tracking-widest uppercase animate-pulse">
                Loading…
            </span>
        </div>
    );
};

export default InfinityLoader;
