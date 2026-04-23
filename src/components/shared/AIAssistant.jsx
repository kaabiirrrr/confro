import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X as CloseIcon } from 'lucide-react';
import './AIAssistant.css';

const AI_LOGO = 'https://ogtkjtbvbkyddutnmcov.supabase.co/storage/v1/object/sign/ai-logo/ChatGPT_Image_Apr_2__2026__11_31_42_PM-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNThiNmMxZi1hM2EyLTQ4MTYtOThmYS02YjlmMTQ0ODI3NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhaS1sb2dvL0NoYXRHUFRfSW1hZ2VfQXByXzJfXzIwMjZfXzExXzMxXzQyX1BNLXJlbW92ZWJnLXByZXZpZXcucG5nIiwiaWF0IjoxNzc1MTUzMDQ1LCJleHAiOjQ4OTcyMTcwNDV9.AGpHIM1DPw7QmLiVhq1jix9Jg-X5cx5hZ3uWbtip8Ek';
import { getApiUrl } from '../../utils/authUtils';
 
const API_BASE = getApiUrl();

// Use lucide icons instead of emojis to avoid encoding issues
const TOOLS = {
  client: [
    { key: 'generate-job',   icon: '/Icons/icons8-new-job-100.png',      name: 'Generate Job Post',  desc: 'Create a compelling job listing from your idea',    placeholder: 'e.g. Need a React developer for a food delivery app' },
    { key: 'improve-job',    icon: '/Icons/icons8-contract-60.png',       name: 'Improve Job Post',   desc: 'Enhance your existing job post for better results',  placeholder: 'Paste your existing job post here...' },
    { key: 'suggest-skills', icon: '/Icons/icons8-skills-100.png',       name: 'Suggest Skills',     desc: 'Get the right skill tags for your project',          placeholder: 'e.g. Build an e-commerce website with payments' },
  ],
  freelancer: [
    { key: 'generate-proposal', icon: '/Icons/icons8-contract-60.png',   name: 'Write Proposal',   desc: 'Craft a winning proposal for any job',               placeholder: 'Paste the job description here...' },
    { key: 'optimize-profile',  icon: '/Icons/icons8-user-100.png',      name: 'Optimize Profile', desc: 'Improve your bio and title to attract more clients',  placeholder: 'Paste your current bio here...' },
    { key: 'bid-strategy',      icon: '/Icons/icons8-money-bag-rupee-100.png', name: 'Bid Strategy',   desc: 'Get smart pricing advice for this job',              placeholder: 'Paste the job description here...' },
  ],
};

