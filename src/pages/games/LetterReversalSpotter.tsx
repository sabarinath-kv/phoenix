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

// Metrics tracking interfaces
interface OptionViewEvent {
  timestamp: number;
  challengeId: string;
  optionIndex: number;
  option: string;
  duration: number;
  challengeType: string;
}

interface ClickEvent {
  timestamp: number;
  challengeId: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  challengeType: string;
  timeFromStart: number; // Time from challenge start to click
  optionsViewed: number; // How many options were viewed before clicking
}

interface ChallengeMetrics {
  challengeId: string;
  challengeType: string;
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
  comparisonTime: number; // Total time studying options
  optionsViewed: OptionViewEvent[];
  systematicChecking: boolean; // Checked all options before selecting
  doubleChecking: boolean; // Looked back at original after viewing options
}

interface LetterReversalSpotterMetrics {
  // Accuracy Metrics
  correct_identification: number;
  mirror_confusion: number; // Selected mirrored version
  rotation_confusion: number; // Selected rotated version

  // Processing Metrics
  comparison_time: number; // Average time studying options
  double_checking: number; // Times looked back at original
  systematic_checking: number; // Times checked all options before selecting

  // Specific Letter Issues
  problem_letters: Array<{
    pair: string;
    errors: number;
    total_attempts: number;
  }>;
  consistency: number; // Same error repeated

  // Raw data for detailed analysis
  all_clicks: ClickEvent[];
  option_views: OptionViewEvent[];
  challenge_metrics: ChallengeMetrics[];
  game_duration: number;
  total_challenges: number;
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

  // Metrics tracking state
  const [allClicks, setAllClicks] = useState<ClickEvent[]>([]);
  const [optionViews, setOptionViews] = useState<OptionViewEvent[]>([]);
  const [challengeMetrics, setChallengeMetrics] = useState<ChallengeMetrics[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0);
  const [currentChallengeId, setCurrentChallengeId] = useState<string>("");
  const [viewedOptions, setViewedOptions] = useState<Set<number>>(new Set());
  const [optionHoverTimes, setOptionHoverTimes] = useState<Map<number, number>>(new Map());

  // Refs for metrics data
  const metricsDataRef = useRef({
    allClicks: [] as ClickEvent[],
    optionViews: [] as OptionViewEvent[],
    challengeMetrics: [] as ChallengeMetrics[],
  });

  // Helper functions for confusion detection
  const isMirrorConfusion = useCallback((correct: string, selected: string): boolean => {
    const mirrorPairs: Record<string, string> = {
      'b': 'd', 'd': 'b', 'p': 'q', 'q': 'p',
      'R': 'Я', 'Я': 'R', 'N': 'И', 'И': 'N',
      'E': 'Ǝ', 'Ǝ': 'E', 'F': 'ᖴ', 'ᖴ': 'F',
      'G': 'Ɔ', 'Ɔ': 'G', 'J': 'ſ', 'ſ': 'J',
      'L': '⅃', '⅃': 'L', 'S': 'Ƨ', 'Ƨ': 'S'
    };
    return mirrorPairs[correct] === selected;
  }, []);

  const isRotationConfusion = useCallback((correct: string, selected: string): boolean => {
    const rotationPairs: Record<string, string[]> = {
      '6': ['9'], '9': ['6'],
      'n': ['u'], 'u': ['n'],
      'w': ['m'], 'm': ['w']
    };
    return rotationPairs[correct]?.includes(selected) || false;
  }, []);

  const getLetterPairKey = useCallback((correct: string, selected: string): string => {
    const pairs = [
      ['b', 'd'], ['p', 'q'], ['n', 'u'], ['6', '9'],
      ['was', 'saw'], ['dog', 'god'], ['top', 'pot']
    ];
    
    for (const pair of pairs) {
      if ((pair[0] === correct && pair[1] === selected) || 
          (pair[1] === correct && pair[0] === selected)) {
        return pair.sort().join('/');
      }
    }
    return `${correct}/${selected}`;
  }, []);

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

