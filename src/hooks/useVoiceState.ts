import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseVoiceStateOptions {
  onStateChange?: (state: VoiceState) => void;
  autoTimeout?: number; // Auto-return to idle after this many ms
}

export const useVoiceState = (options: UseVoiceStateOptions = {}) => {
  const [state, setState] = useState<VoiceState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { onStateChange, autoTimeout = 5000 } = options;

  const setVoiceState = useCallback((newState: VoiceState) => {
    setState(newState);
    onStateChange?.(newState);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set auto-timeout for non-idle states
    if (newState !== 'idle' && autoTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setState('idle');
        onStateChange?.('idle');
      }, autoTimeout);
    }
  }, [onStateChange, autoTimeout]);

  const startListening = useCallback(() => {
    setVoiceState('listening');
  }, [setVoiceState]);

  const startProcessing = useCallback(() => {
    setVoiceState('processing');
  }, [setVoiceState]);

  const startSpeaking = useCallback(() => {
    setVoiceState('speaking');
  }, [setVoiceState]);

  const stopVoice = useCallback(() => {
    setVoiceState('idle');
  }, [setVoiceState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    isSpeaking: state === 'speaking',
    isIdle: state === 'idle',
    isActive: state !== 'idle',
    startListening,
    startProcessing,
    startSpeaking,
    stopVoice,
    setVoiceState,
  };
};
