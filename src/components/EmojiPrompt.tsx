import { useEffect, useState } from 'react';

interface EmojiPromptProps {
  emoji: string;
  onEmotionDetected?: () => void;
  onTimeout?: () => void;
  duration?: number;
  className?: string;
  isEmotionDetected?: boolean;
  recognitionActive?: boolean;
}

export const EmojiPrompt = ({ 
  emoji, 
  onEmotionDetected,
  onTimeout,
  duration = 30000, // 30 seconds timeout for emotion detection
  className = "",
  isEmotionDetected = false,
  recognitionActive = true
}: EmojiPromptProps) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [progress, setProgress] = useState(100);

  // Note: onEmotionDetected is handled by the parent component when detection actually happens
  // We don't need to call it here based on isEmotionDetected prop changes

  useEffect(() => {
    setTimeLeft(duration / 1000);
    setProgress(100);

    const interval = setInterval(() => {
      // Only countdown if recognition is active and emotion is not detected
      if (recognitionActive && !isEmotionDetected) {
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
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onTimeout, recognitionActive, isEmotionDetected]);

  return (
    <div className={`bg-gradient-primary rounded-3xl ${className}`}>
      <div className="p-8 text-center">
        <div className="relative mb-6 h-32 sm:h-40 flex items-center justify-center">
          {isEmotionDetected ? (
            <div className="text-6xl sm:text-7xl font-bold text-green-400 animate-slide-up">
              Great!
            </div>
          ) : (
            <div className="text-8xl sm:text-9xl">
              {emoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};