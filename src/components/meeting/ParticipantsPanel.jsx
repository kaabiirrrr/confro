import { useState } from 'react';
import { X, UserPlus, Loader2, MicOff, VideoOff } from 'lucide-react';

function Avatar({ name, avatar, size = 'w-8 h-8' }) {
  if (avatar) return <img src={avatar} alt={name} className={`${size} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${size} rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export default function ParticipantsPanel({ participants, remoteUsers, isHost, localName, localAvatar, onClose, onInvite }) {
  const [inviteId, setInviteId] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteId.trim()) return;
    setInviting(true);
    await onInvite(inviteId.trim());
    setInviteId('');
    setInviting(false);
  };

  // Match a remote Agora user to a participant profile
  const getRemoteProfile = (remoteUser) => {
    return participants.find(p =>
      String(p.agora_uid) === String(remoteUser.uid) ||
      String(p.uid) === String(remoteUser.uid)
    );
  };

  // Remote users that are NOT already shown via participant_profiles
  const unmatchedRemote = remoteUsers.filter(u => !getRemoteProfile(u));

  return (
    <div className="flex flex-col w-72 shrink-0"
      style={{ background: 'rgba(8,14,30,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-white font-semibold text-sm">
          Participants ({participants.length + unmatchedRemote.length + 1})
        </span>
        <button onClick={onClose} className="text-white/30 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">

        {/* Local user (you) */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition">
          <Avatar name={localName} avatar={localAvatar} />
          <div className="flex-1 min-w-0">
            <span className="text-white/80 text-sm truncate block">{localName || 'You'}</span>
            {isHost && <span className="text-blue-400 text-[10px] font-semibold">Host</span>}
          </div>
        </div>

        {/* Backend participant profiles */}
        {participants.map(p => (
          <div key={p.user_id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition">
            <Avatar name={p.name} avatar={p.avatar_url} />
            <span className="text-white/80 text-sm flex-1 truncate">{p.name}</span>
          </div>
        ))}

        {/* Agora remote users not matched to a profile */}
        {unmatchedRemote.map(u => (
          <div key={u.uid} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white/40 text-xs font-bold shrink-0">
              ?
            </div>
            <span className="text-white/60 text-sm flex-1">Participant</span>
            <div className="flex items-center gap-1">
              {u._audioMuted && <MicOff size={12} className="text-red-400" />}
              {!u.videoTrack && <VideoOff size={12} className="text-red-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Invite (host only) */}
      {isHost && (
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">Invite by User ID</p>
          <div className="flex gap-2">
            <input
              value={inviteId}
              onChange={e => setInviteId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="User ID..."
              className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <button onClick={handleInvite} disabled={inviting || !inviteId.trim()}
              className="px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1"
              style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
              {inviting ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
