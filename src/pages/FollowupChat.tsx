/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    RoomAudioRenderer,
    RoomContext,
    useParticipants,
    useTracks,
  } from '@livekit/components-react';
  import { Room, Track, RoomEvent, ConnectionState, RemoteParticipant } from 'livekit-client';
  import '@livekit/components-styles';
  import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FollowupChatUI } from '@/components/FollowupChatUI';
  
export default function FollowupChatPage() {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: false,
        dynacast: false,
      })
  );
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true); // Default enabled
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [autoMicEnabled, setAutoMicEnabled] = useState(true); // Auto-enable mic in listening state
  const [isFirstmsgDone, setIsFirstmsgDone] = useState(false);
  
  // New state for UI management
  const [aiTranscript, setAiTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'ai' | 'user'; message: string; timestamp: Date }>>([]);
  const [isListening, setIsListening] = useState(true);
  
  // Text chat mode state
  const [isTextChatMode, setIsTextChatMode] = useState(false);
  const [textMessages, setTextMessages] = useState<Array<{ role: 'ai' | 'user'; message: string; timestamp: Date }>>([]);
  const lastCallTime = useRef(0);
  const { user, getLivekitTokenResponse, livekitTokenResponse, refreshLivekitTokenResponse } = useAuth();
  const agentId = useRef('');

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

          // Enable microphone by default
          await room.localParticipant.setMicrophoneEnabled(true);
          console.log('🎤 [LiveKit] Microphone enabled by default');
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
      setTimeout(() => {
        setConnectionState(ConnectionState.Connected);
        setConnected(true);

      }, 1000);
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
      
      // Check if this is the agent
      if (participant.identity === 'agent' || participant.name === 'agent' || !participant.isLocal) {
        agentId.current = participant.identity;
        setAgentConnected(true);
        console.log('🤖 [Agent] Agent connected and ready');
      }
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log('👋 [LiveKit] Participant disconnected:', {
        identity: participant.identity,
        name: participant.name,
        sid: participant.sid
      });
      
      // Check if this was the agent
      if (participant.identity === 'agent' || participant.name === 'agent' || !participant.isLocal) {
        setAgentConnected(false);
        setAgentSpeaking(false);
        setIsListening(false);
        console.log('🤖 [Agent] Agent disconnected');
      }
    };

    // Audio track events
    const handleTrackSubscribed = (track: any, publication: any, participant: RemoteParticipant) => {
      console.log('🎵 [LiveKit] Track subscribed:', {
        kind: track.kind,
        source: track.source,
        participant: participant.identity,
        enabled: track.enabled,
        muted: track.muted,
        isAgent: !participant.isLocal
      });

      if (track.kind === Track.Kind.Audio && !participant.isLocal) {
        console.log('🔊 [LiveKit] Agent audio track received - Agent is starting to speak');
        
        // Save any pending user transcript before agent starts speaking
        if (userTranscript.trim()) {
          console.log('💬 [Transcript] Saving user transcript before agent speaks:', userTranscript);
          setChatHistory(prev => [...prev, {
            role: 'user',
            message: userTranscript.trim(),
            timestamp: new Date()
          }]);
          setUserTranscript('');
        }
        
        // Set agent speaking state and switch UI
        // setAgentSpeaking(true);
        // setIsListening(false);
        console.log('🎯 [UI State] Agent started speaking - switching to AI speaking UI');
        
        // Ensure audio context is started and track is properly attached
        const ensureAudioPlayback = async () => {
          try {
            // Force start audio context
            console.log('🔊 [LiveKit] Starting audio context...');
            await room.startAudio();
            
            // Attach the audio track to DOM
            console.log('🔊 [LiveKit] Attaching audio track...');
            const audioElement = track.attach();
            if (audioElement) {
              audioElement.autoplay = true;
              audioElement.playsInline = true;
              audioElement.volume = 1.0;
              
              // Append to body to ensure it plays
              document.body.appendChild(audioElement);
              
              // Force play
              try {
                await audioElement.play();
                console.log('🔊 [LiveKit] Audio element playing successfully');
              } catch (playError) {
                console.error('🔊 [LiveKit] Audio play failed:', playError);
              }
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
        participant: participant.identity,
        isAgent: !participant.isLocal
      });

      if (track.kind === Track.Kind.Audio && !participant.isLocal) {
        console.log('🔇 [LiveKit] Agent audio stopped - Agent finished speaking');
        
        // Save AI transcript to chat history if we have one
        if (aiTranscript.trim()) {
          console.log('💬 [Transcript] Saving AI transcript after agent stops speaking:', aiTranscript);
          setChatHistory(prev => [...prev, {
            role: 'ai',
            message: aiTranscript.trim(),
            timestamp: new Date()
          }]);
          setAiTranscript('');
        }
        
        // Set agent speaking to false
        setAgentSpeaking(false);
        
        // Switch to listening mode if agent is still connected
        if (agentConnected) {
          console.log('🎯 [UI State] Agent stopped speaking - switching to listening UI');
          // setIsListening(true);
          
        } else {
          console.log('🎯 [UI State] Agent disconnected - not switching to listening mode');
          setIsListening(false);
        }
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
        from: participant?.identity || 'unknown',
        isFromAgent: participant ? !participant.isLocal : false
      });
      
      try {
        const data = JSON.parse(message);
        if (data.type === 'transcript') {
          if (participant && !participant.isLocal) {
            // AI transcript from agent
            console.log('💬 [Transcript] AI transcript received:', data.text);
            setAiTranscript(data.text || '');
          } else {
            // User transcript (from local participant or system)
            console.log('💬 [Transcript] User transcript received:', data.text);
            // setUserTranscript(data.text || '');
          }
        } else if (data.type === 'text_message_response') {
          // Handle AI response to text message
          if (participant && !participant.isLocal) {
            console.log('💬 [TextChat] AI text response received:', data.content);
            const aiResponse = {
              role: 'ai' as const,
              message: data.content,
              timestamp: new Date()
            };
            setTextMessages(prev => [...prev, aiResponse]);
          }
        } else if (data.type === 'agent_speaking_start') {
          console.log('🎯 [Agent State] Agent speaking start signal received');
          // setAgentSpeaking(true);
          setIsListening(false);
        } else if (data.type === 'agent_speaking_end') {
          console.log('🎯 [Agent State] Agent speaking end signal received');
          // setAgentSpeaking(false);
          if (agentConnected) {
            // setIsListening(true);
          }
        }
      } catch (error) {
        console.log('📨 [LiveKit] Non-JSON data received:', message);
        // Handle plain text messages
        if (participant && !participant.isLocal) {
          // Treat as AI transcript
          console.log('💬 [Transcript] Plain text from agent:', message);
          setAiTranscript(message);
        }
      }
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

    room.on(RoomEvent.ActiveSpeakersChanged, (data) => {
        const now = Date.now();
        if (now - lastCallTime.current < 2000) {
            return; // Skip if less than 1 second since last execution
        }
        lastCallTime.current = now;

        if(data.length > 0 && data[0].isLocal == false) {
            setAgentSpeaking(true);
            setIsListening(false);
        } else {
            setTimeout(() => {
                setAgentSpeaking(false);
                // setIsListening(true);
            }, 1000);
        }
        console.log('🎤 [LiveKit] Active speakers changed:', data);
    });

    room.on(RoomEvent.LocalAudioSilenceDetected, (data) => {
        const now = Date.now();
        if (now - lastCallTime.current < 5000) {
            return; // Skip if less than 1 second since last execution
        }
        lastCallTime.current = now;

        if(data.isLocal) {
            // setAgentSpeaking(true);
            // setIsListening(false);
        }
        console.log('🎤 [LiveKit] Active speakers changed:', data);
    });

    room.on(RoomEvent.TranscriptionReceived, (data) => {
        if (data.length > 0) {  
            setAiTranscript(data[0].text);
    }
        console.log('🎤 [LiveKit] Transcription received:', data);
    });

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

  // State logging and management
  useEffect(() => {
    console.log('🎯 [UI State] Current state:', {
      connected,
      agentConnected,
      agentSpeaking,
      isListening,
      micEnabled,
      autoMicEnabled,
      hasAiTranscript: !!aiTranscript,
      hasUserTranscript: !!userTranscript,
      aiTranscriptLength: aiTranscript.length,
      userTranscriptLength: userTranscript.length,
      chatHistoryLength: chatHistory.length,
      connectionState: connectionState,
      roomState: room.state,
      canPlaybackAudio: room.canPlaybackAudio,
      numParticipants: room.numParticipants
    });
    
    // Log the expected UI state
    if (agentSpeaking) {
      console.log('🎯 [UI Expected] Should show: AI Speaking UI with transcript');
    } else if (isListening) {
      console.log('🎯 [UI Expected] Should show: Listening UI with Wigloo illustration');
    } else {
      console.log('🎯 [UI Expected] Should show: Default/waiting state');
    }
  }, [connected, agentConnected, agentSpeaking, isListening, micEnabled, autoMicEnabled, aiTranscript, userTranscript, chatHistory, connectionState, room]);

  // Auto-switch to listening when agent connects and is not speaking
  useEffect(() => {
    if (agentConnected && !agentSpeaking && connected) {
    //   setIsListening(true);
      console.log('🎯 [UI State] Agent connected and not speaking - auto-switching to listening mode');
      
    }
  }, [agentConnected, agentSpeaking, connected, autoMicEnabled]);

  // Simple mic toggle handler - user controlled only
  const handleToggleMic = async () => {
    const next = !micEnabled;
    console.log(`🎤 [LiveKit] Toggling microphone: ${next ? 'ON' : 'OFF'}`);
    
    try {
      setMicEnabled(next);
      await room.localParticipant.setMicrophoneEnabled(next);
    } catch (error) {
      console.error('🎤 [LiveKit] Error toggling microphone:', error);
      // Revert state on error
      setMicEnabled(!next);
    }
  };

  const handleToggleChat = () => {
    console.log('🗨️ [VoiceChat] Chat toggled');
    setIsTextChatMode(!isTextChatMode);
    
    if (!isTextChatMode) {
      console.log('🗨️ [VoiceChat] Entered text chat mode');
    } else {
      console.log('🗨️ [VoiceChat] Exited text chat mode');
    }
  };

  const handleToggleAutoMic = () => {
    const newAutoMicState = !autoMicEnabled;
    setAutoMicEnabled(newAutoMicState);
    console.log(`🎤 [Auto-Mic] Auto-mic ${newAutoMicState ? 'enabled' : 'disabled'}`);
  };

  const handleSendTextMessage = async (message: string) => {
    if (!message.trim() || !connected) return;
    
    // Add user message to text messages
    const userMessage = {
      role: 'user' as const,
      message: message.trim(),
      timestamp: new Date()
    };
    setTextMessages(prev => [...prev, userMessage]);
    
    try {
      // Send text message via LiveKit data channel
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ 
          type: 'text_message', 
          content: message.trim() 
        })),
        { reliable: true }
      );
      
      console.log('📤 [TextChat] Sent text message:', message);
      
      // Note: AI response will come via DataReceived event from the agent
      // If no response comes within 5 seconds, show a fallback message
      setTimeout(() => {
        // Check if we got a response from the agent
        setTextMessages(current => {
          const lastMessage = current[current.length - 1];
          if (lastMessage && lastMessage.role === 'user' && lastMessage.message === message.trim()) {
            // No AI response received, add fallback
            const fallbackResponse = {
              role: 'ai' as const,
              message: `I received your message: "${message.trim()}". Let me think about that...`,
              timestamp: new Date()
            };
            return [...current, fallbackResponse];
          }
          return current;
        });
      }, 5000);
      
    } catch (error) {
      console.error('❌ [TextChat] Failed to send text message:', error);
    }
  };

  const handleEndChat = async () => {
    console.log('🔌 [VoiceChat] Ending chat...');
    room.disconnect();
    setConnected(false);
  };

  // Enable audio on first interaction if needed
  const enableAudioIfNeeded = async () => {
    if (!room.canPlaybackAudio) {
      try {
        console.log('🔊 [LiveKit] User interaction - enabling audio');
        await room.startAudio();
        console.log('🔊 [LiveKit] Audio enabled by user interaction');
      } catch (error) {
        console.error('🔊 [LiveKit] Failed to enable audio:', error);
      }
    }
  };

  useEffect(() => {
    // Enable audio on component mount if possible
    enableAudioIfNeeded();
  }, [room]);


  return (
    <RoomContext.Provider value={room}>
      <div className="mobile-full-screen bg-white">
        <FollowupChatUI
          isAISpeaking={agentSpeaking}
          isConnected={connected}
          isListening={isListening}
          aiTranscript={aiTranscript}
          userTranscript={userTranscript}
          chatHistory={chatHistory}
          onToggleMic={handleToggleMic}
          onToggleChat={handleToggleChat}
          onEndChat={handleEndChat}
          onToggleAutoMic={handleToggleAutoMic}
          micEnabled={micEnabled}
          agentConnected={agentConnected}
          autoMicEnabled={autoMicEnabled}
          room={room}
          isTextChatMode={isTextChatMode}
          textMessages={textMessages}
          onSendTextMessage={handleSendTextMessage}
        />
        
        {/* Audio output - hidden but necessary */}
        <RoomAudioRenderer />
        
        {/* Debug panel for development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <AudioDebugPanel room={room} />
        )} */}
      </div>
    </RoomContext.Provider>
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