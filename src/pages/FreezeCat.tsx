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

  // Refs for cleanup
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const animalSpawnTimerRef = useRef<NodeJS.Timeout>();
  const animalIdCounter = useRef(0);

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
        };

        newAnimals.push(newAnimal);
      }

      return newAnimals;
    });

    // Schedule next spawn only if game is still playing
    if (gameState === "playing") {
      const nextSpawnTime = getCurrentAppearInterval();
      animalSpawnTimerRef.current = setTimeout(spawnAnimals, nextSpawnTime);
    }
  }, [gameState, getCurrentAppearInterval, getRandomAnimal]);

  // Handle animal tap
  const handleAnimalTap = useCallback(
    (animal: GridAnimal) => {
      if (gameState !== "playing") return;

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
    [gameState, playCorrectSound, playWrongSound]
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

    // Create game session with hardcoded data only if session is active
    if (gameSession.isSessionActive) {
      try {
        await gameSession.endSessionWithHardcodedData("freeze-cat");
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    }
  }, [gameState, gameSession]);

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
      const startTime = Date.now();
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
            subtext: "Tap dogs, rabbits, and other animals for points"
          },
          {
            icon: "🐱",
            text: "Stay Frozen!",
            subtext: "Don't tap the cats or you'll lose points - there are many!"
          },
          {
            icon: "⏱️",
            text: "Quick Thinking!",
            subtext: "You have 20 seconds to score as much as possible"
          }
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
        <header className="bg-white/90 backdrop-blur-sm border border-white/40 relative z-30" style={{ height: '100px' }}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/80 via-blue-200/80 to-purple-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
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
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Game Complete!
                </h2>
                <p className="text-green-600 text-lg">
                  {stats.score >= 100
                    ? "Amazing!"
                    : stats.score >= 50
                    ? "Great job!"
                    : stats.score >= 20
                    ? "Good try!"
                    : "Keep practicing!"}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {stats.score}
                    </div>
                    <p className="text-green-600 font-semibold">Final Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-bold text-blue-700">
                      {stats.correctTaps}
                    </div>
                    <div className="text-blue-600">Correct</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="font-bold text-red-700">
                      {stats.incorrectTaps}
                    </div>
                    <div className="text-red-600">Wrong</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="font-bold text-purple-700">
                      {stats.totalTaps}
                    </div>
                    <div className="text-purple-600">Total</div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                {gameRedirect.isInRedirectFlow ? (
                  <>
                    <Button
                      onClick={gameRedirect.handleGoToNextGame}
                      size="lg"
                      className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                    >
                      {gameRedirect.isLastGame
                        ? "Finish All Games"
                        : "Go to Next Game"}
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800 w-full"
                    >
                      Play Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetGame}
                      size="lg"
                      className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                    >
                      Play Again
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800"
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
