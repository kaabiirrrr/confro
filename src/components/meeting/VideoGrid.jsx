import { useEffect } from 'react';
import { MicOff, VideoOff } from 'lucide-react';

function VideoTile({ id, label, micOn = true, camOn = true, isLocal = false }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center"
      style={{ minHeight: 180 }}>
      <div id={id} style={{ width: '100%', height: '100%', minHeight: 180, background: '#0d1117' }} />
      {!camOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <VideoOff size={28} className="text-white/20" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white font-medium"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
        {!micOn && <MicOff size={10} className="text-red-400" />}
        {label}
      </div>
    </div>
  );
}

export default function VideoGrid({ remoteUsers, micOn, camOn, localLabel = 'You' }) {
  const count = remoteUsers.length;
  const cols = count === 0 ? '1fr'
    : count === 1 ? '1fr 1fr'
    : count <= 3 ? 'repeat(2, 1fr)'
    : 'repeat(3, 1fr)';

  // Re-play remote tracks when remoteUsers changes
  useEffect(() => {
    remoteUsers.forEach(u => {
      setTimeout(() => u.videoTrack?.play(`remote-${u.uid}`), 100);
    });
  }, [remoteUsers]);

  return (
    <div className="flex-1 min-h-0 p-3 grid gap-2" style={{ gridTemplateColumns: cols }}>
      <VideoTile id="local-video" label={localLabel} micOn={micOn} camOn={camOn} isLocal />
      {remoteUsers.map(u => (
        <VideoTile
          key={u.uid}
          id={`remote-${u.uid}`}
          label={`Participant ${u.uid}`}
          micOn={!u._audioMuted}
          camOn={!!u.videoTrack}
        />
      ))}
    </div>
  );
}
