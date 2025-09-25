import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ReportSliderProps {
  /** The image to display */
  imageSrc: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Progress messages to show at different stages */
  progressMessages: string[];
  /** Current progress value (0-100) */
  progress: number;
  /** Whether to auto-advance the progress */
  autoProgress?: boolean;
  /** Auto-progress interval in ms */
  autoProgressInterval?: number;
  /** Callback when progress changes */
  onProgressChange?: (progress: number, messageIndex: number) => void;
  /** Custom className for the container */
  className?: string;
  /** Whether the slider is interactive */
  interactive?: boolean;
  /** Optional slide data for data-driven approach */
  slideData?: Array<{
    id: number;
    imageSrc: string;
    imageAlt?: string;
    message: string;
    progress: number;
  }>;
  /** Current slide index when using slideData */
  currentSlideIndex?: number;
  /** Callback when slide changes */
  onSlideChange?: (slideIndex: number) => void;
}

export const ReportSlider: React.FC<ReportSliderProps> = ({
  imageSrc,
  imageAlt = 'Report image',
  progressMessages,
  progress,
  autoProgress = false,
  autoProgressInterval = 2000,
  onProgressChange,
  className,
  interactive = true,
  slideData,
  currentSlideIndex = 0,
  onSlideChange,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Use slide data if provided
  const isDataDriven = slideData && slideData.length > 0;
  const currentSlideData = isDataDriven ? slideData[currentSlideIndex] : null;
  const displayImage = currentSlideData?.imageSrc || imageSrc;
  const displayImageAlt = currentSlideData?.imageAlt || imageAlt;
  const displayMessages = isDataDriven 
    ? slideData.map(slide => slide.message)
    : progressMessages;

  // Auto-progress functionality
  useEffect(() => {
    if (autoProgress && !isDataDriven) {
      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          const newProgress = Math.min(prev + (100 / displayMessages.length), 100);
          return newProgress;
        });
      }, autoProgressInterval);

      return () => clearInterval(interval);
    }
  }, [autoProgress, autoProgressInterval, displayMessages.length, isDataDriven]);

  // Update current progress when prop changes
  useEffect(() => {
    if (isDataDriven && currentSlideData) {
      setCurrentProgress(currentSlideData.progress);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, isDataDriven, currentSlideData]);

  // Calculate current message index based on progress
  useEffect(() => {
    let messageIndex: number;
    if (isDataDriven) {
      messageIndex = currentSlideIndex;
    } else {
      messageIndex = Math.min(
        Math.floor((currentProgress / 100) * displayMessages.length),
        displayMessages.length - 1
      );
    }
    setCurrentMessageIndex(messageIndex);
    onProgressChange?.(currentProgress, messageIndex);
  }, [currentProgress, displayMessages.length, onProgressChange, isDataDriven, currentSlideIndex]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!interactive) return;
    const newProgress = parseInt(event.target.value);
    setCurrentProgress(newProgress);
    
    if (isDataDriven && onSlideChange) {
      // Calculate which slide this progress corresponds to
      const slideIndex = Math.min(
        Math.floor((newProgress / 100) * slideData.length),
        slideData.length - 1
      );
      if (slideIndex !== currentSlideIndex) {
        onSlideChange(slideIndex);
      }
    }
  };

  const currentMessage = displayMessages[currentMessageIndex] || displayMessages[0];

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-6", className)}>
      {/* Image Container */}
      <div className="relative mb-8 rounded-card overflow-hidden shadow-card">
        <img
          src={displayImage}
          alt={displayImageAlt}
          className="w-full h-auto object-cover"
        />
        {/* Optional overlay for progress indication */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Progress Message */}
      <div className="mb-6 text-center">
        <p className="text-h2 font-semibold text-foreground mb-2">
          {currentMessage}
        </p>
        <p className="text-caption-lg text-muted-foreground">
          {Math.round(currentProgress)}% Complete
        </p>
      </div>

      {/* Custom Progress Bar */}
      <div className="mb-6">
        <div className="relative w-full h-4 bg-secondary/30 rounded-full overflow-hidden shadow-inner">
          {/* Background track with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondary/40 rounded-full" />
          
          {/* Progress fill with animated gradient */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-700 ease-out rounded-full shadow-sm overflow-hidden"
            style={{ width: `${currentProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {/* Progress indicator dot with glow */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary border-3 border-background rounded-full shadow-lg transition-all duration-700 ease-out hover:scale-110 cursor-pointer"
            style={{ 
              left: `calc(${currentProgress}% - 12px)`,
              boxShadow: `0 0 0 0 hsla(var(--primary), 0.4), 0 4px 8px rgba(0,0,0,0.1)`,
              animation: currentProgress > 0 ? 'pulse-glow 2s infinite' : 'none'
            }}
          >
            {/* Inner dot */}
            <div className="absolute inset-1 bg-primary-foreground rounded-full" />
          </div>
        </div>
      </div>

      {/* Interactive Slider (if enabled) */}
      {interactive && (
        <div className="relative mt-4">
          <input
            type="range"
            min="0"
            max="100"
            value={currentProgress}
            onChange={handleSliderChange}
            className="w-full h-3 bg-transparent appearance-none cursor-pointer modern-slider"
          />
          <style>{`
            /* Modern Slider Styles */
            .modern-slider {
              background: transparent;
              outline: none;
            }
            
            .modern-slider::-webkit-slider-track {
              height: 6px;
              border-radius: 3px;
              background: linear-gradient(to right, 
                hsl(var(--primary)) 0%, 
                hsl(var(--primary)) ${currentProgress}%, 
                hsl(var(--secondary)) ${currentProgress}%, 
                hsl(var(--secondary)) 100%);
              border: none;
            }
            
            .modern-slider::-webkit-slider-thumb {
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%);
              border: 4px solid hsl(var(--background));
              box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.12), 
                0 2px 8px rgba(0, 0, 0, 0.08),
                0 0 0 0 hsla(var(--primary), 0.3);
              cursor: grab;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
            }
            
            .modern-slider::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 6px hsla(var(--primary), 0.15);
              background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.9) 100%);
            }
            
            .modern-slider::-webkit-slider-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
              box-shadow: 
                0 4px 16px rgba(0, 0, 0, 0.2), 
                0 2px 8px rgba(0, 0, 0, 0.15),
                0 0 0 8px hsla(var(--primary), 0.2);
              background: linear-gradient(135deg, hsl(var(--primary)/0.9) 0%, hsl(var(--primary)/0.7) 100%);
            }
            
            /* Firefox Styles */
            .modern-slider::-moz-range-track {
              height: 6px;
              border-radius: 3px;
              background: linear-gradient(to right, 
                hsl(var(--primary)) 0%, 
                hsl(var(--primary)) ${currentProgress}%, 
                hsl(var(--secondary)) ${currentProgress}%, 
                hsl(var(--secondary)) 100%);
              border: none;
            }
            
            .modern-slider::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%);
              border: 4px solid hsl(var(--background));
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
              cursor: grab;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .modern-slider::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.12);
              background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.9) 100%);
            }
            
            .modern-slider::-moz-range-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            /* Focus styles for accessibility */
            .modern-slider:focus {
              outline: none;
            }
            
            .modern-slider:focus::-webkit-slider-thumb {
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 3px hsla(var(--primary), 0.3);
            }
            
            .modern-slider:focus::-moz-range-thumb {
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 3px hsla(var(--primary), 0.3);
            }
            
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            
            @keyframes pulse-glow {
              0%, 100% { 
                box-shadow: 0 0 0 0 hsla(var(--primary), 0.4), 0 4px 8px rgba(0,0,0,0.1);
              }
              50% { 
                box-shadow: 0 0 0 8px hsla(var(--primary), 0.1), 0 4px 12px rgba(0,0,0,0.15);
              }
            }
            
            .animate-shimmer {
              animation: shimmer 2s infinite;
            }
          `}</style>
        </div>
      )}

      {/* Progress Steps Indicators */}
      <div className="flex justify-between items-center mt-6">
        {displayMessages.map((_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            {/* Step indicator */}
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-500 relative",
                index <= currentMessageIndex 
                  ? "bg-primary shadow-md scale-110" 
                  : "bg-secondary/50 scale-100"
              )}
            >
              {/* Active indicator glow */}
              {index === currentMessageIndex && (
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              )}
            </div>
            
            {/* Step number */}
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              index <= currentMessageIndex 
                ? "text-primary" 
                : "text-muted-foreground"
            )}>
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportSlider;
