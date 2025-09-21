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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 via-pink-100/80 to-blue-100/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl p-8 shadow-xl mx-4 max-w-md w-full">
        {/* Green Trophy and Success Message */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold text-green-600 mb-4">Well Done</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {isInRedirectFlow && onGoToNextGame ? (
            <>
              <Button
                onClick={onGoToNextGame}
                className="bg-green-500 hover:bg-green-600 text-white border-0 py-4 text-xl font-bold rounded-full"
              >
                {isLastGame ? "Finish All Games" : "Go to Next Game"}
              </Button>
              <Button
                onClick={onPlayAgain}
                variant="outline"
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-xl font-bold rounded-full"
              >
                Play Again
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onPlayAgain}
                className="bg-green-500 hover:bg-green-600 text-white border-0 py-4 text-xl font-bold rounded-full"
              >
                Play Again
              </Button>

              <Button
                onClick={onGoBack}
                variant="outline"
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-xl font-bold rounded-full"
              >
                Go Back
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
