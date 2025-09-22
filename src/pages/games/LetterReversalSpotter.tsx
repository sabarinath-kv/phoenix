import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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

// Enhanced metrics tracking interfaces
interface LetterReversalEvent {
  timestamp: number;
  challengeId: string;
  challengeType: string;
  prompt: string;
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  gameTime: number;
  difficultyLevel: number;
  optionViewTimes: number[]; // Time spent looking at each option
  totalComparisonTime: number;
  doubleCheckCount: number; // How many times user looked back
  systematicCheck: boolean; // Whether user checked all options
}

interface LetterReversalMetrics {
  // Accuracy Metrics
  correct_identification: number; // 0-1 ratio of exact matches
  mirror_confusion: number; // Count of mirror confusions
  rotation_confusion: number; // Count of rotation confusions

  // Processing Metrics
  comparison_time: number; // Average time studying options
  double_checking: number; // 0-1 ratio of double-checks
  systematic_checking: number; // 0-1 ratio of systematic checking

  // Specific Letter Issues
  problem_letters: Array<{
    pair: string;
    error_count: number;
    accuracy: number;
  }>;
  consistency: number; // 0-1 score for repeated errors

  // Raw data for analysis
  all_events: LetterReversalEvent[];
  game_duration: number;
  total_challenges: number;
  difficulty_progression: Array<{
    time: number;
    level: number;
    performance: number;
  }>;
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

  // Enhanced metrics tracking state
  const [allEvents, setAllEvents] = useState<LetterReversalEvent[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0);
  const [optionInteractions, setOptionInteractions] = useState<{
    [key: string]: number;
  }>({});
  const [doubleCheckCount, setDoubleCheckCount] = useState(0);
  const [difficultyProgression, setDifficultyProgression] = useState<
    Array<{
      time: number;
      level: number;
      performance: number;
    }>
  >([]);

  // Refs to store current metrics data for accurate calculation
  const metricsDataRef = useRef({
    allEvents: [] as LetterReversalEvent[],
    difficultyProgression: [] as Array<{
      time: number;
      level: number;
      performance: number;
    }>,
  });

  // Ref to store current score for accurate session data
  const scoreRef = useRef(0);

  // Keep refs in sync with state for accurate metrics calculation
  useEffect(() => {
    metricsDataRef.current.allEvents = allEvents;
  }, [allEvents]);