const PAGE_GUIDES = {
  '/freelancer/dashboard':        { title: 'Dashboard',             steps: ['Check your active proposals in the My Proposals section', 'View your earnings summary at the top', 'Click Find Work in the sidebar to browse new jobs', 'Use Buy Connects to apply to more jobs'] },
  '/freelancer/find-work':        { title: 'Find Work',             steps: ['Use the search bar to filter jobs by keyword', 'Click the filter icon to narrow by budget, duration, or skill', 'Click any job card to read the full description', 'Hit Submit Proposal to apply — you\'ll spend Connects'] },
  '/freelancer/proposals':        { title: 'My Proposals',          steps: ['See all your submitted proposals here', 'Green = accepted, Yellow = pending, Red = declined', 'Click a proposal to view client feedback', 'Withdraw a proposal by clicking the 3-dot menu'] },
  '/freelancer/messages':         { title: 'Messages',              steps: ['Click a conversation on the left to open it', 'Use the phone/video icons at the top right to call', 'Click the paperclip to send files', 'Click the 3-dot menu for options like mute, clear, or report'] },
  '/freelancer/contracts':        { title: 'Contracts',             steps: ['View all active and completed contracts here', 'Click a contract to see milestones and deliverables', 'Submit work using the Submit Work button', 'Track payment status in the contract detail view'] },
  '/freelancer/earnings':         { title: 'Earnings',              steps: ['See your total earnings and pending payments', 'Click Withdraw to transfer funds to your account', 'Filter by date range to see specific periods', 'Download reports using the export button'] },
  '/freelancer/settings':         { title: 'Settings',              steps: ['Update your email and password in Account section', 'Set notification preferences to stay informed', 'Connect payment methods for withdrawals', 'Manage privacy settings for your profile visibility'] },
  '/freelancer/services':         { title: 'My Services',           steps: ['Click Add New Service to create a service listing', 'Set a clear title, description, and price', 'Add images to make your service stand out', 'Publish when ready — clients can order directly'] },
  '/client/dashboard':            { title: 'Client Dashboard',      steps: ['See your active jobs and proposals at a glance', 'Click Post a Job to hire a freelancer', 'Review pending proposals in the Proposals section', 'Check your spending summary in the Reports tab'] },
  '/client/post-job':             { title: 'Post a Job',            steps: ['Write a clear job title describing what you need', 'Add a detailed description — more detail = better proposals', 'Set your budget (fixed price or hourly)', 'Add required skills and click Post Job to publish'] },
  '/client/proposals':            { title: 'Proposals',             steps: ['Review each proposal carefully', 'Check the freelancer\'s profile and ratings', 'Message a freelancer before hiring using the chat icon', 'Click Hire to create a contract with them'] },
  '/client/messages':             { title: 'Messages',              steps: ['Click a conversation on the left to open it', 'Use the phone/video icons to call your freelancer', 'Send files using the paperclip icon', 'Click the 3-dot menu for mute, clear, or report options'] },
  '/client/search-talent':        { title: 'Search Talent',         steps: ['Use the search bar to find freelancers by skill', 'Filter by rating, hourly rate, or location', 'Click a profile to view their full portfolio', 'Click Invite to Job to send them a job offer'] },
};

