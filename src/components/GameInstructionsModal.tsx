import { Button } from '@/components/ui/button';

interface GameInstructionsModalProps {
  isOpen: boolean;
  onStartGame: () => void;
}

export const GameInstructionsModal = ({ isOpen, onStartGame }: GameInstructionsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/80 via-purple-200/80 to-pink-200/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">😊</div>
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Copy My Face
          </h2>
          <p className="text-blue-600 text-lg">
            Let's learn how to play
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 bg-blue-50/60 rounded-2xl p-4 border border-blue-200">
            <div className="text-3xl">👀</div>
            <div>
              <p className="font-bold text-blue-700">Look!</p>
              <p className="text-sm text-blue-600">I'll show you a face</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-green-50/60 rounded-2xl p-4 border border-green-200">
            <div className="text-3xl">😊</div>
            <div>
              <p className="font-bold text-green-700">Copy!</p>
              <p className="text-sm text-green-600">Make the same face</p>
            </div>
          </div>
          
          {/* <div className="flex items-center gap-4 bg-orange-50/60 rounded-2xl p-4 border border-orange-200">
            <div className="text-3xl">⏱️</div>
            <div>
              <p className="font-bold text-orange-700">Quick!</p>
              <p className="text-sm text-orange-600">You have 5 seconds</p>
            </div>
          </div> */}
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={onStartGame}
            size="lg"
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Let's Play
          </Button>
        </div>
      </div>
    </div>
  );
};
