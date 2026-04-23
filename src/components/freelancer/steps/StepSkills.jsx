import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import { toast } from "react-hot-toast";

export default function StepSkills({ next, back }) {
    const [skills, setSkills] = useState("");

    const handleContinue = async () => {
        try {
            // Convert comma separated string to array
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            await profileApi.updateStepStatus('skills', { skills: skillsArray });
            next();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save skills: " + (e.response?.data?.message || e.message));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-xl font-bold text-white mb-1">
                    Your Skills
                </h2>
                <p className="text-white/40 text-sm">List the skills that help you stand out. Separate them with commas.</p>
            </div>

            <div className="space-y-2">
                <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-transparent border border-white/10 p-4 rounded-xl focus:border-accent outline-none transition-all text-white placeholder:text-white/20 text-base shadow-inner shadow-black/20"
                    placeholder="e.g. React, Node.js, UI Design, Python"
                />
            </div>

            <div className="flex justify-end gap-5 pt-4">
                <button
                    onClick={back}
                    className="flex items-center gap-2 px-8 py-4 text-white/40 hover:text-white transition-colors text-sm font-semibold"
                >
                    <FiArrowLeft />
                    Back
                </button>

                <button
                    onClick={handleContinue}
                    disabled={!skills.trim()}
                    className="bg-accent text-white font-bold px-10 py-4 rounded-full hover:bg-accent/90 disabled:opacity-30 flex items-center gap-3 transition-all shadow-xl shadow-accent/10"
                >
                    Continue
                    <FiArrowRight />
                </button>
            </div>
        </motion.div>
    );
}