    // Reset metrics tracking for new challenge
    setViewedOptions(new Set());
    setOptionHoverTimes(new Map());

    // Small delay to ensure clean state transition
    setTimeout(() => {
      const challenge = generateChallenge();
      const challengeId = `${challenge.prompt}-${challenge.correctAnswer}-${Date.now()}`;
      
      setCurrentChallenge(challenge);
      setCurrentChallengeId(challengeId);
      setChallengeStartTime(Date.now());
      
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

      const currentTime = Date.now();
      const timeFromStart = currentTime - challengeStartTime;
      const correct = answer === currentChallenge.correctAnswer;

      // Track click event for metrics
      const clickEvent: ClickEvent = {
        timestamp: currentTime,
        challengeId: currentChallengeId,
        selectedOption: answer,
        correctAnswer: currentChallenge.correctAnswer,
        isCorrect: correct,
        challengeType: currentChallenge.type,
        timeFromStart,
        optionsViewed: viewedOptions.size,
      };
      setAllClicks((prev) => [...prev, clickEvent]);

      // Calculate challenge metrics
      const comparisonTime = timeFromStart;
      const systematicChecking = viewedOptions.size === currentChallenge.options.length;
      const doubleChecking = viewedOptions.size > currentChallenge.options.length; // Viewed some options multiple times

      const challengeMetric: ChallengeMetrics = {
        challengeId: currentChallengeId,
        challengeType: currentChallenge.type,
        correctAnswer: currentChallenge.correctAnswer,
        selectedAnswer: answer,
        isCorrect: correct,
        comparisonTime,
        optionsViewed: optionViews.filter(view => view.challengeId === currentChallengeId),
        systematicChecking,
        doubleChecking,
      };
      setChallengeMetrics((prev) => [...prev, challengeMetric]);

      setSelectedAnswer(answer);
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
    [
      selectedAnswer,
      currentChallenge,
      timeLeft,
      startNewChallenge,
      challengeStartTime,
      currentChallengeId,
      viewedOptions,
      optionViews,
    ]
  );

  // Calculate comprehensive metrics
  const calculateMetricsFromRefs = useCallback((): LetterReversalSpotterMetrics => {
    const { allClicks, optionViews, challengeMetrics } = metricsDataRef.current;

    // Accuracy Metrics
    const correctIdentification = allClicks.filter(click => click.isCorrect).length;
    const mirrorConfusion = allClicks.filter(click => 
      !click.isCorrect && isMirrorConfusion(click.correctAnswer, click.selectedOption)
    ).length;
    const rotationConfusion = allClicks.filter(click => 
      !click.isCorrect && isRotationConfusion(click.correctAnswer, click.selectedOption)
    ).length;

    // Processing Metrics
    const comparisonTimes = challengeMetrics.map(c => c.comparisonTime);
    const avgComparisonTime = comparisonTimes.length > 0 
      ? comparisonTimes.reduce((a, b) => a + b, 0) / comparisonTimes.length 
      : 0;
    
    const doubleCheckingCount = challengeMetrics.filter(c => c.doubleChecking).length;
    const systematicCheckingCount = challengeMetrics.filter(c => c.systematicChecking).length;

    // Problem Letters Analysis
    const letterPairErrors = new Map<string, { errors: number; total: number }>();
    
    allClicks.forEach(click => {
      const pairKey = getLetterPairKey(click.correctAnswer, click.selectedOption);
      const current = letterPairErrors.get(pairKey) || { errors: 0, total: 0 };
      current.total++;
      if (!click.isCorrect) {
        current.errors++;
      }
      letterPairErrors.set(pairKey, current);
    });

    const problemLetters = Array.from(letterPairErrors.entries()).map(([pair, stats]) => ({
      pair,
      errors: stats.errors,
      total_attempts: stats.total,
    }));

    // Consistency Analysis - same error repeated
    const errorPatterns = new Map<string, number>();
    allClicks.filter(click => !click.isCorrect).forEach(click => {
      const pattern = `${click.correctAnswer}->${click.selectedOption}`;
      errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1);
    });
    
    const consistencyErrors = Array.from(errorPatterns.values()).filter(count => count > 1).length;

    const gameDuration = gameStartTime > 0 ? Date.now() - gameStartTime : 0;

    return {
      correct_identification: correctIdentification,
      mirror_confusion: mirrorConfusion,
      rotation_confusion: rotationConfusion,
      comparison_time: avgComparisonTime,
      double_checking: doubleCheckingCount,
      systematic_checking: systematicCheckingCount,
      problem_letters: problemLetters,
      consistency: consistencyErrors,
      all_clicks: allClicks,
      option_views: optionViews,
      challenge_metrics: challengeMetrics,
      game_duration: gameDuration,
      total_challenges: allClicks.length,
    };
  }, [isMirrorConfusion, isRotationConfusion, getLetterPairKey, gameStartTime]);

