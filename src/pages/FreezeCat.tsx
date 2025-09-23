import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import GameControls from "@/components/ui/GameControls";
import { CommonInstructionsModal } from "@/components/CommonInstructionsModal";
import { useGameRedirect } from "@/hooks/useGameRedirect";
import { useGameSession } from "@/hooks/useGameSession";
import { FREEZE_CAT, ANIMALS } from "@/constants/game";

type GameState = "instructions" | "countdown" | "playing" | "completed";

interface GridAnimal {
  id: number;
  animal: string;
  position: number; // 0-8 for 3x3 grid
  isCat: boolean;
  isVisible: boolean;
  showTime: number;
  spawnTime?: number; // When animal was spawned for timing analysis
}

// Enhanced metrics tracking interfaces
interface TapEvent {
  timestamp: number;
  animalId: number;
  animal: string;
  position: number;
  isCat: boolean;
  responseTime: number; // Time from spawn to tap
  gameTime: number;
  isCorrect: boolean;
  appearanceDuration: number; // How long animal was visible before tap
}

interface AnimalAppearance {
  animalId: number;
  animal: string;
  position: number;
  isCat: boolean;
  spawnTime: number;
  hideTime?: number;
  wasTapped: boolean;
  tapTime?: number;
  responseTime?: number;
  gameTime: number;
}

interface FreezeCatMetrics {
  // Core Inhibition
  false_alarms: number; // Clicked on cats
  correct_rejections: number; // Not clicking cats
  response_time: number; // Average time to click non-cats

  // Pattern Recognition
  learning_curve: number; // 0-1 score for error reduction over time
  position_memory: number; // 0-1 score for remembering cat positions

  // Cognitive Load
  accuracy_vs_speed: {
    fast_appearances: number; // Accuracy when animals appear/disappear quickly
    slow_appearances: number; // Accuracy when more time to think
  };

  // Raw data for analysis
  all_taps: TapEvent[];
  all_appearances: AnimalAppearance[];
  game_duration: number;
  total_animals_spawned: number;
  position_error_patterns: number[]; // Error count per position (0-8)
  temporal_accuracy: Array<{ time: number; accuracy: number }>; // Accuracy over time
}

interface GameStats {
  score: number;
  correctTaps: number;
  incorrectTaps: number;
  totalTaps: number;
}

