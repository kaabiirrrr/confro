import React from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, MapPin, Globe, Star, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Profile = () => {
    const { user, profile } = useAuth();

    return (
        <div className="w-full mx-auto space-y-8 pb-24">
            {/* Profile Header */}
            <div className="relative h-40 sm:h-64 rounded-[24px] sm:rounded-[40px] overflow-hidden bg-gradient-to-br from-indigo-600 via-accent to-accent/40 shadow-2xl shadow-accent/20">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <button className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl transition shadow-xl">
                    <Edit3 size={16} className="text-white" />
                </button>
            </div>

            <div className="relative px-4 sm:px-12 -mt-20 sm:-mt-32 flex flex-col sm:flex-row gap-6 sm:gap-10">
                {/* Left Column */}
                <div className="w-full sm:w-80 shrink-0 space-y-4 sm:space-y-6">
                    <div className="relative group flex justify-center sm:justify-start">
                        <div className="w-36 h-36 sm:w-64 sm:h-64 rounded-full border-4 sm:border-8 border-slate-900/5 dark:border-primary bg-slate-900/5 dark:bg-secondary overflow-hidden shadow-2xl">
                            {user?.user_metadata?.avatar_url || profile?.avatar_url ? (
                                <img src={user?.user_metadata?.avatar_url || profile?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                    <User size={50} strokeWidth={1} className="text-white/10" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-[calc(50%-72px)] sm:right-16 sm:bottom-6 p-2.5 sm:p-3 bg-accent text-primary rounded-xl sm:rounded-2xl shadow-2xl hover:scale-110 transition border-2 sm:border-4 border-primary">
                            <Edit3 size={14} />
                        </button>
                    </div>

                    <div className="bg-slate-900/5 dark:bg-secondary/40 border border-slate-900/5 dark:border-white/5 p-5 sm:p-8 rounded-[24px] sm:rounded-[35px] space-y-4 sm:space-y-6 backdrop-blur-sm">
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900/30 dark:text-white/30">Verification</h3>
                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-400/5 p-3 rounded-xl sm:rounded-2xl border border-emerald-400/10">
                                <ShieldCheck size={16} />
                                <span className="text-xs sm:text-sm font-bold tracking-tight">Identity Verified</span>
                            </div>
                        </div>
                        <div className="space-y-3 pt-3 border-t border-slate-900/5 dark:border-white/5">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900/30 dark:text-white/30">Quick Info</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-3 text-slate-900/60 dark:text-white/60">
                                    <MapPin size={14} />
                                    <span className="text-xs sm:text-sm font-medium">{profile?.location || 'Remote'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-900/60 dark:text-white/60">
                                    <Calendar size={14} />
                                    <span className="text-xs sm:text-sm font-medium">Joined Mar 2024</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-900/60 dark:text-white/60">
                                    <Globe size={14} />
                                    <span className="text-xs sm:text-sm font-medium">English • Hindi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 pt-4 sm:pt-32 space-y-6 sm:space-y-10">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <h1 className="text-2xl sm:text-5xl font-bold tracking-tight text-slate-950 dark:text-white mb-1">
                                {profile?.full_name || user?.user_metadata?.full_name || 'Freelancer'}
                            </h1>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent shadow-sm">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs sm:text-sm font-bold">5.0</span>
                            </div>
                        </div>
                        <p className="text-base sm:text-xl text-accent font-semibold tracking-tight">
                            {profile?.title || 'UI/UX Designer & Frontend Developer'}
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900/20 dark:text-white/20">About Me</h3>
                        <p className="text-sm sm:text-lg text-slate-900/60 dark:text-white/60 leading-relaxed font-medium">
                            {profile?.bio || "I'm a dedicated professional looking to help brands and businesses grow through innovative design and robust engineering solutions."}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6">
                        {[
                            { label: 'Job Success', value: '100%', sub: 'Based on 12 jobs' },
                            { label: 'Total Earned', value: '₹2k+', sub: 'Last 12 months' },
                            { label: 'Completion Rate', value: '98%', sub: 'On-time delivery' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/5 dark:bg-secondary/40 border border-slate-900/5 dark:border-white/5 p-4 sm:p-8 rounded-[20px] sm:rounded-[35px] space-y-1">
                                <p className="text-lg sm:text-2xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
                                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-accent">{stat.label}</p>
                                <p className="text-[9px] sm:text-[10px] text-slate-900/20 dark:text-white/20 font-bold mt-1 sm:mt-2 uppercase">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <button className="px-6 sm:px-10 py-3 sm:py-5 bg-accent text-primary text-xs font-bold uppercase tracking-[0.2em] rounded-2xl sm:rounded-3xl hover:bg-accent/90 transition shadow-2xl shadow-accent/10">
                            Apply to Jobs
                        </button>
                        <button onClick={() => window.open(`/freelancer/${user?.id}`, '_blank')}
                            className="px-6 sm:px-10 py-3 sm:py-5 bg-slate-900/5 dark:bg-white/5 text-slate-900/80 dark:text-white/80 border border-slate-900/10 dark:border-white/10 text-xs font-bold uppercase tracking-[0.2em] rounded-2xl sm:rounded-3xl hover:bg-slate-900/10 dark:hover:bg-white/10 transition">
                            View Public Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
