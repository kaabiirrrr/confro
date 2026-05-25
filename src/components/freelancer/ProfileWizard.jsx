import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { profileApi } from "../../services/profileApi";
import { useProfileCompletion } from "../../hooks/useProfileCompletion";
import { useAuth } from "../../context/AuthContext";
import ProfileCompletionBar from "./ProfileCompletionBar";
import InfinityLoader from "../common/InfinityLoader";
import { logger } from "../../utils/logger";

import StepBasic from "./steps/StepBasic";
import StepProfessional from "./steps/StepProfessional";
import StepSkills from "./steps/StepSkills";
import StepPortfolio from "./steps/StepPortfolio";
import StepDocuments from "./steps/StepDocuments";
import StepFinish from "./steps/StepFinish";

export default function ProfileWizard() {

    const [step, setStep] = useState(1);
    const [finishing, setFinishing] = useState(false); // local state for finish flow
    const totalSteps = 6;
    const navigate = useNavigate();
    const { status, loading, refetch } = useProfileCompletion();
    const { refreshProfile, user, role, profile, isProfileComplete } = useAuth();

    // Sync step with backend data on load
    useEffect(() => {
        if (!loading && status) {
            // Use dynamic current_step returned by backend status endpoint
            const backendStep = Number(status.current_step) || 1;

            // Use backend step (most reliable source of truth) but allow local override for current session
            const savedStep = Number(localStorage.getItem("profileStep")) || 1;
            const resumeStep = Math.min(Math.round(Math.max(savedStep, backendStep)), 6);
            setStep(resumeStep);
        }
    }, [status, loading, navigate]);

    const next = () => {
        const newStep = step + 1;
        setStep(newStep);
        localStorage.setItem("profileStep", String(newStep));
        refetch(); // Refetch status to update progress bar
    };
    const back = () => {
        const newStep = step - 1;
        setStep(newStep);
        localStorage.setItem("profileStep", String(newStep));
    };

    const finish = async () => {
        setFinishing(true);
        try {
            logger.log("[ProfileWizard] Finalizing profile...");

            // 1. Persist 'finish' status to backend
            await profileApi.updateStepStatus('finish', {});

            // 2. Clear local step tracking
            localStorage.removeItem("profileStep");

            // 3. Stamp completion in localStorage IMMEDIATELY so any guard
            //    reading cached state sees the profile as complete before
            //    the async refreshProfile call finishes.
            try {
                const cachedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
                cachedProfile.profile_completed = true;
                cachedProfile.is_profile_complete = true;
                cachedProfile.profile_completion_percentage = 100;
                localStorage.setItem('user_profile', JSON.stringify(cachedProfile));

                const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
                cachedUser.is_profile_complete = true;
                localStorage.setItem('user', JSON.stringify(cachedUser));
            } catch (_) { /* non-blocking */ }

            // 4. Refresh auth state in background (non-blocking — don't await)
            refreshProfile().catch(e => logger.warn("[ProfileWizard] Background refresh failed:", e));

            logger.log("[ProfileWizard] Profile finalized. Navigating to freelancer dashboard...");
            // 5. Navigate DIRECTLY to the freelancer dashboard — skip the
            //    DashboardDispatcher to avoid race conditions where in-memory
            //    state hasn't updated yet and the dispatcher re-sends to wizard.
            navigate("/freelancer/dashboard", { replace: true });
        } catch (error) {
            logger.error("[ProfileWizard] Error finishing profile:", error);
            toast.error("Could not finalize profile. Please try again.");
        } finally {
            setFinishing(false);
        }
    }

    if (loading || finishing) {
        return <InfinityLoader text={finishing ? "Completing your profile..." : "Loading profile setup..."} />;
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center pt-20 pb-6 sm:pt-24 sm:pb-12 px-4 sm:px-6">
            {/* Absolute Logo Header like Navbar */}
            <div className="absolute top-6 left-6 sm:top-6 sm:left-18 z-50">
                <Link to="/" className="inline-flex items-center gap-2 group shrink-0">
                    <img
                        src="/Logo2.png"
                        alt="Connect - Freelance Marketplace Logo"
                        className="h-7 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
            </div>

            <div className="w-full max-w-4xl">
                <div className="mb-2 sm:mb-4">
                    <div className="flex justify-between items-end mb-2 sm:mb-4">
                        <div className="space-y-1">
                            <span className="text-accent font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Profile Verification</span>
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">Let's build your profile</h1>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] sm:text-sm font-medium text-white/40">Step {step} of {totalSteps}</span>
                        </div>
                    </div>
                    <ProfileCompletionBar percentage={Math.round((step / totalSteps) * 100)} />
                </div>

                <div className="relative mt-4">
                    {step === 1 && <StepBasic next={next} status={status} />}
                    {step === 2 && <StepSkills next={next} back={back} />}
                    {step === 3 && <StepPortfolio next={next} back={back} />}
                    {step === 4 && <StepDocuments next={next} back={back} />}
                    {step === 5 && <StepProfessional next={next} back={back} />}
                    {step === 6 && <StepFinish finish={finish} />}
                </div>
            </div>
        </div>
    );

}