export const FreezeCat = () => {
  const navigate = useNavigate();
  const gameRedirect = useGameRedirect("freeze-cat");
  const gameSession = useGameSession(5); // gameId 5 for freeze-cat
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [countdown, setCountdown] = useState<number>(
    FREEZE_CAT.COUNTDOWN_DURATION
  );
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(
    FREEZE_CAT.GAME_DURATION
  );
  // Removed difficulty level - keeping game simple
  const [currentAnimals, setCurrentAnimals] = useState<GridAnimal[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctTaps: 0,
    incorrectTaps: 0,
    totalTaps: 0,
  });

  // Enhanced metrics tracking state
  const [allTaps, setAllTaps] = useState<TapEvent[]>([]);
  const [allAppearances, setAllAppearances] = useState<AnimalAppearance[]>([]);
  const [totalAnimalsSpawned, setTotalAnimalsSpawned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [positionErrorPatterns, setPositionErrorPatterns] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [temporalAccuracy, setTemporalAccuracy] = useState<
    Array<{ time: number; accuracy: number }>
  >([]);

  // Refs for cleanup
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const animalSpawnTimerRef = useRef<NodeJS.Timeout>();
  const animalIdCounter = useRef(0);

  // Refs to store current metrics data for accurate calculation
  const metricsDataRef = useRef({
    allTaps: [] as TapEvent[],
    allAppearances: [] as AnimalAppearance[],
    totalAnimalsSpawned: 0,
    positionErrorPatterns: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    temporalAccuracy: [] as Array<{ time: number; accuracy: number }>,
  });

  // Ref to store current score for accurate session data
  const scoreRef = useRef(0);

  // Keep refs in sync with state for accurate metrics calculation
  useEffect(() => {
    metricsDataRef.current.allTaps = allTaps;
  }, [allTaps]);

  useEffect(() => {
    metricsDataRef.current.allAppearances = allAppearances;
  }, [allAppearances]);

  useEffect(() => {
    metricsDataRef.current.totalAnimalsSpawned = totalAnimalsSpawned;
  }, [totalAnimalsSpawned]);

  useEffect(() => {
    metricsDataRef.current.positionErrorPatterns = positionErrorPatterns;
  }, [positionErrorPatterns]);

  useEffect(() => {
    metricsDataRef.current.temporalAccuracy = temporalAccuracy;
  }, [temporalAccuracy]);

  useEffect(() => {
    scoreRef.current = stats.score;
  }, [stats.score]);

  // Simple fixed interval for animal spawning
  const getCurrentAppearInterval = useCallback(() => {
    return FREEZE_CAT.INITIAL_APPEAR_INTERVAL;
  }, []);

  // TODO: Add confetti animation when winning
  // TODO: Add sound effects integration with better audio management

  // Audio feedback functions
  const playCorrectSound = useCallback(() => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  const playWrongSound = useCallback(() => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
    oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.1); // G3

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.4
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  }, []);

  // Get random animal (not cat)
  const getRandomAnimal = useCallback(() => {
    return ANIMALS.OTHERS[Math.floor(Math.random() * ANIMALS.OTHERS.length)];
  }, []);

  // Removed getRandomPosition - now using shuffled positions for spawning

  // Spawn new animals (1-3 at a time, cats are majority)
  const spawnAnimals = useCallback(() => {
    if (gameState !== "playing") return;

    setCurrentAnimals((prev) => {
      // Remove animals that have been visible for too long
      const now = Date.now();
      const activeAnimals = prev.filter(
        (animal) => now - animal.showTime < FREEZE_CAT.ANIMAL_DISPLAY_TIME
      );

      // Track animals that disappeared without being tapped
      prev.forEach((animal) => {
        if (now - animal.showTime >= FREEZE_CAT.ANIMAL_DISPLAY_TIME) {
          setAllAppearances((prevAppearances) =>
            prevAppearances.map((appearance) =>
              appearance.animalId === animal.id && !appearance.hideTime
                ? { ...appearance, hideTime: now }
                : appearance
            )
          );
        }
      });

      // Clear all animals and spawn new batch
      const newAnimals: GridAnimal[] = [];

      // Randomly decide how many animals to spawn (1, 2, or 3)
      const numToSpawn = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

      // Get available positions (all 9 positions)
      const allPositions = Array.from({ length: 9 }, (_, i) => i);
      const shuffledPositions = allPositions.sort(() => Math.random() - 0.5);

      for (let i = 0; i < numToSpawn; i++) {
        // Cats are majority - 70% chance for cat, 30% for other animals
        const shouldSpawnCat = Math.random() < 0.7;

        const newAnimal: GridAnimal = {
          id: animalIdCounter.current++,
          animal: shouldSpawnCat ? ANIMALS.CAT : getRandomAnimal(),
          position: shuffledPositions[i],
          isCat: shouldSpawnCat,
          isVisible: true,
          showTime: now,
          spawnTime: now,
        };

        newAnimals.push(newAnimal);

        // Track animal appearance for metrics
        const gameTime = now - gameStartTime;
        const appearance: AnimalAppearance = {
          animalId: newAnimal.id,
          animal: newAnimal.animal,
          position: newAnimal.position,
          isCat: newAnimal.isCat,
          spawnTime: now,
          wasTapped: false,
          gameTime,
        };

        setAllAppearances((prev) => [...prev, appearance]);
        setTotalAnimalsSpawned((prev) => prev + 1);
      }

      return newAnimals;
    });

    // Schedule next spawn only if game is still playing
    if (gameState === "playing") {
      const nextSpawnTime = getCurrentAppearInterval();
      animalSpawnTimerRef.current = setTimeout(spawnAnimals, nextSpawnTime);
    }
  }, [gameState, getCurrentAppearInterval, getRandomAnimal, gameStartTime]);

  // Handle animal tap
  const handleAnimalTap = useCallback(
    (animal: GridAnimal) => {
      if (gameState !== "playing") return;

      const now = Date.now();
      const gameTime = now - gameStartTime;
      const responseTime = animal.spawnTime ? now - animal.spawnTime : 0;
      const appearanceDuration = animal.spawnTime ? now - animal.spawnTime : 0;
      const isCorrect = !animal.isCat; // Correct if not a cat

      // Record tap event for metrics
      const tapEvent: TapEvent = {
        timestamp: now,
        animalId: animal.id,
        animal: animal.animal,
        position: animal.position,
        isCat: animal.isCat,
        responseTime,
        gameTime,
        isCorrect,
        appearanceDuration,
      };

      setAllTaps((prev) => [...prev, tapEvent]);

      // Update appearance tracking
      setAllAppearances((prev) =>
        prev.map((appearance) =>
          appearance.animalId === animal.id
            ? {
                ...appearance,
                wasTapped: true,
                tapTime: now,
                responseTime,
              }
            : appearance
        )
      );

      // Track position error patterns (for pattern recognition)
      if (!isCorrect) {
        setPositionErrorPatterns((prev) => {
          const newPatterns = [...prev];
          newPatterns[animal.position]++;
          return newPatterns;
        });
      }

      // Update temporal accuracy tracking (every 5 seconds)
      const timeSegment = Math.floor(gameTime / 5000); // 5-second segments
      setTemporalAccuracy((prev) => {
        const existing = prev.find(
          (ta) => Math.floor(ta.time / 5000) === timeSegment
        );
        if (existing) {
          // Update existing segment accuracy
          const segmentTaps =
            allTaps.filter(
              (tap) => Math.floor(tap.gameTime / 5000) === timeSegment
            ).length + 1; // +1 for current tap
          const segmentCorrect =
            allTaps.filter(
              (tap) =>
                Math.floor(tap.gameTime / 5000) === timeSegment && tap.isCorrect
            ).length + (isCorrect ? 1 : 0);
          existing.accuracy = segmentCorrect / segmentTaps;
        } else {
          prev.push({ time: gameTime, accuracy: isCorrect ? 1 : 0 });
        }
        return [...prev];
      });

      // Simple score calculation - no complex difficulty logic
      setStats((prev) => {
        const newStats = { ...prev };
        newStats.totalTaps++;

        if (animal.isCat) {
          // Tapped a cat - penalty!
          newStats.score = Math.max(0, prev.score - FREEZE_CAT.SCORE_PENALTY);
          newStats.incorrectTaps++;
          playWrongSound();
        } else {
          // Tapped a good animal - reward!
          newStats.score = prev.score + FREEZE_CAT.SCORE_INCREMENT;
          newStats.correctTaps++;
          playCorrectSound();
        }

        return newStats;
      });

      // Remove the tapped animal
      setCurrentAnimals((prev) => prev.filter((a) => a.id !== animal.id));
    },
    [gameState, playCorrectSound, playWrongSound, gameStartTime, allTaps]
  );

  // Start countdown
  const startCountdown = useCallback(() => {
    setGameState("countdown");
    setCountdown(FREEZE_CAT.COUNTDOWN_DURATION);

    // Clear any existing countdown timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          countdownTimerRef.current = undefined;
          setTimeout(() => {
            setGameState("playing");
            gameSession.startSession(); // Start tracking the game session
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    countdownTimerRef.current = countdownInterval;
  }, [gameSession]);

  // Comprehensive metrics calculation function
  const calculateFreezeCatMetrics = useCallback((): FreezeCatMetrics => {
    const gameDuration = FREEZE_CAT.GAME_DURATION;
    const totalTaps = allTaps.length;
    const catTaps = allTaps.filter((tap) => tap.isCat).length;
    const nonCatTaps = allTaps.filter((tap) => !tap.isCat).length;

    // Core Inhibition Metrics
    const falseAlarms = catTaps; // Clicked on cats (should not click)
    const catsAppeared = allAppearances.filter((app) => app.isCat).length;
    const catsNotTapped = allAppearances.filter(
      (app) => app.isCat && !app.wasTapped
    ).length;
    const correctRejections = catsNotTapped; // Not clicking cats (correct inhibition)

    // Average response time for non-cats only
    const nonCatResponseTimes = allTaps
      .filter((tap) => !tap.isCat)
      .map((tap) => tap.responseTime);
    const avgResponseTime =
      nonCatResponseTimes.length > 0
        ? nonCatResponseTimes.reduce((sum, time) => sum + time, 0) /
          nonCatResponseTimes.length
        : 0;

    // Pattern Recognition Metrics
    // Learning curve - errors should decrease over time
    let learningCurve = 0;
    if (temporalAccuracy.length >= 2) {
      const firstHalf = temporalAccuracy.slice(
        0,
        Math.ceil(temporalAccuracy.length / 2)
      );
      const secondHalf = temporalAccuracy.slice(
        Math.floor(temporalAccuracy.length / 2)
      );

      const firstHalfAccuracy =
        firstHalf.reduce((sum, ta) => sum + ta.accuracy, 0) / firstHalf.length;
      const secondHalfAccuracy =
        secondHalf.reduce((sum, ta) => sum + ta.accuracy, 0) /
        secondHalf.length;

      learningCurve = Math.max(0, secondHalfAccuracy - firstHalfAccuracy); // 0-1 improvement
    }

    // Position memory - lower error variance across positions indicates better memory
    let positionMemory = 1;
    if (positionErrorPatterns.some((errors) => errors > 0)) {
      const totalErrors = positionErrorPatterns.reduce(
        (sum, errors) => sum + errors,
        0
      );
      const avgErrorsPerPosition = totalErrors / 9;
      const variance =
        positionErrorPatterns.reduce(
          (sum, errors) => sum + Math.pow(errors - avgErrorsPerPosition, 2),
          0
        ) / 9;
      const maxPossibleVariance = Math.pow(totalErrors, 2) / 9; // If all errors in one position
      positionMemory =
        maxPossibleVariance > 0 ? 1 - variance / maxPossibleVariance : 1;
    }

    // Cognitive Load - Accuracy vs Speed
    const fastThreshold = 1000; // 1 second - considered "fast" appearance
    const slowThreshold = 3000; // 3 seconds - considered "slow" appearance

    const fastAppearanceTaps = allTaps.filter(
      (tap) => tap.appearanceDuration <= fastThreshold
    );
    const slowAppearanceTaps = allTaps.filter(
      (tap) => tap.appearanceDuration >= slowThreshold
    );

    const fastAccuracy =
      fastAppearanceTaps.length > 0
        ? fastAppearanceTaps.filter((tap) => tap.isCorrect).length /
          fastAppearanceTaps.length
        : 0;

    const slowAccuracy =
      slowAppearanceTaps.length > 0
        ? slowAppearanceTaps.filter((tap) => tap.isCorrect).length /
          slowAppearanceTaps.length
        : 0;

    return {
      false_alarms: falseAlarms,
      correct_rejections: correctRejections,
      response_time: avgResponseTime,
      learning_curve: learningCurve,
      position_memory: positionMemory,
      accuracy_vs_speed: {
        fast_appearances: fastAccuracy,
        slow_appearances: slowAccuracy,
      },
      all_taps: allTaps,
      all_appearances: allAppearances,
      game_duration: gameDuration,
      total_animals_spawned: totalAnimalsSpawned,
      position_error_patterns: positionErrorPatterns,
      temporal_accuracy: temporalAccuracy,
    };
  }, [
    allTaps,
    allAppearances,
    totalAnimalsSpawned,
    positionErrorPatterns,
    temporalAccuracy,
  ]);

  // Metrics calculation using current ref values
  const calculateFreezeCatMetricsFromRefs =
    useCallback((): FreezeCatMetrics => {
      const {
        allTaps,
        allAppearances,
        totalAnimalsSpawned,
        positionErrorPatterns,
        temporalAccuracy,
      } = metricsDataRef.current;

      const gameDuration = FREEZE_CAT.GAME_DURATION;
      const totalTaps = allTaps.length;
      const catTaps = allTaps.filter((tap) => tap.isCat).length;

      // Core Inhibition Metrics
      const falseAlarms = catTaps; // Clicked on cats (should not click)
      const catsAppeared = allAppearances.filter((app) => app.isCat).length;
      const catsNotTapped = allAppearances.filter(
        (app) => app.isCat && !app.wasTapped
      ).length;
      const correctRejections = catsNotTapped; // Not clicking cats (correct inhibition)

      // Average response time for non-cats only
      const nonCatResponseTimes = allTaps
        .filter((tap) => !tap.isCat)
        .map((tap) => tap.responseTime);
      const avgResponseTime =
        nonCatResponseTimes.length > 0
          ? nonCatResponseTimes.reduce((sum, time) => sum + time, 0) /
            nonCatResponseTimes.length
          : 0;

      // Pattern Recognition Metrics
      let learningCurve = 0;
      if (temporalAccuracy.length >= 2) {
        const firstHalf = temporalAccuracy.slice(
          0,
          Math.ceil(temporalAccuracy.length / 2)
        );
        const secondHalf = temporalAccuracy.slice(
          Math.floor(temporalAccuracy.length / 2)
        );

        const firstHalfAccuracy =
          firstHalf.reduce((sum, ta) => sum + ta.accuracy, 0) /
          firstHalf.length;
        const secondHalfAccuracy =
          secondHalf.reduce((sum, ta) => sum + ta.accuracy, 0) /
          secondHalf.length;

        learningCurve = Math.max(0, secondHalfAccuracy - firstHalfAccuracy);
      }

      // Position memory
      let positionMemory = 1;
      if (positionErrorPatterns.some((errors) => errors > 0)) {
        const totalErrors = positionErrorPatterns.reduce(
          (sum, errors) => sum + errors,
          0
        );
        const avgErrorsPerPosition = totalErrors / 9;
        const variance =
          positionErrorPatterns.reduce(
            (sum, errors) => sum + Math.pow(errors - avgErrorsPerPosition, 2),
            0
          ) / 9;
        const maxPossibleVariance = Math.pow(totalErrors, 2) / 9;
        positionMemory =
          maxPossibleVariance > 0 ? 1 - variance / maxPossibleVariance : 1;
      }

      // Cognitive Load - Accuracy vs Speed
      const fastThreshold = 1000;
      const slowThreshold = 3000;

      const fastAppearanceTaps = allTaps.filter(
        (tap) => tap.appearanceDuration <= fastThreshold
      );
      const slowAppearanceTaps = allTaps.filter(
        (tap) => tap.appearanceDuration >= slowThreshold
      );

      const fastAccuracy =
        fastAppearanceTaps.length > 0
          ? fastAppearanceTaps.filter((tap) => tap.isCorrect).length /
            fastAppearanceTaps.length
          : 0;

      const slowAccuracy =
        slowAppearanceTaps.length > 0
          ? slowAppearanceTaps.filter((tap) => tap.isCorrect).length /
            slowAppearanceTaps.length
          : 0;

      return {
        false_alarms: falseAlarms,
        correct_rejections: correctRejections,
        response_time: avgResponseTime,
        learning_curve: learningCurve,
        position_memory: positionMemory,
        accuracy_vs_speed: {
          fast_appearances: fastAccuracy,
          slow_appearances: slowAccuracy,
        },
        all_taps: allTaps,
        all_appearances: allAppearances,
        game_duration: gameDuration,
        total_animals_spawned: totalAnimalsSpawned,
        position_error_patterns: positionErrorPatterns,
        temporal_accuracy: temporalAccuracy,
      };
    }, []);

  // End game
  const endGame = useCallback(async () => {
    // Prevent multiple calls
    if (gameState === "completed") return;

    setGameState("completed");

    // Clear all timers
    if (animalSpawnTimerRef.current) {
      clearTimeout(animalSpawnTimerRef.current);
      animalSpawnTimerRef.current = undefined;
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = undefined;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }

    // Calculate comprehensive metrics and send to session API
    if (gameSession.isSessionActive) {
      try {
        const freezeCatMetrics = calculateFreezeCatMetricsFromRefs();
        const currentScore = scoreRef.current;
        const success = currentScore > 50; // Consider success if score > 50

        await gameSession.endSession(success, currentScore, freezeCatMetrics);
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    }
  }, [gameState, gameSession, calculateFreezeCatMetricsFromRefs]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState("instructions");
    setStats({
      score: 0,
      correctTaps: 0,
      incorrectTaps: 0,
      totalTaps: 0,
    });
    setCurrentAnimals([]);
    setGameTimeLeft(FREEZE_CAT.GAME_DURATION);

    // Reset enhanced metrics tracking state
    setAllTaps([]);
    setAllAppearances([]);
    setTotalAnimalsSpawned(0);
    setGameStartTime(0);
    setPositionErrorPatterns([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setTemporalAccuracy([]);

    // Clear all timers
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = undefined;
    }
    if (animalSpawnTimerRef.current) {
      clearTimeout(animalSpawnTimerRef.current);
      animalSpawnTimerRef.current = undefined;
    }
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameState === "playing") {
      // Reset game state
      setStats({
        score: 0,
        correctTaps: 0,
        incorrectTaps: 0,
        totalTaps: 0,
      });
      setCurrentAnimals([]);
      setGameTimeLeft(FREEZE_CAT.GAME_DURATION);

      // Initialize enhanced metrics tracking
      setAllTaps([]);
      setAllAppearances([]);
      setTotalAnimalsSpawned(0);
      setPositionErrorPatterns([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      setTemporalAccuracy([]);
      const startTime = Date.now();
      setGameStartTime(startTime);

      // Clear any existing spawn timer
      if (animalSpawnTimerRef.current) {
        clearTimeout(animalSpawnTimerRef.current);
      }

      // Start spawning animals
      setTimeout(spawnAnimals, 500);

      // Clear any existing game timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }

      // Start game timer
      const gameTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, FREEZE_CAT.GAME_DURATION - elapsed);
        setGameTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(gameTimer);
          gameTimerRef.current = undefined;
          endGame();
        }
      }, 100);

      gameTimerRef.current = gameTimer;
    }
  }, [gameState]); // Removed problematic dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = undefined;
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = undefined;
      }
      if (animalSpawnTimerRef.current) {
        clearTimeout(animalSpawnTimerRef.current);
        animalSpawnTimerRef.current = undefined;
      }
    };
  }, []);

  return (
    <>
      {/* Instructions Modal */}
      <CommonInstructionsModal
        isOpen={gameState === "instructions"}
        title="Freeze Cat"
        subtitle="Tap the animals, but don't tap the cats! Watch out - there are many cats!"
        instructions={[
          {
            icon: "🐶",
            text: "Tap Animals!",
            subtext: "Tap dogs, rabbits, and other animals for points",
          },
          {
            icon: "🐱",
            text: "Stay Frozen!",
            subtext:
              "Don't tap the cats or you'll lose points - there are many!",
          },
          {
            icon: "⏱️",
            text: "Quick Thinking!",
            subtext: "You have 20 seconds to score as much as possible",
          },
        ]}
        onStartGame={startCountdown}
        buttonText="LET'S START"
      />

      {/* Countdown Screen */}
      {/* Countdown Screen */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
          <div className="text-center">
            <div className="text-8xl font-bold text-orange-600 animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl text-orange-700 mt-4">Get Ready!</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Header */}
        <header
          className="bg-white/90 backdrop-blur-sm border border-white/40 relative z-30"
          style={{ height: "100px" }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Freeze Cat
              </h1>
            </div>
          </div>
          {/* Back Button */}
          <BackButton onClick={() => navigate("/")} />
        </header>

        {/* Game Controls */}
        {(gameState === "playing" || gameState === "completed") && (
          <GameControls score={stats.score} timeLeft={gameTimeLeft} />
        )}

        {/* Game Grid - Landscape Optimized */}
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl w-full aspect-square">
            {Array.from({ length: 9 }, (_, index) => {
              const animal = currentAnimals.find(
                (a) => a.position === index && a.isVisible
              );

              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-2xl border-4 border-dashed border-orange-300 
                    bg-white/50 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl md:text-6xl
                    transition-all duration-200 cursor-pointer
                    ${
                      animal
                        ? "bg-white/80 border-solid scale-105 shadow-lg"
                        : "hover:bg-white/60"
                    }
                    ${animal ? "border-orange-400 bg-orange-50/80" : ""}
                  `}
                  onClick={() => animal && handleAnimalTap(animal)}
                >
                  {animal?.animal}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results Screen */}
        {gameState === "completed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {stats.score >= 100
                    ? "🏆"
                    : stats.score >= 50
                    ? "🎉"
                    : stats.score >= 20
                    ? "👍"
                    : "😅"}
                </div>
                <h2 className="text-2xl font-bold text-black-700 mb-2">
                  Game Complete!
                </h2>
                <p className="text-black-600 text-lg">
                  {stats.score >= 100
                    ? "Amazing! You're a freeze master!"
                    : stats.score >= 50
                    ? "Great job! You avoided the cats!"
                    : stats.score >= 20
                    ? "Good try! Keep practicing!"
                    : "Keep practicing to avoid those cats!"}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 bg-black-50/60 rounded-2xl p-4 border border-black-200">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="font-bold text-black-700">Final Score</p>
                    <p className="text-2xl font-bold text-black-800">
                      {stats.score}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                {gameRedirect.isInRedirectFlow ? (
                  <>
                    <Button
                      onClick={gameRedirect.handleGoToNextGame}
                      size="lg"
                      className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                    >
                      {gameRedirect.isLastGame
                        ? "Finish"
                        : "Go to Next Game"}
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800 w-full rounded-full"
                    >
                      Play Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetGame}
                      size="lg"
                      className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                    >
                      Play Again
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
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
        )}
      </div>
    </>
  );
};
