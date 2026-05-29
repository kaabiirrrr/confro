import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import { toast } from "react-hot-toast";
import AIRewriteButton from '../../ui/AIRewriteButton';
import CustomDropdown from '../../ui/CustomDropdown';
import InfinityLoader from '../../common/InfinityLoader';

export default function StepSkills({ next, back, wizardData = {} }) {
    const [skills, setSkills] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const CATEGORIES = [
        'Development & IT', 'Design & Creative', 'Writing & Translation',
        'Marketing & SEO', 'AI Services', 'Finance & Accounting', 'Legal', 'HR',
    ];

    useEffect(() => {
        const loadExistingSkills = async () => {
            try {
                setLoading(true);
                const status = await profileApi.getStatus();
                if (status.success) {
                    const existingSkills = status.data?.skills || status.data?.step_data?.skills;
                    if (Array.isArray(existingSkills)) {
                        setSkills(existingSkills.join(', '));
                    }
                    const existingCategory = status.data?.category || status.data?.step_data?.category;
                    if (existingCategory) {
                        setCategory(existingCategory);
                    }
                }
            } catch (error) {
                console.error("Error loading existing skills:", error);
            } finally {
                setLoading(false);
            }
        };
        loadExistingSkills();
    }, []);

    const handleContinue = async () => {
        if (!skills.trim() || !category) {
            toast.error("Please select a category and enter at least one skill.");
            return;
        }

        const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

        try {
            const stepData = { skills: skillsArray, category };
            await profileApi.updateStepStatus("skills", stepData);
            next();
        } catch (error) {
            toast.error("Failed to save skills");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {loading ? (
                <div className="py-12">
                    <InfinityLoader text="Loading your skills..." />
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Your Skills & Category</h2>
                        <p className="text-white/40 text-sm">Select your primary category and list the skills that help you stand out.</p>
                    </div>

            <div className="space-y-5 pt-2">
                <div className="flex flex-col gap-2 relative z-50">
                    <label className="text-sm font-medium text-white/50 px-1">Primary Category</label>
                    <CustomDropdown
                        options={CATEGORIES}
                        value={category}
                        onChange={setCategory}
                        placeholder="Select your primary category"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-medium text-white/50">Skills</label>
                        <div className="w-auto">
                            <AIRewriteButton
                                field="skills"
                                value={skills}
                                context={{ title: wizardData.title || '', bio: wizardData.bio || '', category }}
                                onApply={(val) => setSkills(val)}
                            />
                        </div>
                    </div>
                    <input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full bg-secondary/20 border border-white/10 p-4 rounded-2xl focus:border-accent outline-none transition-all text-light-text placeholder:text-white/20 text-base shadow-inner shadow-black/5"
                        placeholder="e.g. React, Node.js, UI Design, Python"
                    />
                </div>
            </div>

            <div className="hidden sm:flex justify-between gap-3 sm:gap-5 pt-2 sm:pt-4">
                <button onClick={back} className="flex items-center justify-center px-6 sm:px-8 py-2 sm:py-2.5 border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs sm:text-sm font-semibold">
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!skills.trim() || !category}
                    className="bg-accent text-white font-bold px-6 sm:px-10 py-2 sm:py-2.5 rounded-full hover:bg-accent/90 disabled:opacity-30 flex items-center justify-center transition-all text-sm sm:text-base"
                >
                    Continue
                </button>
            </div>

            {/* Mobile fixed bottom buttons */}
            <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-primary border-t border-white/5 px-4 py-3 flex gap-3">
                <button onClick={back} className="flex-1 flex items-center justify-center py-2.5 border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs font-semibold">
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!skills.trim() || !category}
                    className="flex-1 bg-accent text-white font-bold py-2.5 rounded-full hover:bg-accent/90 disabled:opacity-30 flex items-center justify-center transition-all text-sm"
                >
                    Continue
                </button>
            </div>
            <div className="h-16 sm:hidden" />
            </>
            )}
        </motion.div>
    );
}