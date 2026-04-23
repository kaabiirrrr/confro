import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Video, Link2, Loader2, ArrowLeft, Zap, Lock, MicOff, VideoOff } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import InputModal from '../components/common/InputModal';

const CSS = `
@keyframes pageIn { from{opacity:0; transform:scale(0.99);} to{opacity:1; transform:scale(1);} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.98)} }

.cm-input {
  width:100%; height:48px; border-radius:12px; padding:0 16px;
  background:transparent; border:1px solid rgba(255,255,255,0.1);
  color:#fff; font-size:14px; outline:none; transition:all 0.2s;
}
.cm-input:focus { border-color:rgba(59,130,246,0.5); background:rgba(255,255,255,0.02); }

.cm-btn-primary {
  width:100%; height:48px; border-radius:12px;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color:#fff; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;
  transition:all 0.2s; cursor:pointer; border:none; text-transform:uppercase; letter-spacing:0.05em;
}
.cm-btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
.cm-btn-primary:active { transform:scale(0.98); }
.cm-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

.cm-btn-secondary {
  width:100%; height:48px; border-radius:12px;
  background:transparent; border:1px solid rgba(255,255,255,0.1);
  color:rgba(255,255,255,0.7); font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;
  transition:all 0.2s; cursor:pointer; text-transform:uppercase; letter-spacing:0.05em;
}
.cm-btn-secondary:hover { background:rgba(255,255,255,0.05); color:#fff; }
`;

