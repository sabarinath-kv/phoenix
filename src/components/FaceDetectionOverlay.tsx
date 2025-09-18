import React from 'react';

interface FaceDetectionOverlayProps {
  faceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  currentEmotion: string | null;
  confidence: number;
  isTargetEmotionDetected: boolean;
  videoWidth: number;
  videoHeight: number;
  showDebugInfo?: boolean;
}

export const FaceDetectionOverlay: React.FC<FaceDetectionOverlayProps> = ({
  faceBox,
  currentEmotion,
  confidence,
  isTargetEmotionDetected,
  videoWidth,
  videoHeight,
  showDebugInfo = true
}) => {
  if (!faceBox) return null;

  // Calculate scale factors for overlay positioning
  const scaleX = videoWidth / (videoWidth || 1);
  const scaleY = videoHeight / (videoHeight || 1);

  const overlayStyle = {
    left: `${(faceBox.x * scaleX)}px`,
    top: `${(faceBox.y * scaleY)}px`,
    width: `${(faceBox.width * scaleX)}px`,
    height: `${(faceBox.height * scaleY)}px`,
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Face bounding box */}
      <div
        className={`absolute border-2 rounded-lg transition-colors duration-200 ${
          isTargetEmotionDetected 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-blue-400 bg-blue-400/10'
        }`}
        style={overlayStyle}
      >
        {/* Emotion label */}
        {showDebugInfo && currentEmotion && (
          <div className={`absolute -top-8 left-0 px-2 py-1 rounded text-xs font-semibold text-white shadow-lg ${
            isTargetEmotionDetected ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            {currentEmotion} ({Math.round(confidence * 100)}%)
          </div>
        )}
        
        {/* Success indicator */}
        {isTargetEmotionDetected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Debug info panel */}
      {showDebugInfo && (
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          <div>Emotion: {currentEmotion || 'None'}</div>
          <div>Confidence: {Math.round(confidence * 100)}%</div>
          <div className={isTargetEmotionDetected ? 'text-green-400' : 'text-red-400'}>
            Target: {isTargetEmotionDetected ? 'Matched!' : 'Searching...'}
          </div>
        </div>
      )}
    </div>
  );
};
