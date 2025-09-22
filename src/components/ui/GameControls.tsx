import React from 'react';

interface GameControlsProps {
  score?: number;
  timeLeft?: number;
  round?: string;
  totalRounds?: number;
  currentRound?: number;
  children?: React.ReactNode;
  className?: string;
}

function GameControls({ 
  score, 
  timeLeft, 
  round, 
  totalRounds, 
  currentRound, 
  children, 
  className = '' 
}: GameControlsProps) {
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg px-6 py-3">
        <div className="flex items-center justify-center gap-6 text-gray-800">
          {score !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          )}
          
          {timeLeft !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.ceil(timeLeft / 1000)}s</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          )}
          
          {round && (
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{round}</div>
              <div className="text-sm text-gray-600">Round</div>
            </div>
          )}
          
          {currentRound !== undefined && totalRounds !== undefined && (
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{currentRound + 1}/{totalRounds}</div>
              <div className="text-sm text-gray-600">Round</div>
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
}

export default GameControls;
