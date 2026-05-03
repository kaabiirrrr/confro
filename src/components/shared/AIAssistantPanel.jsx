import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import AIIcon from './AIIcon';
import ConnectAILogo from './ConnectAILogo';
import './AIAssistant.css';

import { getApiUrl } from '../../utils/authUtils';
 
const API_BASE = getApiUrl();

const TOOLS = {
  client: [
    { key: 'generate-job',   icon: '✨', name: 'Generate Job Post',  desc: 'Create a compelling job listing from your idea',    placeholder: 'e.g. Need a React developer for a food delivery app' },
    { key: 'improve-job',    icon: '✏️', name: 'Improve Job Post',   desc: 'Enhance your existing job post for better results',  placeholder: 'Paste your existing job post here...' },
    { key: 'suggest-skills', icon: '🔧', name: 'Suggest Skills',     desc: 'Get the right skill tags for your project',          placeholder: 'e.g. Build an e-commerce website with payments' },
  ],
  freelancer: [
    { key: 'generate-proposal', icon: '📝', name: 'Write Proposal',   desc: 'Craft a winning proposal for any job',               placeholder: 'Paste the job description here...' },
    { key: 'optimize-profile',  icon: '🚀', name: 'Optimize Profile', desc: 'Improve your bio and title to attract more clients',  placeholder: 'Paste your current bio here...' },
    { key: 'bid-strategy',      icon: '💡', name: 'Bid Strategy',     desc: 'Get smart pricing advice for this job',              placeholder: 'Paste the job description here...' },
  ],
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="ai-copy-btn" onClick={() => {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function ResultBlock({ data }) {
  if (!data) return null;
  if (data.error) return <p className="ai-error-msg">⚠ {data.error}</p>;
  if (typeof data === 'string') return (
    <div className="ai-result-card">
      <div className="ai-result-field">
        <span className="ai-result-val">{data}</span>
        <CopyBtn text={data} />
      </div>
    </div>
  );
  const entries = Object.entries(data);
  return (
    <div className="ai-result-card">
      {entries.map(([key, val], i) => {
        const display = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val);
        return (
          <div key={key} className="ai-result-field">
            <span className="ai-result-key">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="ai-result-val">{display}</span>
            {i === entries.length - 1 && <CopyBtn text={display} />}
          </div>
        );
      })}
    </div>
  );
}

export default function AIAssistantPanel({ onClose, userRole = 'freelancer' }) {
  const { theme }                 = useTheme();
  const [tab, setTab]             = useState('tools');
  const [activeTool, setActiveTool] = useState(null);

  // Handle system preference if theme is 'auto'
  const appTheme = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  const [input, setInput]         = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [chatMsg, setChatMsg]     = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: '👋 Hi! I\'m Connect AI, your smart assistant powered by Connect.\n\nI can help you:\n• Write winning proposals\n• Optimize your profile\n• Suggest fair rates\n• Post better jobs\n• Answer any platform questions\n\nWhat can I help you with today?' }]);
  const [chatLoading, setChatLoading] = useState(false);
  const [token, setToken]         = useState(null);
  const chatEndRef    = useRef(null);
  const chatScrollRef = useRef(null);
  const panelRef      = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setToken(session?.access_token || null));
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setToken(s?.access_token || null));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const role  = userRole?.toLowerCase() === 'freelancer' ? 'freelancer' : 'client';
  const tools = TOOLS[role];

  async function callAPI(endpoint, body) {
    const res = await fetch(`${API_BASE}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'AI service error');
    return json.data ?? json;
  }

  async function handleGenerate() {
    if (!input.trim() || !activeTool) return;
    setLoading(true); setResult(null);
    try {
      const map = {
        'generate-job':      ['generate-job',     { idea: input }],
        'improve-job':       ['improve-job',       { jobPost: input }],
        'suggest-skills':    ['suggest-skills',    { category: input }],
        'generate-proposal': ['generate-proposal', { jobDescription: input }],
        'optimize-profile':  ['optimize-profile',  { bio: input }],
        'bid-strategy':      ['bid-strategy',      { jobDescription: input }],
      };
      const [ep, body] = map[activeTool.key];
      setResult(await callAPI(ep, body));
    } catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  }

  async function handleChat() {
    if (!chatMsg.trim()) return;
    const msg = chatMsg; setChatMsg('');
    setChatHistory(h => [...h, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const data = await callAPI('chat', { message: msg, role });
      setChatHistory(h => [...h, { role: 'ai', text: data.reply || 'No response.' }]);
    } catch { setChatHistory(h => [...h, { role: 'ai', text: 'Sorry, something went wrong.' }]); }
    finally { setChatLoading(false); }
  }

  return (
    <div
      ref={panelRef}
      className="ai-panel"
      style={{ position: 'absolute', top: '110%', right: 0, bottom: 'auto' }}
      role="dialog"
    >
      {/* Header */}
      <div className="ai-header">
        <ConnectAILogo variant="icon" theme={appTheme} size={36} />
        <div className="ai-header-info">
          <div className="ai-header-title">
            <span style={{ fontWeight: 600 }}>Connect</span>
            <span style={{ color: '#22D3EE', fontWeight: 700, marginLeft: 5 }}>AI</span>
          </div>
          <div className="ai-header-sub">Powered by Connect AI</div>
        </div>
        <button className="ai-header-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button className={`ai-tab ${tab === 'tools' ? 'active' : ''}`} onClick={() => setTab('tools')}>Tools</button>
        <button className={`ai-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>Ask AI</button>
      </div>

      {/* Tools */}
      {tab === 'tools' && (
        <div className="ai-tools-body">
          {!activeTool ? (
            <>
              <p className="ai-section-label">Available Tools</p>
              <div className="ai-tool-cards">
                {tools.map(t => (
                  <button key={t.key} className="ai-tool-card" onClick={() => { setActiveTool(t); setResult(null); setInput(''); }}>
                    <div className="ai-tool-icon">{t.icon}</div>
                    <div className="ai-tool-info">
                      <div className="ai-tool-name">{t.name}</div>
                      <div className="ai-tool-desc">{t.desc}</div>
                    </div>
                    <span className="ai-tool-arrow">›</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setActiveTool(null); setResult(null); setInput(''); }} className="ai-back-btn">
                ‹ Back to tools
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="ai-tool-icon" style={{ width: 32, height: 32, fontSize: 15 }}>{activeTool.icon}</div>
                <div>
                  <div className="ai-tool-name">{activeTool.name}</div>
                  <div className="ai-tool-desc">{activeTool.desc}</div>
                </div>
              </div>
              <div className="ai-input-area">
                <p className="ai-input-label">Your Input</p>
                <textarea className="ai-textarea" rows={4} placeholder={activeTool.placeholder} value={input} onChange={e => setInput(e.target.value)} />
                <button className="ai-generate-btn" onClick={handleGenerate} disabled={loading || !input.trim()}>
                  {loading ? '✦ Generating...' : '✦ Generate with AI'}
                </button>
                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div className="ai-shimmer" style={{ width: '80%' }} />
                    <div className="ai-shimmer" style={{ width: '60%' }} />
                    <div className="ai-shimmer" style={{ width: '70%' }} />
                  </div>
                )}
                {result && !loading && (
                  <>
                    <p className="ai-section-label" style={{ marginTop: 4 }}>Result</p>
                    <ResultBlock data={result} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat */}
      {tab === 'chat' && (
        <div className="ai-chat-body">
          <div className="ai-chat-messages" ref={chatScrollRef}>
            {chatHistory.length === 0 && (
              <p className="ai-hint">Ask me anything —<br /><span style={{ opacity: 0.6 }}>"Help me write a proposal"<br />"Is ₹5,000 a fair rate for this project?"</span></p>
            )}
            {chatHistory.map((m, i) => <div key={i} className={`ai-msg ${m.role}`}>{m.text}</div>)}
            {chatLoading && <div className="ai-typing-bubble"><div className="ai-typing-dot" /><div className="ai-typing-dot" /><div className="ai-typing-dot" /></div>}
          </div>
          <div className="ai-chat-input-row">
            <input className="ai-chat-input" type="text" placeholder="Ask AI anything..." value={chatMsg}
              onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} />
            <button className="ai-send-btn" onClick={handleChat} disabled={chatLoading || !chatMsg.trim()}>
              <img src="/Icons/icons8-send-96.png" alt="Send" className="w-8 h-8 object-contain" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
