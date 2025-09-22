import React, { useState, useEffect, useRef } from 'react';
import { WinglooIllustration } from './WinglooIllustration';
import { useParticipants } from '@livekit/components-react';
import { Room } from 'livekit-client';
import wiglooImage from '@/assets/images/wigloo-image.png';

interface VoiceChatUIProps {
  isAISpeaking: boolean;
  isListening: boolean;
  aiTranscript: string;
  userTranscript: string;
  chatHistory: Array<{ role: 'ai' | 'user'; message: string; timestamp: Date }>;
  onToggleMic: () => void;
  onToggleChat: () => void;
  onEndChat: () => void;
  onToggleAutoMic: () => void;
  micEnabled: boolean;
  agentConnected: boolean;
  autoMicEnabled: boolean;
  room: Room;
  isConnected: boolean;
  isTextChatMode: boolean;
  textMessages: Array<{ role: 'ai' | 'user'; message: string; timestamp: Date }>;
  onSendTextMessage: (message: string) => void;
}

export function VoiceChatUI({
  isAISpeaking,
  isListening,
  aiTranscript,
  userTranscript,
  chatHistory,
  onToggleMic,
  onToggleChat,
  onEndChat,
  onToggleAutoMic,
  micEnabled,
  agentConnected,
  autoMicEnabled,
  room,
  isConnected,
  isTextChatMode,
  textMessages,
  onSendTextMessage
}: VoiceChatUIProps) {
  const [currentView, setCurrentView] = useState<'thinking' | 'speaking' | 'listening'>('thinking');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSlideTransition, setIsSlideTransition] = useState(false);

  const handleChatToggle = () => {
    setIsSlideTransition(true);
    // Small delay for smooth transition
    setTimeout(() => {
      onToggleChat();
      setIsSlideTransition(false);
    }, 150);
  };

  // Handle smooth transitions between UI states
  useEffect(() => {
    const newView = !isConnected ? 'thinking' : isAISpeaking ? 'speaking' : 'listening';
    
    if (newView !== currentView) {
      setIsTransitioning(true);
      
      // Longer delay for disconnect transitions to allow for smoother animation
      const transitionDelay = (currentView === 'thinking' || newView === 'thinking') ? 250 : 200;
      
      setTimeout(() => {
        setCurrentView(newView);
        setIsTransitioning(false);
      }, transitionDelay);
    }
  }, [isConnected, isAISpeaking, currentView]);

  // Log current UI state for debugging
  React.useEffect(() => {
    console.log('🎯 [UI State]', {
      agentConnected,
      isAISpeaking,
      isListening,
      micEnabled,
      hasAiTranscript: !!aiTranscript,
      hasUserTranscript: !!userTranscript
    });
  }, [agentConnected, isAISpeaking, isListening, micEnabled, aiTranscript, userTranscript]);

  if (isTextChatMode) {
    return (
      <div className={`transition-all duration-300 ease-in-out ${
        isSlideTransition ? 'transform translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
      }`}>
        <ChatBottomSheet
          messages={textMessages}
          onClose={handleChatToggle}
          onSendMessage={onSendTextMessage}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col mobile-full-screen overflow-hidden transition-all duration-500 ease-in-out ${
      isListening || !isConnected ? 'bg-[#F0F0F0]' : 'bg-white'
    } ${
      isSlideTransition ? 'transform translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
    }`}>
      {/* Background Layer with Flex Positioning */}
      <div className="flex-1 flex flex-col relative">
        {/* Decorative Background Elements */}
        <BackgroundEffects isBlankBg={isListening || !isConnected} />
         
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col p-4 safe-area-inset relative z-10">
          {/* Main Content Area - Moved to top */}
          <div className="flex flex-col items-center justify-center pt-[120px] space-y-6 flex-shrink-0">
            <div className="relative w-full">
              <div className={`transition-all duration-300 ${
                isTransitioning 
                  ? (currentView === 'thinking' ? 'animate-disconnect-fade-out' : 'animate-ui-transition-out')
                  : (currentView === 'thinking' ? 'animate-disconnect-fade-in' : 'animate-ui-transition-in')
              }`}>
                {currentView === 'thinking' && (
                  <ListeningView isListening={isListening} userTranscript={userTranscript} message="thinking" />
                )}
                {currentView === 'speaking' && (
                  <AISpeakingView aiTranscript={aiTranscript} />
                )}
                {currentView === 'listening' && (
                  <ListeningView isListening={isListening} userTranscript={userTranscript} message="listening" />
                )}
              </div>
            </div>
          </div>
          
          {/* Spacer for pushing bottom content down */}
          <div className="flex-1" />
          
          {/* Bottom Section */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            {/* Interaction hint */}
            {isAISpeaking && (
              <div className="flex justify-center">
                <p className="text-[#878787] text-sm font-medium leading-[19px] text-center">
                  Tap or start speaking to interrupt
                </p>
              </div>
            )}
            
            {/* Bottom Controls */}
            <div className="flex justify-center pb-[33px] items-center">
              <ControlPanel 
                onChatToggle={handleChatToggle}
                onMicToggle={onToggleMic}
                onEndChat={onEndChat}
                micEnabled={micEnabled}
                agentConnected={agentConnected}
                isAISpeaking={isAISpeaking}
                autoMicEnabled={autoMicEnabled}
                isTextChatMode={isTextChatMode}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Participant Count Display - Bottom Right */}
      {/* <ParticipantCounter room={room} /> */}
      
      {/* Control Buttons - Bottom Left */}
      {/* <BottomLeftControls 
        autoMicEnabled={autoMicEnabled}
        onToggleAutoMic={onToggleAutoMic}
        onDisconnect={onEndChat}
      /> */}
    </div>
  );
}

// Participant Counter Component
function ParticipantCounter({ room }: { room: Room }) {
  const participants = useParticipants();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono z-50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Participants: {participants.length}</span>
      </div>
      <div className="text-xs opacity-70 mt-1">
        Audio: {room.canPlaybackAudio ? '🔊' : '🔇'}
      </div>
    </div>
  );
}

// Bottom Left Controls Component
function BottomLeftControls({ 
  autoMicEnabled, 
  onToggleAutoMic,
  onDisconnect
}: { 
  autoMicEnabled: boolean; 
  onToggleAutoMic: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {/* Auto-Mic Toggle */}
      {/* <button
        onClick={onToggleAutoMic}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          autoMicEnabled 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${autoMicEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span>Auto-Mic {autoMicEnabled ? 'ON' : 'OFF'}</span>
      </button>
       */}
      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// Background Effects Component - Exact Figma layering and positioning
function BackgroundEffects({ isBlankBg }: { isBlankBg: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden m-4 rounded-[24px] border border-[#E0D0BB80] transition-all duration-500 ease-in-out">
      {isBlankBg ? (
        <div className="absolute inset-0 bg-[#F0F0F0] rounded-[24px] transition-all duration-500 ease-in-out" />
      ) : (
        <div className="relative w-full h-full bg-[#F0F0F0] rounded-[24px] overflow-hidden transition-all duration-500 ease-in-out">
          {/* Exact Figma layering order (bottom to top as they appear in children array) */}
          
          {/* Layer 1: Ellipse 35 - Bright yellow center-right */}
          <div 
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '372px',
              height: '362px',
              left: '111px',
              top: '451px',
              backgroundColor: '#F7E06D',
              filter: 'blur(207.4px)',
              zIndex: 1
            }}
          />
          
          {/* Layer 2: Ellipse 36 - Orange bottom-left */}
          <div 
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '303px',
              height: '224px',
              left: '-66px',
              top: '678px',
              backgroundColor: '#EEBF9B',
              filter: 'blur(207.4px)',
              zIndex: 2
            }}
          />
          
          {/* Layer 3: Ellipse 37 - Light yellow top-left */}
          <div 
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '372px',
              height: '246px',
              left: '0px',
              top: '-166px',
              backgroundColor: '#F9E99B',
              filter: 'blur(207.4px)',
              zIndex: 3
            }}
          />
          
          {/* Layer 4: Ellipse 39 - WHITE central character area (IMAGE-SVG in Figma) */}
          <div 
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '447.76px',
              height: '477.57px',
              left: '-55.65px',
              top: '124.46px',
              backgroundColor: '#FFFFFF',
              filter: 'blur(100px)',
              zIndex: 4
            }}
          />
          
          {/* Layer 5: Ellipse 38 - Purple top-right (topmost layer) */}
          <div 
            className="absolute rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: '303px',
              height: '224px',
              left: '167px',
              top: '-112px',
              backgroundColor: '#E391F5',
              filter: 'blur(207.4px)',
              zIndex: 5
            }}
          />
        </div>
      )}
    </div>
  );
}

// Control Panel Component - Clean separation of concerns
function ControlPanel({ 
  onChatToggle, 
  onMicToggle, 
  onEndChat, 
  micEnabled,
  agentConnected,
  isAISpeaking,
  autoMicEnabled,
  isTextChatMode
}: {
  onChatToggle: () => void;
  onMicToggle: () => void;
  onEndChat: () => void;
  micEnabled: boolean;
  agentConnected: boolean;
  isAISpeaking: boolean;
  autoMicEnabled: boolean;
  isTextChatMode?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-1.5 bg-white/50 border border-[rgba(224,208,187,0.5)] rounded-full">
      {/* Chat Button */}
      <button 
        onClick={onChatToggle}
        className={`relative flex items-center gap-2 px-4 py-4 border border-[rgba(224,208,187,0.5)] rounded-full transition-all duration-200 ${
          isTextChatMode 
            ? 'bg-[#3B82F6] text-white border-[#3B82F6]' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        {isTextChatMode && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
          <path d="M12.7487 6.66775L11.3322 5.25122L2.00327 14.5802V15.9967H3.4198L12.7487 6.66775ZM14.1653 5.25122L15.5818 3.8347L14.1653 2.41816L12.7487 3.8347L14.1653 5.25122ZM4.24959 18H0V13.7504L13.457 0.293369C13.8482 -0.0977898 14.4824 -0.0977898 14.8735 0.293369L17.7066 3.12643C18.0978 3.51759 18.0978 4.1518 17.7066 4.54295L4.24959 18Z" fill={isTextChatMode ? 'white' : '#3B3839'}/>
        </svg>
        <span className={`text-sm font-semibold leading-6 tracking-[0.4px] font-sans ${
          isTextChatMode ? 'text-white' : 'text-[#2E2E2E]'
        }`}>
          Chat
        </span>
      </button>
      
      {/* Mic Button */}
      <button 
        onClick={onMicToggle}
        disabled={!agentConnected || isAISpeaking}
        className={`relative flex items-center justify-center p-4 border border-[rgba(224,208,187,0.5)] rounded-full transition-colors bg-white hover:bg-gray-50`}
      >
        {autoMicEnabled && agentConnected && !isAISpeaking && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
        <svg width="24" height="24" viewBox="0 0 18 22" fill="none" className="flex-shrink-0">
          <path d="M8.94511 2C7.28821 2 5.94507 3.34315 5.94507 5V9C5.94507 10.6569 7.28821 12 8.94511 12C10.6019 12 11.9451 10.6569 11.9451 9V5C11.9451 3.34315 10.6019 2 8.94511 2ZM8.94511 0C11.7065 0 13.9451 2.23858 13.9451 5V9C13.9451 11.7614 11.7065 14 8.94511 14C6.18364 14 3.94507 11.7614 3.94507 9V5C3.94507 2.23858 6.18364 0 8.94511 0ZM0 10H2.01596C2.50119 13.3923 5.4186 16 8.94511 16C12.4715 16 15.3889 13.3923 15.8742 10H17.8901C17.429 14.1716 14.1167 17.4839 9.94511 17.9451V22H7.94511V17.9451C3.77345 17.4839 0.46115 14.1716 0 10Z" fill={
            !agentConnected || isAISpeaking 
              ? "#9CA3AF" 
              : micEnabled 
                ? "#DC2626" 
                : "#3B3839"
          }/>
        </svg>
      </button>
      
      {/* Close Button */}
      <button 
        onClick={onEndChat}
        className="flex items-center justify-center p-4 bg-[#F34E4E] rounded-full hover:bg-red-600 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 19 19" fill="none" className="flex-shrink-0">
          <path d="M8.04082 9.50003L0 1.4592L1.4592 0L9.50001 8.04074L17.5408 0L19 1.4592L10.9592 9.50003L19 17.5407L17.5408 19L9.50001 10.9592L1.4592 19L0 17.5407L8.04082 9.50003Z" fill="white"/>
        </svg>
      </button>
    </div>
  );
}

function AISpeakingView({ aiTranscript }: { aiTranscript: string }) {
  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto px-4 mt-[200px]">
      {/* Main Content Container */}
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Welcome Message */}
        <div className="flex flex-col space-y-4 px-10">
          <h1 className="text-[#393738] text-[29px] text-left font-normal leading-[40px] font-['Replay_Pro']">
          {aiTranscript}
          </h1>
          
          {/* <p className="text-[#393738] text-2xl font-normal leading-[30px] font-replay">
            ...I'll help understand your child better through fun games.
          </p>
          
          <p className="text-[#393738] text-2xl font-normal leading-[30px] font-replay">
            What's your child's name?
          </p> */}
        </div>
       
      </div>
    </div>
  );
}

// Animated dots component for thinking/listening states
function AnimatedDots() {
  return (
    <span className="inline-flex items-center ml-1">
      <span 
        className="w-[3px] h-[3px] bg-[#393738] rounded-full animate-dots-loading inline-block"
        style={{ animationDelay: '0s' }}
      />
      <span 
        className="w-[3px] h-[3px] bg-[#393738] rounded-full animate-dots-loading inline-block ml-1"
        style={{ animationDelay: '0.2s' }}
      />
      <span 
        className="w-[3px] h-[3px] bg-[#393738] rounded-full animate-dots-loading inline-block ml-1"
        style={{ animationDelay: '0.4s' }}
      />
    </span>
  );
}

function ListeningView({ isListening, userTranscript, message }: { isListening: boolean; userTranscript: string; message: string }) {
  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto px-4">
      {/* Listening Header */}
      
      {/* Character Illustration */}
      <div className="flex justify-center">
        <WinglooIllustration isListening={isListening} />
      </div>
      <div className="flex justify-center">
        <h1 className="text-[#393738] text-[28px] font-normal leading-[28px] font-['Replay_Pro'] text-center">
          Wingloo is <span className="italic">{message}</span>
          <AnimatedDots />
        </h1>
      </div>
      
      {/* User Transcript Bubble */}
      {userTranscript && (
        <div className="flex justify-center w-full">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40 max-w-full">
            <p className="text-[#393738] text-[24px] font-normal leading-[24px] font-['Replay Pro'] text-center">
              {userTranscript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


function ChatBottomSheet({ 
  messages, 
  onClose,
  onSendMessage
}: { 
  messages: Array<{ role: 'ai' | 'user'; message: string; timestamp: Date }>; 
  onClose: () => void;
  onSendMessage: (message: string) => void;
}) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col mobile-full-screen bg-[#F0F0F0] overflow-hidden transition-all duration-300 ease-in-out">
      {/* Bottom Sheet Container with rounded top corners */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-t-3xl border-t border-l border-r border-white/40 shadow-sm mt-4 mx-4">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="relative w-full h-full overflow-hidden">
            {/* Gradient blobs using flexbox positioning */}
            <div className="absolute inset-0">
              <div 
                className="absolute rounded-full transition-all duration-700 ease-in-out"
                style={{
                  width: '372px',
                  height: '362px',
                  left: '30%',
                  top: '60%',
                  backgroundColor: '#F7E06D',
                  filter: 'blur(207.4px)',
                }}
              />
              <div 
                className="absolute rounded-full transition-all duration-700 ease-in-out"
                style={{
                  width: '303px',
                  height: '224px',
                  left: '-10%',
                  bottom: '0%',
                  backgroundColor: '#EEBF9B',
                  filter: 'blur(207.4px)',
                }}
              />
              <div 
                className="absolute rounded-full transition-all duration-700 ease-in-out"
                style={{
                  width: '372px',
                  height: '246px',
                  left: '0%',
                  top: '-20%',
                  backgroundColor: '#F9E99B',
                  filter: 'blur(207.4px)',
                }}
              />
              <div 
                className="absolute rounded-full transition-all duration-700 ease-in-out"
                style={{
                  width: '447.76px',
                  height: '477.57px',
                  left: '-15%',
                  top: '15%',
                  backgroundColor: '#FFFFFF',
                  filter: 'blur(100px)',
                }}
              />
              <div 
                className="absolute rounded-full transition-all duration-700 ease-in-out"
                style={{
                  width: '303px',
                  height: '224px',
                  right: '10%',
                  top: '-15%',
                  backgroundColor: '#E391F5',
                  filter: 'blur(207.4px)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Layer with proper flex layout */}
        <div className="relative z-10 flex flex-col h-full p-4 rounded-t-3xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-[#454344] text-xl font-semibold font-['Replay_Pro']">
              Chat with Wingloo
            </h2>
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-xs border border-white/40 hover:bg-white/90 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 19 19" fill="none">
                <path d="M2.79 2.79L16.21 16.21M16.21 2.79L2.79 16.21" 
                      stroke="#393738" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-[#393738]/60 text-sm font-normal font-sans">
                      Start a conversation with Wingloo!
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      {message.role === 'ai' ? (
                        <div className="flex items-start gap-2 max-w-[85%]">
                          {/* Wingloo Avatar */}
                          <div className="flex-shrink-0 mt-1">
                            <img 
                              src={wiglooImage} 
                              alt="Wingloo" 
                              className="w-8 h-8 rounded-full object-cover border shadow-sm"
                            />
                          </div>
                          {/* AI Message Bubble */}
                          <div className="bg-white/90 backdrop-blur-sm text-[#393738] border border-white/40 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <p className="text-sm font-normal leading-[20px] font-sans">
                              {message.message}
                            </p>
                            <p className="text-xs mt-2 text-[#393738]/50 text-right">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm text-[#393738] border border-white/40 rounded-2xl rounded-br-md px-4 py-3 shadow-sm max-w-[85%]">
                          <p className="text-sm font-normal leading-[20px] font-sans">
                            {message.message}
                          </p>
                          <p className="text-xs mt-2 text-[#393738]/60 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 mt-4">
            <div className="flex items-center gap-3 p-2 bg-white/80 backdrop-blur-sm border-0 rounded-full shadow-sm">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-4 py-3 text-sm font-normal font-sans placeholder:text-[#393738]/50 border-0 outline-0 focus:outline-0 focus:border-0 focus:ring-0 focus:shadow-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex items-center justify-center bg-[#3B82F6] text-white rounded-full w-10 h-10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all duration-200 flex-shrink-0 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
