"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
    Mic, MicOff, Headphones, HeadphoneOff, 
    Monitor, MonitorOff, Settings, PhoneOff, 
    Volume2, Wifi, WifiOff, Video, VideoOff, 
    MessageSquare, Maximize2, Minimize2
} from "lucide-react";
import { User } from "@/hooks/use-chat-data";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VoiceAreaProps {
  channelId: number;
  userId: number;
  users: User[];
  onLeave?: () => void;
  onToggleChat?: () => void;
}

interface Participant {
  userId: number;
  stream?: MediaStream;
  isMuted?: boolean;
  isDeafened?: boolean;
  isSpeaking?: boolean;
  isScreenSharing?: boolean;
  isVideoEnabled?: boolean;
  screenStream?: MediaStream;
}

export function VoiceArea({ channelId, userId, users, onLeave, onToggleChat }: VoiceAreaProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false); // Local state for speaking detection feedback
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor" | "bad">("good");
  const [focusedStream, setFocusedStream] = useState<{ userId: number, isScreen: boolean } | null>(null);
  
  // Settings State
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");
  const [volume, setVolume] = useState([100]);
  
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const screenPeersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Device enumeration
  useEffect(() => {
      const getDevices = async () => {
          try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              setInputDevices(devices.filter(d => d.kind === 'audioinput'));
              setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
          } catch (err) {
              console.error("Error enumerating devices", err);
          }
      };
      getDevices();
      navigator.mediaDevices.addEventListener('devicechange', getDevices);
      return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  // Initialize Audio Context for speaking detection
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Detect speaking
  useEffect(() => {
    if (!localStream || !analyserRef.current || isMuted) return;

    const source = audioContextRef.current!.createMediaStreamSource(localStream);
    source.connect(analyserRef.current!);

    const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
    
    speakingIntervalRef.current = setInterval(() => {
        analyserRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const isSpeakingDetected = average > 30; // Threshold
        
        setIsSpeakingNow(isSpeakingDetected); // Update local visual state

        if (isSpeakingDetected) {
            socket.emit("voice_speaking", { 
                roomId: `channel_${channelId}`, 
                userId,
                speaking: true
            });
        }
    }, 100);

    return () => {
        if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
        source.disconnect();
    };
  }, [localStream, isMuted, channelId, userId]);

  // Main Voice Logic
  useEffect(() => {
    const initVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
        localStreamRef.current = stream;

        socket.emit("joinVoiceRoom", { roomId: `channel_${channelId}`, userId });
      } catch (err) {
        console.error("Failed to get local audio", err);
        // Handle permission denied or no device
      }
    };

    initVoice();

    return () => {
      socket.emit("leaveVoiceRoom", { roomId: `channel_${channelId}`, userId });
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localScreenStreamRef.current?.getTracks().forEach(track => track.stop());
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
      screenPeersRef.current.forEach(pc => pc.close());
      screenPeersRef.current.clear();
    };
  }, [channelId, userId]);

  // Peer Connection Logic (Lifted out of useEffect)
  const createPeerConnection = useCallback((targetUserId: number, initiator: boolean, isScreen: boolean = false) => {
      const roomId = `channel_${channelId}`;
      const refs = isScreen ? screenPeersRef : peersRef;
      if (refs.current.has(targetUserId)) return refs.current.get(targetUserId)!;

      const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      refs.current.set(targetUserId, pc);

      // Add tracks
      const streamRef = isScreen ? localScreenStreamRef : localStreamRef;
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
              pc.addTrack(track, streamRef.current!);
          });
      }

      pc.onicecandidate = (event) => {
          if (event.candidate) {
              socket.emit(isScreen ? "screen_share_ice_candidate" : "voice_ice_candidate", {
                  targetUserId,
                  candidate: event.candidate,
                  roomId
              });
          }
      };

      pc.ontrack = (event) => {
          console.log(`Track received from user ${targetUserId} (isScreen: ${isScreen})`, event.streams[0]);
          setParticipants(prev => {
              const existingIndex = prev.findIndex(p => p.userId === targetUserId);
              if (existingIndex !== -1) {
                  const newParticipants = [...prev];
                  if (isScreen) {
                      newParticipants[existingIndex].screenStream = event.streams[0];
                      newParticipants[existingIndex].isScreenSharing = true;
                  } else {
                      newParticipants[existingIndex].stream = event.streams[0];
                  }
                  return newParticipants;
              } else {
                  return [...prev, { 
                      userId: targetUserId, 
                      stream: !isScreen ? event.streams[0] : undefined,
                      screenStream: isScreen ? event.streams[0] : undefined,
                      isScreenSharing: isScreen
                  }];
              }
          });
          
          // Audio playback handling
          if (!isScreen) {
              const audio = new Audio();
              audio.srcObject = event.streams[0];
              audio.autoplay = true;
          }
      };

      if (initiator) {
          pc.createOffer()
              .then(offer => pc.setLocalDescription(offer))
              .then(() => {
                  socket.emit(isScreen ? "screen_share_offer" : "voice_offer", {
                      targetUserId,
                      offer: pc.localDescription,
                      roomId
                  });
              })
              .catch(e => console.error("Offer error", e));
      }

      return pc;
  }, [channelId, userId]);

  // Socket Event Listeners
  useEffect(() => {
    const roomId = `channel_${channelId}`;

    socket.on("voiceRoomJoined", (data: { participants: { userId: number }[] }) => {
        console.log("Voice room joined", data);
        // Initialize participants list from existing users
        const initialParticipants = data.participants.map(p => ({ userId: p.userId }));
        setParticipants(prev => {
             const existingIds = new Set(prev.map(p => p.userId));
             const newParts = initialParticipants.filter(p => !existingIds.has(p.userId));
             return [...prev, ...newParts];
        });

        data.participants.forEach(p => {
            createPeerConnection(p.userId, true); // Voice
            if (isScreenSharing) createPeerConnection(p.userId, true, true); // Screen share if active
        });
    });

    socket.on("userJoinedVoice", (data: { userId: number }) => {
        console.log("User joined voice", data);
        setParticipants(prev => {
            if (prev.some(p => p.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId }];
        });
        
        // If I am screen sharing, initiate connection with new user
        if (isScreenSharing) {
            console.log("Initiating screen share with new user", data.userId);
            createPeerConnection(data.userId, true, true);
        }
    });

    // Voice Signaling
    socket.on("voice_offer", async (data) => {
        if (data.targetUserId !== userId) return;
        const pc = createPeerConnection(data.userId, false);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("voice_answer", {
                targetUserId: data.userId,
                answer,
                roomId
            });
        } catch (e) { console.error(e); }
    });

    socket.on("voice_answer", async (data) => {
        if (data.targetUserId !== userId) return;
        const pc = peersRef.current.get(data.userId);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("voice_ice_candidate", async (data) => {
        if (data.targetUserId !== userId) return;
        const pc = peersRef.current.get(data.userId);
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    // Screen Share Signaling
    socket.on("screen_share_offer", async (data) => {
        console.log("Received screen share offer", data);
        if (data.targetUserId !== userId) return;
        const pc = createPeerConnection(data.userId, false, true);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("screen_share_answer", {
                targetUserId: data.userId,
                answer,
                roomId
            });
        } catch (e) { console.error(e); }
    });

    socket.on("screen_share_answer", async (data) => {
        if (data.targetUserId !== userId) return;
        const pc = screenPeersRef.current.get(data.userId);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("screen_share_ice_candidate", async (data) => {
        if (data.targetUserId !== userId) return;
        const pc = screenPeersRef.current.get(data.userId);
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    // Status Events
    socket.on("voice_mute_status", (data: { userId: number, muted: boolean }) => {
        setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, isMuted: data.muted } : p));
    });

    socket.on("voice_deafen_status", (data: { userId: number, deafened: boolean }) => {
        setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, isDeafened: data.deafened } : p));
    });

    socket.on("voice_speaking", (data: { userId: number, speaking: boolean }) => { 
        setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, isSpeaking: true } : p));
        
        // Auto clear after 300ms if no new event
        setTimeout(() => {
             setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, isSpeaking: false } : p));
        }, 300);
    });

    socket.on("voice_video_status", (data: { userId: number, enabled: boolean }) => {
        setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, isVideoEnabled: data.enabled } : p));
    });

    socket.on("screen_share_start", (data: { userId: number }) => {
        // Note: ontrack handles the actual stream, but we can use this to update UI state if needed
        console.log("User started screen sharing:", data.userId);
    });

    socket.on("screen_share_stop", (data: { userId: number }) => {
        console.log("User stopped screen sharing:", data.userId);
        setParticipants(prev => prev.map(p => {
            if (p.userId === data.userId) {
                return { ...p, isScreenSharing: false, screenStream: undefined };
            }
            return p;
        }));
        
        // Also clear focused stream if it was this user's screen
        if (focusedStream?.userId === data.userId && focusedStream?.isScreen) {
            setFocusedStream(null);
        }
    });

    socket.on("userLeftVoice", (data: { userId: number }) => {
        const pc = peersRef.current.get(data.userId);
        pc?.close();
        peersRef.current.delete(data.userId);
        
        const spc = screenPeersRef.current.get(data.userId);
        spc?.close();
        screenPeersRef.current.delete(data.userId);

        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    return () => {
        socket.off("voiceRoomJoined");
        socket.off("userJoinedVoice");
        socket.off("voice_offer");
        socket.off("voice_answer");
        socket.off("voice_ice_candidate");
        socket.off("screen_share_offer");
        socket.off("screen_share_answer");
        socket.off("screen_share_ice_candidate");
        socket.off("screen_share_start");
        socket.off("screen_share_stop");
        socket.off("voice_video_status");
        socket.off("voice_mute_status");
        socket.off("voice_deafen_status");
        socket.off("voice_speaking");
        socket.off("userLeftVoice");
    };

  }, [channelId, userId, isScreenSharing, createPeerConnection]);

  // Handlers
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !newMuted);
    }
    socket.emit("voice_mute_status", { roomId: `channel_${channelId}`, userId, muted: newMuted });
  };

  const toggleDeafen = () => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    if (newDeafened && !isMuted) toggleMute();
    socket.emit("voice_deafen_status", { roomId: `channel_${channelId}`, userId, deafened: newDeafened });
  };

  const toggleVideo = async () => {
      if (isVideoEnabled) {
          // Disable video
          if (localStreamRef.current) {
              const videoTrack = localStreamRef.current.getVideoTracks()[0];
              if (videoTrack) {
                  videoTrack.stop();
                  localStreamRef.current.removeTrack(videoTrack);
                  setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
              }
          }
          setIsVideoEnabled(false);
          
          // Signal video disabled status
          socket.emit("voice_video_status", { roomId: `channel_${channelId}`, userId, enabled: false });
          
          // Propagate to peers - replace video track with null to stop sending
          peersRef.current.forEach((pc) => {
               const sender = pc.getSenders().find(s => s.track?.kind === 'video');
               if (sender) sender.replaceTrack(null);
          });
      } else {
          // Enable video
          try {
              const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
              const videoTrack = videoStream.getVideoTracks()[0];
              
              if (localStreamRef.current) {
                  localStreamRef.current.addTrack(videoTrack);
                  setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
                  
                  // Signal video enabled status
                  socket.emit("voice_video_status", { roomId: `channel_${channelId}`, userId, enabled: true });
                  
                  // Add track to all existing peer connections
                  peersRef.current.forEach((pc, targetUserId) => {
                      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                      if (sender) {
                          sender.replaceTrack(videoTrack);
                      } else {
                          pc.addTrack(videoTrack, localStreamRef.current!);
                          // Renegotiate
                          pc.createOffer()
                              .then(offer => pc.setLocalDescription(offer))
                              .then(() => {
                                  socket.emit("voice_offer", {
                                      targetUserId,
                                      offer: pc.localDescription,
                                      roomId: `channel_${channelId}`
                                  });
                              });
                      }
                  });
              }
              setIsVideoEnabled(true);
          } catch (err) {
              console.error("Failed to enable video", err);
          }
      }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
        localScreenStreamRef.current?.getTracks().forEach(track => track.stop());
        setLocalScreenStream(null);
        setIsScreenSharing(false);
        
        screenPeersRef.current.forEach(pc => {
            pc.getSenders().forEach(sender => pc.removeTrack(sender));
            pc.close();
        });
        screenPeersRef.current.clear();
        
        socket.emit("screen_share_stop", { roomId: `channel_${channelId}`, userId });
    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setLocalScreenStream(stream);
            localScreenStreamRef.current = stream;
            setIsScreenSharing(true);
            
            socket.emit("screen_share_start", { roomId: `channel_${channelId}`, userId });

            participants.forEach(p => {
                if (p.userId !== userId) {
                    createPeerConnection(p.userId, true, true); 
                }
            });
            
            stream.getVideoTracks()[0].onended = () => {
                toggleScreenShare();
            };

        } catch (err) {
            console.error("Screen share failed", err);
        }
    }
  };

  const handleMaximize = (userId: number, isScreen: boolean) => {
      if (focusedStream && focusedStream.userId === userId && focusedStream.isScreen === isScreen) {
          setFocusedStream(null);
      } else {
          setFocusedStream({ userId, isScreen });
      }
  };

  // Render Helpers
  const getUser = (uid: number) => users.find(u => u.id === uid);
  
  const renderVideo = (stream: MediaStream | undefined, isScreen: boolean, userId: number) => (
      <div className="relative w-full h-full group">
            <video
                autoPlay
                playsInline
                className={cn("absolute inset-0 w-full h-full", isScreen ? "object-contain bg-black" : "object-cover")}
                ref={el => {
                    if (el) {
                        el.srcObject = stream || null;
                        if (!isScreen && stream) el.volume = volume[0] / 100;
                    }
                }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMaximize(userId, isScreen);
                    }}
                >
                    {focusedStream?.userId === userId && focusedStream.isScreen === isScreen ? 
                        <Minimize2 className="h-4 w-4" /> : 
                        <Maximize2 className="h-4 w-4" />
                    }
                </Button>
            </div>
      </div>
  );

  // Focused View Render
  if (focusedStream) {
      const focusedParticipant = focusedStream.userId === userId 
          ? { userId, stream: localStream || undefined, screenStream: localScreenStream || undefined }
          : participants.find(p => p.userId === focusedStream.userId);
      
      const streamToRender = focusedStream.isScreen 
          ? focusedParticipant?.screenStream 
          : focusedParticipant?.stream || (focusedStream.userId === userId ? localStream : undefined);

      return (
        <div className="flex flex-col h-full bg-background text-foreground relative transition-colors duration-300">
             {/* Main Stage */}
             <div className="flex-1 p-4 relative bg-black/90 flex items-center justify-center overflow-hidden">
                 {streamToRender && (
                     <video
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                        ref={el => {
                            if (el) {
                                el.srcObject = streamToRender;
                                el.volume = volume[0] / 100;
                            }
                        }}
                     />
                 )}
                 <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-4 right-4 h-10 w-10 bg-black/50 hover:bg-black/70 text-white border-0 z-50"
                    onClick={() => setFocusedStream(null)}
                >
                    <Minimize2 className="h-5 w-5" />
                </Button>
             </div>

             {/* Bottom Strip */}
             <div className="h-40 bg-background border-t border-border p-4 flex gap-4 overflow-x-auto">
                 {/* Me (Small) */}
                 <div 
                    className="relative aspect-video bg-card rounded-lg border border-border shrink-0 w-48 cursor-pointer"
                    onClick={() => handleMaximize(userId, false)}
                 >
                     {localStream && localStream.getVideoTracks().length > 0 ? (
                         <video autoPlay muted playsInline className="w-full h-full object-cover rounded-lg" ref={el => { if(el) el.srcObject = localStream }} />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={getUser(userId)?.avatar} />
                                <AvatarFallback>{getUser(userId)?.username?.[0]}</AvatarFallback>
                            </Avatar>
                         </div>
                     )}
                 </div>
                 
                 {/* Participants (Small) */}
                 {participants.map(p => {
                     const hasVideo = (p.stream && p.stream.getVideoTracks().length > 0);
                     const hasScreen = !!p.screenStream;
                     return (
                         <div key={p.userId} className="flex gap-2">
                             <div 
                                className="relative aspect-video bg-card rounded-lg border border-border shrink-0 w-48 cursor-pointer"
                                onClick={() => handleMaximize(p.userId, false)}
                             >
                                 {hasVideo ? (
                                     <video autoPlay playsInline className="w-full h-full object-cover rounded-lg" ref={el => { if(el) el.srcObject = p.stream || null }} />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={getUser(p.userId)?.avatar} />
                                            <AvatarFallback>{getUser(p.userId)?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                     </div>
                                 )}
                             </div>
                             {hasScreen && (
                                 <div 
                                    className="relative aspect-video bg-card rounded-lg border-2 border-green-500 shrink-0 w-48 cursor-pointer"
                                    onClick={() => handleMaximize(p.userId, true)}
                                 >
                                     <video autoPlay playsInline className="w-full h-full object-contain bg-black rounded-lg" ref={el => { if(el) el.srcObject = p.screenStream || null }} />
                                     <div className="absolute bottom-1 right-1 bg-green-600 text-[10px] px-1 rounded text-white">Screen</div>
                                 </div>
                             )}
                         </div>
                     );
                 })}
             </div>
             
             {/* Controls (Same as before) */}
             <div className="h-20 bg-card border-t border-border flex items-center justify-between px-6 shrink-0 z-10 relative shadow-lg">
                {/* ... (Controls content, duplicated for now or extract to component) */}
                <div className="flex items-center gap-2 w-1/3">
                   <div className="flex flex-col">
                       <span className="text-sm font-bold flex items-center gap-2 text-green-500">
                           <Wifi className="h-4 w-4" /> Connected
                       </span>
                       <span className="text-xs text-muted-foreground">Voice Channel / {connectionQuality}</span>
                   </div>
               </div>
               <div className="flex items-center justify-center gap-4 w-1/3">
                   <Button variant={isMuted ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={toggleMute}>{isMuted ? <MicOff /> : <Mic />}</Button>
                   <Button variant={isDeafened ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={toggleDeafen}>{isDeafened ? <HeadphoneOff /> : <Headphones />}</Button>
                   <Button variant={isVideoEnabled ? "default" : "secondary"} size="icon" className={cn("rounded-full h-12 w-12", isVideoEnabled && "bg-green-600 hover:bg-green-700")} onClick={toggleVideo}>{isVideoEnabled ? <Video /> : <VideoOff />}</Button>
                   <Button variant={isScreenSharing ? "default" : "secondary"} size="icon" className={cn("rounded-full h-12 w-12", isScreenSharing && "bg-green-600 hover:bg-green-700")} onClick={toggleScreenShare}>{isScreenSharing ? <MonitorOff /> : <Monitor />}</Button>
                   <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 ml-2" onClick={() => onLeave && onLeave()}><PhoneOff /></Button>
               </div>
               <div className="flex items-center justify-end gap-2 w-1/3">
                    {onToggleChat && <Button variant="ghost" size="icon" onClick={onToggleChat}><MessageSquare className="h-5 w-5" /></Button>}
                    <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
               </div>
             </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative transition-colors duration-300">
       {/* Grid Area */}
       <div className="flex-1 p-4 overflow-y-auto min-h-0">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center h-full content-center max-w-7xl mx-auto">
               {/* Me */}
               <div className={cn(
                   "relative aspect-video bg-card rounded-xl flex flex-col items-center justify-center border-2 transition-all shadow-sm overflow-hidden group",
                   isSpeakingNow ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "border-border"
               )}>
                   {(localScreenStream || (localStream && localStream.getVideoTracks().length > 0)) ? (
                       renderVideo(localScreenStream || localStream || undefined, !!localScreenStream, userId)
                   ) : (
                       <>
                        <Avatar className={cn("h-24 w-24 mb-3 transition-transform duration-200 z-10", isSpeakingNow && "scale-110")}>
                                <AvatarImage src={getUser(userId)?.avatar} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{getUser(userId)?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            {/* If local has screen or video, show maximize but since we are showing avatar, nothing to maximize usually unless we want to maximize the 'card' */}
                        </div>
                       </>
                   )}

                   <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-sm flex items-center gap-2 backdrop-blur-sm z-20">
                       {isMuted ? <MicOff className="h-3.5 w-3.5 text-destructive" /> : <Mic className="h-3.5 w-3.5 text-green-400" />}
                       <span className="font-medium max-w-[100px] truncate">{getUser(userId)?.username || "You"}</span>
                   </div>
                   {isDeafened && (
                       <div className="absolute top-3 right-3 bg-destructive/90 p-1.5 rounded-full shadow-sm z-20">
                           <HeadphoneOff className="h-4 w-4 text-white" />
                       </div>
                   )}
               </div>

               {/* Participants */}
               {participants.map(p => {
                   const user = getUser(p.userId);
                   const hasVideo = (p.stream && p.stream.getVideoTracks().length > 0);
                   const hasScreen = !!p.screenStream;
                   
                   // We specifically check isVideoEnabled property from state to allow turning off camera
                   // If isVideoEnabled is undefined, default to hasVideo (assume true if tracks exist and no status received)
                   const isVideoActive = hasVideo && (p.isVideoEnabled !== false);
                   
                   const streamToShow = hasScreen ? p.screenStream : (isVideoActive ? p.stream : null);
                   const isScreen = hasScreen; // Prioritize screen share in display logic
                   const showVideoElement = hasScreen || isVideoActive;

                   return (
                       <div key={p.userId} className={cn(
                           "relative aspect-video bg-card rounded-xl flex flex-col items-center justify-center border-2 transition-all shadow-sm overflow-hidden group",
                           p.isSpeaking ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "border-border"
                       )}>
                           {showVideoElement ? (
                               renderVideo(streamToShow || undefined, isScreen, p.userId)
                           ) : (
                               <Avatar className={cn("h-24 w-24 mb-3 transition-transform duration-200 z-10", p.isSpeaking && "scale-110")}>
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.username?.[0] || "U"}</AvatarFallback>
                               </Avatar>
                           )}
                           
                           <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-sm flex items-center gap-2 backdrop-blur-sm z-20">
                               {p.isMuted ? <MicOff className="h-3.5 w-3.5 text-destructive" /> : <Mic className="h-3.5 w-3.5 text-green-400" />} 
                               <span className="font-medium max-w-[100px] truncate">{user?.username || `User ${p.userId}`}</span>
                           </div>

                           {p.isDeafened && (
                               <div className="absolute top-3 right-3 bg-destructive/90 p-1.5 rounded-full shadow-sm z-20">
                                   <HeadphoneOff className="h-4 w-4 text-white" />
                               </div>
                           )}

                           {/* Hidden Audio Element (if video is present, video element handles audio) */}
                           {p.stream && !showVideoElement && !isDeafened && (
                               <audio 
                                   autoPlay 
                                   ref={el => {
                                       if (el && p.stream) {
                                           el.srcObject = p.stream;
                                           el.volume = volume[0] / 100; // Apply master volume
                                       }
                                   }} 
                               />
                           )}
                       </div>
                   );
               })}
           </div>
       </div>

       {/* Bottom Controls Bar */}
       <div className="h-20 bg-card border-t border-border flex items-center justify-between px-6 shrink-0 z-10 relative shadow-lg">
           
           {/* Connection Info / Left */}
           <div className="flex items-center gap-2 w-1/3">
               <div className="flex flex-col">
                   <span className="text-sm font-bold flex items-center gap-2 text-green-500">
                       <Wifi className="h-4 w-4" /> Connected
                   </span>
                   <span className="text-xs text-muted-foreground">Voice Channel / {connectionQuality}</span>
               </div>
           </div>

           {/* Center Controls */}
           <div className="flex items-center justify-center gap-4 w-1/3">
               {/* Microphone */}
               <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button 
                               variant={isMuted ? "destructive" : "secondary"} 
                               size="icon" 
                               className="rounded-full h-12 w-12 shadow-sm"
                               onClick={toggleMute}
                           >
                               {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>{isMuted ? "Unmute" : "Mute"}</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>

               {/* Deafen */}
               <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button 
                               variant={isDeafened ? "destructive" : "secondary"} 
                               size="icon" 
                               className="rounded-full h-12 w-12 shadow-sm"
                               onClick={toggleDeafen}
                           >
                               {isDeafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>{isDeafened ? "Undeafen" : "Deafen"}</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>

               {/* Video */}
               <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button 
                               variant={isVideoEnabled ? "default" : "secondary"}
                               size="icon" 
                               className={cn("rounded-full h-12 w-12 shadow-sm", isVideoEnabled && "bg-green-600 hover:bg-green-700")}
                               onClick={toggleVideo}
                           >
                               {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>{isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>

               {/* Screen Share */}
               <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button 
                               variant={isScreenSharing ? "default" : "secondary"} 
                               size="icon" 
                               className={cn("rounded-full h-12 w-12 shadow-sm", isScreenSharing && "bg-green-600 hover:bg-green-700")}
                               onClick={toggleScreenShare}
                           >
                               {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>
               
               {/* Disconnect Button */}
               <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button 
                               variant="destructive" 
                               size="icon"
                               className="rounded-full h-12 w-12 ml-2 shadow-sm"
                               onClick={() => onLeave && onLeave()}
                           >
                               <PhoneOff className="h-5 w-5" />
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>Disconnect</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>
           </div>

           {/* Right Controls */}
           <div className="flex items-center justify-end gap-2 w-1/3">
               {onToggleChat && (
                   <TooltipProvider>
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={onToggleChat}>
                               <MessageSquare className="h-5 w-5 text-muted-foreground" />
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>Show Chat</p>
                       </TooltipContent>
                   </Tooltip>
               </TooltipProvider>
               )}

               {/* Settings Dialog */}
               <Dialog>
                   <DialogTrigger asChild>
                       <Button variant="ghost" size="icon">
                           <Settings className="h-5 w-5 text-muted-foreground" />
                       </Button>
                   </DialogTrigger>
                   <DialogContent>
                       <DialogHeader>
                           <DialogTitle>Voice Settings</DialogTitle>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                           <div className="space-y-2">
                               <Label>Input Device</Label>
                               <Select value={selectedInput} onValueChange={setSelectedInput}>
                                   <SelectTrigger>
                                       <SelectValue placeholder="Select microphone" />
                                   </SelectTrigger>
                                   <SelectContent className="z-[200]">
                                       {inputDevices.map(device => (
                                           <SelectItem key={device.deviceId} value={device.deviceId}>
                                               {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                           </SelectItem>
                                       ))}
                                   </SelectContent>
                               </Select>
                           </div>
                           
                           <div className="space-y-2">
                               <Label>Output Device</Label>
                               <Select value={selectedOutput} onValueChange={setSelectedOutput}>
                                   <SelectTrigger>
                                       <SelectValue placeholder="Select speakers" />
                                   </SelectTrigger>
                                   <SelectContent className="z-[200]">
                                       {outputDevices.map(device => (
                                           <SelectItem key={device.deviceId} value={device.deviceId}>
                                               {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                                           </SelectItem>
                                       ))}
                                   </SelectContent>
                               </Select>
                           </div>

                           <div className="space-y-2">
                               <Label>Output Volume</Label>
                               <div className="flex items-center gap-4">
                                   <Volume2 className="h-4 w-4 text-muted-foreground" />
                                   <Slider 
                                       value={volume} 
                                       onValueChange={setVolume} 
                                       max={100} 
                                       step={1} 
                                   />
                                   <span className="text-sm text-muted-foreground w-8">{volume}%</span>
                               </div>
                           </div>
                       </div>
                   </DialogContent>
               </Dialog>
           </div>
       </div>
    </div>
  );
}
