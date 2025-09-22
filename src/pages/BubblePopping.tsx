import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import GameControls from "@/components/ui/GameControls";
import { CommonInstructionsModal } from "@/components/CommonInstructionsModal";
import { useGameRedirect } from "@/hooks/useGameRedirect";
import { useGameSession } from "@/hooks/useGameSession";

type GameState = "instructions" | "countdown" | "playing" | "completed";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  opacity: number;
  createdAt: number;
  isPopping?: boolean;
  popStartTime?: number;
}

interface GameMetrics {
  totalTaps: number;
  successfulPops: number;
  missedTaps: number;
  totalTapDuration: number;
  totalReactionTime: number;
  consecutiveSuccessfulPops: number;
  maxConsecutivePops: number;
  accuracyDistances: number[];
  score: number;
}

interface TapData {
  startTime: number;
  bubble?: Bubble;
  distance?: number;
}

// Bubble colors for variety
const BUBBLE_COLORS = [
  "rgba(100, 200, 255, 0.7)", // Light blue
  "rgba(255, 100, 200, 0.7)", // Pink
  "rgba(100, 255, 200, 0.7)", // Light green
  "rgba(255, 200, 100, 0.7)", // Orange
  "rgba(200, 100, 255, 0.7)", // Purple
  "rgba(255, 255, 100, 0.7)", // Yellow
];

const GAME_DURATION = 60000; // 60 seconds
const COUNTDOWN_DURATION = 3;
const BUBBLE_LIFESPAN = 8000; // 8 seconds
const SPAWN_RATE_MIN = 500;
const SPAWN_RATE_MAX = 1200;
const MIN_BUBBLE_SIZE = 30;
const MAX_BUBBLE_SIZE = 80;

