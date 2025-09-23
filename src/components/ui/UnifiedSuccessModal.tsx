import React from 'react';
import { Button } from './button';

interface UnifiedSuccessModalProps {
  isOpen: boolean;
  gameName: string;
  score: number;
  onPlayAgain: () => void;
  onGoToNextGame?: () => void;
  onBackToMenu: () => void;
  isInRedirectFlow?: boolean;
  isLastGame?: boolean;
  additionalStats?: React.ReactNode;
}

export const UnifiedSuccessModal = ({
  isOpen,
  gameName,
  score,
  onPlayAgain,
  onGoToNextGame,
  onBackToMenu,
  isInRedirectFlow = false,
  isLastGame = false,
  additionalStats
}: UnifiedSuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>
            Great Job!
          </h2>
          <p className="text-lg" style={{ color: '#383534' }}>
            You completed {gameName}!
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-6 text-center border border-orange-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-orange-700">Points Earned</div>
        </div>

        {/* Additional Stats */}
        {additionalStats && (
          <div className="mb-6">
            {additionalStats}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Play Again Button */}
          <Button 
            onClick={onPlayAgain}
            className="w-full rounded-full px-6 py-4 text-white font-semibold text-sm tracking-wider border transition-all duration-300"
              style={{
                backgroundColor: '#ea580c',
                borderColor: '#c2410c',
                borderWidth: '1px',
                boxShadow: '0px 3px 0px 3px #c2410c',
                letterSpacing: '2.86%'
              }}
          >
            PLAY AGAIN
          </Button>

          {/* Next Game Button - Only show if in redirect flow and not last game */}
          {isInRedirectFlow && !isLastGame && onGoToNextGame && (
            <Button 
              onClick={onGoToNextGame}
              className="w-full rounded-full px-6 py-4 font-semibold text-sm tracking-wider border transition-all duration-300"
              style={{
                backgroundColor: '#fed7aa',
                borderColor: '#fdba74',
                borderWidth: '1px',
                color: '#9a3412',
                letterSpacing: '2.86%'
              }}
            >
              NEXT GAME
            </Button>
          )}

          {/* Back to Menu Button */}
          <Button 
            onClick={onBackToMenu}
            className="w-full rounded-full px-6 py-4 font-semibold text-sm tracking-wider border transition-all duration-300"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#fdba74',
                borderWidth: '1px',
                color: '#9a3412',
                letterSpacing: '2.86%'
              }}
          >
            BACK TO MENU
          </Button>
        </div>
      </div>
    </div>
  );
};
