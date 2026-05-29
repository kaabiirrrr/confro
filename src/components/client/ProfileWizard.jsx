import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { profileApi } from "../../services/profileApi";
import { useProfileCompletion } from "../../hooks/useProfileCompletion";
import { useAuth } from "../../context/AuthContext";
import ProfileCompletionBar from "../freelancer/ProfileCompletionBar";
import InfinityLoader from "../common/InfinityLoader";
import { logger } from "../../utils/logger";

import StepBasic from "./steps/StepBasic";
import StepCompany from "./steps/StepCompany";
import StepPersonal from "./steps/StepPersonal";
import StepContact from "./steps/StepContact";
import StepLocation from "./steps/StepLocation";
import StepFinish from "./steps/StepFinish";

export default function ClientProfileWizard() {
    const [step, setStep] = useState(1);
    const [finishing, setFinishing] = useState(false);
    const totalSteps = 6;
    const navigate = useNavigate();
    const { status, loading, refetch } = useProfileCompletion();
    const { refreshProfile, user, setProfile } = useAuth();

    // Sync step with backend — identical logic to freelancer wizard
    useEffect(() => {
        if (!loading && status) {
            const backendStep = Number(status.current_step) || 1;
            const savedStep = Number(localStorage.getItem("clientProfileStep")) || 1;
            const resumeStep = Math.min(Math.round(Math.max(savedStep, backendStep)), 6);
            setStep(resumeStep);
        }
    }, [status, loading]);

    const next = () => {
        const newStep = step + 1;
        setStep(newStep);
        localStorage.setItem("clientProfileStep", String(newStep));
        refetch();
        window.scrollTo(0, 0);
    };

    const back = () => {
        const newStep = step - 1;
        setStep(newStep);
        localStorage.setItem("clientProfileStep", String(newStep));
        window.scrollTo(0, 0);
    };

    const finish = async () => {
        setFinishing(true);
        try {
            logger.log("[ClientProfileWizard] Finalizing client profile...");

            await profileApi.updateStepStatus('finish', {});
            localStorage.removeItem("clientProfileStep");

            // Fetch the latest client profile to get avatar_url and all fields
            let freshAvatarUrl = null;
            try {
                const res = await profileApi.getClientProfile();
                freshAvatarUrl = res?.data?.avatar_url || null;
            } catch (_) {}

            // Stamp completion + avatar into localStorage and React context immediately
            try {
                const cachedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
                cachedProfile.profile_completed = true;
                cachedProfile.is_profile_complete = true;
                cachedProfile.is_client_profile_complete = true;
                cachedProfile.profile_completion_percentage = 100;
                if (freshAvatarUrl) cachedProfile.avatar_url = freshAvatarUrl;
                localStorage.setItem('user_profile', JSON.stringify(cachedProfile));

                const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
                cachedUser.is_profile_complete = true;
                localStorage.setItem('user', JSON.stringify(cachedUser));

                // Update in-memory React context so ProfileSetupGuard and navbar see it immediately
                setProfile(prev => ({
                    ...(prev || {}),
                    profile_completed: true,
                    is_profile_complete: true,
                    is_client_profile_complete: true,
                    profile_completion_percentage: 100,
                    ...(freshAvatarUrl ? { avatar_url: freshAvatarUrl } : {})
                }));
            } catch (_) {}

            // Await refreshProfile so the full profile (including avatar) is in context before navigating
            try {
                await refreshProfile();
            } catch (e) {
                logger.warn("[ClientProfileWizard] Background refresh failed:", e);
            }

            logger.log("[ClientProfileWizard] Profile finalized. Navigating to client dashboard...");
            navigate("/client/dashboard", { replace: true });
        } catch (error) {
            logger.error("[ClientProfileWizard] Error finishing profile:", error);
            toast.error("Could not finalize profile. Please try again.");
        } finally {
            setFinishing(false);
        }
    };

    if (loading || finishing) {
        return <InfinityLoader text={finishing ? "Completing your setup..." : "Loading client setup..."} />;
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center pt-20 pb-6 sm:pt-24 sm:pb-12 px-4 sm:px-6">
            {/* Logo — identical position to freelancer wizard */}
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
                            <span className="text-accent font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Client Registration</span>
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">Set up your mission</h1>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] sm:text-sm font-medium text-white/40">Step {step} of {totalSteps}</span>
                        </div>
                    </div>
                    <ProfileCompletionBar percentage={Math.round((step / totalSteps) * 100)} />
                </div>

                <div className="relative mt-4">
                    {step === 1 && <StepBasic next={next} status={status} />}
                    {step === 2 && <StepCompany next={next} back={back} />}
                    {step === 3 && <StepPersonal next={next} back={back} />}
                    {step === 4 && <StepContact next={next} back={back} />}
                    {step === 5 && <StepLocation next={next} back={back} />}
                    {step === 6 && <StepFinish finish={finish} />}
                </div>
            </div>
        </div>
    );
}
