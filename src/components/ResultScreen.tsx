import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalChallenges,
  mistakes,
  onRestart,
  onBackToMenu,
  title = "Great Job!",
  message = "You helped Panda find the right letters!",
  character = "🐼"
}) => {
  const correctAnswers = totalChallenges - mistakes.length;
  const accuracy = totalChallenges > 0 ? Math.round((correctAnswers / totalChallenges) * 100) : 0;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-4 border-purple-300 shadow-2xl max-w-md w-full">
          <div className="p-8 text-center space-y-6">
            {/* Character and Title */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-8xl mb-4"
            >
              {character}
            </motion.div>

            <motion.h2 
              className="text-3xl font-bold text-purple-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h2>

            <motion.p 
              className="text-lg text-purple-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="bg-white/80 rounded-xl p-4 space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{mistakes.length}</div>
                  <div className="text-sm text-gray-600">Mistakes</div>
                </div>
              </div>
              
              <div className="text-center pt-2 border-t border-gray-200">
                <div className={`text-3xl font-bold ${getPerformanceColor()}`}>
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>

              <motion.p 
                className={`text-center font-semibold ${getPerformanceColor()}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                {getPerformanceMessage()}
              </motion.p>
            </motion.div>

            {/* Mistakes Summary (if any) */}
            {mistakes.length > 0 && (
              <motion.div 
                className="bg-orange-50 rounded-xl p-4 text-left"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-bold text-orange-700 mb-2">💡 Learning Points:</h4>
                <div className="space-y-1 text-sm">
                  {mistakes.slice(0, 3).map((mistake, index) => (
                    <div key={index} className="text-orange-600">
                      • {mistake.challengeType}: Expected "{mistake.expected}", chose "{mistake.chosen}"
                    </div>
                  ))}
                  {mistakes.length > 3 && (
                    <div className="text-orange-500 text-xs">
                      ...and {mistakes.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onRestart}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                🎮 Play Again
              </Button>
              
              <Button
                onClick={onBackToMenu}
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-3 rounded-xl"
              >
                🏠 Back to Games
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
