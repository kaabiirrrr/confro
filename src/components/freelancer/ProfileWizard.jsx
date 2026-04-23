import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            const percentage = status.profile_completion_percentage || 0;

            // Calculate step from backend percentage
            let backendStep = 1;
            if (percentage >= 83) backendStep = 6;
            else if (percentage >= 66) backendStep = 5;
            else if (percentage >= 50) backendStep = 4;
            else if (percentage >= 33) backendStep = 3;
            else if (percentage >= 16) backendStep = 2;

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

            // 3. Force-refresh global auth state to pick up 'is_profile_complete'
            await refreshProfile();
            
            logger.log("[ProfileWizard] Profile finalized. Navigating to dashboard...");
            navigate("/dashboard", { replace: true });
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
        <div className="min-h-screen bg-primary flex justify-center py-24 px-6">
            <div className="w-full max-w-4xl">
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <span className="text-accent font-bold uppercase tracking-widest text-[10px]">Profile Verification</span>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Let's build your profile</h1>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-medium text-white/40">Step {step} of {totalSteps}</span>
                        </div>
                    </div>
                    <ProfileCompletionBar percentage={Math.round((step / totalSteps) * 100)} />
                </div>

                <div className="relative mt-4">
                    {step === 1 && <StepBasic next={next} />}
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