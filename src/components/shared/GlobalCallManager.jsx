import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getSocket, connectSocket, onMeetingInvite } from '../../services/socketService';
import { callService } from '../../services/callService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';

// --- Singleton store ---------------------------------------------------------
const store = {
  state: 'idle',
  callInfo: null,
  localStream: null,
  listeners: new Set(),
  set(patch) { Object.assign(this, patch); this.listeners.forEach(fn => fn()); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  reset() {
    callService.cleanup();
    _remoteStream = null;
    _incomingCall = null;
    this.set({ state: 'idle', callInfo: null, localStream: null });
  },
};

let _incomingCall = null;
let _remoteStream = null;
let _attachedSocketId = null;
function attachListeners(socket) {
  if (!socket) { console.warn('[GCM] attachListeners called with null socket'); return; }

  // If not connected yet, wait then attach
  if (!socket.connected) {
    console.log('[GCM] Socket not connected yet, waiting for connect...');
    socket.once('connect', () => attachListeners(socket));
    return;
  }

  // Already attached to this exact socket — skip
  if (_attachedSocketId === socket.id) return;
  _attachedSocketId = socket.id;

  // Remove old listeners before attaching new ones
  socket.off('incoming-call');
  socket.off('call-accepted');
  socket.off('call-rejected');
  socket.off('call-ended');
  socket.off('ice-candidate');
  socket.off('call-unavailable');

  console.log('[GCM] Attaching call listeners to socket:', socket.id);

  const onDisconnect = () => {
    console.log('[GCM] Socket disconnected — clearing attached socket ID');
    _attachedSocketId = null;
  };
  const onReconnect = () => {
    console.log('[GCM] Socket reconnected — re-attaching call listeners');
    _attachedSocketId = null;
    // Reset any stale local call state on reconnect
    if (store.state !== 'idle') {
      console.log('[GCM] Resetting stale call state on reconnect:', store.state);
      store.reset();
    }
    // Tell backend to clear any stale call state for this socket
    socket.emit('clear-call-state');
    attachListeners(socket);
  };

  socket.off('disconnect', onDisconnect);
  socket.off('reconnect', onReconnect);
  socket.on('disconnect', onDisconnect);
  socket.on('reconnect', onReconnect);

  let _incomingCallTime = 0;

  socket.on('incoming-call', (data) => {
    console.log('[GCM] incoming-call:', data);
    if (store.state !== 'idle') {
      socket.emit('call-reject', { callerId: data.callerId });
      return;
    }
    _incomingCall = data;
    _incomingCallTime = Date.now();
    store.set({ state: 'incoming', callInfo: data });
  });

  socket.on('call-accepted', async ({ answer }) => {
    console.log('[GCM] call-accepted');
    await callService.handleAnswer(answer);
    store.set({ state: 'active' });
  });

  socket.on('call-rejected', () => {
    console.log('[GCM] call-rejected');
    toast.error('Call was declined');
    store.reset();
  });

  socket.on('call-ended', () => {
    console.log('[GCM] call-ended, current state:', store.state);
    // Ignore call-ended that arrives within 5s of incoming-call — it's a stale event
    // from the backend broadcasting end of a previous call session
    if (store.state === 'incoming') {
      const elapsed = Date.now() - _incomingCallTime;
      if (elapsed < 5000) {
        console.log('[GCM] Ignoring stale call-ended during incoming state (elapsed:', elapsed, 'ms)');
        return;
      }
    }
    if (store.state === 'active' || store.state === 'calling' || store.state === 'incoming') {
      store.reset();
    }
  });

  socket.on('ice-candidate', async ({ candidate }) => {
    await callService.handleIceCandidate(candidate);
  });

  socket.on('call-unavailable', () => {
    toast.error('User is unavailable for calls right now');
    store.reset();
  });

  // Caller cancelled before receiver answered
  socket.on('call-cancelled', ({ by }) => {
    console.log('[GCM] call-cancelled by:', by);
    if (store.state === 'incoming') {
      store.reset();
    }
  });

  callService.onRemoteStream = (stream) => {
    console.log('[GCM] remote stream arrived');
    _remoteStream = stream;
  };
}

// --- Hook ---------------------------------------------------------------------
function useCallStore() {
  const [, forceRender] = useState(0);
  useEffect(() => store.subscribe(() => forceRender(n => n + 1)), []);
  return store;
}

// --- Shared avatar with pulse rings ------------------------------------------
function CallAvatar({ avatar, name, size = 96, pulse = 'blue', rings = 3 }) {
  const colors = {
    blue:  { ring: 'rgba(59,130,246,', glow: 'rgba(37,99,235,0.35)' },
    green: { ring: 'rgba(34,197,94,',  glow: 'rgba(34,197,94,0.3)'  },
  };
  const c = colors[pulse] || colors.blue;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Ripple rings */}
      {Array.from({ length: rings }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute',
          inset: -(i + 1) * 12,
          borderRadius: '50%',
          border: `1.5px solid ${c.ring}${0.25 - i * 0.07})`,
          animation: `callRipple 2s ease-out ${i * 0.5}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}
      {/* Avatar */}
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        border: `2px solid ${c.ring}0.4)`,
        boxShadow: `0 0 32px ${c.glow}, 0 0 64px ${c.glow.replace('0.3', '0.15')}`,
        position: 'relative', zIndex: 1,
      }}>
        {avatar
          ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#93c5fd' }}>
              {(name || '?')[0].toUpperCase()}
            </div>
        }
      </div>
    </div>
  );
}

// --- Shared call backdrop -----------------------------------------------------
function CallBackdrop({ avatar }) {
  return (
    <>
      {/* Blurred avatar background */}
      {avatar && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${avatar})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.15) saturate(1.5)',
          transform: 'scale(1.1)',
        }} />
      )}
      {/* Radial gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.18) 0%, rgba(2,6,23,0.92) 60%, rgba(0,0,0,0.98) 100%)',
      }} />
      {/* Center glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300, borderRadius: '50%', zIndex: 1,
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
    </>
  );
}

// --- Incoming UI --------------------------------------------------------------
function IncomingCallUI({ call, onAccept, onReject }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}>
      <style>{`
        @keyframes callRipple { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }
        @keyframes callFadeIn { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes callWave { 0%,100%{height:8px} 50%{height:24px} }
      `}</style>

      {/* Card */}
      <div style={{
        position: 'relative', width: 320, borderRadius: 28, overflow: 'hidden', textAlign: 'center',
        background: 'linear-gradient(160deg, rgba(10,18,42,0.95) 0%, rgba(6,10,22,0.98) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        animation: 'callFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        paddingBottom: 32,
      }}>
        <CallBackdrop avatar={call.callerAvatar} />

        <div style={{ position: 'relative', zIndex: 2, paddingTop: 48 }}>
          <CallAvatar avatar={call.callerAvatar} name={call.callerName} size={96} pulse="green" rings={3} />

          <div style={{ marginTop: 24, marginBottom: 6 }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', margin: 0 }}>{call.callerName || 'Unknown'}</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
              {call.callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
            </p>
          </div>

          {/* Waveform */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 32, margin: '16px 0' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 4, background: 'rgba(34,197,94,0.6)',
                animation: `callWave 1.2s ease-in-out ${i * 0.1}s infinite`,
                height: 8,
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <button onClick={onReject}
                style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s', margin: '0 auto' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(239,68,68,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.4)'; }}>
                <PhoneOff size={24} color="#fff" />
              </button>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8, fontWeight: 500 }}>Decline</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={onAccept}
                style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', transition: 'all 0.2s', margin: '0 auto' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(34,197,94,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.4)'; }}>
                {call.callType === 'video' ? <Video size={24} color="#fff" /> : <Phone size={24} color="#fff" />}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8, fontWeight: 500 }}>Accept</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Calling UI ---------------------------------------------------------------
function CallingUI({ call, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.65)' }}>
      <div style={{
        position: 'relative', width: 300, borderRadius: 28, overflow: 'hidden', textAlign: 'center',
        background: 'linear-gradient(160deg, rgba(10,18,42,0.95) 0%, rgba(6,10,22,0.98) 100%)',
        border: '1px solid rgba(59,130,246,0.18)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        animation: 'callFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        paddingBottom: 36,
      }}>
        <CallBackdrop avatar={call.callerAvatar} />

        <div style={{ position: 'relative', zIndex: 2, paddingTop: 48 }}>
          <CallAvatar avatar={call.callerAvatar} name={call.callerName} size={96} pulse="blue" rings={3} />

          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', margin: 0 }}>{call.callerName}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              {call.callType === 'video' ? 'Video Calling' : 'Calling'}
            </p>
          </div>

          {/* Animated dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '20px 0 28px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                animation: `callBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                display: 'inline-block',
              }} />
            ))}
          </div>

          <style>{`@keyframes callBounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-8px);opacity:1}}`}</style>

          <button onClick={onCancel}
            style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s', margin: '0 auto' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
            <PhoneOff size={24} color="#fff" />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 10, fontWeight: 500 }}>Cancel</p>
        </div>
      </div>
    </div>
  );
}

