import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import reportBottomImage from '@/assets/images/reportBottomImage.png';
import { Summary } from '@/api/apis';
import Graph from '@/assets/images/graph.png';
import GraphPositive from '@/assets/images/graphPositive.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  name: string;
}

export const FinalReport: React.FC<FocusSpanSliderProps> = ({
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
  name,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const navigate = useNavigate();
  const { user } = useAuth();
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
        <h2 className="text-[24px] font-bold text-[#3B3839] text-center leading-[140%] mb-12" style={{ fontFamily: 'Plus Jakarta Sans' }}>Response Style</h2>
        {/* Icon Container */}
        <div className="flex justify-center mb-6">
          <div className="w-[253px] h-[196px] rounded-3xl overflow-hidden">
            <img
              src={user.metadata?.voice_assessment?.adhd_confidence_score > 0 ? Graph :  GraphPositive}
              alt={imageAlt}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title */}

       

        {/* Recommendation */}
        <div 
          className="mb-6 bg-[#FAF6F3] flex flex-row items-center rounded-[20px] p-4 h-[100px] mt-12"
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

      </div>

      {/* Next Button */}
      <button
        onClick={() => {
          navigate( user.metadata?.voice_assessment?.adhd_confidence_score > 0 ? '/expert' : '/tutorial-intro')
        }}
        className="w-full py-4 mt-20 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[#FFD934]"
        style={{
          boxShadow: '0px 6px 0px 4px #FAAD61'
        }}
      >
        CONTINUE
      </button>
    </div>
  );
};

export default FinalReport;
