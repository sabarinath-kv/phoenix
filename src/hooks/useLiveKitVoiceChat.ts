import { useState, useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteAudioTrack, LocalAudioTrack, AudioCaptureOptions } from 'livekit-client';

export interface VoiceChatState {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface VoiceChatConfig {
  serverUrl: string;
  token: string;
  onMessage?: (message: string, isFromUser: boolean) => void;
  onStateChange?: (state: VoiceChatState) => void;
}

export const useLiveKitVoiceChat = (config?: VoiceChatConfig) => {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    error: null,
  });

  const roomRef = useRef<Room | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);

  const updateState = useCallback((updates: Partial<VoiceChatState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      config?.onStateChange?.(newState);
      return newState;
    });
  }, [config]);

  const connect = useCallback(async (serverUrl?: string, token?: string) => {
    if (state.isConnected || state.isConnecting) return;

    const url = serverUrl || config?.serverUrl;
    const authToken = token || config?.token;

    if (!url || !authToken) {
      updateState({ error: 'Server URL and token are required' });
      return;
    }

    try {
      updateState({ isConnecting: true, error: null });

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.Connected, () => {
        updateState({ isConnected: true, isConnecting: false });
      });

      room.on(RoomEvent.Disconnected, () => {
        updateState({ 
          isConnected: false, 
          isConnecting: false,
          isListening: false,
          isSpeaking: false,
          isProcessing: false
        });
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        // Handle audio playback changes
        const isPlaying = room.canPlaybackAudio;
        updateState({ isSpeaking: isPlaying });
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'audio' && track instanceof RemoteAudioTrack) {
          // AI is speaking
          updateState({ isSpeaking: true, isListening: false, isProcessing: false });
          
          // Simulate message reception
          config?.onMessage?.('AI response received', false);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === 'audio') {
          updateState({ isSpeaking: false });
        }
      });

      // Connect to the room
      await room.connect(url, authToken);

      // Enable microphone
      const audioOptions: AudioCaptureOptions = {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      };

      const localAudioTrack = await room.localParticipant.setMicrophoneEnabled(true, audioOptions);
      localAudioTrackRef.current = localAudioTrack as LocalAudioTrack;

    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false 
      });
    }
  }, [state.isConnected, state.isConnecting, config, updateState]);

  const disconnect = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      await roomRef.current.disconnect();
      roomRef.current = null;
      localAudioTrackRef.current = null;
    } catch (error) {
      console.error('Error disconnecting from room:', error);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!state.isConnected) return;
    
    updateState({ isListening: true, isSpeaking: false, isProcessing: false });
    
    // In a real implementation, this would trigger voice activity detection
    // For demo purposes, we'll simulate the listening state
  }, [state.isConnected, updateState]);

  const stopListening = useCallback(() => {
    updateState({ isListening: false, isProcessing: true });
    
    // Simulate processing delay
    setTimeout(() => {
      updateState({ isProcessing: false });
      config?.onMessage?.('User voice input processed', true);
    }, 1000);
  }, [updateState, config]);

  const sendTextMessage = useCallback(async (message: string) => {
    if (!roomRef.current || !state.isConnected) return;

    try {
      // Send text message to the room (this would be processed by your AI agent)
      await roomRef.current.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ type: 'text', content: message })),
        { reliable: true }
      );
      
      config?.onMessage?.(message, true);
    } catch (error) {
      console.error('Failed to send text message:', error);
      updateState({ error: 'Failed to send message' });
    }
  }, [state.isConnected, config, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    state,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendTextMessage,
    room: roomRef.current,
  };
};

// Demo/fallback implementation for when LiveKit is not configured
export const useDemoVoiceChat = () => {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    // Simulate connection delay
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false 
      }));
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    }));
  }, []);

  const startListening = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: true, 
      isSpeaking: false, 
      isProcessing: false 
    }));
    
    // Simulate listening timeout
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        isProcessing: true 
      }));
      
      // Simulate processing
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false 
        }));
      }, 1500);
    }, 3000);
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: false, 
      isProcessing: true 
    }));
    
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false 
      }));
    }, 1000);
  }, []);

  const sendTextMessage = useCallback(async (message: string) => {
    // Demo implementation - just log the message
    console.log('Demo: Sending text message:', message);
  }, []);

  return {
    state,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendTextMessage,
    room: null,
  };
};
