import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowRight, Zap, ListChecks } from 'lucide-react';

const AIJobPreviewModal = ({
    isOpen,
    onClose,
    onApply,
    originalData,
    aiData,
    type = 'improve' // 'improve' | 'generate' | 'skills'
}) => {
    const [selectedSkills, setSelectedSkills] = useState(aiData?.skills || []);

    if (!isOpen) return null;

    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-6 sm:pt-20 pb-6 sm:pb-10">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-3xl bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-8 fade-in zoom-in-95 duration-300">
                {/* AI Glow Effect */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                {/* Header */}
                <div className="relative p-4 sm:p-6 pb-4 flex flex-col items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center overflow-hidden">
                            <img
                                src="/Icons/AI-Connect.png"
                                alt="AI logo"
                                className="h-5 w-auto dark:hidden"
                            />
                            <img
                                src="/Icons/White-AI-Connect.png"
                                alt="AI logo"
                                className="h-5 w-auto hidden dark:block grayscale brightness-200"
                            />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-slate-950 dark:text-light-text tracking-tight uppercase">Connect AI Assistant</h2>
                            <p className="text-[7.5px] text-accent font-black uppercase tracking-[0.3em] mt-0.5">Review AI Suggestions</p>
                        </div>
                    </div>
                </div>

                {/* Unified Content & Actions Area */}
                <div className="relative px-5 sm:px-10 pb-5 sm:pb-10 max-h-[85vh] sm:max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6 sm:space-y-10">
                        {/* Description Improvement (For 'improve' or 'generate') */}
                        {(type === 'improve' || type === 'generate') && aiData?.description && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Original Version</label>
                                        <div className="text-xs text-text-secondary italic leading-relaxed">
                                            {originalData.description || "No description provided."}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ">
                                        <div className="h-[1px] flex-1 bg-border/40" />
                                        <ArrowRight className="text-text-muted rotate-90 md:rotate-0 opacity-40" size={14} />
                                        <div className="h-[1px] flex-1 bg-border/40" />
                                    </div>

                                    <div className="space-y-4 sm:space-y-12">
                                        <label className="block text-[9px] font-black text-accent uppercase tracking-[0.5em] ml-1 opacity-70">Connect AI Version</label>
                                        <div className="p-5 sm:p-12 border border-accent/20 rounded-2xl text-sm sm:text-base text-light-text leading-relaxed font-medium whitespace-pre-wrap shadow-sm">
                                            {aiData.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skill Suggestions */}
                        {aiData?.skills?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-light-text uppercase tracking-widest">Recommended Skills</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {aiData.skills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${selectedSkills.includes(skill)
                                                ? 'bg-accent/10 border-accent text-accent'
                                                : 'bg-white/[0.02] border-border text-text-secondary hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <span className="text-[11px] font-bold uppercase tracking-wider">{skill}</span>
                                            {selectedSkills.includes(skill) && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Actions - Integrated into Flow */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-8 py-3 rounded-full border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-light-text hover:bg-white/5 transition-all"
                            >
                                Keep Original
                            </button>
                            <button
                                onClick={() => onApply({ ...aiData, skills: selectedSkills })}
                                className="w-full sm:w-auto px-10 py-3 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-xl shadow-accent/10 flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Check size={16} />
                                Apply AI Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIJobPreviewModal;
