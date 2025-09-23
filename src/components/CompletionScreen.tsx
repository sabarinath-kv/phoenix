import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CompletionScreenProps {
  onStartAgain: () => void;
  className?: string;
}

export const CompletionScreen = ({
  onStartAgain,
  className = "",
}: CompletionScreenProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-black-700 mb-2">Completed!</h2>
          <p className="text-black-600 text-lg">
            Great job mimicking that expression! Ready for more?
          </p>
        </div>

        <div className="text-center">
          <Button
            onClick={onStartAgain}
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
          >
            Try Another Expression
          </Button>
        </div>
      </div>
    </div>
  );
};
