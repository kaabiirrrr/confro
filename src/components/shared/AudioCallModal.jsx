import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from 'lucide-react';
import {
    initiateCall, acceptCall, rejectCall, onCallAccepted, onCallRejected,
    onCallEnded, onIceCandidate, sendIceCandidate, endCall, onIncomingCall
} from '../../services/socketService';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const AudioCallModal = ({ targetUser, onClose, incomingData }) => {
    const [status, setStatus] = useState(incomingData ? 'incoming' : 'calling');
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [callId] = useState(targetUser?.id);

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const timerRef = useRef(null);
    const callStartRef = useRef(null);

    useEffect(() => {
        if (!incomingData) {
            startCall();
        }

        const cleanupAccepted = onCallAccepted(({ answer }) => {
            setStatus('connected');
            startTimer();
            peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });
        const cleanupRejected = onCallRejected(() => { setStatus('rejected'); setTimeout(cleanup, 2000); });
        const cleanupEnded = onCallEnded(() => { setStatus('ended'); setTimeout(cleanup, 1500); });
        const cleanupIce = onIceCandidate(({ candidate }) => {
            peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            cleanupAccepted && cleanupAccepted();
            cleanupRejected && cleanupRejected();
            cleanupEnded && cleanupEnded();
            cleanupIce && cleanupIce();
        };
    }, []);

    const startTimer = () => {
        callStartRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
        }, 1000);
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            const peer = new RTCPeerConnection(ICE_SERVERS);
            peerRef.current = peer;
            stream.getTracks().forEach(t => peer.addTrack(t, stream));
            peer.onicecandidate = e => { if (e.candidate) sendIceCandidate(callId, e.candidate); };
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            initiateCall(callId, 'audio', offer);
        } catch (err) {
            console.error('Call error:', err);
            setStatus('failed');
        }
    };

    const handleAccept = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            const peer = new RTCPeerConnection(ICE_SERVERS);
            peerRef.current = peer;
            stream.getTracks().forEach(t => peer.addTrack(t, stream));
            peer.onicecandidate = e => { if (e.candidate) sendIceCandidate(incomingData.callerId, e.candidate); };
            await peer.setRemoteDescription(new RTCSessionDescription(incomingData.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            acceptCall(incomingData.callerId, answer);
            setStatus('connected');
            startTimer();
        } catch (err) {
            console.error('Accept call error:', err);
        }
    };

    const handleReject = () => {
        rejectCall(incomingData?.callerId || callId);
        cleanup();
    };

    const handleEndCall = () => {
        const dur = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0;
        endCall(callId, 'audio', dur);
        cleanup();
    };

    const cleanup = () => {
        clearInterval(timerRef.current);
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        peerRef.current?.close();
        onClose();
    };

    const toggleMute = () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        stream.getAudioTracks().forEach(t => { t.enabled = isMuted; });
        setIsMuted(!isMuted);
    };

    const formatDuration = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const STATUS_LABELS = {
        calling: 'Calling...',
        incoming: 'Incoming call...',
        connected: formatDuration(duration),
        rejected: 'Call rejected',
        failed: 'Call failed',
        ended: 'Call ended'
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
            <div className="bg-secondary border border-border rounded-3xl p-8 w-72 text-center space-y-6 shadow-2xl">
                {/* Avatar */}
                <div className="relative mx-auto w-24 h-24">
                    {targetUser?.avatar_url ? (
                        <img src={targetUser.avatar_url} alt={targetUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center text-accent text-3xl font-bold">
                            {(targetUser?.name || '?')[0].toUpperCase()}
                        </div>
                    )}
                    {status === 'connected' && (
                        <span className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-30" />
                    )}
                </div>

                <div>
                    <h3 className="text-white font-semibold text-lg">{targetUser?.name || 'Unknown'}</h3>
                    <p className={`text-sm mt-1 ${status === 'connected' ? 'text-green-400' : 'text-white/50'}`}>
                        {STATUS_LABELS[status]}
                    </p>
                </div>

                {/* Call animation dots */}
                {(status === 'calling' || status === 'incoming') && (
                    <div className="flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    {status === 'incoming' && (
                        <button onClick={handleAccept} className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition shadow-lg">
                            <Phone size={22} className="text-white" />
                        </button>
                    )}
                    {status === 'connected' && (
                        <button onClick={toggleMute} className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'} flex items-center justify-center transition`}>
                            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                        </button>
                    )}
                    {(status === 'calling' || status === 'connected') && (
                        <button onClick={handleEndCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition shadow-lg">
                            <PhoneOff size={22} className="text-white" />
                        </button>
                    )}
                    {status === 'incoming' && (
                        <button onClick={handleReject} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition shadow-lg">
                            <PhoneOff size={22} className="text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioCallModal;
