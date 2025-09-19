import { useEffect, useState, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

interface FaceDetection {
  emotion: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface UseFaceEmotionDetectionReturn {
  currentEmotion: string | null;
  confidence: number;
  isTargetEmotionDetected: boolean;
  isModelLoaded: boolean;
  isModelLoading: boolean;
  modelLoadError: string | null;
  faceBox: FaceDetection['box'];
}

const EMOTION_MAPPING: Record<string, string> = {
  'neutral': '😐',
  'angry': '😠',
  'sad': '😢',
  'happy': '😊' // Both 😊 and 😁 will map to 'happy' emotion for detection
};

const DETECTION_INTERVAL = 500; // ms - Reduced frequency to save resources
const CONFIDENCE_THRESHOLD = 0.3; // Lowered from 0.5 to 0.3 for better detection
const TARGET_EMOTION_CONFIDENCE = 0.4; // Lowered from 0.6 to 0.4 for easier success

export const useFaceEmotionDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  targetEmotion: string,
  isActive: boolean = false
): UseFaceEmotionDetectionReturn => {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isTargetEmotionDetected, setIsTargetEmotionDetected] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<FaceDetection['box']>(null);
  
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDetectingRef = useRef<boolean>(false);
  const lastDetectionTimeRef = useRef<number>(0);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (isModelLoaded || isModelLoading) return;
    
    setIsModelLoading(true);
    setModelLoadError(null);
    
    try {
      console.log('🔧 Initializing TensorFlow.js backend...');
      
      // Ensure TensorFlow.js backend is ready
      await faceapi.tf.ready();
      console.log('✅ TensorFlow.js backend initialized');
      
      const MODEL_URL = '/models'; // Models should be in public/models folder
      console.log('📥 Loading face-api.js models from:', MODEL_URL);
      
      // Load required models with explicit error handling
      console.log('Loading TinyFaceDetector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('✅ TinyFaceDetector loaded');
      
      console.log('Loading FaceExpressionNet...');
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log('✅ FaceExpressionNet loaded');
      
      setIsModelLoaded(true);
      console.log('✅ SUCCESS: All face-api.js models loaded successfully');
      console.log('📊 Model details:', {
        tinyFaceDetector: 'Loaded',
        faceExpressionNet: 'Loaded',
        detectionInterval: `${DETECTION_INTERVAL}ms`,
        confidenceThreshold: `${CONFIDENCE_THRESHOLD * 100}%`,
        targetEmotionThreshold: `${TARGET_EMOTION_CONFIDENCE * 100}%`,
        tfBackend: faceapi.tf.getBackend()
      });
    } catch (error) {
      console.error('❌ ERROR: Failed to load face-api.js models:', error);
      console.error('Model loading error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        modelUrl: '/models',
        requiredModels: ['tinyFaceDetector', 'faceExpressionNet'],
        tfBackend: faceapi.tf?.getBackend() || 'Not available'
      });
      setModelLoadError('Failed to load face detection models. Please refresh the page and try again.');
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoaded, isModelLoading]);

  // Detect faces and emotions
  const detectFaceEmotion = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded || isDetectingRef.current) return;
    
    // Throttle detection to prevent excessive resource usage
    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL) {
      return;
    }
    lastDetectionTimeRef.current = now;
    
    try {
      isDetectingRef.current = true;
      
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416, // Higher resolution for better detection
          scoreThreshold: 0.3 // Lower threshold for more sensitive detection
        }))
        .withFaceExpressions();

      if (detections.length > 0) {
        const detection = detections[0]; // Use first detected face
        const expressions = detection.expressions;
        
        // Find the emotion with highest confidence
        let maxEmotion = 'neutral';
        let maxConfidence = 0;
        
        // Log all detected emotions for debugging (less frequently)
        if (Math.random() < 0.1) { // Only log 10% of detections to reduce spam
          const emotionScores = Object.entries(expressions).map(([emotion, conf]) => 
            `${emotion}: ${Math.round(conf * 100)}%`
          ).join(', ');
          console.log(`🔍 DETECTED EMOTIONS: ${emotionScores}`);
        }
        
        Object.entries(expressions).forEach(([emotion, conf]) => {
          if (conf > maxConfidence && conf > CONFIDENCE_THRESHOLD) {
            maxConfidence = conf;
            maxEmotion = emotion;
          }
        });

        // Update state
        setCurrentEmotion(maxEmotion);
        setConfidence(maxConfidence);
        
        // Update face bounding box
        const box = detection.detection.box;
        setFaceBox({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        });

        // Check if target emotion is detected with sufficient confidence
        // For happy emojis, both 😊 and 😁 should map to 'happy' emotion
        let targetEmotionKey: string | undefined;
        if (targetEmotion === '😊' || targetEmotion === '😁') {
          targetEmotionKey = 'happy'; // Both happy emojis use the same detection
        } else {
          targetEmotionKey = Object.keys(EMOTION_MAPPING).find(
            key => EMOTION_MAPPING[key] === targetEmotion
          );
        }
        
        // More flexible matching - also check if the target emotion confidence is above threshold
        let isTargetDetected = false;
        if (targetEmotionKey) {
          const targetEmotionConfidence = expressions[targetEmotionKey] || 0;
          
          // Success if either:
          // 1. Target emotion is the highest AND above threshold, OR
          // 2. Target emotion confidence is above threshold (even if not highest)
          if ((maxEmotion === targetEmotionKey && maxConfidence >= TARGET_EMOTION_CONFIDENCE) ||
              (targetEmotionConfidence >= TARGET_EMOTION_CONFIDENCE)) {
            console.log(`🎉 SUCCESS: Target emotion "${targetEmotionKey}" detected with ${Math.round(targetEmotionConfidence * 100)}% confidence!`);
            console.log(`📊 Current dominant emotion: ${maxEmotion} (${Math.round(maxConfidence * 100)}%)`);
            isTargetDetected = true;
          }
        }
        
        setIsTargetEmotionDetected(isTargetDetected);
      } else {
        // No face detected (log less frequently)
        if (Math.random() < 0.05) { // Only log 5% of "no face" messages
          console.log('👤 NO FACE DETECTED: Make sure your face is visible and well-lit');
        }
        setCurrentEmotion(null);
        setConfidence(0);
        setFaceBox(null);
        setIsTargetEmotionDetected(false);
      }
    } catch (error) {
      console.error('❌ ERROR: Face emotion detection failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        videoElement: videoRef.current ? 'Available' : 'Not available',
        modelLoaded: isModelLoaded
      });
    } finally {
      isDetectingRef.current = false;
    }
  }, [videoRef, isModelLoaded, targetEmotion]);

  // Start/stop detection based on isActive
  useEffect(() => {
    if (isActive && isModelLoaded && videoRef.current) {
      // Start detection interval
      detectionIntervalRef.current = setInterval(detectFaceEmotion, DETECTION_INTERVAL);
      
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
      };
    } else {
      // Stop detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      // Reset state when inactive
      setCurrentEmotion(null);
      setConfidence(0);
      setFaceBox(null);
      setIsTargetEmotionDetected(false);
    }
  }, [isActive, isModelLoaded, detectFaceEmotion]);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    currentEmotion,
    confidence,
    isTargetEmotionDetected,
    isModelLoaded,
    isModelLoading,
    modelLoadError,
    faceBox
  };
};
