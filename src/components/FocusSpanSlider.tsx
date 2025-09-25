import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import reportBottomImage from '@/assets/images/reportBottomImage.png';
import { Summary } from '@/api/apis';
import shapesFill from '@/assets/images/shapes-fill.png';
import bulbe from '@/assets/images/bulbe.png';

interface FocusSpanSliderProps {
  /** The image to display */
  imageSrc: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Title text */
  title: string;
  /** Current time display */
  currentTime: string;
  /** Maximum time */
  maxTime: string;
  /** Current progress value (0-100) */
  progress: number;
  /** Value text */
  value: string;
  /** Recommendation text */
  recommendation: string;
  /** Current slide number */
  currentSlide: number;
  /** Total slides */
  totalSlides: number;
  /** Whether the slider is interactive */
  interactive?: boolean;
  /** Callback when progress changes */
  onProgressChange?: (progress: number) => void;
  /** Callback when next is clicked */
  onNext?: () => void;
  /** Callback when back is clicked */
  onBack?: () => void;
  /** Custom className for the container */
  className?: string;
  /** Type of the slider */
  type: Summary;
  sub: string;
}

export const FocusSpanSlider: React.FC<FocusSpanSliderProps> = ({
  imageSrc,
  imageAlt = 'Focus Span illustration',
  title,
  currentTime,
  maxTime,
  progress,
  recommendation,
  currentSlide,
  totalSlides,
  interactive = true,
  onProgressChange,
  onNext,
  onBack,
  type,
  value,
  className,
  sub
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  // Update current progress when prop changes
  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!interactive) return;
    const newProgress = parseInt(event.target.value);
    setCurrentProgress(newProgress);
    onProgressChange?.(newProgress);
  };

  return (
    <div className={cn("w-full max-w-sm mx-auto flex flex-col", className)} style={{ backgroundColor: '#F9F0CB' }}>
      {/* Back Button */}
      <div className="mb-0">
        <button
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Card */}
      <div className={"bg-white mt-10 rounded-3xl p-8 mb-6"}>
        {/* Icon Container */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-3xl overflow-hidden" style={{ backgroundColor: '#B8A3E8' }}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {title}
        </h1>

        {/* Time Display */}
    
        {/* Progress Bar */}
      {type == Summary.attention_focus ? <div className="mb-6 mt-[100px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">0m</span>
            <span className="text-sm text-gray-400">
              {maxTime}
              <br />
            </span>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              {/* Background track with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full" />
              
              {/* Progress fill with animated gradient */}
              <div
                className="absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-full shadow-sm overflow-hidden"
                style={{
                  width: `${currentProgress}%`,
                  background: 'linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)'
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              
              {/* Progress indicator dot with glow */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full shadow-lg transition-all duration-700 ease-out hover:scale-110 cursor-pointer"
                style={{ 
                  left: `calc(${currentProgress}% - 12px)`,
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
                  border: '3px solid white',
                  boxShadow: `0 0 0 0 rgba(255, 140, 0, 0.4), 0 4px 8px rgba(0,0,0,0.1)`,
                  animation: currentProgress > 0 ? 'pulse-glow 2s infinite' : 'none'
                }}
              >
                {/* Inner dot */}
                <div className="absolute inset-1 bg-white rounded-full" />
              </div>
            </div>
            
            {/* Time Display Bubble */}
            <div
              className="absolute  top-[-90px]"
              style={{
                left: `calc(${currentProgress}% - 55px)`,
              }}
            >
              <div className="flex justify-center">
                <div className="bg-white rounded-2xl px-6 py-6 relative shadow-lg border border-gray-100">
                  <span className="text-xl font-bold text-gray-800">{currentTime}</span>
                  {/* Speech bubble tail */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid white'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive range input */}
            {interactive && (
              <input
                type="range"
                min="0"
                max="100"
                value={currentProgress}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer modern-focus-slider"
              />
            )}
          </div>
          
          <style>{`
            /* Modern Focus Slider Styles */
            .modern-focus-slider {
              background: transparent;
              outline: none;
            }
            
            .modern-focus-slider::-webkit-slider-thumb {
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
              border: 4px solid white;
              box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.12), 
                0 2px 8px rgba(0, 0, 0, 0.08),
                0 0 0 0 rgba(255, 140, 0, 0.3);
              cursor: grab;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
            }
            
            .modern-focus-slider::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 6px rgba(255, 140, 0, 0.15);
              background: linear-gradient(135deg, #FF8C00 0%, #FFB84D 100%);
            }
            
            .modern-focus-slider::-webkit-slider-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
              box-shadow: 
                0 4px 16px rgba(0, 0, 0, 0.2), 
                0 2px 8px rgba(0, 0, 0, 0.15),
                0 0 0 8px rgba(255, 140, 0, 0.2);
              background: linear-gradient(135deg, #E67E00 0%, #FF9500 100%);
            }
            
            .modern-focus-slider::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
              border: 4px solid white;
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
              cursor: grab;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .modern-focus-slider::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.12);
              background: linear-gradient(135deg, #FF8C00 0%, #FFB84D 100%);
            }
            
            .modern-focus-slider::-moz-range-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            /* Focus styles for accessibility */
            .modern-focus-slider:focus {
              outline: none;
            }
            
            .modern-focus-slider:focus::-webkit-slider-thumb {
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 3px rgba(255, 140, 0, 0.3);
            }
            
            .modern-focus-slider:focus::-moz-range-thumb {
              box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.16), 
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 0 0 3px rgba(255, 140, 0, 0.3);
            }
            
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            
            @keyframes pulse-glow {
              0%, 100% { 
                box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4), 0 4px 8px rgba(0,0,0,0.1);
              }
              50% { 
                box-shadow: 0 0 0 8px rgba(255, 140, 0, 0.1), 0 4px 12px rgba(0,0,0,0.15);
              }
            }
            
            .animate-shimmer {
              animation: shimmer 2s infinite;
            }
          `}</style>
        </div> : <h1 className={`text-3xl font-bold text-[#3B3839] text-center mb-8 ${value.includes('%') ? 'text-[48px]' : 'text-[28px] font-semibold'}`}>
          {value}
        </h1>}

        { type != Summary.attention_focus ? <div className="mb-6">
          <div className=" bg-[#FAF6F3] mx-16 rounded-md  flex flex-row p-2 justify-center items-center">
            <img src={imageAlt} alt="shapesFill" className="w-5 h-5 mr-2" />
            <p>{sub}</p>
          </div>
        </div> : null}

        {/* Recommendation */}
        <div 
          className="mb-6 bg-[#FAF6F3] flex flex-row items-center rounded-[20px] p-4 h-[100px] mt-8"
          style={{
            // backgroundImage: `url(${reportBottomImage})`,
            backgroundSize: 'contain',
            borderRadius: '1rem',
            boxShadow: '0px 8px 0px 0px #D4D1D2',
            border: '1px solid #D4D1D2'
          }}
        >
            <img src={bulbe} alt="reportBottomImage" className="w-8 h-8 mr-2" />
          <p className="text-[#383534] font-['DM_Sans'] font-normal italic text-[18px] leading-none tracking-[0%] align-middle">{recommendation}</p>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSlides }, (_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                index === currentSlide - 1 ? "bg-orange-400" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-full py-4 mt-4 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[#FFD934]"
        style={{
          boxShadow: '0px 6px 0px 4px #FAAD61'
        }}
      >
        NEXT
      </button>
    </div>
  );
};

export default FocusSpanSlider;
