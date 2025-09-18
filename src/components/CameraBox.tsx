import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FaceDetectionOverlay } from './FaceDetectionOverlay';
import { useFallbackEmotionDetection } from '@/hooks/useFallbackEmotionDetection';

interface CameraBoxProps {
  isActive: boolean;
  className?: string;
  targetEmotion?: string;
  onEmotionDetected?: (emotion: string) => void;
  onTargetEmotionDetected?: () => void;
  showDebugInfo?: boolean;
}

export const CameraBox = ({ 
  isActive, 
  className = "", 
  targetEmotion = "😊",
  onEmotionDetected,
  onTargetEmotionDetected,
  showDebugInfo = false 
}: CameraBoxProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  // Fallback emotion detection hook (tries multiple methods)
  const {
    currentEmotion,
    confidence,
    isTargetEmotionDetected,
    isModelLoaded,
    isModelLoading,
    modelLoadError,
    faceBox,
    detectionMethod
  } = useFallbackEmotionDetection(videoRef, targetEmotion, isActive && hasPermission);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setVideoSize({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
          }
        };
        setHasPermission(true);
        setError('');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or unavailable');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
  };

  // Callback effects for emotion detection
  useEffect(() => {
    if (currentEmotion && onEmotionDetected) {
      onEmotionDetected(currentEmotion);
    }
  }, [currentEmotion, onEmotionDetected]);

  useEffect(() => {
    if (isTargetEmotionDetected && onTargetEmotionDetected) {
      onTargetEmotionDetected();
    }
  }, [isTargetEmotionDetected, onTargetEmotionDetected]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  // Show model loading error if it exists
  const displayError = error || modelLoadError;

  return (
    <Card className={`relative overflow-hidden bg-gradient-card shadow-card transition-all duration-300 ${className}`}>
      <div className="aspect-video w-full bg-muted/30 rounded-lg overflow-hidden relative">
        {displayError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-muted-foreground">{displayError}</p>
              {isModelLoading && (
                <div className="mt-2">
                  <div className="text-xs text-blue-600">Loading AI models...</div>
                  <div className="w-16 h-1 bg-blue-200 rounded-full mx-auto mt-1">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie view
            />
            
            {/* Face detection overlay */}
            {hasPermission && isModelLoaded && (
              <FaceDetectionOverlay
                faceBox={faceBox}
                currentEmotion={currentEmotion}
                confidence={confidence}
                isTargetEmotionDetected={isTargetEmotionDetected}
                videoWidth={videoSize.width}
                videoHeight={videoSize.height}
                showDebugInfo={showDebugInfo}
              />
            )}
          </>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {hasPermission && (
          <div className="text-lg">📹</div>
        )}
        
        {isModelLoading && (
          <div className="text-lg animate-pulse">🤖</div>
        )}
        
        {isModelLoaded && !isModelLoading && hasPermission && (
          <div className="text-lg" title={`Detection method: ${detectionMethod}`}>
            {detectionMethod === 'face-api' ? '🧠' : detectionMethod === 'simple' ? '👁️' : '🎭'}
          </div>
        )}
      </div>
    </Card>
  );
};