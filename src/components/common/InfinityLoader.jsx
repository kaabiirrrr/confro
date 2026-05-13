import React from "react";

const InfinityLoader = ({ fullScreen = true, text = "Connecting you..." }) => {
    return (
        <div
            className={`${fullScreen
                ? "fixed inset-0 bg-primary/95 backdrop-blur-sm z-50"
                : "w-full py-12"
                } flex items-center justify-center`}
        >
            <div className="flex flex-col items-center">
                <svg
                    viewBox="0 0 120 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[40px] h-[20px] md:w-[64px] md:h-[32px] transition-all duration-300"
                >
                    {/* Glow shadow path */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="rgba(56, 189, 248, 0.15)"
                        strokeWidth={6}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Background track */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="rgba(56, 189, 248, 0.12)"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Animated stroke */}
                    <path
                        d="M10 30 C10 10, 50 10, 60 30 C70 50, 110 50, 110 30 C110 10, 70 10, 60 30 C50 50, 10 50, 10 30"
                        stroke="#38BDF8"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        className="infinity-draw"
                        style={{ filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))" }}
                    />
                </svg>

                {text && (
                    <p
                        className="text-gray-500 dark:text-white/50 animate-pulse text-[10px] mt-2 font-medium tracking-wide uppercase"
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default InfinityLoader;