  // Keep refs in sync with state for accurate metrics calculation
  useEffect(() => {
    metricsDataRef.current.allClicks = allClicks;
  }, [allClicks]);

  useEffect(() => {
    metricsDataRef.current.optionViews = optionViews;
  }, [optionViews]);

  useEffect(() => {
    metricsDataRef.current.challengeMetrics = challengeMetrics;
  }, [challengeMetrics]);

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
          // Calculate and send metrics
          if (gameSession.isSessionActive) {
            const metrics = calculateMetricsFromRefs();
            gameSession
              .endSession(true, score, metrics)
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

    // Initialize metrics tracking
    const startTime = Date.now();
    setGameStartTime(startTime);
    setAllClicks([]);
    setOptionViews([]);
    setChallengeMetrics([]);
    setViewedOptions(new Set());
    setOptionHoverTimes(new Map());
    setCurrentChallengeId("");

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

    // Reset metrics
    setGameStartTime(0);
    setAllClicks([]);
    setOptionViews([]);
    setChallengeMetrics([]);
    setViewedOptions(new Set());
    setOptionHoverTimes(new Map());
    setCurrentChallengeId("");
    setChallengeStartTime(0);
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
      <header
        className="bg-white/90 backdrop-blur-sm border border-white/40 relative mb-6"
        style={{ height: "100px" }}
      >
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
            subtext:
              "Voice will tell you what to find (e.g., 'Tap the letter F')",
          },
          {
            icon: "📈",
            text: "Difficulty!",
            subtext:
              "Gets harder every 15 seconds - letters → words → mirrored letters",
          },
          {
            icon: "🎯",
            text: "Scoring!",
            subtext: "Harder challenges give more points!",
          },
          {
            icon: "⏰",
            text: "Time Limit!",
            subtext: "60 seconds of non-stop challenges!",
          },
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
                    <div
                      onMouseEnter={() => {
                        if (gameState === "playing" && challengeStartTime > 0) {
                          setOptionHoverTimes(prev => new Map(prev).set(index, Date.now()));
                          setViewedOptions(prev => new Set(prev).add(index));
                        }
                      }}
                      onMouseLeave={() => {
                        if (gameState === "playing" && challengeStartTime > 0) {
                          const hoverStartTime = optionHoverTimes.get(index);
                          if (hoverStartTime) {
                            const currentTime = Date.now();
                            const duration = currentTime - hoverStartTime;
                            const viewEvent: OptionViewEvent = {
                              timestamp: currentTime,
                              challengeId: currentChallengeId,
                              optionIndex: index,
                              option: option,
                              duration,
                              challengeType: currentChallenge.type,
                            };
                            setOptionViews(prev => [...prev, viewEvent]);
                            setOptionHoverTimes(prev => {
                              const newMap = new Map(prev);
                              newMap.delete(index);
                              return newMap;
                            });
                          }
                        }
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
                    </div>
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
