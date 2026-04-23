import React from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';

const Projects = () => {
  const activeProjects = []; // Empty for now

  return (
    <div className="max-w-[1630px] mx-auto px-6 md:px-10 py-8 text-light-text font-sans tracking-tight">
      <div className="space-y-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            My Projects
          </h1>
          <p className="text-base text-light-text/70 mt-1">
            Manage your active contracts and deliver work.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-8">
        {['In Progress', 'Completed', 'Paused'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              i === 0 ? 'bg-accent/10 text-accent border border-accent/20' : 'text-white/50 hover:text-white border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/70 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <Briefcase size={28} strokeWidth={1.5} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No active projects</h3>
            <p className="text-light-text/50 text-sm max-w-sm mx-auto mb-8">
              Once you accept a job offer, your contracts will appear here. Ready to get started?
            </p>
            <a
              href="/freelancer/find-work"
              className="px-6 py-2.5 bg-accent text-primary rounded-full text-sm font-semibold hover:bg-accent/90 transition flex items-center gap-2 w-fit mx-auto shadow-lg shadow-accent/10"
            >
              Start Finding Work
              <ChevronRight size={16} />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Real projects would map here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
