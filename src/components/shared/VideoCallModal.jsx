import { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import {
    initiateCall, acceptCall, onCallAccepted, onCallRejected,
    onCallEnded, onIceCandidate, sendIceCandidate, endCall, rejectCall
} from '../../services/socketService';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const VideoCallModal = ({ targetUser, onClose, incomingData }) => {
    const [status, setStatus] = useState(incomingData ? 'incoming' : 'calling');
    const [isMuted, setIsMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [duration, setDuration] = useState(0);

    const peerRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const timerRef = useRef(null);
    const callStartRef = useRef(null);
    const callId = targetUser?.id;

    useEffect(() => {
        if (!incomingData) startCall();

        const cleanAcc = onCallAccepted(async ({ answer }) => {
            await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
            setStatus('connected');
            startTimer();
        });
        const cleanRej = onCallRejected(() => { setStatus('rejected'); setTimeout(cleanup, 2000); });
        const cleanEnd = onCallEnded(() => { setStatus('ended'); setTimeout(cleanup, 1500); });
        const cleanIce = onIceCandidate(({ candidate }) => peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate)));

        return () => { cleanAcc?.(); cleanRej?.(); cleanEnd?.(); cleanIce?.(); };
    }, []);

    const startTimer = () => {
        callStartRef.current = Date.now();
        timerRef.current = setInterval(() => setDuration(Math.floor((Date.now() - callStartRef.current) / 1000)), 1000);
    };

    const createPeer = (stream) => {
        const peer = new RTCPeerConnection(ICE_SERVERS);
        stream.getTracks().forEach(t => peer.addTrack(t, stream));
        peer.ontrack = e => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
        peer.onicecandidate = e => { if (e.candidate) sendIceCandidate(callId, e.candidate); };
        return peer;
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            const peer = createPeer(stream);
            peerRef.current = peer;
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            initiateCall(callId, 'video', offer);
        } catch (err) {
            console.error('Video call error:', err);
            setStatus('failed');
        }
    };

    const handleAccept = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            const peer = createPeer(stream);
            peerRef.current = peer;
            await peer.setRemoteDescription(new RTCSessionDescription(incomingData.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            acceptCall(incomingData.callerId, answer);
            setStatus('connected');
            startTimer();
        } catch (err) {
            console.error('Accept video call error:', err);
        }
    };

    const handleEndCall = () => {
        const dur = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0;
        endCall(callId, 'video', dur);
        cleanup();
    };

    const cleanup = () => {
        clearInterval(timerRef.current);
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        peerRef.current?.close();
        onClose();
    };

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
        setIsMuted(!isMuted);
    };

    const toggleCamera = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = cameraOff; });
        setCameraOff(!cameraOff);
    };

    const formatDuration = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className={`fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col ${isFullscreen ? '' : 'items-center justify-center'}`}>
            <div className={`relative bg-black ${isFullscreen ? 'w-full h-full' : 'w-full max-w-2xl h-[70vh] rounded-3xl overflow-hidden shadow-2xl'}`}>

                {/* Remote video (full background) */}
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

                {/* Overlay when not connected */}
                {status !== 'connected' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-4">
                        {targetUser?.avatar_url ? (
                            <img src={targetUser.avatar_url} className="w-24 h-24 rounded-full object-cover" alt={targetUser.name} />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent text-4xl font-bold">
                                {(targetUser?.name || '?')[0]}
                            </div>
                        )}
                        <h3 className="text-white font-semibold text-xl">{targetUser?.name}</h3>
                        <p className="text-white/50 text-sm">
                            {status === 'calling' ? 'Video calling...' : status === 'incoming' ? 'Incoming video call...' : status}
                        </p>
                        {(status === 'calling' || status === 'incoming') && (
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Local video (picture-in-picture) */}
                {(status === 'connected' || status === 'incoming') && (
                    <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        {cameraOff && (
                            <div className="absolute inset-0 bg-[#0f1015] flex items-center justify-center">
                                <VideoOff size={20} className="text-white/40" />
                            </div>
                        )}
                    </div>
                )}

                {/* Duration */}
                {status === 'connected' && (
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <p className="text-white text-sm font-mono">{formatDuration(duration)}</p>
                    </div>
                )}

                {/* Fullscreen toggle */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute top-4 left-1/2 -translate-x-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition"
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                {/* Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <button onClick={toggleMute} className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-sm flex items-center justify-center text-white transition hover:scale-105`}>
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                    <button onClick={handleEndCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white transition hover:scale-105 shadow-lg">
                        <PhoneOff size={22} />
                    </button>
                    <button onClick={toggleCamera} className={`w-14 h-14 rounded-full ${cameraOff ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-sm flex items-center justify-center text-white transition hover:scale-105`}>
                        {cameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>

                    {status === 'incoming' && (
                        <button onClick={handleAccept} className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-white transition hover:scale-105 shadow-lg">
                            <Video size={22} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;
