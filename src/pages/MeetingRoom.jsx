import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, Users, MessageSquare, Copy, Check,
  Circle, Square, Loader2
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantsPanel from '../components/meeting/ParticipantsPanel';
import PreJoinLobby from '../components/meeting/PreJoinLobby';

AgoraRTC.setLogLevel(4);

// ── Video Tile ────────────────────────────────────────────────────────────────
function VideoTile({ id, name, avatar, micOn = true, camOn = true, isLocal }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0d1117', minHeight: 200, height: '100%' }}>
      <div id={id} style={{ width: '100%', height: '100%', minHeight: 200, position: 'absolute', inset: 0 }} />

      {/* Camera off overlay */}
      {!camOn && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'linear-gradient(135deg,#0d1117,#111827)', zIndex: 1 }}>
          {avatar
            ? <img src={avatar} alt={name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.1)' }} />
            : <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#93c5fd' }}>
                {name?.[0]?.toUpperCase() || '?'}
              </div>
          }
          <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>{name}</span>
        </div>
      )}

      {/* Name tag */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,.9)', fontSize: 12, fontWeight: 500 }}>
          {!micOn && <MicOff size={10} style={{ color: '#f87171' }} />}
          {name}{isLocal && ' (You)'}
        </div>
      </div>
    </div>
  );
}

