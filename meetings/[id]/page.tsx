'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    Video, VideoOff, Mic, MicOff, PhoneOff,
    MessageSquare, Settings, Users, Clock,
    ChevronRight, Star, Send, Loader2, AlertCircle
} from 'lucide-react';

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: meetingId } = use(params);
    const router = useRouter();
    const { user, role, loading: authLoading } = useAuth();

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [peer, setPeer] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [chatOpen, setChatOpen] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Scoring metrics state (HR only)
    const [scores, setScores] = useState({
        technical: 0,
        communication: 0,
        culturalFit: 0
    });
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // Timer logic
    useEffect(() => {
        if (!isJoined) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleEndCall();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isJoined]);

    // Sync Local Video Stream
    useEffect(() => {
        if (localVideoRef.current && stream) {
            console.log('[Video] Syncing local stream to video element');
            localVideoRef.current.srcObject = stream;
        }
    }, [stream, isJoined]);

    // Sync Remote Video Stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log('[Video] Syncing remote stream to video element');
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, isJoined]);

    // WebRTC Setup
    useEffect(() => {
        if (typeof window === 'undefined' || !user || !meetingId) return;

        let myPeer: any;

        const initPeer = async () => {
            const { default: Peer } = await import('peerjs');

            // Generate a unique peer ID based on meetingId and role
            const peerId = `${meetingId}-${role === 'HR' ? 'hr' : 'candidate'}`;
            myPeer = new Peer(peerId);

            myPeer.on('open', (id: string) => {
                console.log('My peer ID is: ' + id);
            });

            myPeer.on('call', (call: any) => {
                console.log('[Video] Received incoming call');

                const answerCall = (localStream: MediaStream) => {
                    call.answer(localStream);
                    call.on('stream', (userRemoteStream: MediaStream) => {
                        console.log('[Video] Received remote stream from incoming call');
                        setRemoteStream(userRemoteStream);
                    });
                };

                if (streamRef.current) {
                    answerCall(streamRef.current);
                } else {
                    // Fallback to getting stream if not already joined
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
                        streamRef.current = currentStream;
                        setStream(currentStream);
                        setIsJoined(true);
                        answerCall(currentStream);
                    }).catch(err => {
                        console.error('[Video] Failed to get stream for incoming call', err);
                        if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                            setError('Camera or Microphone is already in use by another application or tab. Please close other apps and try again.');
                        } else {
                            setError('Could not access camera/microphone. Please check permissions.');
                        }
                    });
                }
            });

            setPeer(myPeer);
        };

        initPeer();

        return () => {
            if (myPeer) myPeer.destroy();
        };
    }, [user, meetingId, role]);

    const handleJoin = async () => {
        try {
            const currentStream = streamRef.current || await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = currentStream;
            setStream(currentStream);

            setIsJoined(true);

            // If we are candidate, we call the HR
            const remotePeerId = `${meetingId}-${role === 'HR' ? 'candidate' : 'hr'}`;

            const makeCall = () => {
                if (!peer || !currentStream) return;

                console.log(`[Video] Attempting to call ${remotePeerId}...`);
                const call = peer.call(remotePeerId, currentStream);

                if (call) {
                    call.on('stream', (userRemoteStream: MediaStream) => {
                        console.log('[Video] Received remote stream');
                        setRemoteStream(userRemoteStream);
                    });

                    call.on('error', (err: any) => {
                        console.error('[Video] Call error:', err);
                    });
                } else {
                    console.warn('[Video] Call object is undefined, remote peer might not be ready.');
                }
            };

            // Small delay to ensure peer is ready or simply call
            if (role === 'CANDIDATE') {
                // Candidates often join second, but let's be safe
                setTimeout(makeCall, 1000);
            } else {
                // HR might join first, so they wait for incoming call mostly, 
                // but can try calling too
                makeCall();
            }
        } catch (err: any) {
            console.error('Failed to get local stream', err);
            if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera or Microphone is already in use by another application or tab. Please close other apps and refresh.');
            } else {
                setError('Could not access camera/microphone. Please check system permissions and ensure no other app is using them.');
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const handleEndCall = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (peer) peer.destroy();
        router.push(role === 'HR' ? '/dashboard' : '/jobopening');
    };

    const handleSaveScores = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/interview/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingId, // We need the interview ID really, but for now we'll find by meetingId in the API
                    scores,
                    feedback
                })
            });
            if (response.ok) {
                alert('Scores saved successfully!');
            }
        } catch (err) {
            console.error('Failed to save scores', err);
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (authLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;

    if (!isJoined) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#111] text-white p-4">
                <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-3xl p-8 border border-white/5 shadow-2xl">
                    <h1 className="text-3xl font-bold mb-2 text-center">Ready to join?</h1>
                    <p className="text-white/50 text-center mb-8">Meeting ID: {meetingId}</p>

                    <div className="aspect-video bg-black rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                        <Users className="h-24 w-24 text-white/10" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                            <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'}`}>
                                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>
                            <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'}`}>
                                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleJoin}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Join Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#111] text-white flex overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col relative h-full">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                            <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : ''}`}>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button className="p-3 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 hover:bg-black/70 transition-all">
                            <Users size={20} />
                        </button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative mt-16 pb-24">
                    {/* Remote Video (Full Screen if alone, side by side if both) */}
                    <div className="relative bg-[#1e1e1e] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        {remoteStream ? (
                            <video
                                autoPlay
                                playsInline
                                ref={remoteVideoRef}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                    <Users size={40} className="text-white/20" />
                                </div>
                                <p className="text-white/30 font-medium">Waiting for other participant...</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-medium border border-white/10">
                            {role === 'HR' ? 'Candidate' : 'Interviewer'}
                        </div>
                    </div>

                    {/* Local Video (Floating or Split) */}
                    <div className="relative bg-[#1e1e1e] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        <video
                            autoPlay
                            playsInline
                            muted
                            ref={localVideoRef}
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-medium border border-white/10">
                            You
                        </div>
                        {!isVideoOn && (
                            <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center">
                                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                                    <VideoOff size={32} className="text-white/20" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl z-20">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`p-4 rounded-2xl transition-all ${chatOpen ? 'bg-primary text-primary-foreground' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <MessageSquare size={24} />
                    </button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <Settings size={24} />
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="p-4 bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-lg shadow-red-500/20"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>

            {/* Side Chat / Scoring Panel */}
            {chatOpen && (
                <div className="w-96 bg-[#1a1a1a] border-l border-white/5 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            {role === 'HR' ? 'Scoring & Metrics' : 'In-call Messages'}
                        </h2>
                        <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {role === 'HR' ? (
                            <>
                                {/* Scoring Section for HR */}
                                <div className="space-y-6">
                                    <h3 className="text-xs uppercase font-bold tracking-widest text-primary">Interview Metrics</h3>

                                    {['technical', 'communication', 'culturalFit'].map((metric) => (
                                        <div key={metric} className="space-y-3">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                                                <span className="text-primary">{scores[metric as keyof typeof scores]}/10</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="1"
                                                value={scores[metric as keyof typeof scores]}
                                                onChange={(e) => setScores({ ...scores, [metric]: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-xs uppercase font-bold tracking-widest text-primary">Evaluation Feedback</h3>
                                    <textarea
                                        placeholder="Add private interview notes..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                    <button
                                        onClick={handleSaveScores}
                                        disabled={saving}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                                        Save Evaluation
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Chat for Candidate - Placeholder for now or simple UI */
                            <div className="flex flex-col h-full">
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4 opacity-30">
                                    <MessageSquare size={48} />
                                    <div>
                                        <p className="font-bold">Chat Unavailable</p>
                                        <p className="text-xs">Messaging is disabled for this session.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {role !== 'HR' && (
                        <div className="p-6 border-t border-white/5">
                            <div className="relative">
                                <input
                                    disabled
                                    placeholder="Type a message..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none opacity-50 cursor-not-allowed"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
