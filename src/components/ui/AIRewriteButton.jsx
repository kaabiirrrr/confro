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
    <div className={`w-full ${className}`}>
      <div className="space-y-3">
        {/* Trigger button - shown only if no suggestion */}
        {!suggestion && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-widest hover:bg-accent/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <img src="/Icons/White-AI-Connect.png" alt="AI" className="w-3.5 h-3.5 object-contain" />
                  Rewrite with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Suggestion preview - always full width below the trigger line */}
        {suggestion && (
          <div className="rounded-xl border border-accent/30 bg-secondary/50 backdrop-blur-md p-4 space-y-3 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent/10 rounded-lg">
                  <img src="/Icons/White-AI-Connect.png" alt="AI" className="w-4 h-4 object-contain" />
                </div>
                <span className="text-accent text-[10px] font-bold uppercase tracking-widest">AI Suggestion</span>
              </div>
              <button 
                onClick={handleDiscard}
                className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-medium uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
            <p className="text-light-text text-sm leading-relaxed whitespace-pre-wrap">{suggestion}</p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent/90 transition shadow-lg shadow-accent/20"
              >
                Apply Changes
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/50 text-xs font-bold rounded-xl hover:bg-white/10 transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
