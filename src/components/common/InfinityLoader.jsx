import React from "react";

const InfinityLoader = ({ fullScreen = true, size = "lg", text = "Connecting you..." }) => {
    const sizes = {
        sm: { width: 60, height: 30, strokeWidth: 3, textClass: "text-xs mt-2" },
        md: { width: 90, height: 45, strokeWidth: 3.5, textClass: "text-sm mt-3" },
        lg: { width: 120, height: 60, strokeWidth: 4, textClass: "text-base mt-4" },
    };

    const s = sizes[size] || sizes.lg;

    return (
        <div
            className={`${fullScreen
                ? "fixed inset-0 bg-primary/95 backdrop-blur-sm z-50"
                : "w-full py-12"
                } flex items-center justify-center`}
        >
            <div className="flex flex-col items-center">
                <svg
                    width={s.width}
                    height={s.height}
                    viewBox="0 0 120 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Glow shadow path */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="rgba(56, 189, 248, 0.15)"
                        strokeWidth={s.strokeWidth + 4}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Background track */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="rgba(56, 189, 248, 0.12)"
                        strokeWidth={s.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Animated stroke */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="#38BDF8"
                        strokeWidth={s.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        className="infinity-draw"
                        style={{ filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))" }}
                    />
                </svg>

                {text && (
                    <p
                        className={`text-light-text/50 animate-pulse ${s.textClass}`}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default InfinityLoader;