function getPageGuide(pathname) {
  if (PAGE_GUIDES[pathname]) return PAGE_GUIDES[pathname];
  const key = Object.keys(PAGE_GUIDES).find(k => pathname.startsWith(k));
  return key ? PAGE_GUIDES[key] : null;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="ai-copy-btn" onClick={() => {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    }}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ResultBlock({ data }) {
  if (!data) return null;
  if (data.error) return <p className="ai-error-msg">{data.error}</p>;
  if (typeof data === 'string') return (
    <div className="ai-result-card"><div className="ai-result-field"><span className="ai-result-val">{data}</span><CopyBtn text={data} /></div></div>
  );
  const entries = Object.entries(data);
  return (
    <div className="ai-result-card">
      {entries.map(([key, val], i) => {
        const display = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
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

export default function AIAssistant({ userRole = 'client', externalOpen = false, onClose = null }) {
  const [open, setOpen] = useState(false);
  const isOpen = externalOpen || open;
  const handleClose = () => { onClose ? onClose() : setOpen(false); };
  const role = userRole?.toLowerCase() === 'freelancer' ? 'freelancer' : 'client';

  let pathname = '/';
  try { pathname = useLocation().pathname; } catch { /* outside router */ }
  const pageGuide = getPageGuide(pathname);

  const welcomeText = role === 'freelancer'
    ? 'Welcome to Connect AI\nYour smart assistant powered by Connect.\n\nI assist you with:\n\u2022 Writing high-converting proposals\n\u2022 Optimizing your profile for better visibility\n\u2022 Suggesting competitive and fair rates\n\u2022 Creating effective job posts\n\u2022 Answering all platform-related questions\n\nHow can I assist you today?'
    : 'Welcome to Connect AI\nYour smart assistant powered by Connect.\n\nI assist you with:\n\u2022 Creating compelling job posts that attract top talent\n\u2022 Finding and evaluating the right freelancers\n\u2022 Setting fair and competitive budgets\n\u2022 Managing contracts and milestones effectively\n\u2022 Answering all platform-related questions\n\nHow can I assist you today?';

  const [tab, setTab] = useState('tools');
  const [activeTool, setActiveTool] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: welcomeText }]);
  const [chatLoading, setChatLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token') || null);
  const chatScrollRef = useRef(null);
  const tools = TOOLS[role];

  useEffect(() => {
    // Keep token fresh if it changes (e.g. after re-login)
    const stored = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (stored) { setToken(stored); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) setToken(session.access_token);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => {
      const fresh = s?.access_token || localStorage.getItem('token') || sessionStorage.getItem('token') || null;
      setToken(fresh);
    });
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      if (chatLoading) {
        // While AI is "typing", stay at the bottom to see progress
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      } else {
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg?.role === 'user') {
          // User message: scroll to bottom
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        } else if (lastMsg?.role === 'ai' && chatHistory.length > 1) {
          // AI response finished: scroll to the START of the message
          const messages = chatScrollRef.current.querySelectorAll('.ai-msg');
          const lastMsgElement = messages[messages.length - 1];
          if (lastMsgElement) {
            lastMsgElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  }, [chatHistory, chatLoading]);


  async function callAPI(endpoint, body) {
    const res = await fetch(`${API_BASE}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errMsg = `Server error (${res.status}).`;
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errJson.error || errMsg;
      } catch { /* ignore parse error */ }
      if (res.status === 404) errMsg = 'AI service is not available yet. Please check back soon.';
      if (res.status === 401) errMsg = 'Please log in to use AI features.';
      if (res.status === 429) errMsg = 'Too many requests. Please wait a moment and try again.';
      throw new Error(errMsg);
    }
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

  async function handleChat(overrideMsg) {
    const msg = overrideMsg || chatMsg;
    if (!msg.trim()) return;
    if (!overrideMsg) setChatMsg('');
    setChatHistory(h => [...h, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const contextPrefix = pageGuide ? `[User is on the "${pageGuide.title}" page] ` : '';
      const fullMessage = contextPrefix + msg;
      const data = await callAPI('chat', {
        message: fullMessage,
        prompt: fullMessage,       // some backends use 'prompt'
        query: fullMessage,        // some use 'query'
        role,
        userRole: role,
        messages: [{ role: 'user', content: fullMessage }], // OpenAI format fallback
      });
      setChatHistory(h => [...h, { role: 'ai', text: data.reply || 'No response.' }]);
    } catch (e) {
      setChatHistory(h => [...h, { role: 'ai', text: e.message || 'Sorry, something went wrong. Please try again.' }]);
    } finally { setChatLoading(false); }
  }

  function handleGuideMe() {
    if (!pageGuide) { handleChat('What can I do on this platform?'); return; }
    const steps = pageGuide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    setChatHistory(h => [...h, { role: 'ai', text: `Here is how to use the ${pageGuide.title} page:\n\n${steps}\n\nNeed help with any specific step?` }]);
    setTab('chat');
  }

  return (
    <>
      {!externalOpen && (
        <button className="ai-fab" onClick={() => setOpen(o => !o)} aria-label="Open AI Assistant">
          <img src={AI_LOGO} alt="Connect AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          Connect AI
        </button>
      )}

      {isOpen && (
        <div className="ai-panel" role="dialog" aria-label="AI Assistant">
          {/* Header */}
          <div className="ai-header">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/Icons/AI-Connect.png" alt="c.ai" className="w-8 h-8 object-contain" style={{ filter: 'invert(67%) sepia(61%) saturate(2462%) hue-rotate(165deg) brightness(102%) contrast(100%)' }} />
            </div>
            <div className="ai-header-info">
              <div className="ai-header-title">
                <span style={{ color: '#F1F5F9', fontWeight: 700 }}>Connect</span>
                <span style={{ color: '#22D3EE', fontWeight: 800, marginLeft: 4 }}>AI</span>
              </div>
              <div className="ai-header-sub">{pageGuide ? `On: ${pageGuide.title}` : 'Powered by Connect AI'}</div>
            </div>
            <button className="ai-header-close" onClick={handleClose} aria-label="Close">
              <CloseIcon size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Page guide banner */}
          {pageGuide && (
            <button onClick={handleGuideMe} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '10px 16px 0', padding: '12px 14px',
              background: 'transparent',
              border: '1px solid rgba(34, 211, 238, 0.35)', borderRadius: 12,
              cursor: 'pointer', width: 'calc(100% - 32px)', textAlign: 'left',
              transition: 'all 0.2s ease',
            }}>
              <img src="/Icons/search.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              <div>
                <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 700 }}>Guide me on this page</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Step-by-step help for {pageGuide.title}</div>
              </div>
            </button>
          )}

          {/* Tabs */}
          <div className="ai-tabs" role="tablist">
            <button role="tab" className={`ai-tab ${tab === 'tools' ? 'active' : ''}`} onClick={() => setTab('tools')}>Tools</button>
            <button role="tab" className={`ai-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>Ask AI</button>
          </div>

          {/* Tools Tab */}
          {tab === 'tools' && (
            <div className="ai-tools-body">
              {!activeTool ? (
                <>
                  <p className="ai-section-label">Available Tools</p>
                  <div className="ai-tool-cards">
                    {tools.map(t => (
                      <button key={t.key} className="ai-tool-card" onClick={() => { setActiveTool(t); setResult(null); setInput(''); }}>
                        <div className="ai-tool-icon">
                          <img src={t.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
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
                  <button onClick={() => { setActiveTool(null); setResult(null); setInput(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    Back to tools
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div className="ai-tool-icon" style={{ width: 32, height: 32 }}>
                      <img src={activeTool.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div><div className="ai-tool-name">{activeTool.name}</div><div className="ai-tool-desc">{activeTool.desc}</div></div>
                  </div>
                  <div className="ai-input-area">
                    <p className="ai-input-label">Your Input</p>
                    <textarea className="ai-textarea" rows={4} placeholder={activeTool.placeholder} value={input} onChange={e => setInput(e.target.value)} />
                    <button className="ai-generate-btn" onClick={handleGenerate} disabled={loading || !input.trim()}>
                      {loading ? 'Generating...' : 'Generate with AI'}
                    </button>
                    {loading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        <div className="ai-shimmer" style={{ width: '80%' }} />
                        <div className="ai-shimmer" style={{ width: '60%' }} />
                        <div className="ai-shimmer" style={{ width: '70%' }} />
                      </div>
                    )}
                    {result && !loading && (<><p className="ai-section-label" style={{ marginTop: 4 }}>Result</p><ResultBlock data={result} /></>)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {tab === 'chat' && (
            <div className="ai-chat-body">
              {chatHistory.length <= 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 16px 0' }}>
                  {[
                    pageGuide && `How do I use ${pageGuide.title}?`,
                    role === 'freelancer' ? 'How do I write a good proposal?' : 'How do I post a job?',
                    role === 'freelancer' ? 'How do I get more clients?' : 'How do I find the best freelancer?',
                    'How does payment work?',
                  ].filter(Boolean).map(q => (
                    <button key={q} onClick={() => handleChat(q)}
                      style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', color: '#38bdf8', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="ai-chat-messages" ref={chatScrollRef}>
                {chatHistory.map((m, i) => (
                  <div key={i} className={`ai-msg ${m.role}`} style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                ))}
                {chatLoading && (
                  <div className="ai-typing-bubble">
                    <div className="ai-typing-dot" /><div className="ai-typing-dot" /><div className="ai-typing-dot" />
                  </div>
                )}
              </div>
              <div className="ai-chat-input-row">
                <input className="ai-chat-input" type="text" placeholder="Ask AI anything..."
                  value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()} />
                <button className="ai-send-btn" onClick={() => handleChat()} disabled={chatLoading || !chatMsg.trim()} aria-label="Send">
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
