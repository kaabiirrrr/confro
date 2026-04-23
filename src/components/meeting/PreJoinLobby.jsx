import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Loader2, AlertTriangle, CheckCircle, Sun } from 'lucide-react';

const CSS = `
@keyframes pj-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pj-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
@keyframes pj-wave { 0%,100%{height:3px} 50%{height:18px} }
@keyframes pj-spin { to{transform:rotate(360deg)} }
`;

// Detect average brightness from video frame
function detectBrightness(videoEl) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 36;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, 64, 36);
    const data = ctx.getImageData(0, 0, 64, 36).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
    }
    return sum / (data.length / 4);
  } catch { return 128; }
}

export default function PreJoinLobby({ meetingTitle, displayName, avatar, onJoin, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const brightnessRef = useRef(null);

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camAllowed, setCamAllowed] = useState(null);
  const [micBars, setMicBars] = useState(Array(7).fill(3));
  const [brightness, setBrightness] = useState(128); // 0-255
  const [joining, setJoining] = useState(false);

  // Quality derived from brightness
  const lightQuality = brightness > 100 ? 'good' : brightness > 55 ? 'medium' : 'poor';
  const lightLabel = { good: '🟢 Good lighting', medium: '🟡 Low light', poor: '🔴 Poor lighting' }[lightQuality];
  const lightColor = { good: '#4ade80', medium: '#fbbf24', poor: '#f87171' }[lightQuality];

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }
        setCamAllowed(true);

        // Mic analyser
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const step = Math.floor(data.length / 7);
          setMicBars(Array.from({length:7}, (_,i) => Math.max(3, Math.round((data[i*step]/255)*20))));
          animRef.current = requestAnimationFrame(tick);
        };
        tick();

        // Brightness check every 2s
        brightnessRef.current = setInterval(() => {
          if (videoRef.current) setBrightness(detectBrightness(videoRef.current));
        }, 2000);

      } catch { setCamAllowed(false); }
    })();

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(brightnessRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !camOn; });
    setCamOn(v => !v);
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(v => !v);
  };

  const handleJoin = () => {
    setJoining(true);
    // Stop preview stream — Agora will claim devices
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animRef.current);
    clearInterval(brightnessRef.current);
    onJoin({ micOn, camOn });
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', background:'#020617', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter',-apple-system,sans-serif" }}>
        <div style={{ width:'100%', maxWidth:900, display:'grid', gridTemplateColumns:'1fr 380px', gap:24, animation:'pj-in .5s ease both' }}>

          {/* ── Left: Camera preview ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Video */}
            <div style={{ position:'relative', borderRadius:20, overflow:'hidden', background:'#0d1117', aspectRatio:'16/9' }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width:'100%', height:'100%', objectFit:'cover', display: camOn && camAllowed ? 'block' : 'none', transform:'scaleX(-1)',
                  filter: lightQuality === 'poor' ? 'brightness(1.4) contrast(1.1)' : lightQuality === 'medium' ? 'brightness(1.15)' : 'none',
                }}/>

              {/* Camera off / no permission */}
              {(!camOn || camAllowed === false) && (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
                  {avatar
                    ? <img src={avatar} alt={displayName} style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,.1)' }}/>
                    : <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a8a,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#93c5fd' }}>
                        {displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                  <span style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>{camAllowed === false ? 'Camera blocked' : 'Camera off'}</span>
                </div>
              )}

              {/* Pending */}
              {camAllowed === null && (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, background:'#0d1117' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#60a5fa', animation:'pj-pulse 1s ease-in-out infinite' }}/>
                  <span style={{ color:'rgba(255,255,255,.35)', fontSize:13 }}>Requesting camera access...</span>
                </div>
              )}

              {/* Cinematic gradient overlay */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.5) 100%)', pointerEvents:'none', zIndex:1 }}/>

              {/* Name tag */}
              <div style={{ position:'absolute', bottom:14, left:14, zIndex:2, padding:'5px 12px', borderRadius:8, background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)', color:'rgba(255,255,255,.9)', fontSize:13, fontWeight:600 }}>
                {displayName}
              </div>

              {/* Light quality badge */}
              {camOn && camAllowed && (
                <div style={{ position:'absolute', top:14, right:14, zIndex:2, display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:100, background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)' }}>
                  <Sun size={12} style={{ color: lightColor }}/>
                  <span style={{ color: lightColor, fontSize:11, fontWeight:700 }}>{lightLabel}</span>
                </div>
              )}
            </div>

            {/* Low light warning */}
            {camOn && camAllowed && lightQuality !== 'good' && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:14, background:'rgba(251,191,36,.07)', border:'1px solid rgba(251,191,36,.2)' }}>
                <AlertTriangle size={15} style={{ color:'#fbbf24', flexShrink:0, marginTop:1 }}/>
                <div>
                  <p style={{ color:'#fbbf24', fontSize:13, fontWeight:600, margin:'0 0 4px' }}>
                    {lightQuality === 'poor' ? 'Poor lighting detected' : 'Low light detected'}
                  </p>
                  <p style={{ color:'rgba(255,255,255,.4)', fontSize:12, margin:0, lineHeight:1.5 }}>
                    Face a light source · Avoid backlight · Move to a brighter area
                  </p>
                </div>
              </div>
            )}

            {/* Good light confirmation */}
            {camOn && camAllowed && lightQuality === 'good' && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:14, background:'rgba(74,222,128,.06)', border:'1px solid rgba(74,222,128,.15)' }}>
                <CheckCircle size={14} style={{ color:'#4ade80' }}/>
                <span style={{ color:'rgba(255,255,255,.5)', fontSize:12 }}>Lighting looks great — you're ready to join</span>
              </div>
            )}

            {/* Mic waveform */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
              <Mic size={14} style={{ color: micOn ? '#60a5fa' : 'rgba(255,255,255,.2)', flexShrink:0 }}/>
              <div style={{ display:'flex', alignItems:'flex-end', gap:2.5, flex:1 }}>
                {micBars.map((h,i) => (
                  <div key={i} style={{ width:3, borderRadius:2, background: micOn ? 'rgba(99,102,241,.8)' : 'rgba(255,255,255,.1)', height: micOn ? h : 3, transition:'height .08s ease', animation: micOn ? undefined : `pj-wave ${.7+i*.1}s ease-in-out ${i*.08}s infinite` }}/>
                ))}
              </div>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>{micOn ? 'Mic active' : 'Muted'}</span>
            </div>

            {/* Cam / Mic toggles */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={toggleCam} style={{ flex:1, height:44, borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, fontWeight:600, transition:'all .2s', background: camOn ? 'rgba(255,255,255,.08)' : 'rgba(239,68,68,.15)', color: camOn ? 'rgba(255,255,255,.7)' : '#f87171', border: camOn ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(239,68,68,.3)' }}>
                {camOn ? <Video size={15}/> : <VideoOff size={15}/>}
                {camOn ? 'Camera on' : 'Camera off'}
              </button>
              <button onClick={toggleMic} style={{ flex:1, height:44, borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, fontWeight:600, transition:'all .2s', background: micOn ? 'rgba(255,255,255,.08)' : 'rgba(239,68,68,.15)', color: micOn ? 'rgba(255,255,255,.7)' : '#f87171', border: micOn ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(239,68,68,.3)' }}>
                {micOn ? <Mic size={15}/> : <MicOff size={15}/>}
                {micOn ? 'Mic on' : 'Muted'}
              </button>
            </div>
          </div>

          {/* ── Right: Join card ── */}
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:20 }}>
            <div style={{ background:'linear-gradient(145deg,rgba(28,38,56,.9),rgba(13,19,35,.95))', border:'1px solid rgba(255,255,255,.09)', borderRadius:24, padding:'32px 28px', boxShadow:'0 24px 64px rgba(0,0,0,.6), inset 0 1px rgba(255,255,255,.06)' }}>

              <div style={{ marginBottom:24 }}>
                <p style={{ color:'rgba(255,255,255,.35)', fontSize:12, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', margin:'0 0 6px' }}>You're about to join</p>
                <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 4px', letterSpacing:'-.02em' }}>{meetingTitle || 'Meeting'}</h2>
                <p style={{ color:'rgba(255,255,255,.35)', fontSize:13, margin:0 }}>as {displayName}</p>
              </div>

              {/* Status checks */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                {[
                  { label:'Camera', ok: camOn && camAllowed, icon:<Video size={13}/> },
                  { label:'Microphone', ok: micOn, icon:<Mic size={13}/> },
                  { label:'Lighting', ok: lightQuality !== 'poor', icon:<Sun size={13}/> },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, background:'rgba(255,255,255,.04)' }}>
                    <span style={{ color: s.ok ? '#4ade80' : '#f87171' }}>{s.icon}</span>
                    <span style={{ color:'rgba(255,255,255,.6)', fontSize:13, flex:1 }}>{s.label}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: s.ok ? '#4ade80' : '#f87171' }}>{s.ok ? 'Ready' : 'Check'}</span>
                  </div>
                ))}
              </div>

              {/* Join button */}
              <button onClick={handleJoin} disabled={joining}
                style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor: joining ? 'not-allowed' : 'pointer', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 32px rgba(37,99,235,.5)', transition:'all .2s', opacity: joining ? .7 : 1 }}
                onMouseEnter={e => { if(!joining) e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; }}>
                {joining ? <><Loader2 size={17} style={{ animation:'pj-spin .7s linear infinite' }}/> Joining...</> : <><Video size={17}/> Join Meeting</>}
              </button>

              <button onClick={onCancel} style={{ width:'100%', marginTop:10, height:40, borderRadius:12, border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'rgba(255,255,255,.35)', fontSize:13, cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.7)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.35)'}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