// ── Control Button ────────────────────────────────────────────────────────────
function CtrlBtn({ onClick, active, danger, disabled, title, label, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="flex flex-col items-center gap-1.5 group disabled:opacity-40 focus:outline-none">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
        style={{
          background: danger ? 'rgba(239,68,68,0.15)' : active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
        }}>
        {children}
      </div>
      {label && <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MeetingRoom() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const clientRef = useRef(null);
  const joinedRef = useRef(false);
  const micTrackRef = useRef(null);
  const camTrackRef = useRef(null);
  const screenTrackRef = useRef(null);

  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [camReady, setCamReady] = useState(false);
  const [showLobby, setShowLobby] = useState(true); // show pre-join screen first
  const [lobbyPrefs, setLobbyPrefs] = useState({ micOn: true, camOn: true });

  const [remoteUsers, setRemoteUsers] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  // Play local cam after DOM renders
  useEffect(() => {
    if (!camReady || !camTrackRef.current) return;
    camTrackRef.current.play('local-video');
  }, [camReady]);

  // Meeting timer
  useEffect(() => {
    if (!loading && meeting?.status !== 'ended') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, meeting?.status]);

  const fmtDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const leave = useCallback(async (endForAll = false) => {
    clearInterval(timerRef.current);
    if (endForAll) await api.post(`/api/meetings/${id}/end`).catch(() => {});
    micTrackRef.current?.close();
    camTrackRef.current?.close();
    screenTrackRef.current?.close();
    if (clientRef.current && joinedRef.current) {
      await clientRef.current.leave().catch(() => {});
    }
    clientRef.current = null;
    joinedRef.current = false;
    navigate(-1);
  }, [id, navigate]);

  useEffect(() => {
    let cancelled = false;

    const joinMeeting = async () => {
      try {
        const meetRes = await api.get(`/api/meetings/${id}`);
        const mtg = meetRes.data.data;
        if (cancelled) return;

        if (mtg.status === 'ended') { setMeeting(mtg); setLoading(false); return; }
        if (!mtg?.room_id) { setError('Meeting room not configured.'); setLoading(false); return; }

        setMeeting(mtg);
        setParticipants(mtg.participant_profiles || []);
        // Don't join Agora yet — wait for lobby confirmation
        setLoading(false);
      } catch (err) {
        if (!cancelled) { setError(err.response?.data?.message || err.message || 'Meeting not found'); setLoading(false); }
      }
    };

    joinMeeting();
    return () => { cancelled = true; };
  }, [id]);

  // Called when user clicks "Join Meeting" in the lobby
  const handleLobbyJoin = useCallback(async (prefs) => {
    setLobbyPrefs(prefs);
    setShowLobby(false);
    setLoading(true);
    setMicOn(prefs.micOn);
    setCamOn(prefs.camOn);

    try {
      api.post(`/api/meetings/${id}/start`).catch(() => {});

      const tokenRes = await api.get(`/api/meetings/${id}/token`);
      const { token, uid, appId, channelName } = tokenRes.data?.data || {};
      if (!channelName || !appId || !token) { setError('Could not get meeting credentials.'); setLoading(false); return; }

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => prev.find(u => u.uid === remoteUser.uid) ? prev : [...prev, remoteUser]);
          setTimeout(() => remoteUser.videoTrack?.play(`remote-${remoteUser.uid}`), 150);
        }
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });
      client.on('user-unpublished', (remoteUser, mediaType) => {
        if (mediaType === 'video') setRemoteUsers(prev => prev.map(u => u.uid === remoteUser.uid ? { ...u, videoTrack: null } : u));
        if (mediaType === 'audio') setRemoteUsers(prev => prev.map(u => u.uid === remoteUser.uid ? { ...u, _audioMuted: true } : u));
      });
      client.on('user-left', (remoteUser) => setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid)));

      await client.join(appId, channelName, token, uid);
      joinedRef.current = true;

      // HD video constraints
      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { ANS: true, AEC: true },
        { encoderConfig: { width: 1280, height: 720, frameRate: 30, bitrateMin: 400, bitrateMax: 1500 } }
      );
      micTrackRef.current = micTrack;
      camTrackRef.current = camTrack;

      // Apply lobby prefs
      if (!prefs.micOn) await micTrack.setEnabled(false);
      if (!prefs.camOn) await camTrack.setEnabled(false);

      await client.publish([micTrack, camTrack]);
      setLoading(false);
      setCamReady(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join meeting');
      setLoading(false);
    }
  }, [id]);

  const toggleMic = async () => {
    if (!micTrackRef.current) return;
    await micTrackRef.current.setEnabled(!micOn);
    setMicOn(v => !v);
  };

  const toggleCam = async () => {
    if (!camTrackRef.current) return;
    await camTrackRef.current.setEnabled(!camOn);
    setCamOn(v => !v);
  };

  const toggleScreen = async () => {
    const client = clientRef.current;
    if (!client) return;
    if (screenSharing) {
      screenTrackRef.current?.close();
      screenTrackRef.current = null;
      if (camTrackRef.current) {
        await client.unpublish();
        await client.publish([micTrackRef.current, camTrackRef.current]);
        camTrackRef.current.play('local-video');
      }
      setScreenSharing(false);
    } else {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        screenTrackRef.current = screenTrack;
        await client.unpublish([camTrackRef.current]);
        await client.publish([screenTrack]);
        screenTrack.play('local-video');
        setScreenSharing(true);
        screenTrack.on('track-ended', async () => {
          await client.unpublish([screenTrack]);
          screenTrack.close();
          screenTrackRef.current = null;
          await client.publish([camTrackRef.current]);
          camTrackRef.current.play('local-video');
          setScreenSharing(false);
        });
      } catch (err) {
        if (err.code !== 'PERMISSION_DENIED') console.error('[Screen]', err);
      }
    }
  };

  const toggleRecording = async () => {
    setRecordingLoading(true);
    try {
      if (recording) {
        const { data } = await api.post(`/api/meetings/${id}/recording/stop`);
        setRecording(false);
        if (data?.data?.playbackUrl) setPlaybackUrl(data.data.playbackUrl);
      } else {
        await api.post(`/api/meetings/${id}/recording/start`);
        setRecording(true);
        setPlaybackUrl(null);
      }
    } catch { /* silent */ }
    finally { setRecordingLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (userId) => {
    await api.post(`/api/meetings/${id}/invite`, { userId }).catch(() => {});
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'You';
  const isHost = meeting?.host_id === user?.id;
  const totalCount = remoteUsers.length + 1;

  // ── Grid layout ──────────────────────────────────────────────────────────
  const gridCols = remoteUsers.length === 0 ? '1fr'
    : remoteUsers.length === 1 ? '1fr 1fr'
    : remoteUsers.length <= 3 ? 'repeat(2, 1fr)'
    : 'repeat(3, 1fr)';

  // ── Pre-join lobby ────────────────────────────────────────────────────────
  if (showLobby && !error) return (
    <PreJoinLobby
      meetingTitle={meeting?.title || 'Meeting'}
      displayName={displayName}
      avatar={profile?.avatar_url}
      onJoin={handleLobbyJoin}
      onCancel={() => navigate(-1)}
    />
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#080e1e' }}>
      <div className="text-center space-y-4 p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <PhoneOff size={28} className="text-red-400" />
        </div>
        <p className="text-white font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline text-sm">Go Back</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#080e1e' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>
          <Video size={28} color="#fff" />
        </div>
        <Loader2 size={24} className="animate-spin text-blue-400" />
        <p className="text-white/40 text-sm">Joining meeting...</p>
      </div>
    </div>
  );

  if (meeting?.status === 'ended') return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#080e1e' }}>
      <div className="text-center space-y-4 p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-white/60 text-xl font-semibold">Meeting ended</p>
        {playbackUrl && <a href={playbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm block">View recording →</a>}
        <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm">Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080e1e', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 56, background: 'rgba(8,14,30,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Left — title + status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
            <Video size={14} color="#fff" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">{meeting?.title || 'Meeting'}</p>
            <p className="text-white/30 text-[11px] mt-0.5">{fmtDuration(duration)}</p>
          </div>
          {recording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ml-2"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> REC
            </div>
          )}
          {screenSharing && (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.25)', color: '#fbbf24' }}>
              Sharing screen
            </div>
          )}
        </div>

        {/* Right — participant count + copy link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Users size={13} />
            <span>{totalCount}</span>
          </div>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Invite</>}
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0">

        {/* Video area — PiP layout when remote users present */}
        <div className="flex-1 min-w-0 p-3 relative" style={{ minHeight: 0 }}>
          {remoteUsers.length === 0 ? (
            /* Solo — full grid */
            <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr', gridAutoRows: '1fr', gap: 8 }}>
              <VideoTile id="local-video" name={displayName} avatar={profile?.avatar_url} micOn={micOn} camOn={camOn && !screenSharing} isLocal />
            </div>
          ) : (
            /* Remote users fill the space, self-view is PiP */
            <>
              <div style={{ height: '100%', display: 'grid', gap: 8, gridTemplateColumns: remoteUsers.length === 1 ? '1fr' : remoteUsers.length <= 3 ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gridAutoRows: '1fr' }}>
                {remoteUsers.map(u => {
                  const prof = participants.find(p => String(p.agora_uid) === String(u.uid));
                  return (
                    <VideoTile key={u.uid} id={`remote-${u.uid}`} name={prof?.name || 'Participant'} avatar={prof?.avatar_url} micOn={!u._audioMuted} camOn={!!u.videoTrack} />
                  );
                })}
              </div>

              {/* Self-view PiP — bottom right corner */}
              <div style={{
                position: 'absolute', bottom: 24, right: 24, width: 180, height: 120,
                borderRadius: 14, overflow: 'hidden', zIndex: 10,
                border: '2px solid rgba(255,255,255,.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,.6)',
                background: '#0d1117',
                cursor: 'pointer',
              }}>
                <div id="local-video" style={{ width: '100%', height: '100%' }} />
                {(!camOn || screenSharing) && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0d1117,#1e1b4b)' }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}/>
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: 800 }}>{displayName?.[0]?.toUpperCase()}</div>
                    }
                  </div>
                )}
                {/* Cinematic gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.5) 100%)', pointerEvents: 'none' }}/>
                <div style={{ position: 'absolute', bottom: 6, left: 8, color: 'rgba(255,255,255,.8)', fontSize: 10, fontWeight: 600 }}>
                  You {!micOn && '🔇'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Participants sidebar */}
        {showParticipants && (
          <ParticipantsPanel
            participants={participants}
            remoteUsers={remoteUsers}
            isHost={isHost}
            localName={displayName}
            localAvatar={profile?.avatar_url}
            onClose={() => setShowParticipants(false)}
            onInvite={handleInvite}
          />
        )}

        {/* Chat sidebar */}
        {showChat && (
          <ChatPanel
            onClose={() => setShowChat(false)}
            currentUser={{ name: displayName }}
          />
        )}
      </div>

      {/* Playback banner */}
      {playbackUrl && (
        <div className="shrink-0 flex items-center justify-between px-5 py-2 text-xs"
          style={{ background: 'rgba(34,197,94,0.08)', borderTop: '1px solid rgba(34,197,94,0.12)' }}>
          <span className="text-green-400 font-semibold">Recording saved</span>
          <a href={playbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View →</a>
        </div>
      )}

      {/* ── CONTROLS BAR ── */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(8,14,30,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Left — meeting info */}
        <div className="flex items-center gap-2 w-48">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-xs truncate">{meeting?.title}</span>
        </div>

        {/* Center — controls */}
        <div className="flex items-center gap-3">
          <CtrlBtn onClick={toggleMic} active={micOn} label={micOn ? 'Mute' : 'Unmute'}>
            {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-red-400" />}
          </CtrlBtn>

          <CtrlBtn onClick={toggleCam} active={camOn} label={camOn ? 'Stop Video' : 'Start Video'}>
            {camOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-red-400" />}
          </CtrlBtn>

          <CtrlBtn onClick={toggleScreen} active={screenSharing} label="Share">
            {screenSharing ? <MonitorOff size={18} className="text-yellow-400" /> : <Monitor size={18} className="text-white" />}
          </CtrlBtn>

          {isHost && (
            <CtrlBtn onClick={toggleRecording} disabled={recordingLoading} label="Record">
              {recordingLoading
                ? <Loader2 size={16} className="animate-spin text-white/50" />
                : recording
                  ? <Square size={14} className="text-red-400 fill-red-400" />
                  : <Circle size={16} className="text-white" />}
            </CtrlBtn>
          )}

          <CtrlBtn onClick={() => { setShowParticipants(v => !v); setShowChat(false); }} active={showParticipants} label="People">
            <Users size={18} className={showParticipants ? 'text-blue-400' : 'text-white'} />
          </CtrlBtn>

          <CtrlBtn onClick={() => { setShowChat(v => !v); setShowParticipants(false); }} active={showChat} label="Chat">
            <MessageSquare size={18} className={showChat ? 'text-blue-400' : 'text-white'} />
          </CtrlBtn>

          {/* Leave */}
          <button onClick={() => leave(isHost)}
            className="flex items-center gap-2 px-5 h-12 rounded-2xl text-sm font-semibold transition-all active:scale-95 ml-2"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            <PhoneOff size={16} />
            {isHost ? 'End' : 'Leave'}
          </button>
        </div>

        {/* Right — spacer */}
        <div className="w-48" />
      </div>
    </div>
  );
}
