import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  isActive: boolean;
  variant?: 'small' | 'medium' | 'large';
  className?: string;
  barCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive,
  variant = 'medium',
  className,
  barCount = 5
}) => {
  const sizeClasses = {
    small: 'h-6 gap-0.5',
    medium: 'h-8 gap-1',
    large: 'h-12 gap-1.5'
  };

  const barSizes = {
    small: 'w-0.5',
    medium: 'w-1',
    large: 'w-1.5'
  };

  // Generate random heights for more natural wave effect
  const generateWaveHeights = () => {
    return Array.from({ length: barCount }, () => ({
      initial: Math.random() * 0.3 + 0.1,
      peak: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 0.5
    }));
  };

  const waveData = React.useMemo(() => generateWaveHeights(), [barCount]);

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[variant],
      className
    )}>
      {waveData.map((wave, index) => (
        <motion.div
          key={index}
          className={cn(
            'bg-primary rounded-full',
            barSizes[variant]
          )}
          initial={{ scaleY: wave.initial }}
          animate={isActive ? {
            scaleY: [wave.initial, wave.peak, wave.initial],
          } : {
            scaleY: wave.initial
          }}
          transition={{
            duration: 0.6 + wave.delay,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.1
          }}
          style={{
            height: '100%',
            transformOrigin: 'bottom'
          }}
        />
      ))}
    </div>
  );
};

// Alternative circular pulse waveform
interface VoicePulseProps {
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const VoicePulse: React.FC<VoicePulseProps> = ({
  isActive,
  size = 'medium',
  className
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {/* Center dot */}
      <div className="w-2 h-2 bg-primary rounded-full z-10" />
      
      {/* Pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 border-2 border-primary/30 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? {
            scale: [0, 1.5, 2],
            opacity: [0.7, 0.3, 0]
          } : {
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            delay: ring * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Gemini-style voice indicator
interface GeminiVoiceIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  className?: string;
}

export const GeminiVoiceIndicator: React.FC<GeminiVoiceIndicatorProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  className
}) => {
  const getState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const state = getState();

  return (
    <div className={cn(
      'flex items-center justify-center w-24 h-24 relative',
      className
    )}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        animate={{
          borderColor: state === 'listening' ? 'hsl(var(--primary))' : 
                     state === 'speaking' ? 'hsl(var(--game-success))' :
                     state === 'processing' ? 'hsl(var(--game-warning))' :
                     'hsl(var(--border))',
          scale: state !== 'idle' ? [1, 1.1, 1] : 1
        }}
        transition={{
          duration: 1.5,
          repeat: state !== 'idle' ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Inner content */}
      <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center">
        {state === 'listening' && (
          <VoiceWaveform isActive={true} variant="small" barCount={3} />
        )}
        {state === 'speaking' && (
          <VoicePulse isActive={true} size="small" />
        )}
        {state === 'processing' && (
          <motion.div
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
        {state === 'idle' && (
          <div className="w-3 h-3 bg-muted-foreground rounded-full" />
        )}
      </div>

      {/* State label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <span className="text-xs text-muted-foreground capitalize font-medium">
          {state}
        </span>
      </div>
    </div>
  );
};
