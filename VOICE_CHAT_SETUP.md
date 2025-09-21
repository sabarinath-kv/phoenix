# Voice Chat Setup Guide

This guide explains how to set up the voice chat feature using LiveKit for real-time voice communication with an AI agent.

## Features

- 🎤 **Real-time Voice Chat**: Talk directly with the AI using your microphone
- 🌊 **Voice Waveform Animations**: Beautiful Gemini-style voice indicators
- 📝 **Optional Text Chat**: Send text messages that get spoken as responses
- 🔄 **Transcription Toggle**: Enable/disable voice transcription display
- 📱 **Mobile Responsive**: Optimized for both desktop and mobile devices
- 🎨 **Consistent Theme**: Uses the existing application design system

## Demo Mode

The application currently runs in **demo mode** with simulated voice interactions. To enable real LiveKit integration, follow the setup instructions below.

## LiveKit Setup (Production)

### 1. LiveKit Server Setup

You have several options for LiveKit server:

#### Option A: LiveKit Cloud (Recommended)
1. Sign up at [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Get your server URL, API key, and API secret

#### Option B: Self-hosted LiveKit Server
1. Follow the [LiveKit Server installation guide](https://docs.livekit.io/realtime/self-hosting/)
2. Deploy LiveKit server on your infrastructure

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# LiveKit Configuration
VITE_LIVEKIT_SERVER_URL=wss://your-livekit-server.com
VITE_LIVEKIT_API_KEY=your-api-key
VITE_LIVEKIT_API_SECRET=your-api-secret
VITE_LIVEKIT_ROOM_NAME=voice-chat-room

# AI Configuration (Optional)
VITE_AI_MODEL=gpt-4
VITE_AI_VOICE=alloy
VITE_AI_LANGUAGE=en-US
```

### 3. Backend API Setup

Create an API endpoint to generate LiveKit tokens. Here's an example using Node.js:

```javascript
// /api/livekit/token.js
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { participantName, roomName } = req.body;

  if (!participantName || !roomName) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '10m', // Token expires in 10 minutes
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = at.toJwt();
  res.json({ token });
}
```

### 4. Enable Production Mode

Update the VoiceChat component to use the real LiveKit hook:

```typescript
// In src/pages/VoiceChat.tsx
import { useLiveKitVoiceChat } from '@/hooks/useLiveKitVoiceChat';

// Replace this line:
const voiceChat = useDemoVoiceChat();

// With this:
const voiceChat = useLiveKitVoiceChat({
  serverUrl: getLiveKitConfig().serverUrl,
  token: '', // Will be generated dynamically
  onMessage: (message, isFromUser) => {
    // Handle incoming messages
  },
  onStateChange: (state) => {
    // Handle state changes
  },
});
```

## AI Agent Integration

To connect with an actual AI agent, you'll need to:

### 1. Choose an AI Provider

- **OpenAI**: Use GPT-4 with voice capabilities
- **Google**: Use Gemini with voice features
- **Anthropic**: Use Claude with voice integration
- **Custom**: Build your own voice AI agent

### 2. Set up Voice Processing

The AI agent should:
1. Receive audio from LiveKit room
2. Process speech-to-text
3. Generate AI response
4. Convert response to speech
5. Send audio back to LiveKit room

### 3. Example AI Agent Structure

```typescript
// Example AI agent integration
class VoiceAIAgent {
  constructor(liveKitRoom, aiProvider) {
    this.room = liveKitRoom;
    this.ai = aiProvider;
    this.setupAudioProcessing();
  }

  async processVoiceInput(audioBuffer) {
    // 1. Speech to text
    const transcript = await this.ai.speechToText(audioBuffer);
    
    // 2. Generate AI response
    const response = await this.ai.generateResponse(transcript);
    
    // 3. Text to speech
    const audioResponse = await this.ai.textToSpeech(response);
    
    // 4. Send back to room
    await this.room.publishAudio(audioResponse);
  }
}
```

## Component Usage

### Basic Voice Chat

```tsx
import VoiceChat from '@/pages/VoiceChat';

// Use in your routing
<Route path="/voice-chat" element={<VoiceChat />} />
```

### Voice Waveform Components

```tsx
import { VoiceWaveform, VoicePulse, GeminiVoiceIndicator } from '@/components/VoiceWaveform';

// Basic waveform
<VoiceWaveform isActive={isListening} variant="large" />

// Pulse indicator
<VoicePulse isActive={isSpeaking} size="medium" />

// Gemini-style indicator
<GeminiVoiceIndicator
  isListening={isListening}
  isSpeaking={isSpeaking}
  isProcessing={isProcessing}
/>
```

## Customization

### Styling

The voice chat components use the existing design system. You can customize:

- Colors via CSS variables in `src/index.css`
- Animations in `tailwind.config.ts`
- Component variants in the component files

### Voice Settings

Modify audio settings in `src/config/livekit.ts`:

```typescript
export const getAudioSettings = (): AudioSettings => ({
  sampleRate: 48000,
  channels: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
});
```

## Troubleshooting

### Common Issues

1. **"Connection failed"**: Check your LiveKit server URL and credentials
2. **"No audio"**: Ensure microphone permissions are granted
3. **"Token expired"**: Implement token refresh logic
4. **"Poor audio quality"**: Adjust audio settings in configuration

### Debug Mode

Enable debug logging:

```typescript
// In your component
const voiceChat = useLiveKitVoiceChat({
  // ... other config
  debug: true,
});
```

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited WebRTC support
- Mobile browsers: Varies by device

## Security Considerations

1. **Token Security**: Never expose API secrets in frontend code
2. **Room Access**: Implement proper authentication
3. **Audio Privacy**: Ensure compliance with privacy regulations
4. **Rate Limiting**: Implement rate limiting on token generation

## Performance Tips

1. **Audio Quality**: Balance quality vs bandwidth
2. **Token Caching**: Cache tokens until near expiration
3. **Connection Pooling**: Reuse connections when possible
4. **Error Handling**: Implement robust error recovery

## Support

For issues with:
- **LiveKit**: Check [LiveKit Documentation](https://docs.livekit.io/)
- **Voice Chat UI**: Review component source code
- **AI Integration**: Consult your AI provider's documentation

## Next Steps

1. Set up your LiveKit server
2. Configure environment variables
3. Implement backend token generation
4. Connect your AI agent
5. Test with real users
6. Monitor and optimize performance
