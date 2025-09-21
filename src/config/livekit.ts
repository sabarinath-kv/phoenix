// LiveKit Configuration
// This file contains configuration for LiveKit voice chat integration

export interface LiveKitConfig {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  roomName: string;
}

// Environment-based configuration
export const getLiveKitConfig = (): LiveKitConfig => {
  const config: LiveKitConfig = {
    serverUrl: import.meta.env.VITE_LIVEKIT_SERVER_URL || 'wss://your-livekit-server.com',
    apiKey: import.meta.env.VITE_LIVEKIT_API_KEY || '',
    apiSecret: import.meta.env.VITE_LIVEKIT_API_SECRET || '',
    roomName: import.meta.env.VITE_LIVEKIT_ROOM_NAME || 'voice-chat-room',
  };

  return config;
};

// Token generation (should be done on your backend in production)
export const generateAccessToken = async (
  config: LiveKitConfig,
  participantName: string,
  roomName?: string
): Promise<string> => {
  // In production, this should be an API call to your backend
  // Your backend should generate the token using the LiveKit server SDK
  
  const response = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      participantName,
      roomName: roomName || config.roomName,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate access token');
  }

  const { token } = await response.json();
  return token;
};

// Demo token for development (replace with real implementation)
export const generateDemoToken = (): string => {
  // This is a placeholder token for demo purposes
  // In a real application, you would call your backend API to generate a proper JWT token
  return 'demo-token-' + Math.random().toString(36).substring(7);
};

// Voice assistant configuration
export interface VoiceAssistantConfig {
  model: string;
  voice: string;
  language: string;
  enableTranscription: boolean;
  enableVAD: boolean; // Voice Activity Detection
}

export const getVoiceAssistantConfig = (): VoiceAssistantConfig => ({
  model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
  voice: import.meta.env.VITE_AI_VOICE || 'alloy',
  language: import.meta.env.VITE_AI_LANGUAGE || 'en-US',
  enableTranscription: true,
  enableVAD: true,
});

// Audio settings
export interface AudioSettings {
  sampleRate: number;
  channels: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export const getAudioSettings = (): AudioSettings => ({
  sampleRate: 48000,
  channels: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
});
