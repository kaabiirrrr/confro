import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Circle, Square, PhoneOff, Users, MessageSquare, Loader2 } from 'lucide-react';

function Btn({ onClick, active, danger, disabled, title, children }) {
  const base = 'w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 focus:outline-none';
  const bg = danger
    ? 'rgba(239,68,68,0.2)'
    : active
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(255,255,255,0.07)';
  const border = danger
    ? '1px solid rgba(239,68,68,0.4)'
    : active
      ? '1px solid rgba(255,255,255,0.15)'
      : '1px solid rgba(255,255,255,0.08)';

  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={base} style={{ background: bg, border }}>
      {children}
    </button>
  );
}

export default function Controls({
  micOn, camOn, screenSharing, recording, recordingLoading,
  showParticipants, showChat, isHost,
  onToggleMic, onToggleCam, onToggleScreen, onToggleRecording,
  onToggleParticipants, onToggleChat, onLeave,
}) {
  return (
    <div className="shrink-0 flex items-center justify-center gap-3 py-4 px-6"
      style={{ background: 'rgba(8,14,30,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      <Btn onClick={onToggleMic} active={micOn} title={micOn ? 'Mute' : 'Unmute'}>
        {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-red-400" />}
      </Btn>

      <Btn onClick={onToggleCam} active={camOn} title={camOn ? 'Stop video' : 'Start video'}>
        {camOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-red-400" />}
      </Btn>

      <Btn onClick={onToggleScreen} active={screenSharing} title={screenSharing ? 'Stop sharing' : 'Share screen'}>
        {screenSharing
          ? <MonitorOff size={18} className="text-yellow-400" />
          : <Monitor size={18} className="text-white" />}
      </Btn>

      {isHost && (
        <Btn onClick={onToggleRecording} disabled={recordingLoading}
          active={recording} title={recording ? 'Stop recording' : 'Start recording'}>
          {recordingLoading
            ? <Loader2 size={16} className="animate-spin text-white/50" />
            : recording
              ? <Square size={14} className="text-red-400 fill-red-400" />
              : <Circle size={16} className="text-white" />}
        </Btn>
      )}

      <Btn onClick={onToggleParticipants} active={showParticipants} title="Participants">
        <Users size={18} className={showParticipants ? 'text-blue-400' : 'text-white'} />
      </Btn>

      <Btn onClick={onToggleChat} active={showChat} title="Chat">
        <MessageSquare size={18} className={showChat ? 'text-blue-400' : 'text-white'} />
      </Btn>

      {/* Leave / End */}
      <button onClick={onLeave}
        className="flex items-center gap-2 px-5 h-12 rounded-full text-sm font-semibold transition-all active:scale-95 ml-2"
        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
        <PhoneOff size={16} />
        {isHost ? 'End' : 'Leave'}
      </button>
    </div>
  );
}
