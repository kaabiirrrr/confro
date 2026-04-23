/**
 * callService.js - WebRTC Call Manager
 */

import { getSocket } from './socketService';
import { logger } from '../utils/logger';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

class CallService {
  constructor() {
    this.pc = null;
    this.localStream = null;
    this._remoteStream = null;
    this.targetUserId = null;
    this.callType = null;
    this.callStartTime = null;
    this._onRemoteStream = null;
    this._onStateChange = null;
    this._pendingCandidates = []; // queue ICE candidates until remote desc is set
    this._remoteDescSet = false;
  }

  set onRemoteStream(fn) {
    this._onRemoteStream = fn;
    if (fn && this._remoteStream) fn(this._remoteStream);
  }
  get onRemoteStream() { return this._onRemoteStream; }

  set onStateChange(fn) {
    this._onStateChange = fn;
    if (fn && this.pc) fn(this.pc.connectionState);
  }
  get onStateChange() { return this._onStateChange; }

  async startCall(targetUserId, callType) {
    this.targetUserId = targetUserId;
    this.callType = callType;
    this._remoteStream = null;
    this._pendingCandidates = [];
    this._remoteDescSet = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera/microphone requires HTTPS. Please use https://');
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });

    this.pc = this._createPeer();
    this.localStream.getTracks().forEach(t => this.pc.addTrack(t, this.localStream));

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    logger.log('[CallService] Emitting call-request to', targetUserId);
    getSocket()?.emit('call-request', { targetUserId, callType, offer });

    return this.localStream;
  }

  async acceptCall(callerId, offer, callType) {
    this.targetUserId = callerId;
    this.callType = callType;
    this._remoteStream = null;
    this._pendingCandidates = [];
    this._remoteDescSet = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera/microphone requires HTTPS. Please use https://');
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });

    this.pc = this._createPeer();
    this.localStream.getTracks().forEach(t => this.pc.addTrack(t, this.localStream));

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    this._remoteDescSet = true;
    await this._flushPendingCandidates();

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    logger.log('[CallService] Emitting call-accept to', callerId);
    this.callStartTime = Date.now();
    getSocket()?.emit('call-accept', { callerId, answer });

    return this.localStream;
  }

  async handleAnswer(answer) {
    if (!this.pc) return;
    // Only set remote description if in the right state
    if (this.pc.signalingState !== 'have-local-offer') {
      logger.warn('[CallService] Ignoring answer — wrong signaling state:', this.pc.signalingState);
      return;
    }
    logger.log('[CallService] Setting remote description (answer)');
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    this._remoteDescSet = true;
    await this._flushPendingCandidates();
  }

  async handleIceCandidate(candidate) {
    if (!candidate) return;
    if (!this.pc || !this._remoteDescSet) {
      // Queue until remote description is set
      logger.log('[CallService] Queuing ICE candidate (remote desc not set yet)');
      this._pendingCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      if (!e.message.includes('closed')) {
        logger.error('[CallService] ICE candidate error:', e);
      }
    }
  }

  async _flushPendingCandidates() {
    logger.log('[CallService] Flushing', this._pendingCandidates.length, 'queued ICE candidates');
    for (const c of this._pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        if (!e.message.includes('closed')) logger.error('[CallService] Flush ICE error:', e);
      }
    }
    this._pendingCandidates = [];
  }

  endCall(duration = 0, conversationId = null) {
    logger.log('[CallService] Ending call with', this.targetUserId);
    getSocket()?.emit('call-end', {
      targetUserId: this.targetUserId,
      callType: this.callType || 'audio',
      duration,
      ...(conversationId ? { conversationId } : {}),
    });
    this.cleanup();
  }

  toggleMute() {
    const track = this.localStream?.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return !track.enabled;
  }

  toggleCamera() {
    const track = this.localStream?.getVideoTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return !track.enabled;
  }

  cleanup() {
    this.localStream?.getTracks().forEach(t => t.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
    this._remoteStream = null;
    this.targetUserId = null;
    this.callType = null;
    this.callStartTime = null;
    this._pendingCandidates = [];
    this._remoteDescSet = false;
  }

  _createPeer() {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && this.targetUserId) {
        const ip = candidate.address || candidate.candidate?.split(' ')[4] || '';
        // Skip virtual adapter IPs (VirtualBox 192.168.56.x, VMware 192.168.x.x non-standard)
        const isVirtual = /^192\.168\.56\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
        if (isVirtual) {
          logger.log('[CallService] Skipping virtual adapter candidate:', ip);
          return;
        }
        logger.log('[CallService] Sending ICE candidate:', candidate.type, ip);
        getSocket()?.emit('ice-candidate', { targetUserId: this.targetUserId, candidate });
      } else if (!candidate) {
        logger.log('[CallService] ICE gathering complete');
      }
    };

    pc.onicegatheringstatechange = () => {
      logger.log('[CallService] ICE gathering state:', pc.iceGatheringState);
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      logger.log('[CallService] Remote track received', stream?.id);
      this._remoteStream = stream;
      this._onRemoteStream?.(stream);
    };

    pc.onconnectionstatechange = () => {
      logger.log('[CallService] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') this.callStartTime = Date.now();
      this._onStateChange?.(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      logger.log('[CallService] ICE state:', pc.iceConnectionState);
    };

    return pc;
  }
}

export const callService = new CallService();