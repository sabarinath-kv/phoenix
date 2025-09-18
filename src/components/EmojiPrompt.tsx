import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface EmojiPromptProps {
  emoji: string;
  onEmotionDetected?: () => void;
  onTimeout?: () => void;
  duration?: number;
  className?: string;
  isEmotionDetected?: boolean;
}

export const EmojiPrompt = ({ 
  emoji, 
  onEmotionDetected,
  onTimeout,
  duration = 30000, // 30 seconds timeout for emotion detection
  className = "",
  isEmotionDetected = false
}: EmojiPromptProps) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [progress, setProgress] = useState(100);

  // Handle emotion detection success
  useEffect(() => {
    if (isEmotionDetected && onEmotionDetected) {
      onEmotionDetected();
    }
  }, [isEmotionDetected, onEmotionDetected]);

  useEffect(() => {
    setTimeLeft(duration / 1000);
    setProgress(100);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 0.1);
        setProgress((newTime / (duration / 1000)) * 100);
        
        if (newTime <= 0) {
          clearInterval(interval);
          if (onTimeout) {
            onTimeout();
          }
        }
        
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onTimeout]);

  return (
    <Card className={`bg-gradient-primary shadow-hover border-0 ${className}`}>
      <div className="p-8 text-center">
        <div className="relative mb-6">
          <div className="text-8xl sm:text-9xl">
            {emoji}
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {isEmotionDetected ? 'Perfect! Well done!' : 'Mimic this expression'}
        </h2>
        
        <p className="text-lg text-white/80 mb-6">
          {isEmotionDetected 
            ? 'You matched the emotion successfully!' 
            : `Show me your best ${emoji}`
          }
        </p>
        
        {/* Progress Ring */}
        <div className="relative w-16 h-16 mx-auto">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="87.96"
              strokeDashoffset={87.96 - (87.96 * progress) / 100}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {Math.ceil(timeLeft)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};