// --- Active Call UI -----------------------------------------------------------
function ActiveCallUI({ call, localStream, onEnd }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connState, setConnState] = useState('connecting');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;

    const attachRemote = (stream) => {
      if (!stream) return;
      if (call.callType === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      } else if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    if (_remoteStream) {
      attachRemote(_remoteStream);
      setConnState('connected');
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }

    callService.onRemoteStream = (stream) => { _remoteStream = stream; attachRemote(stream); };
    callService.onStateChange = (s) => {
      setConnState(s);
      if (s === 'connected') {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      }
    };

    return () => {
      clearInterval(timerRef.current);
      callService.onRemoteStream = (s) => { _remoteStream = s; };
      callService.onStateChange = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (call.callType === 'video') {
    return (
      <div className={`fixed inset-0 bg-black flex flex-col ${isFullscreen ? '' : 'items-center justify-center'}`} style={{ zIndex: 99999 }}>
        <div className={`relative bg-black ${isFullscreen ? 'w-full h-full' : 'w-full max-w-3xl h-[75vh] rounded-3xl overflow-hidden shadow-2xl'}`}>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {connState !== 'connected' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
              {call.callerAvatar ? <img src={call.callerAvatar} className="w-24 h-24 rounded-full object-cover" alt="" /> : <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent text-4xl font-bold">{(call.callerName||'?')[0]}</div>}
              <p className="text-white font-semibold text-xl">{call.callerName}</p>
              <p className="text-white/50 text-sm">Connecting...</p>
              <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay:`${i*0.2}s`}}/>)}</div>
            </div>
          )}
          <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isCameraOff && <div className="absolute inset-0 bg-[#0f1015] flex items-center justify-center"><VideoOff size={20} className="text-white/40"/></div>}
          </div>
          {connState === 'connected' && <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full"><p className="text-white text-sm font-mono">{fmt(duration)}</p></div>}
          <button onClick={() => setIsFullscreen(f=>!f)} className="absolute top-4 left-1/2 -translate-x-1/2 p-2 bg-black/50 rounded-full text-white/60 hover:text-white transition">
            {isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button onClick={() => setIsMuted(callService.toggleMute())} className={`w-14 h-14 rounded-full ${isMuted?'bg-red-500/30':'bg-white/15'} backdrop-blur-sm flex items-center justify-center text-white transition hover:scale-105`}>
              {isMuted ? <MicOff size={22}/> : <Mic size={22}/>}
            </button>
            <button onClick={onEnd} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white transition hover:scale-105 shadow-lg">
              <PhoneOff size={22}/>
            </button>
            <button onClick={() => setIsCameraOff(callService.toggleCamera())} className={`w-14 h-14 rounded-full ${isCameraOff?'bg-red-500/30':'bg-white/15'} backdrop-blur-sm flex items-center justify-center text-white transition hover:scale-105`}>
              {isCameraOff ? <VideoOff size={22}/> : <Video size={22}/>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.65)' }}>
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      <div style={{
        position: 'relative', width: 300, borderRadius: 28, overflow: 'hidden', textAlign: 'center',
        background: 'linear-gradient(160deg, rgba(10,18,42,0.95) 0%, rgba(6,10,22,0.98) 100%)',
        border: `1px solid ${connState === 'connected' ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.18)'}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        animation: 'callFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        paddingBottom: 36,
        transition: 'border-color 0.5s ease',
      }}>
        <CallBackdrop avatar={call.callerAvatar} />
        <div style={{ position: 'relative', zIndex: 2, paddingTop: 48 }}>
          <CallAvatar avatar={call.callerAvatar} name={call.callerName} size={96} pulse={connState === 'connected' ? 'green' : 'blue'} rings={connState === 'connected' ? 2 : 3} />
          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', margin: 0 }}>{call.callerName}</h3>
            <p style={{ fontSize: 14, marginTop: 8, fontWeight: 600, letterSpacing: '0.04em', color: connState === 'connected' ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
              {connState === 'connected' ? fmt(duration) : 'Connecting...'}
            </p>
          </div>
          {/* Waveform when connected */}
          {connState === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 32, margin: '16px 0' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ width: 3, borderRadius: 4, background: 'rgba(74,222,128,0.7)', animation: `callWave 1s ease-in-out ${i * 0.1}s infinite`, height: 8 }} />
              ))}
            </div>
          )}
          {connState !== 'connected' && <div style={{ height: 32, margin: '16px 0' }} />}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <button onClick={() => setIsMuted(callService.toggleMute())}
              style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', transition: 'all 0.2s', color: isMuted ? '#f87171' : '#fff' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={onEnd}
              style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(239,68,68,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.4)'; }}>
              <PhoneOff size={22} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Meeting Invite Banner ----------------------------------------------------
function MeetingInviteBanner({ invite, onJoin, onDismiss }) {
  return createPortal(
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 99998,
      width: 320, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(160deg, rgba(10,18,42,0.97) 0%, rgba(6,10,22,0.99) 100%)',
      border: '1px solid rgba(59,130,246,0.25)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      animation: 'callFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)',
      padding: '20px 20px 16px',
    }}>
      <style>{`@keyframes callFadeIn{from{opacity:0;transform:translateY(-12px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 2px' }}>Meeting Invite</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{invite.title || 'Meeting'}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>from {invite.hostName || 'Someone'}</p>
        </div>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, lineHeight: 1 }}>?</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onDismiss} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Decline
        </button>
        <button onClick={onJoin} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
          Join Now
        </button>
      </div>
    </div>,
    document.body
  );
}

// --- Main Component -----------------------------------------------------------
const GlobalCallManager = () => {
  const { state, callInfo, localStream } = useCallStore();
  const navigate = useNavigate();
  const [meetingInvite, setMeetingInvite] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const socket = await connectSocket();
      attachListeners(socket);
    };
    init();

    // Listen for meeting invites
    const unsubInvite = onMeetingInvite((invite) => {
      console.log('[GCM] meeting-invite received:', invite);
      // Normalize field names from backend
      const normalized = {
        ...invite,
        meetingId: invite.meetingId || invite.meeting_id || invite.id,
        title: invite.title || invite.meeting_title || 'Meeting Invitation',
        hostName: invite.hostName || invite.host_name || invite.from || 'Someone',
      };
      setMeetingInvite(normalized);
    });

    window.__startCall = async (targetUserId, callType, targetName, targetAvatar, conversationId = null) => {
      // Clear any stale state before starting
      if (store.state !== 'idle') {
        console.log('[GCM] Clearing stale state before new call:', store.state);
        store.reset();
        getSocket()?.emit('clear-call-state');
        await new Promise(r => setTimeout(r, 100));
      }

      const sock = getSocket();
      if (!sock?.connected) {
        toast.error('Not connected to server. Please refresh and try again.');
        return;
      }
      if (!targetUserId) {
        toast.error('Cannot start call: missing user ID.');
        return;
      }

      try {
        // Set state FIRST so UI appears immediately
        store.set({
          state: 'calling',
          callInfo: { callerId: targetUserId, callType, callerName: targetName, callerAvatar: targetAvatar, conversationId }
        });
        const stream = await callService.startCall(targetUserId, callType);
        store.set({ localStream: stream });
      } catch (err) {
        console.error('[GCM] startCall error:', err);
        if (err.name === 'NotAllowedError') toast.error('Please allow microphone/camera access');
        else if (err.name === 'NotFoundError') toast.error('No microphone/camera found');
        else toast.error('Could not start call: ' + err.message);
        store.reset();
      }
    };

    window.__resetCall = () => { store.reset(); };

    return () => { unsubInvite(); };
  }, []);

  const handleAccept = async () => {
    if (!_incomingCall) return;
    try {
      const stream = await callService.acceptCall(_incomingCall.callerId, _incomingCall.offer, _incomingCall.callType);
      store.set({ state: 'active', localStream: stream });
      console.log('[GCM] Call accepted, waiting for ICE connection...');
    } catch (err) {
      console.error('[GCM] acceptCall error:', err);
      if (err.name === 'NotAllowedError') toast.error('Please allow microphone/camera access');
      else toast.error('Could not accept call: ' + err.message);
      getSocket()?.emit('call-reject', { callerId: _incomingCall.callerId });
      store.reset();
    }
  };

  const handleReject = () => {
    if (_incomingCall) getSocket()?.emit('call-reject', {
      callerId: _incomingCall.callerId,
      callType: _incomingCall.callType,
      conversationId: _incomingCall.conversationId || store.callInfo?.conversationId || null,
    });
    store.reset();
  };

  const handleEnd = () => {
    const dur = callService.callStartTime ? Math.floor((Date.now() - callService.callStartTime) / 1000) : 0;
    const conversationId = store.callInfo?.conversationId || null;
    callService.endCall(dur, conversationId);
    store.reset();
  };

  if (state === 'idle' && !meetingInvite) return null;

  return createPortal(
    <>
      {meetingInvite && (
        <MeetingInviteBanner
          invite={meetingInvite}
          onJoin={() => { navigate(`/meeting/${meetingInvite.meetingId}`); setMeetingInvite(null); }}
          onDismiss={() => setMeetingInvite(null)}
        />
      )}
      {state === 'incoming' && callInfo && <IncomingCallUI call={callInfo} onAccept={handleAccept} onReject={handleReject} />}
      {state === 'calling' && callInfo && <CallingUI call={callInfo} onCancel={handleEnd} />}
      {state === 'active' && callInfo && <ActiveCallUI call={callInfo} localStream={localStream} onEnd={handleEnd} />}
    </>,
    document.body
  );
};

export default GlobalCallManager;






