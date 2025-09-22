import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import GameControls from "@/components/ui/GameControls";
import { CommonInstructionsModal } from "@/components/CommonInstructionsModal";
import { GameTimer } from "@/components/GameTimer";
import { GameCard } from "@/components/GameCard";
import { ResultScreen } from "@/components/ResultScreen";
import { useGameRedirect } from "@/hooks/useGameRedirect";
import { useGameSession } from "@/hooks/useGameSession";

interface GameMistake {
  challengeType: string;
  expected: string;
  chosen: string;
  isCorrect: boolean;
}

interface Challenge {
  type: "letter-confusion" | "word-confusion" | "mirrored-letter";
  prompt: string;
  voicePrompt: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
}

type GameState = "instructions" | "playing" | "feedback" | "finished";

const GAME_DURATION = 60; // 60 seconds
const FEEDBACK_DURATION = 1500; // 1.5 seconds

export const LetterReversalSpotter: React.FC = () => {
  const navigate = useNavigate();
  const gameRedirect = useGameRedirect("letter-reversal-spotter");
  const gameSession = useGameSession(7); // gameId 7 for letter-reversal-spotter
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [score, setScore] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [usedChallenges, setUsedChallenges] = useState<Set<string>>(new Set());
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  // Voice synthesis function with consistent settings
  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Wait a moment for cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Consistent voice settings for all questions
        utterance.rate = 0.7; // Slower, consistent rate
        utterance.pitch = 1.1; // Consistent pitch
        utterance.volume = 0.9; // Consistent volume
        utterance.lang = "en-US"; // Consistent language

        // Try to use the same voice consistently
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        // Priority order for consistent voice selection
        const preferredVoices = [
          "Microsoft Zira - English (United States)",
          "Google US English",
          "Alex",
          "Samantha",
          "Karen",
          "Microsoft David - English (United States)",
        ];

        // Find the first available preferred voice
        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find((voice) => voice.name === voiceName);
          if (selectedVoice) break;
        }

        // Fallback to first English voice if no preferred voice found
        if (!selectedVoice) {
          selectedVoice = voices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              (voice.name.includes("Female") || voice.name.includes("Woman"))
          );
        }

        // Final fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find((voice) => voice.lang.startsWith("en"));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  }, []);

  // Dynamic challenge generation based on difficulty and time
  const generateChallengePool = useCallback(
    (difficulty: number): Challenge[] => {
      const baseLetters = ["b", "d", "p", "q"];
      const confusingPairs = [
        ["was", "saw"],
        ["dog", "god"],
        ["top", "pot"],
        ["tar", "rat"],
        ["net", "ten"],
        ["pan", "nap"],
        ["tab", "bat"],
        ["mad", "dam"],
      ];
      const mirroredLetters = [
        ["R", "Я"],
        ["N", "И"],
        ["E", "Ǝ"],
        ["F", "ᖴ"],
        ["G", "Ɔ"],
        ["J", "ſ"],
        ["L", "⅃"],
        ["S", "Ƨ"],
      ];

      const challenges: Challenge[] = [];

      // Level 1: Basic letter confusion (easier)
      if (difficulty >= 1) {
        baseLetters.forEach((letter) => {
          challenges.push({
            type: "letter-confusion",
            prompt: `Tap the letter "${letter}"`,
            voicePrompt: `Tap the letter ${letter}`,
            options: [...baseLetters].sort(() => Math.random() - 0.5),
            correctAnswer: letter,
            difficulty: 1,
          });
        });
      }

      // Level 2: Word confusion (medium)
      if (difficulty >= 2) {
        confusingPairs.forEach(([word1, word2]) => {
          challenges.push({
            type: "word-confusion",
            prompt: `Find the word "${word1}"`,
            voicePrompt: `Find the word ${word1}`,
            options: [word1, word2].sort(() => Math.random() - 0.5),
            correctAnswer: word1,
            difficulty: 2,
          });
          challenges.push({
            type: "word-confusion",
            prompt: `Tap the word "${word2}"`,
            voicePrompt: `Tap the word ${word2}`,
            options: [word1, word2].sort(() => Math.random() - 0.5),
            correctAnswer: word2,
            difficulty: 2,
          });
        });
      }

      // Level 3: Mirrored letters (harder)
      if (difficulty >= 3) {
        mirroredLetters.forEach(([normal, mirrored]) => {
          challenges.push({
            type: "mirrored-letter",
            prompt: `Tap the real letter "${normal}"`,
            voicePrompt: `Tap the real letter ${normal}`,
            options: [normal, mirrored].sort(() => Math.random() - 0.5),
            correctAnswer: normal,
            difficulty: 3,
          });
        });
      }

      // Level 4: Mixed complexity (hardest)
      if (difficulty >= 4) {
        // Add more complex combinations
        const complexWords = [
          ["stop", "pots"],
          ["star", "rats"],
          ["part", "trap"],
        ];
        complexWords.forEach(([word1, word2]) => {
          challenges.push({
            type: "word-confusion",
            prompt: `Find "${word1}"`,
            voicePrompt: `Find the word ${word1}`,
            options: [word1, word2].sort(() => Math.random() - 0.5),
            correctAnswer: word1,
            difficulty: 4,
          });
        });
      }

      return challenges;
    },
    []
  );

  // Generate challenge based on current difficulty and avoid repeats
  const generateChallenge = useCallback((): Challenge => {
    const challengePool = generateChallengePool(difficultyLevel);
    const availableChallenges = challengePool.filter(
      (challenge) =>
        !usedChallenges.has(`${challenge.prompt}-${challenge.correctAnswer}`)
    );

    if (availableChallenges.length === 0) {
      // Reset used challenges if we've used them all
      setUsedChallenges(new Set());
      return challengePool[Math.floor(Math.random() * challengePool.length)];
    }

    // Prefer challenges matching current difficulty level
    const preferredChallenges = availableChallenges.filter(
      (c) => c.difficulty === difficultyLevel
    );
    const finalPool =
      preferredChallenges.length > 0
        ? preferredChallenges
        : availableChallenges;

    return finalPool[Math.floor(Math.random() * finalPool.length)];
  }, [difficultyLevel, usedChallenges, generateChallengePool]);

  // Update difficulty based on time elapsed
  const updateDifficulty = useCallback((timeElapsed: number) => {
    if (timeElapsed < 15) {
      setDifficultyLevel(1); // First 15 seconds: basic letters
    } else if (timeElapsed < 30) {
      setDifficultyLevel(2); // 15-30 seconds: add words
    } else if (timeElapsed < 45) {
      setDifficultyLevel(3); // 30-45 seconds: add mirrored letters
    } else {
      setDifficultyLevel(4); // Last 15 seconds: everything mixed
    }
  }, []);

  // Start new challenge
  const startNewChallenge = useCallback(() => {
    // Reset all selection states first
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Clear current challenge temporarily to prevent flickering
    setCurrentChallenge(null);

    // Small delay to ensure clean state transition
    setTimeout(() => {
      const challenge = generateChallenge();
      setCurrentChallenge(challenge);
      setUsedChallenges((prev) =>
        new Set(prev).add(`${challenge.prompt}-${challenge.correctAnswer}`)
      );
      setTotalChallenges((prev) => prev + 1);

      // Speak the challenge after a short delay
      setTimeout(() => {
        speakText(challenge.voicePrompt);
      }, 300);
    }, 50);
  }, [generateChallenge, speakText]);

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (selectedAnswer || !currentChallenge) return;

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      setSelectedAnswer(answer);
      const correct = answer === currentChallenge.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        const points = currentChallenge.difficulty * 10; // More points for harder challenges
        setScore((prev) => prev + points);
      } else {
        setMistakes((prev) => [
          ...prev,
          {
            challengeType: currentChallenge.type,
            expected: currentChallenge.correctAnswer,
            chosen: answer,
            isCorrect: false,
          },
        ]);
      }

      setGameState("feedback");

      // Auto-advance after feedback
      setTimeout(() => {
        if (timeLeft > 0) {
          // Reset states before starting new challenge
          setSelectedAnswer(null);
          setIsCorrect(null);
          setGameState("playing");
          startNewChallenge();
        } else {
          setGameState("finished");
        }
      }, FEEDBACK_DURATION);
    },
    [selectedAnswer, currentChallenge, timeLeft, startNewChallenge, speakText]
  );

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "feedback") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        const timeElapsed = GAME_DURATION - newTime;

        // Update difficulty based on time elapsed
        updateDifficulty(timeElapsed);

        if (newTime <= 0) {
          setGameState("finished");
          window.speechSynthesis.cancel();
          // Create game session with hardcoded data only if session is active
          if (gameSession.isSessionActive) {
            gameSession
              .endSessionWithHardcodedData("letter-reversal-spotter")
              .catch((error) => {
                console.error("Failed to save game session:", error);
              });
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, updateDifficulty, gameSession]);

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing");
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setMistakes([]);
    setTotalChallenges(0);
    setUsedChallenges(new Set());
    setDifficultyLevel(1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentChallenge(null);
    gameSession.startSession(); // Start tracking the game session
    startNewChallenge();
  }, [startNewChallenge, gameSession]);

  // Restart game
  const restartGame = useCallback(() => {
    window.speechSynthesis.cancel();
    setGameState("instructions");
    setTimeLeft(GAME_DURATION);
    setCurrentChallenge(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setMistakes([]);
    setTotalChallenges(0);
    setUsedChallenges(new Set());
    setDifficultyLevel(1);
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Get card size based on challenge type
  const getCardSize = (challengeType: string) => {
    switch (challengeType) {
      case "letter-confusion":
        return "large";
      case "word-confusion":
        return "medium";
      case "mirrored-letter":
        return "large";
      default:
        return "medium";
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Easy - Basic Letters";
      case 2:
        return "Medium - Words";
      case 3:
        return "Hard - Mirrored Letters";
      case 4:
        return "Expert - Mixed Challenge";
      default:
        return "Level " + level;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border border-white/40 relative mb-6" style={{ height: '100px' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Letter Reversal
            </h1>
          </div>
        </div>
        {/* Back Button */}
        <BackButton onClick={() => navigate("/")} />
      </header>

      {/* Game Timer */}
      {(gameState === "playing" || gameState === "feedback") && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <GameTimer
            timeLeft={timeLeft}
            totalTime={GAME_DURATION}
            className=""
          />
        </div>
      )}

      {/* Game Controls */}
      {(gameState === "playing" || gameState === "feedback") && (
        <GameControls score={score} />
      )}

      {/* Instructions Screen */}
      <CommonInstructionsModal
        isOpen={gameState === "instructions"}
        title="Letter Reversal"
        subtitle="Help Panda find the right letters and words! 🔊 Listen for voice cues!"
        instructions={[
          {
            icon: "🔊",
            text: "Listen!",
            subtext: "Voice will tell you what to find (e.g., 'Tap the letter F')"
          },
          {
            icon: "📈",
            text: "Difficulty!",
            subtext: "Gets harder every 15 seconds - letters → words → mirrored letters"
          },
          {
            icon: "🎯",
            text: "Scoring!",
            subtext: "Harder challenges give more points!"
          },
          {
            icon: "⏰",
            text: "Time Limit!",
            subtext: "60 seconds of non-stop challenges!"
          }
        ]}
        onStartGame={startGame}
        buttonText="LET'S START"
      />

      {/* Game Screen */}
      {(gameState === "playing" || gameState === "feedback") &&
        currentChallenge &&
        currentChallenge.options && (
          <motion.div
            key={`challenge-${currentChallenge.prompt}-${currentChallenge.correctAnswer}`}
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Challenge Prompt */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-orange-200 mb-8 mt-12"
              key={currentChallenge.prompt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-6xl mb-4">🐼</div>
              <h2 className="text-3xl font-bold text-orange-700 mb-2">
                {currentChallenge.prompt}
              </h2>
              <div className="text-lg text-orange-600">
                🔊 Listen for the voice cue!
              </div>
            </motion.div>

            {/* Answer Options */}
            <div
              className={`grid gap-6 justify-center items-center ${
                currentChallenge.options.length === 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              <AnimatePresence mode="wait" key={currentChallenge.prompt}>
                {currentChallenge.options.map((option, index) => (
                  <motion.div
                    key={`${currentChallenge.prompt}-${currentChallenge.correctAnswer}-${option}-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <GameCard
                      content={option}
                      onClick={() => handleAnswerSelect(option)}
                      isCorrect={
                        selectedAnswer === option
                          ? option === currentChallenge.correctAnswer
                          : null
                      }
                      isSelected={selectedAnswer === option}
                      disabled={gameState === "feedback"}
                      size={getCardSize(currentChallenge.type) as any}
                      className="mx-auto"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

      {/* Result Screen */}
      {gameState === "finished" && (
        <ResultScreen
          score={score}
          totalChallenges={totalChallenges}
          mistakes={mistakes}
          onRestart={restartGame}
          onBackToMenu={() => navigate("/")}
          title="Amazing Work!"
          message="You helped Panda master all the tricky letters!"
          character="🐼"
          isInRedirectFlow={gameRedirect.isInRedirectFlow}
          onGoToNextGame={gameRedirect.handleGoToNextGame}
          isLastGame={gameRedirect.isLastGame}
        />
      )}
    </div>
  );
};