  useEffect(() => {
    metricsDataRef.current.difficultyProgression = difficultyProgression;
  }, [difficultyProgression]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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

  // Helper functions for metrics analysis
  const isMirrorConfusion = useCallback(
    (expected: string, chosen: string): boolean => {
      const mirrorPairs = [
        ["b", "d"],
        ["p", "q"],
        ["n", "u"],
        ["6", "9"],
        ["R", "Я"],
        ["N", "И"],
        ["E", "Ǝ"],
        ["F", "ᖴ"],
        ["G", "Ɔ"],
        ["J", "ſ"],
        ["L", "⅃"],
        ["S", "Ƨ"],
      ];

      return mirrorPairs.some(
        ([a, b]) =>
          (expected === a && chosen === b) || (expected === b && chosen === a)
      );
    },
    []
  );

  const isRotationConfusion = useCallback(
    (expected: string, chosen: string): boolean => {
      const rotationPairs = [
        ["6", "9"],
        ["p", "b"],
        ["d", "q"],
        ["n", "u"],
      ];

      return rotationPairs.some(
        ([a, b]) =>
          (expected === a && chosen === b) || (expected === b && chosen === a)
      );
    },
    []
  );

  const getProblemLetterPair = useCallback(
    (expected: string, chosen: string): string | null => {
      const problemPairs = [
        ["b", "d"],
        ["p", "q"],
        ["n", "u"],
        ["6", "9"],
      ];

      for (const [a, b] of problemPairs) {
        if (
          (expected === a && chosen === b) ||
          (expected === b && chosen === a)
        ) {
          return `${a}/${b}`;
        }
      }
      return null;
    },
    []
  );

  // Comprehensive metrics calculation function
  const calculateLetterReversalMetrics =
    useCallback((): LetterReversalMetrics => {
      const gameDuration = GAME_DURATION * 1000; // Convert to milliseconds
      const totalEvents = allEvents.length;

      if (totalEvents === 0) {
        return {
          correct_identification: 0,
          mirror_confusion: 0,
          rotation_confusion: 0,
          comparison_time: 0,
          double_checking: 0,
          systematic_checking: 0,
          problem_letters: [],
          consistency: 0,
          all_events: [],
          game_duration: gameDuration,
          total_challenges: 0,
          difficulty_progression: [],
        };
      }

      // Accuracy Metrics
      const correctEvents = allEvents.filter((event) => event.isCorrect);
      const correctIdentification = correctEvents.length / totalEvents;

      const mirrorConfusions = allEvents.filter(
        (event) =>
          !event.isCorrect &&
          isMirrorConfusion(event.correctAnswer, event.selectedAnswer)
      ).length;

      const rotationConfusions = allEvents.filter(
        (event) =>
          !event.isCorrect &&
          isRotationConfusion(event.correctAnswer, event.selectedAnswer)
      ).length;

      // Processing Metrics
      const avgComparisonTime =
        allEvents.reduce((sum, event) => sum + event.totalComparisonTime, 0) /
        totalEvents;

      const doubleCheckingRatio =
        allEvents.filter((event) => event.doubleCheckCount > 0).length /
        totalEvents;

      const systematicCheckingRatio =
        allEvents.filter((event) => event.systematicCheck).length / totalEvents;

      // Problem Letters Analysis
      const problemLetterStats: {
        [key: string]: { errors: number; total: number };
      } = {};
      const problemPairs = ["b/d", "p/q", "n/u", "6/9"];

      // Initialize problem letter stats
      problemPairs.forEach((pair) => {
        problemLetterStats[pair] = { errors: 0, total: 0 };
      });

      allEvents.forEach((event) => {
        const pair = getProblemLetterPair(
          event.correctAnswer,
          event.selectedAnswer
        );
        if (pair && problemLetterStats[pair]) {
          problemLetterStats[pair].total++;
          if (!event.isCorrect) {
            problemLetterStats[pair].errors++;
          }
        }
      });

      const problemLetters = problemPairs
        .map((pair) => ({
          pair,
          error_count: problemLetterStats[pair].errors,
          accuracy:
            problemLetterStats[pair].total > 0
              ? 1 -
                problemLetterStats[pair].errors / problemLetterStats[pair].total
              : 1,
        }))
        .filter((item) => item.error_count > 0);

      // Consistency Analysis - repeated errors
      const errorPatterns: { [key: string]: number } = {};
      allEvents
        .filter((event) => !event.isCorrect)
        .forEach((event) => {
          const pattern = `${event.correctAnswer}->${event.selectedAnswer}`;
          errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
        });

      const repeatedErrors = Object.values(errorPatterns).filter(
        (count) => count > 1
      ).length;
      const totalErrorTypes = Object.keys(errorPatterns).length;
      const consistency =
        totalErrorTypes > 0 ? repeatedErrors / totalErrorTypes : 0;

      return {
        correct_identification: correctIdentification,
        mirror_confusion: mirrorConfusions,
        rotation_confusion: rotationConfusions,
        comparison_time: avgComparisonTime,
        double_checking: doubleCheckingRatio,
        systematic_checking: systematicCheckingRatio,
        problem_letters: problemLetters,
        consistency,
        all_events: allEvents,
        game_duration: gameDuration,
        total_challenges: totalEvents,
        difficulty_progression: difficultyProgression,
      };
    }, [
      allEvents,
      difficultyProgression,
      isMirrorConfusion,
      isRotationConfusion,
      getProblemLetterPair,
    ]);

  // Metrics calculation using current ref values
  const calculateLetterReversalMetricsFromRefs =
    useCallback((): LetterReversalMetrics => {
      const { allEvents, difficultyProgression } = metricsDataRef.current;

      const gameDuration = GAME_DURATION * 1000;
      const totalEvents = allEvents.length;

      if (totalEvents === 0) {
        return {
          correct_identification: 0,
          mirror_confusion: 0,
          rotation_confusion: 0,
          comparison_time: 0,
          double_checking: 0,
          systematic_checking: 0,
          problem_letters: [],
          consistency: 0,
          all_events: [],
          game_duration: gameDuration,
          total_challenges: 0,
          difficulty_progression: [],
        };
      }

      // Accuracy Metrics
      const correctEvents = allEvents.filter((event) => event.isCorrect);
      const correctIdentification = correctEvents.length / totalEvents;

      const mirrorConfusions = allEvents.filter(
        (event) =>
          !event.isCorrect &&
          isMirrorConfusion(event.correctAnswer, event.selectedAnswer)
      ).length;

      const rotationConfusions = allEvents.filter(
        (event) =>
          !event.isCorrect &&
          isRotationConfusion(event.correctAnswer, event.selectedAnswer)
      ).length;

      // Processing Metrics
      const avgComparisonTime =
        allEvents.reduce((sum, event) => sum + event.totalComparisonTime, 0) /
        totalEvents;

      const doubleCheckingRatio =
        allEvents.filter((event) => event.doubleCheckCount > 0).length /
        totalEvents;

      const systematicCheckingRatio =
        allEvents.filter((event) => event.systematicCheck).length / totalEvents;

      // Problem Letters Analysis
      const problemLetterStats: {
        [key: string]: { errors: number; total: number };
      } = {};
      const problemPairs = ["b/d", "p/q", "n/u", "6/9"];

      problemPairs.forEach((pair) => {
        problemLetterStats[pair] = { errors: 0, total: 0 };
      });

      allEvents.forEach((event) => {
        const pair = getProblemLetterPair(
          event.correctAnswer,
          event.selectedAnswer
        );
        if (pair && problemLetterStats[pair]) {
          problemLetterStats[pair].total++;
          if (!event.isCorrect) {
            problemLetterStats[pair].errors++;
          }
        }
      });

      const problemLetters = problemPairs
        .map((pair) => ({
          pair,
          error_count: problemLetterStats[pair].errors,
          accuracy:
            problemLetterStats[pair].total > 0
              ? 1 -
                problemLetterStats[pair].errors / problemLetterStats[pair].total
              : 1,
        }))
        .filter((item) => item.error_count > 0);

      // Consistency Analysis
      const errorPatterns: { [key: string]: number } = {};
      allEvents
        .filter((event) => !event.isCorrect)
        .forEach((event) => {
          const pattern = `${event.correctAnswer}->${event.selectedAnswer}`;
          errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
        });

      const repeatedErrors = Object.values(errorPatterns).filter(
        (count) => count > 1
      ).length;
      const totalErrorTypes = Object.keys(errorPatterns).length;
      const consistency =
        totalErrorTypes > 0 ? repeatedErrors / totalErrorTypes : 0;

      return {
        correct_identification: correctIdentification,
        mirror_confusion: mirrorConfusions,
        rotation_confusion: rotationConfusions,
        comparison_time: avgComparisonTime,
        double_checking: doubleCheckingRatio,
        systematic_checking: systematicCheckingRatio,
        problem_letters: problemLetters,
        consistency,
        all_events: allEvents,
        game_duration: gameDuration,
        total_challenges: totalEvents,
        difficulty_progression: difficultyProgression,
      };
    }, [isMirrorConfusion, isRotationConfusion, getProblemLetterPair]);

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
    setOptionInteractions({});
    setDoubleCheckCount(0);

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
      setChallengeStartTime(Date.now());

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

      const now = Date.now();
      const responseTime = now - challengeStartTime;
      const gameTime = now - gameStartTime;

      setSelectedAnswer(answer);
      const correct = answer === currentChallenge.correctAnswer;
      setIsCorrect(correct);

      // Calculate metrics for this challenge
      const totalComparisonTime = Object.values(optionInteractions).reduce(
        (sum, time) => sum + time,
        0
      );
      const systematicCheck =
        currentChallenge.options.length <=
        Object.keys(optionInteractions).length;

      // Create challenge event for metrics
      const challengeEvent: LetterReversalEvent = {
        timestamp: now,
        challengeId: `${currentChallenge.prompt}-${currentChallenge.correctAnswer}`,
        challengeType: currentChallenge.type,
        prompt: currentChallenge.prompt,
        correctAnswer: currentChallenge.correctAnswer,
        selectedAnswer: answer,
        isCorrect: correct,
        responseTime,
        gameTime,
        difficultyLevel,
        optionViewTimes: currentChallenge.options.map(
          (option) => optionInteractions[option] || 0
        ),
        totalComparisonTime,
        doubleCheckCount,
        systematicCheck,
      };

      setAllEvents((prev) => [...prev, challengeEvent]);

      // Track difficulty progression
      if (totalChallenges > 0 && totalChallenges % 5 === 0) {
        const recentEvents = allEvents.slice(-5);
        const recentPerformance =
          recentEvents.length > 0
            ? recentEvents.filter((e) => e.isCorrect).length /
              recentEvents.length
            : 0;

        setDifficultyProgression((prev) => [
          ...prev,
          {
            time: gameTime,
            level: difficultyLevel,
            performance: recentPerformance,
          },
        ]);
      }

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
    [
      selectedAnswer,
      currentChallenge,
      timeLeft,
      startNewChallenge,
      challengeStartTime,
      gameStartTime,
      optionInteractions,
      doubleCheckCount,
      difficultyLevel,
      totalChallenges,
      allEvents,
    ]
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

          // Calculate comprehensive metrics and send to session API
          if (gameSession.isSessionActive) {
            try {
              const letterReversalMetrics =
                calculateLetterReversalMetricsFromRefs();
              const currentScore = scoreRef.current;
              const success = currentScore > 50; // Consider success if score > 50

              gameSession.endSession(
                success,
                currentScore,
                letterReversalMetrics
              );
            } catch (error) {
              console.error("Failed to save game session:", error);
            }
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    gameState,
    updateDifficulty,
    gameSession,
    calculateLetterReversalMetricsFromRefs,
  ]);

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

