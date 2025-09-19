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
  return (
    <div className={`flex items-center justify-center space-x-3 sm:space-x-4 ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = index === currentStep;

        return (
          <div
            key={index}
            className={`h-2 w-12 sm:w-16 rounded-full transition-all duration-500 ${
              isCompleted 
                ? 'bg-green-500' 
                : isCurrent 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
};
