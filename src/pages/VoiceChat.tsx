import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, History, Sun, Moon, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScatteredVoiceSphere } from '@/components/ScatteredVoiceSphere';
import { useDemoVoiceChat } from '@/hooks/useLiveKitVoiceChat';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

type VoiceChatState = 'idle' | 'listening' | 'processing' | 'speaking' | 'text-mode';

const VoiceChat = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<VoiceChatState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState("Hello! I'm your AI companion. What can I help you with today?");
  const [showTextChat, setShowTextChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [userInputText, setUserInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showExpandedInput, setShowExpandedInput] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  
  const voiceChat = useDemoVoiceChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start voice chat on component mount
  useEffect(() => {
    const initializeVoiceChat = async () => {
      await voiceChat.connect();
      setCurrentState('listening');
      
      // Add initial AI greeting to messages
      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        isVoice: true
      };
      setMessages([initialMessage]);
      
      // Start with AI greeting and then begin listening
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(aiResponse);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.onstart = () => setCurrentState('speaking');
          utterance.onend = () => {
            setCurrentState('listening');
            startContinuousListening();
          };
          speechSynthesis.speak(utterance);
        } else {
          setCurrentState('listening');
          startContinuousListening();
        }
      }, 1000);
    };

    initializeVoiceChat();

    return () => {
      // Cleanup on unmount
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      voiceChat.disconnect();
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const startContinuousListening = useCallback(() => {
    // Don't start if already listening or if speech recognition is not supported
    if (isListeningRef.current || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    // Stop any existing recognition first
    stopListening();

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognitionRef.current = recognition;
    isListeningRef.current = true;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (isListeningRef.current) {
        setCurrentState('listening');
      }
    };

    recognition.onresult = (event) => {
      if (!isListeningRef.current) return;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript || finalTranscript);

      if (finalTranscript && finalTranscript.trim()) {
        handleUserVoiceInput(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      
      // Handle different error types
      if (event.error === 'aborted' || event.error === 'network') {
        // Don't restart on aborted or network errors immediately
        return;
      }
      
      if (event.error === 'not-allowed') {
        console.error('Microphone permission denied');
        setCurrentState('idle');
        return;
      }

      // For other errors, try to restart after a delay
      if (isListeningRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && currentState === 'listening') {
            startContinuousListening();
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      // Only restart if we're still supposed to be listening
      if (isListeningRef.current && currentState === 'listening') {
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && currentState === 'listening') {
            startContinuousListening();
          }
        }, 500);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      isListeningRef.current = false;
    }
  }, [currentState, stopListening]);

  const handleUserVoiceInput = useCallback((transcript: string) => {
    if (!transcript.trim()) return;

    // Stop listening while processing
    stopListening();
    setCurrentState('processing');
    setCurrentTranscript('');
    setUserInputText(transcript); // Show user input at bottom

    // Add user message to history
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      isVoice: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing and response
    setTimeout(() => {
      const aiResponses = [
        "That's really interesting! Tell me more about that.",
        "I understand. How does that make you feel?",
        "That sounds like a great experience. What was the best part?",
        "I can see why that would be important to you. What's your next step?",
        "Thanks for sharing that with me. Is there anything else you'd like to discuss?",
        "That's a thoughtful perspective. What led you to think about it that way?",
        "I appreciate you opening up about that. How can I help you with this?",
      ];

      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setAiResponse(response);

      // Add AI message to history
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        isVoice: true,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response
      if ('speechSynthesis' in window) {
        setCurrentState('speaking');
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setCurrentTranscript('');
          setUserInputText(''); // Clear user input when AI starts new question
          setCurrentState('listening');
          startContinuousListening();
        };
        speechSynthesis.speak(utterance);
      } else {
        setCurrentTranscript('');
        setUserInputText(''); // Clear user input when AI starts new question
        setCurrentState('listening');
        startContinuousListening();
      }
    }, 1500);
  }, [stopListening, startContinuousListening]);

  const handleTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Stop listening while processing
    stopListening();
    setCurrentState('processing');
    setCurrentTranscript('');
    setUserInputText(text); // Show user input at bottom

    // Add user message to history
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: false,
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing and response (same logic as voice input but without duplication)
    setTimeout(() => {
      const aiResponses = [
        "That's really interesting! Tell me more about that.",
        "I understand. How does that make you feel?",
        "That sounds like a great experience. What was the best part?",
        "I can see why that would be important to you. What's your next step?",
        "Thanks for sharing that with me. Is there anything else you'd like to discuss?",
        "That's a thoughtful perspective. What led you to think about it that way?",
        "I appreciate you opening up about that. How can I help you with this?",
      ];

      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setAiResponse(response);

      // Add AI message to history
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        isVoice: true,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response
      if ('speechSynthesis' in window) {
        setCurrentState('speaking');
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setCurrentTranscript('');
          setUserInputText(''); // Clear user input when AI starts new question
          setCurrentState('listening');
          startContinuousListening();
        };
        speechSynthesis.speak(utterance);
      } else {
        setCurrentTranscript('');
        setUserInputText(''); // Clear user input when AI starts new question
        setCurrentState('listening');
        startContinuousListening();
      }
    }, 1500);
  }, [stopListening, startContinuousListening]);

  const toggleTextChat = useCallback(() => {
    setShowTextChat(!showTextChat);
    if (!showTextChat) {
      // Switching to text mode
      stopListening();
      setCurrentState('text-mode');
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } else {
      // Switching back to voice mode
      setCurrentState('listening');
      startContinuousListening();
    }
  }, [showTextChat, stopListening, startContinuousListening]);

  // Theme-based styles
  const themeStyles = {
    dark: {
      background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
      buttonBg: 'bg-white/10 backdrop-blur-sm',
      buttonText: 'text-white/70 hover:text-white',
      buttonHover: 'hover:bg-white/20',
      textPrimary: 'text-white/90',
      textSecondary: 'text-white/60',
      inputBg: 'bg-white/10 backdrop-blur-sm',
      inputText: 'text-white placeholder-white/60',
      inputBorder: 'border-white/20',
      particleColor: '#ffffff20',
      cardBg: 'bg-gray-900/90 backdrop-blur-xl',
      border: 'border-white/5',
      userMessageBg: 'bg-gray-700/80 border border-gray-600/50',
      userMessageText: 'text-white/95',
      aiMessageBg: 'bg-gray-800/60 border border-gray-700/40',
      aiMessageText: 'text-white/90',
    },
    light: {
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      buttonBg: 'bg-black/10 backdrop-blur-sm',
      buttonText: 'text-gray-700 hover:text-gray-900',
      buttonHover: 'hover:bg-black/20',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      inputBg: 'bg-white/80 backdrop-blur-sm',
      inputText: 'text-gray-900 placeholder-gray-500',
      inputBorder: 'border-gray-300',
      particleColor: '#00000015',
      cardBg: 'bg-white/85 backdrop-blur-xl',
      border: 'border-gray-100',
      userMessageBg: 'bg-gray-200/90 border border-gray-300/60',
      userMessageText: 'text-gray-800',
      aiMessageBg: 'bg-white/90 border border-gray-200/50',
      aiMessageText: 'text-gray-700',
    }
  };

  const currentTheme = isDarkTheme ? themeStyles.dark : themeStyles.light;

  return (
    <div className={`min-h-screen ${currentTheme.background} flex flex-col relative overflow-hidden transition-all duration-700`} style={{ pointerEvents: 'auto' }}>
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 100 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full transition-colors duration-700"
            style={{ backgroundColor: currentTheme.particleColor }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [null, Math.random() * 0.3 + 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked');
            navigate('/');
          }}
          className={`rounded-full ${currentTheme.buttonText} ${currentTheme.buttonHover} ${currentTheme.buttonBg} transition-all duration-300 w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto`}
          title="Back to games"
          style={{ pointerEvents: 'auto' }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Theme button clicked, current theme:', isDarkTheme);
            setIsDarkTheme(!isDarkTheme);
          }}
          className={`rounded-full ${currentTheme.buttonText} ${currentTheme.buttonHover} ${currentTheme.buttonBg} transition-all duration-300 w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto`}
          title="Toggle theme"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDarkTheme ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isDarkTheme ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.div>
        </button>

        {/* History Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('History button clicked, current state:', showHistoryOverlay);
            setShowHistoryOverlay(!showHistoryOverlay);
          }}
          className={`rounded-full ${currentTheme.buttonText} ${currentTheme.buttonHover} ${currentTheme.buttonBg} transition-all duration-300 w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto ${
            showHistoryOverlay ? `${currentTheme.buttonBg} ${currentTheme.textPrimary}` : ''
          }`}
          title="Chat history"
          style={{ pointerEvents: 'auto' }}
        >
          <History className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        
        {/* AI Response Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={aiResponse}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-16 max-w-2xl text-center px-6"
          >
            <p className={`${currentTheme.textPrimary} text-2xl md:text-3xl font-medium leading-relaxed transition-colors duration-300`}>
              {aiResponse}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Scattered Voice Sphere */}
        <ScatteredVoiceSphere 
          state={currentState}
          isBottom={showTextChat}
          isDarkTheme={isDarkTheme}
        />


        {/* State Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
        </motion.div>
      </div>

      {/* Bottom Area */}
      <div className="relative z-10 p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* User Input Display - Always maintains space to prevent jump */}
          <div className="text-center min-h-[60px] flex items-center justify-center">
            <motion.div
              animate={{ 
                opacity: userInputText ? 1 : 0,
                scale: userInputText ? 1 : 0.95
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="inline-block"
            >
              <div className={`${currentTheme.inputBg} ${currentTheme.inputBorder} rounded-2xl px-6 py-3 transition-all duration-300 ${
                userInputText ? 'border-opacity-100' : 'border-opacity-0 bg-opacity-0'
              }`}>
                <p className={`${currentTheme.textPrimary} text-sm transition-all duration-300`}>
                  {userInputText || '\u00A0'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Expandable Chat Input */}
          <div className="relative flex justify-end">
            <AnimatePresence mode="wait">
              {showExpandedInput ? (
                <motion.div
                  key="expanded-input"
                  initial={{ width: 56, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 56, opacity: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.4, 0, 0.2, 1],
                    width: { duration: 0.5 }
                  }}
                  className={`${currentTheme.inputBg} rounded-full relative border ${currentTheme.inputBorder}`}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                      className={`w-full px-6 py-4 bg-transparent ${currentTheme.inputText} rounded-full pr-12 focus:outline-none focus:ring-0 focus:border-transparent border-none outline-none`}
                      style={{ 
                        outline: 'none', 
                        border: 'none', 
                        boxShadow: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputText.trim()) {
                          handleTextMessage(inputText);
                          setInputText('');
                        }
                      }
                    }}
                    autoFocus
                  />
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowExpandedInput(false)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full ${currentTheme.buttonText} transition-all duration-200 w-10 h-10 flex items-center justify-center`}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="chat-button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  onClick={() => setShowExpandedInput(true)}
                  className={`w-14 h-14 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} ${currentTheme.buttonHover} flex items-center justify-center transition-all duration-300 shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Message History Overlay */}
      <AnimatePresence>
        {showTextChat && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className={`fixed inset-0 ${isDarkTheme ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm z-20 flex flex-col transition-colors duration-300`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDarkTheme ? 'border-white/20' : 'border-gray-200'} transition-colors duration-300`}>
              <h2 className={`${currentTheme.textPrimary} text-lg font-semibold`}>Chat History</h2>
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleTextChat}
                className={`${currentTheme.buttonText} ${currentTheme.buttonHover} rounded-full transition-all duration-300 w-12 h-12 p-0`}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl transition-all duration-300 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : isDarkTheme 
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-2 opacity-60 text-right">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat History Overlay */}
      <AnimatePresence>
        {showHistoryOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 ${isDarkTheme ? 'bg-black/40' : 'bg-black/20'} backdrop-blur-sm`}
              onClick={() => setShowHistoryOverlay(false)}
            />
            
            {/* History Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative w-full max-w-2xl max-h-[80vh] ${currentTheme.cardBg} rounded-2xl shadow-2xl overflow-hidden`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${currentTheme.border} flex items-center justify-between`}>
                <h2 className={`text-lg font-medium ${currentTheme.textPrimary} opacity-90`}>
                  Chat History
                </h2>
                <button
                  onClick={() => setShowHistoryOverlay(false)}
                  className={`rounded-full ${currentTheme.buttonText} ${currentTheme.buttonHover} ${currentTheme.buttonBg} transition-all duration-200 w-10 h-10 flex items-center justify-center`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages List */}
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {messages.length === 0 ? (
                  <div className={`text-center py-8 ${currentTheme.textSecondary}`}>
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No chat history yet</p>
                    <p className="text-sm mt-1">Start a conversation to see your history here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.type === 'user'
                              ? currentTheme.userMessageBg
                              : currentTheme.aiMessageBg
                          }`}
                        >
                          <p className={`text-sm leading-relaxed ${
                            message.type === 'user'
                              ? `${currentTheme.userMessageText}`
                              : `${currentTheme.aiMessageText}`
                          }`}>{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span className="flex items-center gap-1">
                              {message.isVoice && (
                                <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                              )}
                              {message.type === 'user' ? 'You' : 'AI'}
                            </span>
                            <span>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-3 border-t ${currentTheme.border} ${currentTheme.textSecondary} text-xs text-center opacity-70`}>
                {messages.length > 0 && (
                  <p>{messages.length} message{messages.length !== 1 ? 's' : ''} in this conversation</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceChat;