import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX, Heart, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

const ParentCompanionAI = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! I'm here to support you through your parenting journey. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isNightMode, setIsNightMode] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour <= 6;
  });
  const [showDrawer, setShowDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback((content: string, isVoice = false) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That sounds challenging. Remember, you're doing an amazing job as a parent. Here's what might help...",
        "I understand how overwhelming that can feel. Many parents go through this. Let me share some gentle strategies...",
        "You're not alone in feeling this way. It's completely normal. Here are some supportive approaches...",
        "That's a great question! Every child is different, but here are some tried-and-true methods...",
        "I can hear the love in your concern. You're being so thoughtful. Here's what other parents have found helpful..."
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Simulate text-to-speech
      if ('speechSynthesis' in window) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(aiMessage.content);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }, 1500);
  }, []);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        const sampleVoiceInputs = [
          "My toddler won't go to sleep",
          "How do I handle tantrums in public",
          "I'm feeling overwhelmed with bedtime routines",
          "My child is being picky with food"
        ];
        const voiceInput = sampleVoiceInputs[Math.floor(Math.random() * sampleVoiceInputs.length)];
        sendMessage(voiceInput, true);
      }, 2000);
    }
  }, [sendMessage]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const FloatingButton = () => (
    <motion.button
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-hover backdrop-blur-sm border border-primary/20 bg-primary/90 hover:bg-primary`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowDrawer(true)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
    >
      <Heart className="w-8 h-8 text-white mx-auto" />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/40"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );

  const ChatDrawer = () => (
    <AnimatePresence>
      {showDrawer && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDrawer(false)}
          />
          <motion.div
            className={`fixed inset-0 z-50 flex flex-col ${
              isNightMode ? 'bg-card/95 dark' : 'bg-card/95'
            } backdrop-blur-lg border-l border-border`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-primary">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDrawer(false)}
                  className="rounded-full text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="font-semibold text-white text-lg">
                    Parent Companion
                  </h2>
                  <p className="text-white/80 text-sm">
                    Always here to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopSpeaking}
                  className="rounded-full text-white hover:bg-white/20"
                  disabled={!isSpeaking}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNightMode(!isNightMode)}
                  className="rounded-full text-white hover:bg-white/20"
                >
                  {isNightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-soft ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-foreground border border-border'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.isVoice && message.type === 'user' && (
                        <Mic className="w-4 h-4 mt-0.5 opacity-70" />
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs mt-2 opacity-60">
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

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Share what's on your mind..."
                    className="min-h-[60px] max-h-32 resize-none rounded-xl border-border bg-background/50 backdrop-blur-sm focus:bg-background"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(inputText);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <motion.button
                    className={`w-12 h-12 rounded-full backdrop-blur-sm border border-border shadow-soft ${
                      isListening
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-accent text-accent-foreground hover:bg-accent/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startListening}
                    disabled={isListening}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5 mx-auto" />
                    ) : (
                      <Mic className="w-5 h-5 mx-auto" />
                    )}
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-destructive/40"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.button>
                  <Button
                    onClick={() => sendMessage(inputText)}
                    disabled={!inputText.trim()}
                    size="icon"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-soft"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!showDrawer) {
    return <FloatingButton />;
  }

  return (
    <div className="relative">
      <FloatingButton />
      <ChatDrawer />
    </div>
  );
};

export default ParentCompanionAI;