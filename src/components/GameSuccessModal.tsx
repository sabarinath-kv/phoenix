import { Button } from "@/components/ui/button";

interface GameSuccessModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  onGoBack: () => void;
  // Game redirect props
  isInRedirectFlow?: boolean;
  onGoToNextGame?: () => void;
  isLastGame?: boolean;
}

export const GameSuccessModal = ({
  isOpen,
  onPlayAgain,
  onGoBack,
  isInRedirectFlow = false,
  onGoToNextGame,
  isLastGame = false,
}: GameSuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-black-700 mb-2">Well Done!</h2>
          <p className="text-black-600 text-lg">
            Amazing! You successfully completed all the challenges!
          </p>
        </div>

        <div className="text-center space-y-3">
          {isInRedirectFlow && onGoToNextGame ? (
            <>
              <Button
                onClick={onGoToNextGame}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
              >
                {isLastGame ? "Finish" : "Go to Next Game"}
              </Button>
              <Button
                onClick={onPlayAgain}
                variant="outline"
                className="text-gray-600 hover:text-gray-800 w-full rounded-full"
              >
                Play Again
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onPlayAgain}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
              >
                Play Again
              </Button>
              <Button
                onClick={onGoBack}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 rounded-full"
              >
                Back to Games
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