export const BubblePopping = () => {
  const navigate = useNavigate();
  const gameRedirect = useGameRedirect("bubble-popping");
  const gameSession = useGameSession(4); // gameId 4 for bubble-popping
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION);
  const [metrics, setMetrics] = useState<GameMetrics>({
    totalTaps: 0,
    successfulPops: 0,
    missedTaps: 0,
    totalTapDuration: 0,
    totalReactionTime: 0,
    consecutiveSuccessfulPops: 0,
    maxConsecutivePops: 0,
    accuracyDistances: [],
    score: 0,
  });
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [currentTap, setCurrentTap] = useState<TapData | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const bubbleIdCounter = useRef(0);

  // Audio feedback
  const playPopSound = useCallback((accuracy: number) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Higher pitch for better accuracy
    const frequency = 400 + accuracy * 200;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, []);

  const playMissSound = useCallback(() => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  const createBubble = useCallback(() => {
    if (!gameAreaRef.current) return null;

    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;

    const size =
      Math.random() * (MAX_BUBBLE_SIZE - MIN_BUBBLE_SIZE) + MIN_BUBBLE_SIZE;
    const color =
      BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

    // Random spawn location
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);

    // Random velocity
    const speed = Math.random() * 1 + 0.5;
    const angle = Math.random() * Math.PI * 2;

    const bubble: Bubble = {
      id: bubbleIdCounter.current++,
      x,
      y,
      size,
      color,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      opacity: 0.8,
      createdAt: Date.now(),
    };

    return bubble;
  }, []);

  const spawnBubble = useCallback(() => {
    const newBubble = createBubble();
    if (newBubble) {
      setBubbles((prev) => [...prev, newBubble]);
    }

    if (gameState === "playing") {
      const nextSpawnTime =
        Math.random() * (SPAWN_RATE_MAX - SPAWN_RATE_MIN) + SPAWN_RATE_MIN;
      spawnIntervalRef.current = setTimeout(spawnBubble, nextSpawnTime);
    }
  }, [createBubble, gameState]);

  const updateBubbles = useCallback(() => {
    if (!gameAreaRef.current) return;

    const now = Date.now();
    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;

    setBubbles((prev) =>
      prev
        .map((bubble) => {
          if (bubble.isPopping) {
            // Handle popping animation
            const popProgress = bubble.popStartTime
              ? (now - bubble.popStartTime) / 300
              : 0;
            return {
              ...bubble,
              opacity: Math.max(0, 0.8 - popProgress * 2),
              size: bubble.size * (1 + popProgress * 0.5),
            };
          }

          // Update position
          let newX = bubble.x + bubble.velocityX;
          let newY = bubble.y + bubble.velocityY;
          let newVelocityX = bubble.velocityX;
          let newVelocityY = bubble.velocityY;

          // Bounce off walls
          if (newX <= 0 || newX >= width - bubble.size) {
            newVelocityX = -newVelocityX;
            newX = Math.max(0, Math.min(width - bubble.size, newX));
          }
          if (newY <= 0 || newY >= height - bubble.size) {
            newVelocityY = -newVelocityY;
            newY = Math.max(0, Math.min(height - bubble.size, newY));
          }

          return {
            ...bubble,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
          };
        })
        .filter((bubble) => {
          // Remove expired bubbles or completed pop animations
          if (bubble.isPopping && bubble.popStartTime) {
            return now - bubble.popStartTime < 300;
          }
          return now - bubble.createdAt < BUBBLE_LIFESPAN;
        })
    );

    if (gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(updateBubbles);
    }
  }, [gameState]);

  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const handleBubbleClick = useCallback(
    (clickedBubble: Bubble, clickX: number, clickY: number) => {
      if (gameState !== "playing" || clickedBubble.isPopping) return;

      const now = Date.now();
      const bubbleCenter = {
        x: clickedBubble.x + clickedBubble.size / 2,
        y: clickedBubble.y + clickedBubble.size / 2,
      };

      const distance = calculateDistance(
        clickX,
        clickY,
        bubbleCenter.x,
        bubbleCenter.y
      );
      const accuracy = Math.max(0, 1 - distance / (clickedBubble.size / 2));
      const reactionTime = currentTap ? now - currentTap.startTime : 0;

      // Calculate score
      const baseScore = Math.round(clickedBubble.size / 10); // Smaller bubbles = more points
      const accuracyBonus = Math.round(accuracy * 50);
      const totalScore = baseScore + accuracyBonus;

      // Update metrics
      setMetrics((prev) => {
        const newConsecutive = prev.consecutiveSuccessfulPops + 1;
        return {
          ...prev,
          successfulPops: prev.successfulPops + 1,
          totalReactionTime: prev.totalReactionTime + reactionTime,
          consecutiveSuccessfulPops: newConsecutive,
          maxConsecutivePops: Math.max(prev.maxConsecutivePops, newConsecutive),
          accuracyDistances: [...prev.accuracyDistances, distance],
          score: prev.score + totalScore,
        };
      });

      // Play pop sound
      playPopSound(accuracy);

      // Start pop animation
      setBubbles((prev) =>
        prev.map((bubble) =>
          bubble.id === clickedBubble.id
            ? { ...bubble, isPopping: true, popStartTime: now }
            : bubble
        )
      );
    },
    [gameState, currentTap, playPopSound]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      if (gameState !== "playing") return;
      // Removed e.preventDefault() as it was causing passive event listener errors

      setCurrentTap({ startTime: Date.now() });
      setMetrics((prev) => ({ ...prev, totalTaps: prev.totalTaps + 1 }));
    },
    [gameState]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      if (gameState !== "playing" || !currentTap) return;
      // Removed e.preventDefault() as it was causing passive event listener errors

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Get coordinates from different event types
      let clientX: number, clientY: number;

      if ("touches" in e && e.touches.length > 0) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("changedTouches" in e && e.changedTouches.length > 0) {
        // Touch end event
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        // Mouse or pointer event
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
      const tapDuration = Date.now() - currentTap.startTime;

      // Check if click hit any bubble
      const hitBubble = bubbles.find((bubble) => {
        const distance = calculateDistance(
          clickX,
          clickY,
          bubble.x + bubble.size / 2,
          bubble.y + bubble.size / 2
        );
        return distance <= bubble.size / 2 && !bubble.isPopping;
      });

      if (hitBubble) {
        handleBubbleClick(hitBubble, clickX, clickY);
      } else {
        // Miss
        setMetrics((prev) => ({
          ...prev,
          missedTaps: prev.missedTaps + 1,
          consecutiveSuccessfulPops: 0,
          score: Math.max(0, prev.score - 5), // Penalty for missing
        }));
        playMissSound();
      }

      setMetrics((prev) => ({
        ...prev,
        totalTapDuration: prev.totalTapDuration + tapDuration,
      }));

      setCurrentTap(null);
    },
    [gameState, currentTap, bubbles, handleBubbleClick, playMissSound]
  );

  const startCountdown = useCallback(() => {
    setGameState("countdown");
    setCountdown(COUNTDOWN_DURATION);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setGameState("playing");
            gameSession.startSession();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    countdownTimerRef.current = countdownInterval;
  }, [gameSession]);

  const endGame = useCallback(async () => {
    // Prevent multiple calls
    if (gameState === "completed") return;

    setGameState("completed");

    // Clear all timers and intervals
    if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);

    // Create game session with real metrics only if session is active
    if (gameSession.isSessionActive) {
      try {
        const avgReactionTime =
          metrics.totalTaps > 0
            ? metrics.totalReactionTime / metrics.totalTaps
            : 0;
        const avgTapDuration =
          metrics.totalTaps > 0
            ? metrics.totalTapDuration / metrics.totalTaps
            : 0;
        const accuracy =
          metrics.totalTaps > 0
            ? (metrics.successfulPops / metrics.totalTaps) * 100
            : 0;
        const avgAccuracyDistance =
          metrics.accuracyDistances.length > 0
            ? metrics.accuracyDistances.reduce((a, b) => a + b, 0) /
              metrics.accuracyDistances.length
            : 0;

        const success = metrics.score > 100; // Consider success if score > 100

        const rawData = {
          totalTaps: metrics.totalTaps,
          successfulPops: metrics.successfulPops,
          missedTaps: metrics.missedTaps,
          accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
          averageReactionTime: Math.round(avgReactionTime),
          averageTapDuration: Math.round(avgTapDuration),
          maxConsecutivePops: metrics.maxConsecutivePops,
          averageAccuracyDistance: Math.round(avgAccuracyDistance * 100) / 100,
          finalScore: metrics.score,
          gameDuration: GAME_DURATION / 1000, // Convert to seconds
        };

        await gameSession.endSession(success, metrics.score, rawData);
      } catch (error) {
        console.error("Failed to save game session:", error);
        // Game continues even if session saving fails
      }
    }
  }, [gameState, metrics, gameSession]); // Restored gameSession dependency

  const resetGame = useCallback(() => {
    setGameState("instructions");
    setBubbles([]);
    setGameTimeLeft(GAME_DURATION);
    setMetrics({
      totalTaps: 0,
      successfulPops: 0,
      missedTaps: 0,
      totalTapDuration: 0,
      totalReactionTime: 0,
      consecutiveSuccessfulPops: 0,
      maxConsecutivePops: 0,
      accuracyDistances: [],
      score: 0,
    });
    setShowDetailedMetrics(false);
    setCurrentTap(null);

    // Clear all timers
    if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameState === "playing") {
      setBubbles([]);
      setGameTimeLeft(GAME_DURATION);

      // Start spawning bubbles
      setTimeout(() => {
        spawnBubble();
        animationFrameRef.current = requestAnimationFrame(updateBubbles);
      }, 100);

      // Start game timer
      const startTime = Date.now();
      const gameTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, GAME_DURATION - elapsed);
        setGameTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(gameTimer);
          endGame();
        }
      }, 100);

      gameTimerRef.current = gameTimer;
    }
  }, [gameState]); // Removed problematic dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Calculate derived metrics
  const avgAccuracy =
    metrics.accuracyDistances.length > 0
      ? metrics.accuracyDistances.reduce((sum, dist) => sum + dist, 0) /
        metrics.accuracyDistances.length
      : 0;
  const avgReactionTime =
    metrics.successfulPops > 0
      ? metrics.totalReactionTime / metrics.successfulPops
      : 0;
  const avgTapDuration =
    metrics.totalTaps > 0 ? metrics.totalTapDuration / metrics.totalTaps : 0;
  const popsPerMinute =
    (metrics.successfulPops /
      Math.max(1, (GAME_DURATION - gameTimeLeft) / 1000)) *
    60;
  const missRate =
    metrics.totalTaps > 0 ? (metrics.missedTaps / metrics.totalTaps) * 100 : 0;

  return (
    <>
      {/* Custom Bubble Styles */}
      <style>{`
        .bubble {
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 50%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            inset 0 0 20px rgba(255, 255, 255, 0.2),
            0 4px 15px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          user-select: none;
        }
        
        .bubble:hover {
          transform: scale(1.05);
          transition: transform 0.1s ease;
        }
        
        @keyframes bubblePop {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        .popping {
          animation: bubblePop 0.3s ease-out;
        }
      `}</style>

      {/* Instructions Modal */}
      <CommonInstructionsModal
        isOpen={gameState === "instructions"}
        title="Bubble Popping"
        subtitle="Pop as many bubbles as you can!"
        instructions={[
          {
            icon: "👆",
            text: "Tap!",
            subtext: "Click on bubbles to pop them"
          },
          {
            icon: "🎯",
            text: "Accuracy!",
            subtext: "Hit the center for bonus points"
          },
          {
            icon: "⏱️",
            text: "Speed!",
            subtext: "You have 60 seconds"
          }
        ]}
        onStartGame={startCountdown}
        buttonText="LET'S START"
      />

      {/* Countdown Screen */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
          <div className="text-center">
            <div className="text-8xl font-bold text-orange-600 animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl text-orange-700 mt-4">Get Ready to Pop!</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border border-white/40 relative z-30" style={{ height: '100px' }}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Bubble Popping
              </h1>
            </div>
          </div>
          {/* Back Button */}
          <BackButton onClick={() => navigate("/")} />
        </header>

        {/* Game Controls */}
        {(gameState === "playing" || gameState === "completed") && (
          <GameControls score={metrics.score} timeLeft={gameTimeLeft} />
        )}

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-[calc(100vh-140px)] overflow-hidden"
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: "none" }}
        >
          {/* Bubbles */}
          {bubbles.map((bubble) => (
            <div
              key={bubble.id}
              className={`absolute bubble ${bubble.isPopping ? "popping" : ""}`}
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
                opacity: bubble.opacity,
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                zIndex: 20,
              }}
            />
          ))}
        </div>

        {/* Results Screen */}
        {gameState === "completed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/80 via-blue-200/80 to-purple-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {metrics.score >= 500
                    ? "🏆"
                    : metrics.score >= 300
                    ? "🎉"
                    : metrics.score >= 100
                    ? "👍"
                    : "🫧"}
                </div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">
                  Game Complete!
                </h2>
                <p className="text-blue-600 text-lg">
                  {metrics.score >= 500
                    ? "Amazing!"
                    : metrics.score >= 300
                    ? "Great job!"
                    : metrics.score >= 100
                    ? "Good work!"
                    : "Keep practicing!"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-700 mb-2">
                    {metrics.score}
                  </div>
                  <p className="text-blue-600 font-semibold">Final Score</p>
                </div>
              </div>

              {!showDetailedMetrics ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowDetailedMetrics(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    View Detailed Metrics
                  </Button>
                  {gameRedirect.isInRedirectFlow ? (
                    <>
                      <Button
                        onClick={gameRedirect.handleGoToNextGame}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {gameRedirect.isLastGame
                          ? "Finish All Games"
                          : "Go to Next Game"}
                      </Button>
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="w-full text-gray-600 hover:text-gray-800"
                      >
                        Play Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={resetGame}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Play Again
                      </Button>
                      <Button
                        onClick={() => navigate("/")}
                        variant="ghost"
                        className="w-full text-gray-600 hover:text-gray-800"
                      >
                        Back to Games
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/50 rounded-2xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bubbles Popped:</span>
                      <span className="font-semibold">
                        {metrics.successfulPops}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pops/Minute:</span>
                      <span className="font-semibold">
                        {popsPerMinute.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Miss Rate:</span>
                      <span className="font-semibold">
                        {missRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Reaction Time:</span>
                      <span className="font-semibold">
                        {avgReactionTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Tap Duration:</span>
                      <span className="font-semibold">
                        {avgTapDuration.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Streak:</span>
                      <span className="font-semibold">
                        {metrics.maxConsecutivePops}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDetailedMetrics(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Back to Score
                  </Button>
                  {gameRedirect.isInRedirectFlow ? (
                    <>
                      <Button
                        onClick={gameRedirect.handleGoToNextGame}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {gameRedirect.isLastGame
                          ? "Finish All Games"
                          : "Go to Next Game"}
                      </Button>
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="w-full text-gray-600 hover:text-gray-800"
                      >
                        Play Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={resetGame}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Play Again
                      </Button>
                      <Button
                        onClick={() => navigate("/")}
                        variant="ghost"
                        className="w-full text-gray-600 hover:text-gray-800"
                      >
                        Back to Games
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
