import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, UserX, Search, ChevronRight } from 'lucide-react';

const SavedFreelancers = () => {
  const saved = []; // Empty for now

  return (
    <div className="min-w-[1000px] mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Saved Freelancers
          </h2>
          <p className="text-white/40 text-sm font-medium">
            Keep track of top talent you'd like to work with
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {saved.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
            <div className="mb-6 text-white/5 flex justify-center">
              <Bookmark size={64} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">No saved freelancers</h3>
            <p className="text-sm text-white/30 max-w-sm mx-auto mb-8">
              Found someone interesting? Save their profile to easily find them later for your future projects.
            </p>
            <a 
              href="/find-freelancers" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-accent/90 transition shadow-xl shadow-accent/10"
            >
              Explore Talent
              <ChevronRight size={14} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Real saved freelancers map here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedFreelancers;
