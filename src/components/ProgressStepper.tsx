import React from 'react';

interface ProgressStepperProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  totalSteps,
  currentStep,
  completedSteps,
  className = ""
}) => {
  const emojis = ['😐', '😠', '😢', '😊', '😁']; // Match the game emojis
  
  return (
    <div className={`${className}`}>
      {/* Title */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-orange-700">Your Progress</h3>
        <p className="text-sm text-orange-600">{completedSteps.length} of {totalSteps} emotions mastered</p>
      </div>
      
      {/* Emoji Progress Circles */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const emoji = emojis[index] || '😊';

          return (
            <div key={index} className="flex flex-col items-center">
              {/* Emoji Circle */}
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 transition-all duration-500 flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100 border-green-400 shadow-lg scale-110' 
                    : isCurrent 
                      ? 'bg-orange-100 border-orange-400 shadow-md animate-pulse scale-105' 
                      : 'bg-gray-100 border-gray-300'
                }`}
              >
                <span className={`text-lg sm:text-xl transition-all duration-300 ${
                  isCompleted ? 'grayscale-0' : isCurrent ? 'grayscale-0' : 'grayscale opacity-50'
                }`}>
                  {emoji}
                </span>
                
                {/* Success Check Mark */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
