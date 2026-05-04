import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, Lightbulb, ChevronLeft, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import InfinityLoader from "../../common/InfinityLoader";

const getPracticeStyle = (title) => {
    const t = title.toLowerCase();
    if (t.includes('profile')) return {
        image: "/Icons/icons8-user-100.png",
        color: "from-blue-500/20 to-transparent",
        border: "group-hover:border-blue-500/50"
    };
    if (t.includes('portfolio') || t.includes('sample')) return {
        image: "/Icons/icons8-skills-100.png",
        color: "from-emerald-500/20 to-transparent",
        border: "group-hover:border-emerald-500/50"
    };
    if (t.includes('proposal')) return {
        image: "/Icons/icons8-new-job-100.png",
        color: "from-purple-500/20 to-transparent",
        border: "group-hover:border-purple-500/50"
    };
    if (t.includes('respond') || t.includes('quick') || t.includes('communication')) return {
        image: "/Icons/icons8-communication-100.png",
        color: "from-amber-500/20 to-transparent",
        border: "group-hover:border-amber-500/50"
    };
    if (t.includes('completion') || t.includes('success')) return {
        image: "/Icons/icons8-growth-100.png",
        color: "from-red-500/20 to-transparent",
        border: "group-hover:border-red-500/50"
    };
    if (t.includes('identity') || t.includes('verify')) return {
        image: "/Icons/icons8-verification-100.png",
        color: "from-indigo-500/20 to-transparent",
        border: "group-hover:border-indigo-500/50"
    };
    return {
        image: null,
        icon: <TrendingUp size={32} className="text-accent" />,
        color: "from-accent/10 to-transparent",
        border: "group-hover:border-accent/40"
    };
};

const defaultBestPractices = [
    { id: '1', title: 'Complete Your Profile 100%', description: 'A complete profile with a professional photo and detailed bio attracts 3x more clients. Verify your credentials to stand out.' },
    { id: '2', title: 'Build a Strong Portfolio', description: 'Showcase your best work. High-quality portfolio samples are the #1 deciding factor for premium clients when awarding contracts.' },
    { id: '3', title: 'Write Tailored Proposals', description: 'Avoid generic templates. Address the client\'s specific needs and mention their company name to stand out from the crowd.' },
    { id: '4', title: 'Respond Quickly', description: 'Freelancers who respond within 1 hour secure 50% more contracts than those who wait a day. Quick communication builds trust.' },
    { id: '5', title: 'Deliver on Time', description: 'Meeting deadlines consistently builds your reputation on Connect and leads to repeat business and verified 5-star reviews.' },
    { id: '6', title: 'Verify Your Identity', description: 'Verified identity badges build instant trust, protect you from fraudulent activities, and unlock higher-tier job postings.' }
];

const FreelancerBestPractices = () => {
    const [bestPractices, setBestPractices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading from a network request for the aesthetic effect
        const timer = setTimeout(() => {
            setBestPractices(defaultBestPractices);
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pt-32 pb-32">
                <InfinityLoader/>
            </div>
        );
    }

    return (
        <div className="w-full lg:max-w-[1400px] mx-auto mt-0 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Back Button and Header Section */}
            <div className="space-y-4">
                <Link
                    to="/freelancer/account-health"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </Link>

                <div className="relative pt-2 pb-4 border-b border-white/10 mb-6">
                    <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                            <Lightbulb size={16} />
                            <span>Success Guide</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                            Freelancer Best Practices
                        </h1>
                        <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xl">
                            Accelerate your freelancer growth by following proven strategies that leading top-tier talent use to secure high-value contracts and maintain a perfect reputation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid of Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {bestPractices.map((bp) => {
                    const style = getPracticeStyle(bp.title);
                    return (
                        <div
                            key={bp.id}
                            className={`group relative bg-transparent border border-white/10 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 ${style.border}`}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${style.color}`} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 flex items-center justify-center mb-6">
                                    {style.image ? (
                                        <img src={style.image} alt={bp.title} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <div className="w-14 h-14 flex items-center justify-center">
                                            {style.icon}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">
                                    {bp.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed text-sm flex-grow">
                                    {bp.description}
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-accent transition-all duration-300">
                                    <CheckCircle size={16} className="opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-300" />
                                    <span>Recommended</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {bestPractices.length === 0 && (
                    <div className="col-span-full text-center py-20 text-white/30 font-medium italic">
                        No best practices found at this time.
                    </div>
                )}
            </div>

            {/* CTA Footer */}
            <div className="bg-transparent border border-white/10 rounded-2xl px-5 sm:px-10 py-7 sm:py-10 flex flex-col md:flex-row gap-5 sm:gap-8 items-start md:items-center justify-between mt-8 sm:mt-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(77,199,255,0.1)]">
                        <ShieldCheck size={32} className="text-accent" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Stay Protected</h3>
                        <p className="text-white/50 text-sm font-medium">
                            Review your Account Health standing at any time.
                        </p>
                    </div>
                </div>

                <Link
                    to="/freelancer/account-health"
                    className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                    Return to Account Health
                </Link>
            </div>

        </div>
    );
};

export default FreelancerBestPractices;
