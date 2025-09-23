import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GameMistake {
  challengeType: string;
  expected: string;
  chosen: string;
  isCorrect: boolean;
}

interface ResultScreenProps {
  score: number;
  totalChallenges: number;
  mistakes: GameMistake[];
  onRestart: () => void;
  onBackToMenu: () => void;
  title?: string;
  message?: string;
  character?: string;
  // Game redirect props
  isInRedirectFlow?: boolean;
  onGoToNextGame?: () => void;
  isLastGame?: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalChallenges,
  mistakes,
  onRestart,
  onBackToMenu,
  title = "Great Job!",
  message = "You helped Panda find the right letters!",
  character = "🐼",
  isInRedirectFlow = false,
  onGoToNextGame,
  isLastGame = false,
}) => {
  const correctAnswers = totalChallenges - mistakes.length;
  const accuracy =
    totalChallenges > 0
      ? Math.round((correctAnswers / totalChallenges) * 100)
      : 0;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Outstanding! You're a letter detective! 🕵️";
    if (accuracy >= 75) return "Excellent work! Keep it up! ⭐";
    if (accuracy >= 60) return "Good job! Practice makes perfect! 👍";
    return "Nice try! Let's practice more! 💪";
  };

  const getPerformanceColor = () => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 75) return "text-blue-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-6xl mb-4"
          >
            {character}
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-black-700 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-black-600 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {accuracy >= 90
              ? "Amazing! You're a letter detective!"
              : accuracy >= 75
              ? "Excellent work! You mastered those tricky letters!"
              : accuracy >= 60
              ? "Good job! Keep practicing those reversals!"
              : "Keep practicing! You're getting better at spotting letters!"}
          </motion.p>
        </div>

        <motion.div
          className="space-y-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4 bg-black-50/60 rounded-2xl p-4 border border-black-200">
            <div className="text-3xl">🏆</div>
            <div>
              <p className="font-bold text-black-700">Final Score</p>
              <p className="text-2xl font-bold text-black-800">{score}</p>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="flex items-center gap-4 bg-yellow-50/60 rounded-2xl p-4 border border-yellow-200">
              <div className="text-3xl">💡</div>
              <div>
                <p className="font-bold text-yellow-700">Learning Tips</p>
                <p className="text-sm text-yellow-600">
                  {mistakes.length === 1
                    ? "Just 1 mistake - you're doing great!"
                    : mistakes.length <= 3
                    ? `${mistakes.length} mistakes - keep practicing!`
                    : "Practice makes perfect - try again!"}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="text-center space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
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
                onClick={onRestart}
                variant="outline"
                className="text-gray-600 hover:text-gray-800 w-full rounded-full"
              >
                Play Again
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onRestart}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
              >
                Play Again
              </Button>
              <Button
                onClick={onBackToMenu}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 rounded-full"
              >
                Back to Games
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
