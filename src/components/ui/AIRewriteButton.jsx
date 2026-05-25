import { useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

/**
 * AIRewriteButton — inline AI suggestion button for text fields in wizards
 * 
 * Props:
 *   field: 'bio' | 'title' | 'skills' | 'mission'
 *   value: current field value
 *   context: extra context object (e.g. { title, role })
 *   onApply: (newValue) => void
 *   className: optional extra classes
 */
export default function AIRewriteButton({ field, value, context = {}, onApply, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const getEndpointAndPayload = () => {
    switch (field) {
      case 'bio':
        return {
          url: '/api/ai/optimize-profile',
          payload: { bio: value, ...context },
          extract: (d) => d.optimizedBio || d.bio,
        };
      case 'title':
        return {
          url: '/api/ai/optimize-profile',
          payload: { bio: context.bio || value, title: value, ...context },
          extract: (d) => d.title,
        };
      case 'skills':
        return {
          url: '/api/ai/suggest-skills',
          payload: { title: context.title || '', bio: context.bio || '', ...context },
          extract: (d) => Array.isArray(d.skills) ? d.skills.join(', ') : d.skills,
        };
      case 'mission':
        return {
          url: '/api/ai/optimize-mission',
          payload: { mission: value, ...context },
          extract: (d) => d.optimizedMission || d.mission,
        };
      default:
        return null;
    }
  };

  const handleGenerate = async () => {
    if (!value?.trim() && field !== 'skills') {
      toast.error('Please write something first so AI can improve it');
      return;
    }

    const config = getEndpointAndPayload();
    if (!config) return;

    setLoading(true);
    setSuggestion(null);

    try {
      const res = await api.post(config.url, config.payload);
      if (res.data.success) {
        const extracted = config.extract(res.data.data);
        if (extracted) {
          setSuggestion(extracted);
        } else {
          toast.error('AI returned an empty suggestion');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'AI suggestion failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
      setSuggestion(null);
      toast.success('AI suggestion applied!');
    }
  };

  const handleDiscard = () => setSuggestion(null);

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-3">
        {/* Trigger button - shown only if no suggestion */}
        {!suggestion && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="w-3.5 h-3.5 bg-accent inline-block" style={{ maskImage: 'url(/Icons/White-AI-Connect.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(/Icons/White-AI-Connect.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
                  Rewrite with Connect AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Suggestion preview - Modal */}
        {suggestion && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pb-4 bg-black/60 backdrop-blur-sm" onClick={handleDiscard}>
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-2xl rounded-xl border border-white/10 bg-secondary p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center -mt-0.5">
                    <span className="w-5 h-5 bg-accent inline-block" style={{ maskImage: 'url(/Icons/White-AI-Connect.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(/Icons/White-AI-Connect.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
                  </div>
                  <span className="text-accent text-[11px] font-bold uppercase tracking-widest mt-0.5">Connect AI Suggestion</span>
                </div>
                <button 
                  onClick={handleDiscard}
                  className="text-white/30 hover:text-accent transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-primary/50 border border-white/5 rounded-xl p-4 max-h-[50vh] overflow-y-auto">
                <p className="text-light-text text-sm leading-relaxed whitespace-pre-wrap">{suggestion}</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-1 py-2.5 sm:py-3 bg-white/5 border border-white/10 text-white font-bold text-xs sm:text-sm rounded-full hover:bg-white/10 transition-all"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2.5 sm:py-3 bg-accent text-white font-bold text-xs sm:text-sm rounded-full hover:bg-accent/90 transition-all"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
