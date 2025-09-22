import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import GameControls from "@/components/ui/GameControls";
import { CommonInstructionsModal } from "@/components/CommonInstructionsModal";
import { useGameRedirect } from "@/hooks/useGameRedirect";
import { useGameSession } from "@/hooks/useGameSession";

type GameState = "instructions" | "countdown" | "playing" | "completed";

interface FlyingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
  clickAnimation?: "correct" | "wrong" | null;
  animationStartTime?: number;
}

// Object emojis for the game
const OBJECT_EMOJIS = [
  "🎯",
  "⚽",
  "🎸",
  "🎨",
  "📚",
  "🚗",
  "🍎",
  "⭐",
  "🎁",
  "🔑",
  "💎",
  "🎪",
  "🎭",
  "🎲",
  "🎺",
];

const GAME_DURATION = 100000; // 100 seconds
const COUNTDOWN_DURATION = 3; // 3 second countdown
const CENTER_BOX_SIZE = 350; // pixels
const SPAWN_RATE_MIN = 300; // minimum ms between spawns
const SPAWN_RATE_MAX = 800; // maximum ms between spawns

export const SymbolSpotter = () => {
  const navigate = useNavigate();
  const gameRedirect = useGameRedirect("symbol-spotter");
  const gameSession = useGameSession(3); // gameId 3 for symbol-spotter
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [targetEmoji, setTargetEmoji] = useState("");
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmoji[]>([]);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const emojiIdCounter = useRef(0);

  // Audio feedback
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

  const getRandomEmoji = useCallback(() => {
    return OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
  }, []);

  const createFlyingEmoji = useCallback(() => {
    if (!gameAreaRef.current) return null;

    // Use offsetWidth/offsetHeight instead of getBoundingClientRect
    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Random spawn position from edges
    const side = Math.floor(Math.random() * 4);
    let startX, startY;

    switch (side) {
      case 0: // top
        startX = Math.random() * width;
        startY = -50;
        break;
      case 1: // right
        startX = width + 50;
        startY = Math.random() * height;
        break;
      case 2: // bottom
        startX = Math.random() * width;
        startY = height + 50;
        break;
      case 3: // left
        startX = -50;
        startY = Math.random() * height;
        break;
      default:
        startX = 0;
        startY = 0;
    }

    const emoji: FlyingEmoji = {
      id: emojiIdCounter.current++,
      emoji: getRandomEmoji(),
      x: startX,
      y: startY,
      targetX: centerX + (Math.random() - 0.5) * CENTER_BOX_SIZE,
      targetY: centerY + (Math.random() - 0.5) * CENTER_BOX_SIZE,
      speed: Math.random() * 0.8 + 0.5, // Random speed between 0.5-1.3 (slower)
      angle: 0,
    };

    // Calculate angle for straight line movement
    const dx = emoji.targetX - emoji.x;
    const dy = emoji.targetY - emoji.y;
    emoji.angle = Math.atan2(dy, dx);

    return emoji;
  }, [getRandomEmoji]);

  const spawnEmoji = useCallback(() => {
    const newEmoji = createFlyingEmoji();
    if (newEmoji) {
      setFlyingEmojis((prev) => [...prev, newEmoji]);
    }

    // Schedule next spawn only if game is still playing
    if (gameState === "playing") {
      const nextSpawnTime =
        Math.random() * (SPAWN_RATE_MAX - SPAWN_RATE_MIN) + SPAWN_RATE_MIN;
      spawnIntervalRef.current = setTimeout(spawnEmoji, nextSpawnTime);
    }
  }, [createFlyingEmoji, gameState]);

  const updateEmojiPositions = useCallback(() => {
    setFlyingEmojis((prev) =>
      prev
        .map((emoji) => {
          // Don't move emojis that are animating
          if (emoji.clickAnimation) {
            return emoji;
          }

          return {
            ...emoji,
            x: emoji.x + Math.cos(emoji.angle) * emoji.speed,
            y: emoji.y + Math.sin(emoji.angle) * emoji.speed,
          };
        })
        .filter((emoji) => {
          // Remove emojis with expired animations
          if (emoji.clickAnimation && emoji.animationStartTime) {
            return Date.now() - emoji.animationStartTime < 600;
          }

          // Remove emojis that are too far from the screen
          return (
            emoji.x > -100 &&
            emoji.x < window.innerWidth + 100 &&
            emoji.y > -100 &&
            emoji.y < window.innerHeight + 100
          );
        })
    );

    if (gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(updateEmojiPositions);
    }
  }, [gameState]);

  const isEmojiInCenterBox = useCallback((emoji: FlyingEmoji) => {
    if (!gameAreaRef.current) return false;

    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const boxLeft = centerX - CENTER_BOX_SIZE / 2;
    const boxRight = centerX + CENTER_BOX_SIZE / 2;
    const boxTop = centerY - CENTER_BOX_SIZE / 2;
    const boxBottom = centerY + CENTER_BOX_SIZE / 2;

    return (
      emoji.x >= boxLeft &&
      emoji.x <= boxRight &&
      emoji.y >= boxTop &&
      emoji.y <= boxBottom
    );
  }, []);

  const handleEmojiClick = useCallback(
    (clickedEmoji: FlyingEmoji) => {
      if (gameState !== "playing") return;

      if (isEmojiInCenterBox(clickedEmoji)) {
        const isCorrect = clickedEmoji.emoji === targetEmoji;

        if (isCorrect) {
          setScore((prev) => prev + 1);
          playCorrectSound();
        } else {
          setScore((prev) => prev - 1);
          playWrongSound();
        }

        // Add click animation
        setFlyingEmojis((prev) =>
          prev.map((emoji) =>
            emoji.id === clickedEmoji.id
              ? {
                  ...emoji,
                  clickAnimation: isCorrect ? "correct" : "wrong",
                  animationStartTime: Date.now(),
                }
              : emoji
          )
        );

        // Remove emoji after animation
        setTimeout(() => {
          setFlyingEmojis((prev) =>
            prev.filter((emoji) => emoji.id !== clickedEmoji.id)
          );
        }, 600); // Animation duration
      }
    },
    [
      gameState,
      targetEmoji,
      isEmojiInCenterBox,
      playCorrectSound,
      playWrongSound,
    ]
  );

  const startCountdown = useCallback(() => {
    setGameState("countdown");
    setCountdown(COUNTDOWN_DURATION);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Use setTimeout to avoid dependency issues
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

  const endGame = useCallback(async () => {
    // Prevent multiple calls
    if (gameState === "completed") return;

    setGameState("completed");

    // Clear all timers and intervals
    if (spawnIntervalRef.current) {
      clearTimeout(spawnIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    // Create game session with hardcoded data only if session is active
    if (gameSession.isSessionActive) {
      try {
        await gameSession.endSessionWithHardcodedData("symbol-spotter");
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    }
  }, [gameState, gameSession]);

  const resetGame = useCallback(() => {
    setGameState("instructions");
    setScore(0);
    setFlyingEmojis([]);
    setGameTimeLeft(GAME_DURATION);

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
      const newTargetEmoji = getRandomEmoji();
      setTargetEmoji(newTargetEmoji);
      setScore(0);
      setFlyingEmojis([]);
      setGameTimeLeft(GAME_DURATION);

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Start spawning emojis
        spawnEmoji();

        // Start animation loop
        animationFrameRef.current = requestAnimationFrame(updateEmojiPositions);
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

  return (
    <>
      {/* Custom Animations */}
      <style>{`
        @keyframes correctClick {
          0% { transform: scale(1); }
          25% { transform: scale(1.3) rotate(-5deg); }
          50% { transform: scale(1.5) rotate(5deg); }
          75% { transform: scale(1.3) rotate(-2deg); }
          100% { transform: scale(1.2) rotate(0deg); }
        }
        
        @keyframes wrongClick {
          0% { transform: scale(1); }
          25% { transform: scale(0.8) rotate(-10deg); }
          50% { transform: scale(1.1) rotate(10deg); }
          75% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        .correct-click {
          animation: correctClick 0.6s ease-out;
        }
        
        .wrong-click {
          animation: wrongClick 0.6s ease-out;
        }
      `}</style>

      {/* Instructions Modal */}
      <CommonInstructionsModal
        isOpen={gameState === "instructions"}
        title="Symbol Spotter"
        subtitle="Catch the flying symbols!"
        instructions={[
          {
            icon: "👀",
            text: "Watch!",
            subtext: "Look for the target symbol at the top"
          },
          {
            icon: "🎯",
            text: "Click!",
            subtext: "Click the target symbol when it's in the center box"
          },
          {
            icon: "⏱️",
            text: "Quick!",
            subtext: "You have 5 seconds to score as much as possible"
          },
          {
            icon: "📊",
            text: "Score!",
            subtext: "+1 for correct, -1 for wrong clicks"
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
                Symbol Spotter
              </h1>
            </div>
          </div>
          {/* Back Button */}
          <BackButton onClick={() => navigate("/")} />
        </header>

        {/* Target Emoji Display */}
        {(gameState === "playing" || gameState === "completed") && (
          <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 font-medium">
                  Find this symbol:
                </div>
                <div className="text-2xl">{targetEmoji}</div>
              </div>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {(gameState === "playing" || gameState === "completed") && (
          <GameControls score={score} timeLeft={gameTimeLeft} />
        )}

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-[calc(100vh-140px)] overflow-hidden"
        >
          {/* Center Box */}
          {(gameState === "playing" || gameState === "completed") && (
            <div
              className="absolute border-4 border-dashed border-orange-400 bg-orange-100/50 rounded-2xl flex items-center justify-center"
              style={{
                width: CENTER_BOX_SIZE,
                height: CENTER_BOX_SIZE,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="text-orange-600 font-bold text-lg">
                Click Zone
              </span>
            </div>
          )}

          {/* Flying Emojis */}
          {flyingEmojis.map((emoji) => {
            const getAnimationClasses = () => {
              if (!emoji.clickAnimation) {
                return "hover:scale-110 transition-transform";
              }

              if (emoji.clickAnimation === "correct") {
                return "correct-click text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]";
              }

              if (emoji.clickAnimation === "wrong") {
                return "wrong-click text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] opacity-75";
              }

              return "";
            };

            return (
              <div
                key={emoji.id}
                className={`absolute text-4xl cursor-pointer select-none ${getAnimationClasses()}`}
                style={{
                  left: emoji.x - 20,
                  top: emoji.y - 20,
                  zIndex: emoji.clickAnimation ? 30 : 20,
                }}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji.emoji}
                {/* Add visual feedback elements */}
                {emoji.clickAnimation === "correct" && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-lg animate-bounce">
                    +1
                  </div>
                )}
                {emoji.clickAnimation === "wrong" && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-lg animate-pulse">
                    -1
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Results Screen */}
        {gameState === "completed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/80 via-blue-200/80 to-purple-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {score >= 5
                    ? "🏆"
                    : score >= 3
                    ? "🎉"
                    : score >= 0
                    ? "👍"
                    : "😅"}
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Game Complete!
                </h2>
                <p className="text-green-600 text-lg">
                  {score >= 5
                    ? "Amazing!"
                    : score >= 3
                    ? "Great job!"
                    : score >= 0
                    ? "Good try!"
                    : "Keep practicing!"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700 mb-2">
                    {score}
                  </div>
                  <p className="text-green-600 font-semibold">Final Score</p>
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
                      className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
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
