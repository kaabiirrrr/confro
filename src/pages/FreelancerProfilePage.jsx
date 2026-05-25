import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    User, MapPin, Star, ShieldCheck, Mail, Phone,
    Globe, Calendar, Award, CheckCircle2,
    ExternalLink, MessageSquare, Heart, Share2,
    ChevronRight, ArrowLeft, AlertCircle,
    X, Check, Clock, FileText, Camera, IndianRupee, Pencil,
    TrendingUp, Zap, Cpu
} from 'lucide-react';

import { formatINR, convertToUSD, USD_TO_INR } from '../utils/currencyUtils';
import { profileApi } from '../services/profileApi';
import ProfileImageModal from '../components/dashboard/client/settings/ProfileImageModal';
import { getIdentityStatus, getUserPresence } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ClientTopbar from '../layouts/components/ClientTopbar';
import FreelancerTopbar from '../layouts/components/FreelancerTopbar';
import Footer from '../components/Footer';
import InfinityLoader from '../components/common/InfinityLoader';
import logger from '../utils/logger';
import CustomDropdown from '../components/ui/CustomDropdown';
import RelationshipIntelligence from '../components/profile/RelationshipIntelligence';

const FreelancerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, refreshProfile, role } = useAuth();
    const { refetch: refetchProfileContext, status } = useProfile();

    const [isOnline, setIsOnline] = useState(false);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('about');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyType, setVerifyType] = useState(null); // 'email' or 'document'
    const [uploading, setUploading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Edit Mode State
    const [editSection, setEditSection] = useState(null); // 'header', 'about', 'skills', 'contact', 'basic'
    const [editData, setEditData] = useState({});

    // Work History editor state
    const [showWorkForm, setShowWorkForm] = useState(false);
    const [workForm, setWorkForm] = useState({ company: '', role: '', start_date: '', end_date: '', description: '' });
    const [savingWork, setSavingWork] = useState(false);

    // IDV State (Only for own profile)
    const [idvStatus, setIdvStatus] = useState(null);
    const [reliability, setReliability] = useState(null);
    const [risk, setRisk] = useState(null);


    const handlePhotoSelected = (avatarUrl) => {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
        refetchProfileContext();
    };

    useEffect(() => {
        if (currentUser && currentUser.id === id) {
            getIdentityStatus().then(res => setIdvStatus(res?.data ?? res)).catch(() => { });
        }
    }, [id, currentUser]);

    useEffect(() => {
        if (id) {
            fetchProfile(true);
            fetchReliability();
            fetchRisk();
            getUserPresence(id)
                .then(res => {
                    if (res?.success) {
                        setIsOnline(res.data?.online ?? false);
                    }
                })
                .catch(err => {
                    logger.error('Error fetching presence', err);
                });
        }
    }, [id]);

    const fetchRisk = async () => {
        try {
            const res = await profileApi.getRiskData(id);
            if (res.success) setRisk(res.data);
        } catch (err) {
            logger.error('Error fetching risk analysis', err);
        }
    };

    const fetchReliability = async () => {
        try {
            const res = await profileApi.getReliabilityData(id);
            if (res.success) setReliability(res.data);
        } catch (err) {
            logger.error('Error fetching reliability', err);
        }
    };


    const fetchProfile = async (showFullLoader = false) => {
        try {
            if (showFullLoader) {
                setLoading(true);
            }
            const response = await profileApi.getPublicProfile(id);
            if (response.success) {
                const data = response.data;
                // Backend now normalizes all step_data paths — use directly.
                // Only fallback locally for skills if backend missed it.
                const normalizedSkills = Array.isArray(data.skills) && data.skills.length > 0
                    ? data.skills
                    : [];

                setProfile({
                    ...data,
                    is_email_verified: data.is_email_verified ?? data.email_verified ?? false,
                    skills: normalizedSkills,
                    // Backend already resolves these — use directly:
                    experience: Array.isArray(data.experience) ? data.experience : [],
                    experience_years: data.experience_years || '',
                    hourly_rate: Number(data.hourly_rate) || 0,
                    work_hours: data.work_hours || null,
                    // Resume and portfolio from documents step
                    resume_url: data.resume_url || null,
                    portfolio_files: Array.isArray(data.portfolio_files) ? data.portfolio_files : [],
                });
            } else {
                logger.error('API returned success:false', response);
                setProfile(null);
            }
        } catch (error) {
            logger.error('Error fetching profile', error);
            setProfile(null);
        } finally {
            if (showFullLoader) {
                setLoading(false);
            }
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setUploading(true);
            const payload = { ...editData };

            // Build step_data for experience fields
            let experienceYears = null;
            if (payload.experience !== undefined || payload.experience_years !== undefined) {
                const exp = payload.experience || payload.experience_years;
                experienceYears = exp;
                payload.step_data = {
                    ...(profile?.step_data || {}),
                    professional_info: {
                        ...(profile?.step_data?.professional_info || {}),
                        experience: exp
                    }
                };
            }
            delete payload.experience;
            delete payload.experience_years;
            delete payload.years_of_experience;

            // Convert INR hourly rate to USD for backend
            let hourlyRateUSD = null;
            if (payload.hourly_rate) {
                hourlyRateUSD = convertToUSD(payload.hourly_rate);
                payload.hourly_rate = hourlyRateUSD;
            }

            const res = await profileApi.updateProfile(payload);
            if (res.success) {
                toast.success('Profile updated successfully');
                setEditSection(null);

                // Patch local state without a full re-fetch (prevents page-level re-render)
                setProfile(prev => {
                    if (!prev) return prev;
                    const patch = { ...editData };
                    if (hourlyRateUSD !== null) patch.hourly_rate = hourlyRateUSD;
                    if (experienceYears !== null) patch.experience_years = experienceYears;
                    // Remove raw edit keys not on profile
                    delete patch.experience;
                    delete patch.years_of_experience;
                    return { ...prev, ...patch };
                });

                refetchProfileContext(); // Sync global UI (navbar avatar etc.)
            }
        } catch {
            toast.error('Update failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Save a new work history entry to the experience column
    const handleAddWorkEntry = async () => {
        if (!workForm.company.trim() || !workForm.role.trim()) {
            toast.error('Company and role are required');
            return;
        }
        try {
            setSavingWork(true);
            const newEntry = { ...workForm };
            const updatedExperience = [newEntry, ...(profile.experience || [])];
            const res = await profileApi.updateProfile({ experience: updatedExperience });
            if (res.success) {
                toast.success('Work history added');
                setProfile(prev => prev ? { ...prev, experience: updatedExperience } : prev);
                setWorkForm({ company: '', role: '', start_date: '', end_date: '', description: '' });
                setShowWorkForm(false);
                refetchProfileContext();
            }
        } catch {
            toast.error('Failed to save work entry');
        } finally {
            setSavingWork(false);
        }
    };

    // Delete a work history entry by index
    const handleDeleteWorkEntry = async (index) => {
        try {
            const updatedExperience = (profile.experience || []).filter((_, i) => i !== index);
            const res = await profileApi.updateProfile({ experience: updatedExperience });
            if (res.success) {
                toast.success('Entry removed');
                setProfile(prev => prev ? { ...prev, experience: updatedExperience } : prev);
            }
        } catch {
            toast.error('Failed to remove entry');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            const res = await profileApi.uploadAvatar(file);
            if (res.success) {
                toast.success('Avatar updated successfully');
                fetchProfile();
                refetchProfileContext(); // Sync global UI
            }
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            const res = await profileApi.verifyEmailSend();
            if (res.success) {
                toast.success('Verification link sent to your email');
                setVerifyType('email');
                setShowVerifyModal(true);
            }
        } catch {
            toast.error('Failed to send verification link');
        }
    };


    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const res = await profileApi.uploadDocument(file);
            if (res.success) {
                toast.success('Document uploaded for verification');
                fetchProfile();
            }
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const isOwnProfile = currentUser?.id && profile ? currentUser.id === (profile.user_id || profile.id) : false;

    useEffect(() => {
        if (isOwnProfile) {
            const val = status?.online_for_messages ?? currentUser?.profile?.online_for_messages ?? true;
            setIsOnline(val);
        }
    }, [isOwnProfile, status?.online_for_messages, currentUser?.profile?.online_for_messages]);

    if (loading) {

        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
                <InfinityLoader />
                <p className="text-slate-900/60 dark:text-white/60 font-medium animate-pulse">Fetching premium profile...</p>
            </div>
        );
    }

    if (!profile) {

        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">Profile Not Found</h2>
                <p className="text-slate-900/60 dark:text-white/60 mb-6">The freelancer you are looking for does not exist or has a private profile.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-accent hover:underline font-medium"
                >
                    <ArrowLeft size={18} /> Back to previous page
                </button>
            </div>
        );
    }




    return (
        <div className="min-h-screen bg-primary text-light-text selection:bg-accent/30 selection:text-accent font-sans">
            {/* True Navigation Bar */}
            {!currentUser ? (
                <Navbar />
            ) : role === 'CLIENT' ? (
                <ClientTopbar />
            ) : (
                <FreelancerTopbar />
            )}

            <div className="max-w-[1480px] mx-auto px-4 md:px-6">

                {/* 1. TOP HEADER SECTION */}
                <div className="mb-4 md:mb-6 bg-transparent border-none shadow-none">
                    <div className="flex flex-col md:flex-row px-4 sm:px-6 md:px-0 pt-3 sm:pt-5 md:pt-10 pb-2 sm:pb-3 md:pb-4 gap-4 md:gap-12 items-start">
                        {/* Profile Image & Mobile Header Info Container */}
                        <div className="flex flex-col gap-3 md:gap-12 w-full md:w-auto items-start md:items-start shrink-0">
                            <div className="flex flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6 w-full md:w-auto">
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-accent overflow-hidden shadow-2xl bg-primary md:bg-secondary relative z-10">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={40} className="text-slate-900/10 dark:text-white/10" />
                                            </div>
                                        )}
                                    </div>
                                    {isOwnProfile && (
                                        <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="text-white w-6 h-6" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>

                                {/* Mobile Name Only (Next to Avatar) */}
                                <div className="md:hidden flex flex-col pt-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-xl font-bold text-slate-950 dark:text-white leading-tight">{profile.name}</h1>
                                        {isOnline && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse shrink-0" title="Online" />
                                        )}
                                        {profile.is_verified && (
                                            <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile-Only Title & Rate (Full Width Below Avatar/Name) */}
                            <div className="md:hidden w-full space-y-2 mt-2 flex flex-col items-center">
                                <div className="w-full pb-3 border-b border-slate-900/5 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2">
                                    <p className="text-slate-950 dark:text-white font-semibold text-sm leading-relaxed">{profile.title || 'Professional Freelancer'}</p>
                                    {profile.category && (
                                        <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            {profile.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center gap-3 flex-wrap">
                                    <span className="text-accent text-sm font-bold">₹{Number(profile.hourly_rate || 0).toLocaleString('en-IN')}/hr</span>
                                    {profile.experience_years && (
                                        <>
                                            <div className="w-px h-4 bg-slate-900/10 dark:bg-white/10" />
                                            <span className="text-slate-950 dark:text-white/70 text-xs font-bold uppercase tracking-wider">{profile.experience_years}+ Yrs Exp.</span>
                                        </>
                                    )}
                                    {profile.work_hours && (
                                        <>
                                            <div className="w-px h-4 bg-slate-900/10 dark:bg-white/10" />
                                            <span className="text-slate-950 dark:text-white/70 text-xs font-bold">{profile.work_hours}h/wk</span>
                                        </>
                                    )}
                                </div>

                                {/* Mobile Action Buttons */}
                                <div className="w-full flex flex-col gap-3 mt-2">
                                    {!isOwnProfile ? (
                                        <>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => navigate('/freelancer/messages', { state: { recipientId: profile.id } })}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-primary rounded-full font-bold text-xs uppercase tracking-widest"
                                                >
                                                    <MessageSquare size={16} /> Message
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.05] dark:bg-white/[0.02] text-slate-950 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-full font-bold text-xs uppercase tracking-widest transition">
                                                    <Check size={16} className="text-accent" /> Contacts
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => toast.success('Report submitted successfully.')}
                                                className="w-full py-2 text-slate-950/30 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]"
                                            >
                                                Report User
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Name and Header Info Column */}
                        <div className="flex-1 flex flex-col pt-2 w-full relative">
                                <div className="hidden md:flex flex-col sm:flex-row items-center sm:items-start justify-between mb-2">
                                    <div className="space-y-1 text-left">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">{profile.name}</h1>
                                            {isOnline && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5 mt-1 ml-1 scale-110">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                                                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.1em]">Online</span>
                                                </div>
                                            )}
                                            {profile.has_availability_badge && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 mt-1 ml-1 scale-110">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                                                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.1em]">Available Now</span>
                                                </div>
                                            )}
                                            {profile.is_verified && (
                                                <span title="Identity Verified" className="text-blue-500 mt-2">
                                                    <ShieldCheck size={28} />
                                                </span>
                                            )}

                                            {/* Account Violation Status Badge (v2) */}
                                            {(profile.is_banned || profile.is_restricted || profile.warning_count > 0) && (
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-lg mt-1 ml-1 ${profile.is_banned ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                    profile.is_restricted ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    <AlertCircle size={14} className={profile.is_banned ? 'animate-pulse' : ''} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                                        {profile.is_banned ? 'Banned Account' :
                                                            profile.is_restricted ? 'Account Restricted' :
                                                                `Policies Violation Warned`}
                                                    </span>
                                                </div>
                                            )}

                                            {isOwnProfile && (
                                                editSection === 'header' ? (
                                                    <button
                                                        onClick={() => setEditSection(null)}
                                                        className="p-1 text-slate-900/40 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                        title="Cancel editing"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => {
                                                        setEditSection('header');
                                                        setEditData({
                                                            name: profile.name,
                                                            title: profile.title,
                                                            hourly_rate: Math.round((profile.hourly_rate || 0) * USD_TO_INR),
                                                            experience: profile.step_data?.professional_info?.experience || profile.experience_years || ''
                                                        });
                                                    }} className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors" title="Edit header">
                                                        <Pencil size={15} />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
                                            <div className="flex items-center gap-3">
                                                <p className="text-accent text-lg font-medium">{profile.title || 'Professional Freelancer'}</p>
                                                {profile.category && (
                                                    <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                        {profile.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hidden sm:block w-px h-4 bg-white/10" />
                                            <div className="flex items-center gap-1.5 text-slate-900/60 dark:text-white/60 text-lg font-bold">
                                                <IndianRupee size={16} className="text-accent" />
                                                <span>{Number(profile.hourly_rate || 0).toLocaleString('en-IN')}/hr</span>
                                            </div>
                                            {profile.experience_years && (
                                                <>
                                                    <div className="hidden sm:block w-px h-4 bg-white/10" />
                                                    <div className="flex items-center gap-1.5 text-slate-900/60 dark:text-white/60 text-lg font-bold">
                                                        <img src="/Icons/icons8-bag-100.png" alt="Experience" className="w-5 h-5 object-contain shrink-0" />
                                                        <span>{profile.experience_years}+ Years Exp.</span>
                                                    </div>
                                                </>
                                            )}
                                            {profile.work_hours && (
                                                <>
                                                    <div className="hidden sm:block w-px h-4 bg-white/10" />
                                                    <div className="flex items-center gap-1.5 text-slate-900/60 dark:text-white/60 text-base font-semibold">
                                                        <Clock size={16} className="text-accent" />
                                                        <span>{profile.work_hours}h/week</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 mt-4 sm:mt-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-slate-900/40 dark:text-white/40 text-sm font-medium">
                                                <MapPin size={16} />
                                                <span>{profile.location || 'Remote'}</span>
                                            </div>
                                            <div className="w-px h-4 bg-white/10" />
                                            <button className="flex items-center gap-1.5 text-slate-900/40 dark:text-white/40 hover:text-accent transition text-sm font-bold uppercase tracking-widest">
                                                <Heart size={16} /> BOOKMARK
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            {editSection === 'header' && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl pt-2 pb-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase font-bold">Full Name</label>
                                        <input
                                            className="bg-primary/50 border border-white/10 rounded-xl px-4 py-2 w-full text-white outline-none focus:border-accent"
                                            value={editData.name || ''}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase font-bold">Professional Title</label>
                                        <input
                                            className="bg-primary/50 border border-white/10 rounded-xl px-4 py-2 w-full text-white outline-none focus:border-accent"
                                            value={editData.title || ''}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase font-bold">Hourly Rate (₹)</label>
                                        <input
                                            type="number"
                                            className="bg-primary/50 border border-white/10 rounded-xl px-4 py-2 w-full text-white outline-none focus:border-accent"
                                            value={editData.hourly_rate || ''}
                                            onChange={(e) => setEditData({ ...editData, hourly_rate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase font-bold">Years of Experience</label>
                                        <input
                                            className="bg-primary/50 border border-white/10 rounded-xl px-4 py-2 w-full text-white outline-none focus:border-accent"
                                            value={editData.experience || ''}
                                            onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 pt-2">
                                        <button onClick={handleUpdateProfile} className="px-6 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all">Update Header</button>
                                        <button onClick={() => setEditSection(null)} className="px-6 py-2 bg-white/10 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-white/20 hover:scale-[1.02] transition-all">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-12 w-full">
                                {/* Ratings */}
                                <div className="py-2 flex flex-col items-center md:items-start space-y-2 w-full md:w-auto">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-950/50 dark:text-white/30">Client Rating</p>
                                    <div className="flex flex-col items-center md:items-start gap-1">
                                        <span className="text-3xl font-black text-slate-950 dark:text-white leading-none">{profile.rating || '0.0'}</span>
                                        <div className="flex gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star
                                                    key={s}
                                                    size={14}
                                                    fill={s <= (profile.rating || 0) ? "currentColor" : "none"}
                                                    className={s <= (profile.rating || 0) ? "text-accent drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "text-slate-900/10 dark:text-white/10"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reliability Score */}
                                <div className="py-2 flex flex-col items-center md:items-start space-y-2 w-full md:w-auto">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-950/50 dark:text-white/30">Reliability</p>
                                    <div className="flex flex-col items-center md:items-start gap-1.5 w-full">
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60 leading-none">{reliability?.score ?? 100}%</span>
                                        </div>
                                        <div className="w-full md:w-32 h-1.5 bg-slate-900/5 dark:bg-white/5 rounded-full overflow-hidden border border-slate-900/5 dark:border-white/5 relative shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${reliability?.score ?? 100}%` }}
                                                className="h-full bg-gradient-to-r from-accent/50 to-accent relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Render only if there is content to show to prevent huge empty vertical gap */}
                            {(((role === 'CLIENT' || role === 'SUPER_ADMIN' || role === 'ADMIN') && risk) || !isOwnProfile || (isOwnProfile && !profile.profile_completed)) && (
                                <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-end justify-between gap-4 md:gap-6">
                                    {/* Risk Indicator (Client Only OR Admin) */}
                                    {(role === 'CLIENT' || role === 'SUPER_ADMIN' || role === 'ADMIN') && risk ? (
                                        <div className="space-y-2 flex flex-col items-center sm:items-start">
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-950/50 dark:text-white/30">Assurance Check</p>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all duration-500 shadow-sm ${risk.riskLevel === 'high' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                                                    risk.riskLevel === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                                        risk.riskLevel === 'low' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                                            'bg-slate-900/5 dark:bg-white/5 border-slate-900/10 dark:border-white/10 text-slate-950/50 dark:text-white/50'
                                                    }`}>
                                                    {risk.riskLevel === 'high' || risk.riskLevel === 'medium' ? <AlertCircle size={14} /> : <ShieldCheck size={14} />}
                                                    <span className="text-[11px] font-black uppercase tracking-wider">
                                                        {risk.label || 'New Freelancer'}
                                                    </span>
                                                </div>
                                                {risk.isPreliminary && (
                                                    <span className="px-2 py-1 bg-accent/10 border border-accent/20 text-accent rounded-lg text-[9px] font-bold uppercase tracking-widest">Preliminary</span>
                                                )}
                                                {risk.confidence > 0 && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-900/20 dark:text-white/20 font-bold uppercase tracking-tighter">Confidence</span>
                                                        <span className="text-[10px] text-slate-900/40 dark:text-white/40 font-black">{Math.round(risk.confidence * 100)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : <div />}

                                    {/* Action Buttons Row */}
                                    {!isOwnProfile ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate('/freelancer/messages', { state: { recipientId: profile.id } })}
                                                className="flex items-center gap-2 px-6 py-3 bg-accent text-white hover:scale-[1.02] hover:brightness-110 transition-all rounded-full font-bold text-xs uppercase tracking-widest active:scale-[0.98]"
                                            >
                                                <MessageSquare size={16} /> Send message
                                            </button>
                                            <button className="flex items-center gap-2 px-8 py-3 bg-white/[0.05] dark:bg-white/[0.02] text-slate-950 dark:text-white border border-slate-900/10 dark:border-white/10 hover:bg-white/[0.1] hover:scale-[1.02] rounded-full font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-md active:scale-[0.98]">
                                                <Check size={16} className="text-accent" /> Contacts
                                            </button>
                                            <button
                                                onClick={() => toast.success('Report submitted successfully. Our safety team will review it.')}
                                                className="p-3 text-slate-950/30 dark:text-white/30 hover:text-rose-500 transition-all"
                                                title="Report User"
                                            >
                                                <AlertCircle size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        !profile.profile_completed && (
                                            <button
                                                onClick={() => navigate('/freelancer/setup-profile')}
                                                className="w-full md:w-auto px-8 py-3 bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent rounded-full font-bold text-xs uppercase tracking-widest transition"
                                            >
                                                Complete Profile Wizard
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Tab Selection Row — full width, outside the padded header card */}
                <div className="flex items-center w-full border-b border-slate-900/10 dark:border-white/10 mb-8 md:mb-12">
                    {[
                        { id: 'about', label: 'About', img: '/Icons/icons8-user-100.png' },
                        { id: 'resume', label: 'Resume', img: '/Icons/icons8-bag-80.png' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id === 'resume' ? 'resume' : 'about')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 md:py-6 text-sm font-bold tracking-tight transition-all relative ${(activeTab === 'about' && tab.id === 'about') || (activeTab === 'resume' && tab.id === 'resume')
                                ? 'text-slate-950 dark:text-white' : 'text-slate-900/40 dark:text-white/40 hover:text-slate-900/60 dark:hover:text-white/60'
                                }`}
                        >
                            <img
                                src={tab.img}
                                alt={tab.label}
                                className={`w-5 h-5 object-contain transition-all ${
                                    (activeTab === 'about' && tab.id === 'about') || (activeTab === 'resume' && tab.id === 'resume')
                                        ? 'opacity-100'
                                        : 'opacity-40'
                                }`}
                            />
                            {tab.label}
                            {((activeTab === 'about' && tab.id === 'about') || (activeTab === 'resume' && tab.id === 'resume')) && (
                                <motion.div layoutId="headerTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Relationship Intelligence Section (Trust Graph v2) */}
                <div className="mb-8 md:mb-12">
                    <RelationshipIntelligence
                        freelancerId={id}
                        currentUserId={currentUser?.id}
                        userRole={role}
                    />
                </div>

                {/* 2. BOTTOM CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Left Sidebar (4/12) — hidden on Resume tab */}
                    <aside className={`space-y-12 ${activeTab === 'resume' ? 'hidden' : 'lg:col-span-4'}`}>
                        {/* Work Section */}
                        <div className="space-y-6">
                            {(role === 'CLIENT' || role === 'SUPER_ADMIN' || role === 'ADMIN') && risk && !risk.isNew && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/[0.03] dark:from-white/[0.03] to-transparent border border-slate-900/5 dark:border-white/5 space-y-4 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-8 bg-accent/5 blur-3xl rounded-full -mr-10 -mt-10" />

                                    <div className="flex items-center gap-3 relative">
                                        <div className="flex items-center justify-center">
                                            <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="h-5 w-auto dark:hidden brightness-0" />
                                            <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="h-5 w-auto hidden dark:block grayscale opacity-70" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-900/40 dark:text-white/30 font-bold uppercase tracking-widest">Predictive Assurance</p>
                                        </div>
                                        {risk.isPreliminary && (
                                            <div className="ml-auto px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded text-[9px] font-black uppercase tracking-widest">Preliminary</div>
                                        )}
                                    </div>

                                    <div className="space-y-4 relative">
                                        <div className="p-4 bg-slate-900/[0.03] dark:bg-white/[0.02] border border-slate-900/5 dark:border-white/5 rounded-2xl">
                                            <p className="text-xs text-slate-900/70 dark:text-white/70 leading-relaxed italic">
                                                "{risk.insight?.summary || 'Analyzing behavioral patterns for project success...'}"
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-accent font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Zap size={10} /> Client Suggestion
                                                </p>
                                                {risk.insight?.isPreliminary && (
                                                    <span className="text-[8px] text-slate-900/20 dark:text-white/20 font-bold uppercase italic">Syncing...</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-900/50 dark:text-white/50 leading-relaxed font-medium">
                                                {risk.insight?.suggestion || 'Maintain regular communication to ensure alignment.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-slate-900/20 dark:text-white/20 uppercase tracking-tighter border-t border-slate-900/5 dark:border-white/5">
                                        <span>Weighted Score: {risk.riskScore}</span>
                                        <span>Confidence: {Math.round(risk.confidence * 100)}%</span>
                                    </div>
                                </motion.div>
                            )}
                            {/* Work History section header */}
                            <div className="space-y-1.5 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">Experience</h3>
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => { setShowWorkForm(f => !f); setWorkForm({ company: '', role: '', start_date: '', end_date: '', description: '' }); }}
                                            className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors"
                                            title="Add work history entry"
                                        >
                                            {showWorkForm ? <X size={15} /> : <Pencil size={15} />}
                                        </button>
                                    )}
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Work History</h1>
                            </div>

                            {/* Add Work Entry Form (own profile) */}
                            {isOwnProfile && showWorkForm && (
                                <div className="mb-6 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Company *</label>
                                            <input
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent"
                                                placeholder="e.g. Google"
                                                value={workForm.company}
                                                onChange={e => setWorkForm(p => ({ ...p, company: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Role / Title *</label>
                                            <input
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent"
                                                placeholder="e.g. Frontend Developer"
                                                value={workForm.role}
                                                onChange={e => setWorkForm(p => ({ ...p, role: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Start Date</label>
                                            <input
                                                type="month"
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent"
                                                value={workForm.start_date}
                                                onChange={e => setWorkForm(p => ({ ...p, start_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">End Date</label>
                                            <input
                                                type="month"
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent"
                                                placeholder="Leave blank if current"
                                                value={workForm.end_date}
                                                onChange={e => setWorkForm(p => ({ ...p, end_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Description</label>
                                            <textarea
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent resize-none min-h-[72px]"
                                                placeholder="Brief description of your role..."
                                                value={workForm.description}
                                                onChange={e => setWorkForm(p => ({ ...p, description: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            onClick={handleAddWorkEntry}
                                            disabled={savingWork}
                                            className="px-5 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all disabled:opacity-50"
                                        >
                                            {savingWork ? 'Saving…' : 'Add Entry'}
                                        </button>
                                        <button
                                            onClick={() => setShowWorkForm(false)}
                                            className="px-5 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-950 dark:text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-8">
                                {profile.experience && profile.experience.length > 0 ? (
                                    profile.experience.map((exp, i) => {
                                        const company = exp.company || exp.organization || exp.employer || exp.companyName || '';
                                        const role = exp.role || exp.position || exp.title || exp.jobTitle || '';
                                        const startDate = exp.start_date || exp.startDate || exp.from || '';
                                        const endDate = exp.end_date || exp.endDate || exp.to || '';
                                        const description = exp.description || exp.summary || exp.details || '';
                                        return (
                                            <div key={i} className="flex flex-col gap-1.5 pb-6 border-b border-slate-900/5 dark:border-white/5 last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-base font-bold text-slate-950 dark:text-white leading-snug">{company || 'Company'}</h4>
                                                        <p className="text-sm text-accent font-semibold">{role}</p>
                                                        <p className="text-xs text-slate-900/40 dark:text-white/40 font-medium">
                                                            {startDate}{startDate && ' — '}{endDate || (startDate ? 'Present' : '')}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${i === 0 ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-slate-900/5 dark:bg-white/5 text-slate-900/40 dark:text-white/40 border border-slate-900/5 dark:border-white/5'}`}>
                                                            {endDate ? 'Past' : 'Current'}
                                                        </span>
                                                        {isOwnProfile && (
                                                            <button
                                                                onClick={() => handleDeleteWorkEntry(i)}
                                                                className="p-0.5 text-slate-900/20 dark:text-white/20 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                                title="Remove entry"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {description && (
                                                    <p className="text-xs text-slate-900/50 dark:text-white/50 leading-relaxed mt-1">{description}</p>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : profile.experience_years ? (
                                    <div className="flex items-center gap-3 py-2">
                                        <img src="/Icons/icons8-bag-100.png" alt="Experience" className="w-6 h-6 object-contain shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.experience_years}+ Years Experience</p>
                                            <p className="text-xs text-slate-900/40 dark:text-white/40">{isOwnProfile ? 'Click the pencil icon above to add detailed entries' : 'No detailed work history added yet'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-900/30 dark:text-white/30 font-medium italic">
                                        {isOwnProfile ? 'Click the pencil icon above to add your work history' : 'No experience details added yet.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-900/5 dark:border-white/5">
                                {/* Skills section header */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">Expertise</h3>
                                    </div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Technical Skills</h1>
                                </div>
                                {isOwnProfile && (
                                    editSection === 'skills' ? (
                                        <button
                                            onClick={() => setEditSection(null)}
                                            className="p-1 text-slate-900/40 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                            title="Cancel editing skills"
                                        >
                                            <X size={15} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditSection('skills');
                                                setEditData({ skills: profile.skills || [] });
                                            }}
                                            className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors"
                                            title="Edit skills"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                    )
                                )}
                            </div>

                            {editSection === 'skills' ? (
                                <div className="space-y-4">
                                    <textarea
                                        className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-3 w-full text-sm text-slate-950 dark:text-white outline-none focus:border-accent min-h-[100px]"
                                        value={editData.skills?.join(', ') || ''}
                                        onChange={(e) => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                        placeholder="React, Node.js, Design (Comma separated)"
                                    />
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={handleUpdateProfile} className="px-5 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all">Save</button>
                                        <button onClick={() => setEditSection(null)} className="px-5 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-950 dark:text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-900/5 dark:bg-white/5 rounded-full text-xs font-medium text-slate-900/60 dark:text-white/60">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-900/30 dark:text-white/30 font-medium italic">Not Provided</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Trust & Safety Section (Own Profile) */}
                        {isOwnProfile && (
                            <div className="pt-8 border-t border-slate-900/5 dark:border-white/5 space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900/20 dark:text-white/20">Trust & Safety</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-slate-900/5 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className={profile.is_email_verified ? 'text-emerald-500' : 'text-slate-900/20 dark:text-white/20'} />
                                            <span className="text-sm font-bold text-slate-900/60 dark:text-white/60">Email</span>
                                        </div>
                                        {profile.is_email_verified ? <CheckCircle2 size={14} className="text-emerald-400" /> : <button onClick={handleSendOtp} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Verify</button>}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-slate-900/5 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={16} className={(profile.is_verified || idvStatus?.verification_status === 'APPROVED' || idvStatus?.verification_status === 'VERIFIED') ? 'text-[#22c55e]' : (idvStatus?.verification_status === 'PENDING' || idvStatus?.verification_status === 'UNDER_REVIEW') ? 'text-[#f59e0b]' : 'text-slate-900/20 dark:text-white/20'} />
                                            <span className="text-sm font-bold text-slate-900/60 dark:text-white/60">Identity</span>
                                        </div>
                                        {(profile.is_verified || idvStatus?.verification_status === 'APPROVED' || idvStatus?.verification_status === 'VERIFIED') ? (
                                            <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14} /> VERIFIED ✓</span>
                                        ) : (idvStatus?.verification_status === 'PENDING' || idvStatus?.verification_status === 'UNDER_REVIEW') ? (
                                            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-1"><Clock size={14} /> UNDER REVIEW</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">INCOMPLETE</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main Panel (8/12 or full-width on resume tab) */}
                    <main className={`space-y-16 ${activeTab === 'resume' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
                        {activeTab === 'about' ? (
                            <>
                                {/* Section: Contact Information */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-900/5 dark:border-white/5">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-900/30 dark:text-white/30">Contact Information</h3>
                                        {isOwnProfile && (
                                            editSection === 'contact' ? (
                                                <button
                                                    onClick={() => setEditSection(null)}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                    title="Cancel editing contact"
                                                >
                                                    <X size={15} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditSection('contact');
                                                        setEditData({
                                                            phone: profile.phone || '',
                                                            location: profile.location || '',
                                                            website: profile.website || ''
                                                        });
                                                    }}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors"
                                                    title="Edit contact info"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {editSection === 'contact' ? (
                                        <div className="grid grid-cols-1 gap-4 w-full">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Phone</label>
                                                <input
                                                    className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2 w-full text-slate-950 dark:text-white outline-none focus:border-accent"
                                                    value={editData.phone || ''}
                                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Location</label>
                                                <input
                                                    className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2 w-full text-slate-950 dark:text-white outline-none focus:border-accent"
                                                    value={editData.location || ''}
                                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Website</label>
                                                <input
                                                    className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2 w-full text-slate-950 dark:text-white outline-none focus:border-accent"
                                                    value={editData.website || ''}
                                                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2 w-full">
                                                <button onClick={handleUpdateProfile} className="px-6 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all">Save</button>
                                                <button onClick={() => setEditSection(null)} className="px-6 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-950 dark:text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-row items-center justify-between sm:justify-start">
                                                <div className="text-sm font-bold text-slate-900/40 dark:text-gray-400 w-24 sm:w-28 shrink-0">Address:</div>
                                                <div className="text-sm font-bold text-slate-900/60 dark:text-white/60 leading-relaxed uppercase tracking-widest text-right sm:text-left">
                                                    {profile.location || 'Not Provided'}
                                                </div>
                                            </div>

                                            <div className="flex flex-row items-center justify-between sm:justify-start">
                                                <div className="text-sm font-bold text-slate-900/40 dark:text-gray-400 w-24 sm:w-28 shrink-0">Site:</div>
                                                <div className="text-sm font-bold text-accent italic text-right sm:text-left">{profile.website || 'Not Provided'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI Trust Analysis Section */}
                                {reliability?.insight && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative p-8 rounded-xl bg-transparent border border-accent/10 overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Cpu size={120} className="text-accent" />
                                        </div>
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center">
                                                    <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="h-5 w-auto dark:hidden brightness-0" />
                                                    <img src="/Icons/White-AI-Connect.png" alt="Connect AI" className="h-5 w-auto hidden dark:block grayscale opacity-70" />
                                                </div>
                                                <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${reliability.insight.risk === 'low' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    reliability.insight.risk === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                    {reliability.insight.risk} Risk
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-slate-900/60 dark:text-white/80 text-lg leading-relaxed font-medium italic select-none">
                                                    "{reliability.insight.summary}"
                                                </p>
                                                <div className="flex items-start gap-3 p-4 bg-slate-900/[0.02] dark:bg-transparent border border-slate-900/5 dark:border-white/5 rounded-2xl">

                                                    <div className="mt-1 text-accent">
                                                        <ShieldCheck size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-900/40 dark:text-white/40 font-black uppercase tracking-widest mb-1">Recommendation</p>
                                                        <p className="text-sm text-slate-950/70 dark:text-white/70 font-medium">{reliability.insight.suggestion}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Section: Basic Information */}

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-900/5 dark:border-white/5">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-900/30 dark:text-white/30">Basic Information</h3>
                                        {isOwnProfile && (
                                            editSection === 'basic' ? (
                                                <button
                                                    onClick={() => setEditSection(null)}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                    title="Cancel editing basic info"
                                                >
                                                    <X size={15} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditSection('basic');
                                                        setEditData({
                                                            dob: profile.dob || '',
                                                            gender: profile.gender || ''
                                                        });
                                                    }}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors"
                                                    title="Edit basic info"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {editSection === 'basic' ? (
                                        <div className="grid grid-cols-1 gap-4 w-full">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Birthday</label>
                                                <input
                                                    type="date"
                                                    className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2 w-full text-slate-950 dark:text-white outline-none focus:border-accent"
                                                    value={editData.dob || ''}
                                                    onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-900/30 dark:text-white/30 uppercase font-bold">Gender</label>
                                                <CustomDropdown
                                                    options={[
                                                        { label: 'Male', value: 'Male' },
                                                        { label: 'Female', value: 'Female' },
                                                        { label: 'Other', value: 'Other' },
                                                        { label: 'Prefer not to say', value: 'Prefer not to say' }
                                                    ]}
                                                    value={editData.gender}
                                                    onChange={(val) => setEditData({ ...editData, gender: val })}
                                                    placeholder="Select Gender"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2 w-full">
                                                <button onClick={handleUpdateProfile} className="px-6 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all">Save</button>
                                                <button onClick={() => setEditSection(null)} className="px-6 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-950 dark:text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-row items-center justify-between sm:justify-start">
                                                <div className="text-sm font-bold text-slate-900/40 dark:text-gray-400 w-24 sm:w-28 shrink-0">Birthday:</div>
                                                <div className="text-sm font-bold text-slate-900/60 dark:text-white/60 text-right sm:text-left">{profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not Provided'}</div>
                                            </div>

                                            <div className="flex flex-row items-center justify-between sm:justify-start">
                                                <div className="text-sm font-bold text-slate-900/40 dark:text-gray-400 w-24 sm:w-28 shrink-0">Gender:</div>
                                                <div className="text-sm font-bold text-slate-900/60 dark:text-white/60 text-right sm:text-left">{profile.gender || 'Not Provided'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* About Me / Bio */}
                                <div className="space-y-6 pt-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-900/30 dark:text-white/30">About Me</h3>
                                        {isOwnProfile && (
                                            editSection === 'bio' ? (
                                                <button
                                                    onClick={() => setEditSection(null)}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                    title="Cancel editing bio"
                                                >
                                                    <X size={15} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditSection('bio');
                                                        setEditData({ bio: profile.bio || '' });
                                                    }}
                                                    className="p-1 text-slate-900/40 dark:text-white/30 hover:text-accent dark:hover:text-accent transition-colors"
                                                    title="Edit bio"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {editSection === 'bio' ? (
                                        <div className="space-y-4">
                                            <textarea
                                                className="bg-slate-900/5 dark:bg-primary/50 border border-slate-900/10 dark:border-white/10 rounded-xl px-6 py-4 w-full text-lg text-slate-950 dark:text-white outline-none focus:border-accent min-h-[200px] leading-relaxed"
                                                value={editData.bio || ''}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                placeholder="Write something about yourself..."
                                            />
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button onClick={handleUpdateProfile} className="px-6 py-2 bg-accent text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-accent/90 hover:scale-[1.02] transition-all">Save Bio</button>
                                                <button onClick={() => setEditSection(null)} className="px-6 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-950 dark:text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-lg text-slate-900/60 dark:text-white/60 leading-relaxed font-medium text-justify">
                                            {profile.bio || "No bio provided yet."}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'resume' ? (
                            /* Resume Tab Content — full width, no sidebar */
                            <div className="flex flex-col items-center justify-center py-16">
                                {profile.resume_url ? (
                                    <>
                                        <img 
                                            src="/Icons/ChatGPT Image May 23, 2026, 09_47_55 AM.png" 
                                            alt="Professional Resume Illustration" 
                                            className="w-64 md:w-80 h-auto object-contain mb-8 rounded-2xl opacity-90"
                                        />
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Professional Resume</h3>
                                        <p className="text-sm text-slate-900/50 dark:text-white/50 mb-10 max-w-md text-center">
                                            This freelancer has uploaded a verified resume. View or download it to see their full work history.
                                        </p>
                                        <a
                                            href={profile.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-2 bg-accent text-white font-bold rounded-full hover:bg-accent/90 hover:scale-[1.03] transition-all text-xs uppercase tracking-widest"
                                        >
                                            View Resume
                                        </a>
                                    </>
                                ) : (
                                    <p className="text-slate-900/30 dark:text-white/30 font-bold uppercase tracking-widest text-xs">No resume uploaded</p>
                                )}
                            </div>
                        ) : null}
                    </main>
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerifyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowVerifyModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-secondary p-8 rounded-[40px] border border-border w-full max-w-md shadow-2xl"
                        >
                            <button onClick={() => setShowVerifyModal(false)} className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition">
                                <X size={20} />
                            </button>

                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent shadow-lg shadow-accent/10">
                                    <ShieldCheck size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Verify Your Email</h3>
                                    <p className="text-sm text-white/50 px-6">We've sent a secure verification link to your registered email address. Please click the link to verify your account.</p>
                                </div>
                                <div className="pt-8">
                                    <button
                                        onClick={() => setShowVerifyModal(false)}
                                        className="w-full py-4 bg-accent text-primary rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all"
                                    >
                                        Got it, I'll Check
                                    </button>
                                </div>
                                <div className="pt-4 pb-2">
                                    <button
                                        onClick={handleSendOtp}
                                        className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition"
                                    >
                                        Didn't get an email? Resend
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            <Footer />
        </div>
    );
};

export default FreelancerProfilePage;