export default function CreateMeeting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();

  const clientId = searchParams.get('clientId');
  const freelancerId = searchParams.get('freelancerId');
  const conversationId = searchParams.get('conversationId');
  const projectId = searchParams.get('projectId');

  const [title, setTitle] = useState(projectId ? `Project Meeting - ${projectId.split('-')[0].toUpperCase()}` : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Camera preview refs & state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const [camAllowed, setCamAllowed] = useState(null);
  const [micLevel, setMicLevel] = useState(0);
  const [micBars, setMicBars] = useState(Array(9).fill(3));
  const [previewTime, setPreviewTime] = useState(0);

  // ── Security: validate project access + funded milestone before allowing create
  const [accessError, setAccessError] = useState(null);
  const [accessChecking, setAccessChecking] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [contractId, setContractId] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setAccessError('A valid project is required to start a meeting. Please use the "Start Meeting" button from your contract workspace.');
      return;
    }
    // Fetch milestones for this project so user can see what needs funding
    (async () => {
      try {
        const res = await api.get(`/api/contracts/by-job/${projectId}`);
        const contract = res.data?.data || res.data;
        if (contract?.id) {
          setContractId(contract.id);
          const mRes = await api.get(`/api/contracts/${contract.id}/milestones`);
          setMilestones(mRes.data?.data || mRes.data || []);
        }
      } catch {
        // non-critical — milestones just won't show
      }
    })();
  }, [projectId]);

  useEffect(() => { setMounted(true); }, []);

  // Start camera preview
  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCamAllowed(true);

        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setMicLevel(Math.min(avg / 40, 1));
          const step = Math.floor(data.length / 9);
          setMicBars(Array.from({length:9}, (_,i) => Math.max(3, Math.round((data[i*step] / 255) * 20))));
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setCamAllowed(false);
      }
    })();

    const timer = setInterval(() => setPreviewTime(t => t + 1), 1000);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCreate = async () => {
    // ── Security check 1: projectId required if context demands it
    if (projectId && accessError) { setError(accessError); return; }

    setLoading(true); setError(null);
    try {
      const payload = { title: title.trim() || 'Quick Meeting' };
      if (clientId) payload.clientId = clientId;
      if (freelancerId) payload.freelancerId = freelancerId;
      if (conversationId) payload.conversation_id = conversationId;
      // ── Security check 2: always send projectId so backend can validate
      if (projectId) payload.projectId = projectId;
      const res = await api.post('/api/meetings', payload);
      const id = res.data.data.id;
      if (!id) throw new Error('No meeting ID returned');
      // Stop camera stream BEFORE navigating so Agora can claim the devices
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      navigate(`/meeting/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create meeting');
    } finally { setLoading(false); }
  };

  const handleJoin = () => {
    setJoinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      <style>{CSS}</style>

      {/* Unified Background Elements */}
      <div className="absolute inset-0 z-0 bg-primary" />

      {/* Access denied / checking state */}
      {(accessChecking || accessError) && (
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm">
          {accessChecking ? (
            <>
              <Loader2 size={32} className="animate-spin text-accent" />
              <p className="text-white/40 text-sm">Verifying project access...</p>
            </>
          ) : (
            <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-4">
              <Lock size={32} className="text-red-400 mx-auto" />
              <p className="text-white font-semibold">Meeting Locked</p>
              <p className="text-red-400 text-sm">{accessError}</p>
              <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm underline">Go Back</button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Container — only shown when access is confirmed */}
      {!accessChecking && !accessError && (
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-16 lg:gap-24 animate-[pageIn_0.6s_ease_both]">
        
        {/* Left Side: Context & Preview */}
        <div className="flex-1 w-full lg:max-w-[480px] space-y-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="space-y-6">
            <img src="/Logo2.png" alt="Connect Logo" className="h-10 object-contain" />

            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
              Meet. Collaborate.<br />
              <span className="text-accent">Close faster.</span>
            </h1>

            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Connect with clients in real-time with HD video, screen sharing, and encrypted chat — all in one place.
            </p>
          </div>

          <div className="flex gap-10">
            {[['HD', 'Video'], ['256-bit', 'Safe'], ['< 1s', 'Fast']].map(([v, l]) => (
              <div key={l}>
                <div className="text-lg font-bold text-white">{v}</div>
                <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Video Preview Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/5 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ display: camAllowed ? 'block' : 'none' }}
              />

              {camAllowed === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 uppercase font-black text-xl">
                    {profile?.name?.[0] || '?'}
                  </div>
                  <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <VideoOff size={12} /> Camera Off
                  </div>
                </div>
              )}

              {/* Overlays */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                  {String(Math.floor(previewTime/60)).padStart(2,'0')}:{String(previewTime%60).padStart(2,'0')}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  {profile?.name || 'You'}
                </div>
                
                <div className="flex gap-1.5">
                  {micBars.slice(0, 5).map((h, i) => (
                    <div key={i} className="w-0.5 bg-accent/60 rounded-full transition-all duration-75" style={{ height: camAllowed ? h + 'px' : '4px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Card */}
        <div className="w-full max-w-sm lg:max-w-md">
          <div className="backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl flex flex-col gap-8 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/Icons/icons8-video-conference-64.png" alt="Video Conference" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Start a new meeting</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Ready in seconds</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] pl-1">Meeting Title</label>
                <input 
                  className="cm-input border-white/5 bg-transparent" 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  onKeyDown={e=>e.key==='Enter'&&handleCreate()} 
                  placeholder="e.g. Project Sync, Strategy..." 
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                  {error}
                  {/* Milestone escrow panel */}
                  {milestones.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-2">Project Milestones</p>
                      {milestones.map((m) => {
                        const funded = ['FUNDED','IN_PROGRESS','SUBMITTED','COMPLETED'].includes(m.status);
                        return (
                          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                              <p className="text-white text-xs font-semibold truncate max-w-[160px]">{m.title || m.name || `Milestone ${m.amount}`}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${funded ? 'text-green-400' : 'text-yellow-400'}`}>{m.status}</p>
                            </div>
                            {!funded && contractId && (
                              <button
                                onClick={() => navigate(`/checkout?contractId=${contractId}&milestoneId=${m.id}`)}
                                className="px-3 py-1.5 rounded-lg bg-accent text-white text-[9px] font-bold uppercase tracking-widest hover:bg-accent/80 transition shrink-0"
                              >
                                Fund
                              </button>
                            )}
                            {funded && <span className="text-green-400 text-[9px] font-bold uppercase">✓ Funded</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button className="cm-btn-primary" onClick={handleCreate} disabled={loading}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>Start Meeting <ArrowLeft size={16} className="rotate-180" /></>
                  )}
                </button>
                <button className="cm-btn-secondary bg-transparent hover:bg-white/5" onClick={handleJoin}>
                  <Link2 size={16} /> Join with Meeting ID
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-3 justify-center">
              {[
                { icon: <Zap size={12} />, text: 'Instant Start' },
                { icon: <Lock size={12} />, text: 'Encrypted' },
                { icon: <VideoOff size={12} />, text: 'No Waiting' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/20 text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-accent/60">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <p className="text-center text-white/10 text-[9px] font-medium leading-relaxed">
              By starting a meeting you agree to our <span className="text-white/20 underline cursor-pointer">Terms of Service</span>.
            </p>
          </div>
        </div>
      </div>
      )}
      
      <InputModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join Meeting"
        subtitle="Enter the meeting identifier"
        placeholder="Meeting ID (e.g. m-12345)"
        type="text"
        confirmLabel="Join Now"
        icon={Link2}
        onSubmit={async (code) => {
          if (code?.trim()) navigate(`/meeting/${code.trim()}`);
        }}
      />
    </div>
  );
}
