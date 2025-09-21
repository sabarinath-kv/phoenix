import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveKitVoiceChat } from '@/hooks/useLiveKitVoiceChat';
import winglooAvatar from '@/assets/wingloo-avatar.png';

interface Message {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: Date;
}

export default function ParentCompanionAI() {
  const { livekitTokenResponse } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAIMessage, setCurrentAIMessage] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const voiceChat = useLiveKitVoiceChat({
    serverUrl: livekitTokenResponse?.url || '',
    token: livekitTokenResponse?.access_token || '',
    onMessage: (message: string, isFromUser: boolean) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isFromUser,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      if (!isFromUser) {
        setCurrentAIMessage(message);
      }
    },
    onStateChange: (state) => {
      setIsListening(state.isListening);
      setIsProcessing(state.isProcessing);
    }
  });

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  const startConversation = async () => {
    if (!livekitTokenResponse) {
      console.error('No LiveKit token available');
      return;
    }
    
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    try {
      await voiceChat.connect(livekitTokenResponse.url, livekitTokenResponse.access_token);
      setHasStarted(true);
      
      // AI's first message
      const firstMessage = "Hi! I'm Wingloo, your AI parenting companion. I'll help understand your child better through fun games. What's your child's name?";
      setCurrentAIMessage(firstMessage);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: firstMessage,
        isFromUser: false,
        timestamp: new Date()
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleMicClick = () => {
    if (!hasStarted) {
      startConversation();
    } else if (isListening) {
      voiceChat.stopListening();
    } else {
      voiceChat.startListening();
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatInput,
      isFromUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await voiceChat.sendTextMessage(chatInput);
    setChatInput('');
  };

  const handleEndCall = async () => {
    await voiceChat.disconnect();
    setHasStarted(false);
    setCurrentAIMessage('');
    setMessages([]);
  };

  if (!permissionGranted && hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary-light/20 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <h2 className="text-xl font-semibold mb-4">Microphone Access Required</h2>
          <p className="text-muted-foreground mb-6">
            To chat with Wingloo, we need access to your microphone.
          </p>
          <Button onClick={requestMicrophonePermission} className="w-full">
            Grant Permission
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-secondary-light/20 to-accent-light/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-8 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {!hasStarted ? (
            /* Initial State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-sm"
            >
              <div className="mb-8">
                <img 
                  src={winglooAvatar} 
                  alt="Wingloo Avatar" 
                  className="w-32 h-32 mx-auto mb-4"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Meet Wingloo
              </h1>
              <p className="text-muted-foreground mb-8">
                Your AI parenting companion ready to help
              </p>
              <Button
                onClick={startConversation}
                size="lg"
                className="w-full rounded-full"
              >
                Start Conversation
              </Button>
            </motion.div>
          ) : isProcessing ? (
            /* Processing State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="mb-6">
                <img 
                  src={winglooAvatar} 
                  alt="Wingloo Avatar" 
                  className="w-24 h-24 mx-auto animate-pulse"
                />
              </div>
              <h2 className="text-xl font-medium text-foreground mb-2">
                Wingloo is <em>listening...</em>
              </h2>
            </motion.div>
          ) : (
            /* Active Conversation State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-sm"
            >
              <div className="mb-6">
                <motion.img 
                  src={winglooAvatar} 
                  alt="Wingloo Avatar" 
                  className="w-24 h-24 mx-auto"
                  animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                />
              </div>
              
              {currentAIMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <Card className="p-4 bg-white/70 backdrop-blur-sm border-0">
                    <p className="text-foreground leading-relaxed">
                      {currentAIMessage}
                    </p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Bottom Controls */}
        {hasStarted && (
          <div className="p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Chat Button */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Chat with Wingloo</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full mt-4">
                    <ScrollArea className="flex-1 mb-4" ref={chatScrollRef}>
                      <div className="space-y-4 pr-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl ${
                                message.isFromUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <span className="text-xs opacity-60 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendChatMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Microphone Button */}
              <Button
                onClick={handleMicClick}
                size="lg"
                variant={isListening ? "default" : "secondary"}
                className={`w-16 h-16 rounded-full ${
                  isListening 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white/90'
                }`}
              >
                <Mic className={`w-6 h-6 ${isListening ? 'text-white' : 'text-foreground'}`} />
              </Button>

              {/* End Call Button */}
              <Button
                onClick={handleEndCall}
                size="lg"
                variant="destructive"
                className="w-16 h-16 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}