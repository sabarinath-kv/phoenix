import {
    ControlBar,
    RoomAudioRenderer,
    RoomContext,
    useParticipants,
    useTracks,
    useConnectionState,
  } from '@livekit/components-react';
  import { Room, Track, RoomEvent, ConnectionState, RemoteParticipant, LocalParticipant } from 'livekit-client';
  import '@livekit/components-styles';
  import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Bot, Users, Wifi, WifiOff, Speaker } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
  
export default function VoiceChatPage() {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: false,
        dynacast: false,
      })
  );
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  const { user, getLivekitTokenResponse, livekitTokenResponse,refreshLivekitTokenResponse } = useAuth();


  useEffect(() => {
    getLivekitTokenResponse();
  }, []);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      if (mounted) {
        console.log('🔄 [LiveKit] Initiating connection to room...');
        console.log('🌐 [LiveKit] Server URL:', livekitTokenResponse.url);
        console.log('🎫 [LiveKit] Token provided:', !!livekitTokenResponse.access_token);
        
        setConnectionState(ConnectionState.Connecting);
        
        try {
          await room.connect(livekitTokenResponse?.url, livekitTokenResponse?.access_token, { autoSubscribe: true,  });
          console.log('✅ [LiveKit] Successfully connected to room');
          setConnected(true);

          // start mic disabled; enable after agent finishes speaking
          await room.localParticipant.setMicrophoneEnabled(false);
          console.log('🎤 [LiveKit] Microphone initially disabled');
        } catch (error) {
          console.error('❌ [LiveKit] Connection failed:', error);
          setConnected(false);
          setConnectionState(ConnectionState.Disconnected);
        }
      }
    };
    if (livekitTokenResponse?.access_token) {    
    connect();
    }
    return () => {
      mounted = false;
      console.log('🔌 [LiveKit] Disconnecting from room...');
      room.disconnect();
      setConnected(false);
    };
  }, [room, livekitTokenResponse?.access_token]);

  useEffect(() => {
    // Connection state events
    const handleConnected = () => {
      console.log('🟢 [LiveKit] Room connected');
      setConnectionState(ConnectionState.Connected);
      setConnected(true);
    };


    const handleDisconnected = (reason?: any) => {
      console.log('🔴 [LiveKit] Room disconnected:', reason);
      setConnectionState(ConnectionState.Disconnected);
      setConnected(false);
      setAgentSpeaking(false);
      refreshLivekitTokenResponse();
    };

    const handleReconnecting = () => {
      console.log('🔄 [LiveKit] Room reconnecting...');
      setConnectionState(ConnectionState.Reconnecting);
    };

    const handleReconnected = () => {
      console.log('🟢 [LiveKit] Room reconnected');
      setConnectionState(ConnectionState.Connected);
      setConnected(true);
    };

    // Participant events
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log('👥 [LiveKit] Participant connected:', {
        identity: participant.identity,
        name: participant.name,
        metadata: participant.metadata,
        sid: participant.sid
      });
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log('👋 [LiveKit] Participant disconnected:', {
        identity: participant.identity,
        name: participant.name,
        sid: participant.sid
      });
    };

    // Audio track events
    const handleTrackSubscribed = (track: any, publication: any, participant: RemoteParticipant) => {
      console.log('🎵 [LiveKit] Track subscribed:', {
        kind: track.kind,
        source: track.source,
        participant: participant.identity,
        enabled: track.enabled,
        muted: track.muted
      });

      if (track.kind === Track.Kind.Audio) {
        console.log('🔊 [LiveKit] Audio track from agent received');
        setAgentSpeaking(true);
        
        // Ensure audio context is started and track is properly attached
        const ensureAudioPlayback = async () => {
          try {
            // Start audio if not already started
            if (!room.canPlaybackAudio) {
              console.log('🔊 [LiveKit] Starting audio context...');
              await room.startAudio();
            }
            
            // Attach the audio track
            console.log('🔊 [LiveKit] Attaching audio track...');
            const audioElement = track.attach();
            if (audioElement) {
              audioElement.autoplay = true;
              audioElement.playsInline = true;
              console.log('🔊 [LiveKit] Audio element configured for playback');
            }
          } catch (error) {
            console.error('🔊 [LiveKit] Error setting up audio playback:', error);
          }
        };
        
        ensureAudioPlayback();
      }
    };

    const handleTrackUnsubscribed = (track: any, publication: any, participant: RemoteParticipant) => {
      console.log('🔇 [LiveKit] Track unsubscribed:', {
        kind: track.kind,
        source: track.source,
        participant: participant.identity
      });

      if (track.kind === Track.Kind.Audio) {
        console.log('🔇 [LiveKit] Agent audio stopped');
        setAgentSpeaking(false);
      }
    };

    const handleTrackMuted = (publication: any, participant: any) => {
      console.log('🔇 [LiveKit] Track muted:', {
        kind: publication.kind,
        source: publication.source,
        participant: participant.identity
      });
    };

    const handleTrackUnmuted = (publication: any, participant: any) => {
      console.log('🔊 [LiveKit] Track unmuted:', {
        kind: publication.kind,
        source: publication.source,
        participant: participant.identity
      });
    };

    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      const message = new TextDecoder().decode(payload);
      console.log('📨 [LiveKit] Data received:', {
        message,
        from: participant?.identity || 'unknown'
      });
    };

    const handleAudioPlaybackChanged = () => {
      console.log('🔊 [LiveKit] Audio playback status changed:', {
        canPlayback: room.canPlaybackAudio
      });
    };

    console.log('hereeee')

    // Register all event listeners
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.TrackMuted, handleTrackMuted);
    room.on(RoomEvent.TrackUnmuted, handleTrackUnmuted);
    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackChanged);

    // Log initial room state
    console.log('📊 [LiveKit] Initial room state:', {
      numParticipants: room.numParticipants,
      canPlaybackAudio: room.canPlaybackAudio,
      state: room.state
    });

    return () => {
      // Clean up event listeners
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.TrackMuted, handleTrackMuted);
      room.off(RoomEvent.TrackUnmuted, handleTrackUnmuted);
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackChanged);
    };
  }, [room]);

  return (
    <RoomContext.Provider value={room}>
      <div className="flex flex-col items-center justify-between h-screen p-6 bg-gradient-to-br from-indigo-100 to-purple-200">
        {/* Status Panel at the top */}
        <ConnectionStatusPanel 
          connectionState={connectionState}
          connected={connected}
          room={room}
        />

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Voice Chat with Agent
          </h1>

          {connected ? (
            <>
              <AgentStatus agentSpeaking={agentSpeaking} />
              
              {/* Audio Enable Button - helps with browser audio context */}
              {!room.canPlaybackAudio && (
                <button
                  onClick={async () => {
                    try {
                      console.log('🔊 [LiveKit] User clicked to enable audio');
                      await room.startAudio();
                      console.log('🔊 [LiveKit] Audio enabled by user interaction');
                    } catch (error) {
                      console.error('🔊 [LiveKit] Failed to enable audio:', error);
                    }
                  }}
                  className="mb-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Enable Audio</span>
                </button>
              )}
              
              <UserMic
                micEnabled={micEnabled}
                onToggle={async () => {
                  const next = !micEnabled;
                  console.log(`🎤 [LiveKit] Toggling microphone: ${next ? 'ON' : 'OFF'}`);
                  setMicEnabled(next);
                  await room.localParticipant.setMicrophoneEnabled(next);
                }}
              />
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-2">Connecting to room...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}
        </div>

        {/* Agent audio output - ensure audio is rendered properly */}
        <RoomAudioRenderer />
        <AudioDebugPanel room={room} />

        {/* Default controls at bottom */}
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: false,
            screenShare: false,
          }}
        />
      </div>
    </RoomContext.Provider>
  );
}

/**
 * Connection Status Panel - shows comprehensive connection information
 */
function ConnectionStatusPanel({ connectionState, connected, room }: { 
  connectionState: ConnectionState; 
  connected: boolean; 
  room: Room;
}) {
  const participants = useParticipants();
  const tracks = useTracks();
  
  const getConnectionStateColor = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.Connected:
        return 'bg-green-100 text-green-700 border-green-200';
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case ConnectionState.Disconnected:
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConnectionStateIcon = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.Connected:
        return <Wifi className="w-4 h-4" />;
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>;
      case ConnectionState.Disconnected:
        return <WifiOff className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const audioTracks = tracks.filter(track => track.publication.kind === 'audio');
  const remoteAudioTracks = audioTracks.filter(track => track.participant.isLocal === false);

  return (
    <div className="w-full max-w-4xl mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <div className={`p-4 rounded-lg border-2 ${getConnectionStateColor(connectionState)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {getConnectionStateIcon(connectionState)}
            <h3 className="font-semibold">Connection</h3>
          </div>
          <p className="text-sm capitalize">{connectionState.toLowerCase()}</p>
          <p className="text-xs mt-1">
            Audio Playback: {room.canPlaybackAudio ? '✅ Enabled' : '❌ Disabled'}
          </p>
        </div>

        {/* Participants */}
        <div className="p-4 rounded-lg border-2 bg-blue-100 text-blue-700 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4" />
            <h3 className="font-semibold">Participants</h3>
          </div>
          <p className="text-sm">Total: {participants.length}</p>
          <div className="text-xs mt-1 space-y-1">
            {participants.map((p, index) => (
              <div key={p.sid} className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${p.isLocal ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                <span>{p.identity || `Participant ${index + 1}`} {p.isLocal && '(You)'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Status */}
        <div className="p-4 rounded-lg border-2 bg-purple-100 text-purple-700 border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Speaker className="w-4 h-4" />
            <h3 className="font-semibold">Audio</h3>
          </div>
          <p className="text-sm">Remote Audio: {remoteAudioTracks.length} tracks</p>
          <div className="text-xs mt-1">
            {remoteAudioTracks.map((track, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${track.publication.isMuted ? 'bg-red-500' : 'bg-green-500'}`}></span>
                <span>{track.participant.identity || 'Unknown'}: {track.publication.isMuted ? 'Muted' : 'Playing'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Show whether agent is present in the room
 */
function AgentStatus({ agentSpeaking }: { agentSpeaking: boolean }) {
  const participants = useParticipants();
  const agentIdentity = "agent"; // use the same identity your backend assigns to AI agent
  const agent = participants.find((p) => !p.isLocal);
    console.log(participants);
  return (
    <div className="mb-8">
      {agent ? (
        <div className="flex items-center space-x-4">
          <span className="px-4 py-2 rounded-xl bg-green-100 text-green-700 font-medium flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>✅ Agent connected</span>
          </span>
          {agentSpeaking && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center space-x-1 animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>Speaking</span>
            </span>
          )}
        </div>
      ) : (
        <span className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-medium flex items-center space-x-2">
          <Bot className="w-4 h-4" />
          <span>❌ Agent not connected</span>
        </span>
      )}
    </div>
  );
}

/**
 * Audio Debug Panel - helps debug audio issues
 */
function AudioDebugPanel({ room }: { room: Room }) {
  const tracks = useTracks();
  const audioTracks = tracks.filter(track => track.publication.kind === 'audio');

  useEffect(() => {
    // Force enable audio playback
    const enableAudio = async () => {
      try {
        if (room && !room.canPlaybackAudio) {
          console.log('🔊 [AudioDebug] Attempting to enable audio playback...');
          await room.startAudio();
          console.log('🔊 [AudioDebug] Audio playback enabled');
        }
      } catch (error) {
        console.error('🔊 [AudioDebug] Failed to enable audio:', error);
      }
    };

    enableAudio();
  }, [room, audioTracks.length]);

  // Log audio track details
  useEffect(() => {
    audioTracks.forEach((track, index) => {
      console.log(`🎵 [AudioDebug] Audio track ${index}:`, {
        kind: track.publication.kind,
        source: track.publication.source,
        participant: track.participant.identity,
        isLocal: track.participant.isLocal,
        enabled: track.publication.isEnabled,
        muted: track.publication.isMuted,
        subscribed: track.publication.isSubscribed,
        trackSid: track.publication.trackSid,
      });

      // Try to attach the track if it's not local
      if (!track.participant.isLocal && track.publication.track) {
        console.log('🔊 [AudioDebug] Ensuring remote audio track is attached');
        track.publication.track.attach();
      }
    });
  }, [audioTracks]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
      <div>Audio Playback: {room.canPlaybackAudio ? '✅' : '❌'}</div>
      <div>Audio Tracks: {audioTracks.length}</div>
      {audioTracks.map((track, index) => (
        <div key={index} className="mt-1">
          {track.participant.identity || 'Unknown'}: 
          {track.publication.isEnabled ? '🟢' : '🔴'} 
          {track.publication.isMuted ? '🔇' : '🔊'}
        </div>
      ))}
    </div>
  );
}

/**
 * Show mic status + button
 */
function UserMic({ micEnabled, onToggle }: { micEnabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-20 h-20 rounded-full shadow-lg ${
          micEnabled ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
        {micEnabled ? <MicOff size={32} /> : <Mic size={32} />}
      </button>
      <span className="mt-3 text-gray-700 font-medium">
        {micEnabled ? "Mic On (speaking)" : "Mic Off (waiting)"}
      </span>
    </div>
  );
}