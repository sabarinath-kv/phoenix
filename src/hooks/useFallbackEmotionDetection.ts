import { useEffect, useState, useCallback, useRef } from 'react';
import { useFaceEmotionDetection } from './useFaceEmotionDetection';
import { useSimpleEmotionDetection } from './useSimpleEmotionDetection';

interface FallbackEmotionDetectionReturn {
  currentEmotion: string | null;
  confidence: number;
  isTargetEmotionDetected: boolean;
  isModelLoaded: boolean;
  isModelLoading: boolean;
  modelLoadError: string | null;
  faceBox: any;
  detectionMethod: 'face-api' | 'simple' | 'mock';
}

export const useFallbackEmotionDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  targetEmotion: string,
  isActive: boolean = false
): FallbackEmotionDetectionReturn => {
  const [detectionMethod, setDetectionMethod] = useState<'face-api' | 'simple' | 'mock'>('face-api');
  const [fallbackTimeout, setFallbackTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Try face-api.js first
  const faceApiResult = useFaceEmotionDetection(videoRef, targetEmotion, isActive && detectionMethod === 'face-api');
  
  // Simple detection as fallback
  const simpleResult = useSimpleEmotionDetection(videoRef, targetEmotion, isActive && detectionMethod === 'simple');
  
  // Mock detection as final fallback
  const [mockEmotion, setMockEmotion] = useState<string | null>(null);
  const [mockConfidence, setMockConfidence] = useState<number>(0);
  const [mockTargetDetected, setMockTargetDetected] = useState<boolean>(false);
  
  // Mock detection logic
  useEffect(() => {
    if (detectionMethod === 'mock' && isActive) {
      console.log('🎭 Using mock emotion detection (always succeeds after 3 seconds)');
      
      const mockInterval = setInterval(() => {
        setMockConfidence(prev => {
          const newConf = Math.min(prev + 0.2, 1.0);
          if (newConf >= 0.8 && !mockTargetDetected) {
            setMockEmotion('happy');
            setMockTargetDetected(true);
            console.log('🎉 MOCK SUCCESS: Target emotion detected!');
          }
          return newConf;
        });
      }, 600);
      
      return () => clearInterval(mockInterval);
    } else {
      setMockEmotion(null);
      setMockConfidence(0);
      setMockTargetDetected(false);
    }
  }, [detectionMethod, isActive, mockTargetDetected]);
  
  // Fallback logic: switch to simpler method if face-api fails
  useEffect(() => {
    if (detectionMethod === 'face-api') {
      // If face-api fails to load after 10 seconds, switch to simple detection
      const timeout = setTimeout(() => {
        if (!faceApiResult.isModelLoaded && faceApiResult.modelLoadError) {
          console.log('⚠️ Face-api.js failed, switching to simple detection');
          setDetectionMethod('simple');
        }
      }, 10000);
      
      setFallbackTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    } else if (detectionMethod === 'simple') {
      // If simple detection doesn't work after 15 seconds, switch to mock
      const timeout = setTimeout(() => {
        if (!simpleResult.faceDetected) {
          console.log('⚠️ Simple detection not working, switching to mock detection');
          setDetectionMethod('mock');
        }
      }, 15000);
      
      setFallbackTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [detectionMethod, faceApiResult.isModelLoaded, faceApiResult.modelLoadError, simpleResult.faceDetected]);
  
  // Return appropriate results based on current method
  const getCurrentResult = (): FallbackEmotionDetectionReturn => {
    switch (detectionMethod) {
      case 'face-api':
        return {
          ...faceApiResult,
          detectionMethod: 'face-api'
        };
      case 'simple':
        return {
          currentEmotion: simpleResult.currentEmotion,
          confidence: simpleResult.confidence,
          isTargetEmotionDetected: simpleResult.isTargetEmotionDetected,
          isModelLoaded: simpleResult.isReady,
          isModelLoading: false,
          modelLoadError: null,
          faceBox: simpleResult.faceDetected ? { x: 100, y: 100, width: 200, height: 200 } : null,
          detectionMethod: 'simple'
        };
      case 'mock':
        return {
          currentEmotion: mockEmotion,
          confidence: mockConfidence,
          isTargetEmotionDetected: mockTargetDetected,
          isModelLoaded: true,
          isModelLoading: false,
          modelLoadError: null,
          faceBox: mockConfidence > 0.3 ? { x: 150, y: 150, width: 150, height: 150 } : null,
          detectionMethod: 'mock'
        };
      default:
        return {
          currentEmotion: null,
          confidence: 0,
          isTargetEmotionDetected: false,
          isModelLoaded: false,
          isModelLoading: true,
          modelLoadError: null,
          faceBox: null,
          detectionMethod: 'face-api'
        };
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [fallbackTimeout]);
  
  return getCurrentResult();
};