    // Initialize metrics tracking
    setAllEvents([]);
    const startTime = Date.now();
    setGameStartTime(startTime);
    setChallengeStartTime(0);
    setOptionInteractions({});
    setDoubleCheckCount(0);
    setDifficultyProgression([]);

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

    // Reset metrics tracking state
    setAllEvents([]);
    setGameStartTime(0);
    setChallengeStartTime(0);
    setOptionInteractions({});
    setDoubleCheckCount(0);
    setDifficultyProgression([]);
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
        >
          ← Back to Games
        </Button>

        {(gameState === "playing" || gameState === "feedback") && (
          <GameTimer
            timeLeft={timeLeft}
            totalTime={GAME_DURATION}
            className="flex-1 max-w-md mx-4"
          />
        )}

        {(gameState === "playing" || gameState === "feedback") && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border-2 border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{score}</div>
              <div className="text-sm text-purple-600">Score</div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Screen */}
      {gameState === "instructions" && (
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-4 border-purple-300">
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
              className="text-8xl mb-6"
            >
              🐼
            </motion.div>

            <h1 className="text-4xl font-bold text-purple-700 mb-4">
              Letter Reversal Spotter
            </h1>

            <p className="text-xl text-purple-600 mb-6">
              Help Panda find the right letters and words! 🔊 Listen for voice
              cues!
            </p>

            <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-lg font-bold text-purple-700 mb-4">
                How to Play:
              </h3>
              <div className="space-y-3 text-purple-600">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔊</span>
                  <div>
                    <strong>Listen:</strong> Voice will tell you what to find
                    (e.g., "Tap the letter F")
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <strong>Difficulty:</strong> Gets harder every 15 seconds -
                    letters → words → mirrored letters
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <strong>Scoring:</strong> Harder challenges give more
                    points!
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <strong>Time Limit:</strong> 60 seconds of non-stop
                    challenges!
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              🚀 Start Playing!
            </Button>
          </div>
        </motion.div>
      )}

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
            {/* Difficulty Indicator */}
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-3 mb-4 inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={difficultyLevel}
            >
              <div className="font-bold">
                Level {difficultyLevel}: {getDifficultyLabel(difficultyLevel)}
              </div>
            </motion.div>

            {/* Challenge Prompt */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200 mb-8"
              key={currentChallenge.prompt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-6xl mb-4">🐼</div>
              <h2 className="text-3xl font-bold text-purple-700 mb-2">
                {currentChallenge.prompt}
              </h2>
              <div className="text-lg text-purple-600">
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

            {/* Feedback Message */}
            {gameState === "feedback" && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={`text-2xl font-bold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect
                    ? "🎉 Correct! Great job!"
                    : "😅 Oops! Try again next time!"}
                </div>
                {!isCorrect && (
                  <div className="text-lg text-purple-600 mt-2">
                    The correct answer was:{" "}
                    <strong>{currentChallenge.correctAnswer}</strong>
                  </div>
                )}
                <div className="text-sm text-purple-500 mt-2">
                  +{currentChallenge.difficulty * 10} points for this difficulty
                  level!
                </div>
              </motion.div>
            )}
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
