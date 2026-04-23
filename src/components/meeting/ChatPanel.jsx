import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function ChatPanel({ onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: currentUser?.name || 'You',
      text: trimmed,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      self: true,
    }]);
    setText('');
  };

  // Expose addMessage for socket integration
  ChatPanel.addRemoteMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      self: false,
    }]);
  };

  return (
    <div className="flex flex-col w-72 shrink-0"
      style={{ background: 'rgba(8,14,30,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-white font-semibold text-sm">Meeting Chat</span>
        <button onClick={onClose} className="text-white/30 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-white/20 text-xs text-center mt-8">No messages yet</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.self ? 'items-end' : 'items-start'}`}>
            <span className="text-white/30 text-[10px] mb-1">{m.self ? 'You' : m.sender} · {m.time}</span>
            <div className="px-3 py-2 rounded-2xl text-sm max-w-[90%] break-words"
              style={{
                background: m.self ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.07)',
                color: m.self ? '#93c5fd' : 'rgba(255,255,255,0.85)',
                borderRadius: m.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 shrink-0 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Message..."
          className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
        />
        <button onClick={send} disabled={!text.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition active:scale-95"
          style={{ background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <Send size={14} className="text-blue-400" />
        </button>
      </div>
    </div>
  );
}
