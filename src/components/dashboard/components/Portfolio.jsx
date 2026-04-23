import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Plus, Image as ImageIcon, ExternalLink, Trash2 } from 'lucide-react';

const Portfolio = () => {
    const portfolioItems = []; // Empty for now

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Portfolio Items</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent/20 transition">
                    <Plus size={14} />
                    Add Project
                </button>
            </div>

            {portfolioItems.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                    <div className="mb-4 text-white/5 flex justify-center">
                        <ImageIcon size={48} strokeWidth={1} />
                    </div>
                    <p className="text-sm text-white/30 font-medium">No portfolio items yet.</p>
                    <p className="text-[10px] text-white/10 uppercase tracking-widest font-bold mt-1">Showcase your best work to win more clients.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {/* Portfolio mapping here */}
                </div>
            )}
        </div>
    );
};

export default Portfolio;
