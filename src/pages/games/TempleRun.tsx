import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Effects,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import GameControls from "@/components/ui/GameControls";
import { TEMPLE_RUN } from "@/constants/game";
import { useOrientation } from "@/utils/useOrientation";
import { Terrain } from "@/components/world/Terrain";
import { Sky } from "@/components/world/Sky";
import { Obstacle } from "@/components/world/Obstacles";
import { Lighting } from "@/components/world/Lighting";
import { Player } from "@/components/world/Player";
import {
  Building,
  TrafficLight,
  StreetLamp,
  BusStop,
  FireHydrant,
  ParkBench,
  TrashCan,
} from "@/components/world/Environment";
import { RoadDust, CollisionEffect } from "@/components/world/ParticleEffects";
import * as THREE from "three";

type GameState = "countdown" | "playing" | "gameOver";

interface ObstacleData {
  id: number;
  position: [number, number, number];
  type: "car" | "truck" | "cone" | "barrier" | "bus";
}

export const TempleRun = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();

  // Game state
  const [gameState, setGameState] = useState<GameState>("countdown");
  const [countdown, setCountdown] = useState<number>(
    TEMPLE_RUN.COUNTDOWN_DURATION
  );
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [playerLane, setPlayerLane] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [jumpStartTime, setJumpStartTime] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [collisionTriggered, setCollisionTriggered] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);

  // Refs
  const gameStartTime = useRef<number>(0);
  const lastObstacleSpawn = useRef<number>(0);
  const obstacleIdCounter = useRef<number>(0);

  // Enhanced input handling
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setPlayerLane((prev) => Math.max(prev - 1, -1));
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setPlayerLane((prev) => Math.min(prev + 1, 1));
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          if (!isJumping && !isSliding) {
            setIsJumping(true);
            setJumpStartTime(Date.now());
            setTimeout(() => setIsJumping(false), TEMPLE_RUN.JUMP_DURATION);
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (!isJumping && !isSliding) {
            setIsSliding(true);
            setTimeout(() => setIsSliding(false), 400);
          }
          break;
      }
    },
    [gameState, isJumping, isSliding]
  );

  // Enhanced touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStart.current || gameState !== "playing") return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Adjust threshold based on orientation - more sensitive in portrait
      const threshold = orientation === "portrait" ? 40 : 50;
      const minSwipeDistance = 30;

      // Check if swipe is significant enough
      const swipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (swipeDistance < minSwipeDistance) {
        touchStart.current = null;
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe - lane changing
        if (deltaX > threshold) {
          setPlayerLane((prev) => Math.min(prev + 1, 1));
        } else if (deltaX < -threshold) {
          setPlayerLane((prev) => Math.max(prev - 1, -1));
        }
      } else {
        // Vertical swipe - jump/slide
        if (deltaY < -threshold && !isJumping && !isSliding) {
          // Swipe up - jump
          setIsJumping(true);
          setJumpStartTime(Date.now());
          setTimeout(() => setIsJumping(false), TEMPLE_RUN.JUMP_DURATION);
        } else if (deltaY > threshold && !isJumping && !isSliding) {
          // Swipe down - slide
          setIsSliding(true);
          setTimeout(() => setIsSliding(false), 400);
        }
      }

      touchStart.current = null;
    },
    [gameState, isJumping, isSliding, orientation]
  );

  // Game countdown
  const startCountdown = useCallback(() => {
    setGameState("countdown");
    let currentCount = TEMPLE_RUN.COUNTDOWN_DURATION;
    setCountdown(currentCount);

    const countdownInterval = setInterval(() => {
      currentCount--;
      if (currentCount <= 0) {
        clearInterval(countdownInterval);
        setGameState("playing");
        gameStartTime.current = Date.now();
        lastObstacleSpawn.current = Date.now();
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  }, []);

  // Enhanced obstacle spawning
  const spawnObstacle = useCallback(() => {
    const now = Date.now();
    const timeSinceStart = now - gameStartTime.current;
    const timeSinceLastSpawn = now - lastObstacleSpawn.current;

    // Dynamic difficulty - faster spawning and more variety over time
    const difficultyMultiplier = Math.min(timeSinceStart / 60000, 2); // Max 2x difficulty after 1 minute
    const baseInterval =
      TEMPLE_RUN.SPAWN_INTERVAL_MIN +
      (TEMPLE_RUN.SPAWN_INTERVAL_MAX - TEMPLE_RUN.SPAWN_INTERVAL_MIN) *
        Math.max(0, 1 - difficultyMultiplier * 0.7);

    if (timeSinceLastSpawn > baseInterval) {
      const lanes = [-4, 0, 4];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

      // More obstacle variety with difficulty
      const obstacleTypes: ("car" | "truck" | "cone" | "barrier" | "bus")[] =
        difficultyMultiplier > 0.5
          ? ["car", "truck", "cone", "barrier", "bus"]
          : ["car", "truck", "cone"];

      const randomType =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

      const newObstacle: ObstacleData = {
        id: obstacleIdCounter.current++,
        position: [randomLane, 0.5, -30 - Math.random() * 10],
        type: randomType,
      };

      setObstacles((prev) => [...prev, newObstacle]);
      lastObstacleSpawn.current = now;
    }
  }, []);

  // Enhanced game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(() => {
      const elapsed = Date.now() - gameStartTime.current;
      const newDistance = Math.floor(elapsed / 100);
      const newScore = newDistance * TEMPLE_RUN.SCORE_MULTIPLIER;

      setDistance(newDistance);
      setScore(newScore);

      // Increase game speed over time
      const speedMultiplier = 1 + elapsed / 120000; // 2x speed after 2 minutes
      setGameSpeed(speedMultiplier);

      spawnObstacle();

      // Clean up old obstacles
      setObstacles((prev) =>
        prev.filter((obstacle) => obstacle.position[2] < 15)
      );

      // Check game duration
      if (elapsed > TEMPLE_RUN.GAME_DURATION) {
        setGameState("gameOver");
      }
    }, 50); // Smoother updates

    return () => clearInterval(gameLoop);
  }, [gameState, spawnObstacle]);

  // Enhanced collision handling
  const handleCollision = useCallback(() => {
    setCollisionTriggered(true);
    setTimeout(() => {
      setGameState("gameOver");
      setCollisionTriggered(false);
    }, 500);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setDistance(0);
    setPlayerLane(0);
    setIsJumping(false);
    setIsSliding(false);
    setObstacles([]);
    setGameSpeed(1);
    setCollisionTriggered(false);
    obstacleIdCounter.current = 0;
    startCountdown();
  }, [startCountdown]);

  // Event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyPress, handleTouchStart, handleTouchEnd]);

  // Start game on mount
  useEffect(() => {
    startCountdown();
  }, [startCountdown]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-300 to-orange-200">
      {/* No orientation restriction - works in both portrait and landscape */}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 p-3">
        <div
          className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-xl relative"
          style={{ height: "100px" }}
        >
          <div className="flex items-center justify-center h-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Temple Run
            </h1>
          </div>
          {/* Back Button */}
          <BackButton onClick={() => navigate("/")} />
        </div>
      </header>

      {/* Game Controls */}
      <GameControls className="bottom-20">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{distance}m</div>
          <div className="text-sm text-gray-600">Distance</div>
        </div>
        {gameSpeed > 1 && (
          <div className="text-center">
            <div className="text-sm font-bold text-red-600 animate-pulse">
              {gameSpeed.toFixed(1)}x
            </div>
            <div className="text-xs text-gray-600">Speed</div>
          </div>
        )}
      </GameControls>

      {/* Countdown Overlay */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
          <div className="text-center">
            <div className="text-8xl font-bold text-orange-600 animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl text-orange-700 mt-4">Get Ready!</p>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {gameState === "gameOver" || true && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">🚗</div>
              <h2 className="text-2xl font-bold text-black-700 mb-2">
                Race Complete!
              </h2>
              <p className="text-black-600 text-lg">
                {score >= 5000
                  ? "Amazing! You're a racing champion!"
                  : score >= 2000
                  ? "Great job! You dominated the road!"
                  : score >= 1000
                  ? "Good run! Keep improving your skills!"
                  : "Keep practicing to become a racing pro!"}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 bg-black-50/60 rounded-2xl p-4 border border-black-200">
                <div className="text-3xl">🏆</div>
                <div>
                  <p className="font-bold text-black-700">Final Score</p>
                  <p className="text-2xl font-bold text-black-800">
                    {score.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Button
                onClick={resetGame}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full"
              >
                Race Again
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 rounded-full"
              >
                Back to Games
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Controls - Works in both portrait and landscape */}
      <div className="absolute bottom-4 left-4 right-4 z-40 text-center">
        <div className="bg-black/40 rounded-xl p-3 text-white backdrop-blur-sm border border-white/20">
          <div className="flex justify-center items-center text-sm">
            <div className="hidden sm:flex items-center space-x-4">
              <span>🚗 WASD/Arrows to steer</span>
              <span>⬆️ Space/W to jump ramps</span>
              <span>⬇️ S to go under barriers</span>
            </div>
            <div className="sm:hidden">
              {orientation === "portrait" ? (
                <div className="space-y-1 text-center">
                  <div>👈👉 Swipe left/right to change lanes</div>
                  <div>☝️ Swipe up for ramps • 👇 Swipe down to duck</div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span>👈👉 Swipe to change lanes</span>
                  <span>☝️ Swipe up for ramps</span>
                  <span>👇 Swipe down to duck under</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced 3D Scene - Optimized for both portrait and landscape */}
      <Canvas
        shadows
        camera={{
          position: [0, 4, 10],
          fov: orientation === "portrait" ? 85 : 75, // Wider FOV for portrait mode
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 2]} // Adaptive pixel ratio
      >
        {/* Clean environment - no fog or post-processing */}

        <Lighting />
        <Sky />

        {/* Player Car */}
        <Player
          lane={playerLane}
          isJumping={isJumping}
          jumpStartTime={jumpStartTime}
          isSliding={isSliding}
        />

        {/* Collision Effect */}
        <CollisionEffect
          position={[playerLane * 4, 0.5, 2]}
          trigger={collisionTriggered}
        />

        {/* Enhanced Terrain with more segments */}
        {Array.from({ length: TEMPLE_RUN.VISIBLE_SEGMENTS + 5 }, (_, i) => (
          <Terrain
            key={i}
            position={[0, -0.5, -i * TEMPLE_RUN.TERRAIN_SEGMENT_LENGTH]}
            segment={i}
          />
        ))}

        {/* Urban Environment */}
        <Building position={[-12, 0, -20]} />
        <Building position={[12, 0, -35]} />
        <Building position={[-15, 0, -60]} />
        <Building position={[18, 0, -80]} />

        <TrafficLight position={[-6, 0, -15]} />
        <TrafficLight position={[6, 0, -45]} />

        <StreetLamp position={[-8, 0, -25]} />
        <StreetLamp position={[8, 0, -55]} />
        <StreetLamp position={[-10, 0, -75]} />

        <BusStop position={[10, 0, -30]} />
        <FireHydrant position={[-5, 0, -40]} />
        <ParkBench position={[7, 0, -65]} />
        <TrashCan position={[-3, 0, -50]} />

        {/* Minimal Road Effects */}
        <RoadDust count={60} speed={0.08 * gameSpeed} />

        {/* Enhanced Obstacles */}
        {obstacles.map((obstacle) => (
          <Obstacle
            key={obstacle.id}
            position={obstacle.position}
            type={obstacle.type}
            onCollision={handleCollision}
            playerLane={playerLane}
            isPlayerJumping={isJumping}
            isPlayerSliding={isSliding}
          />
        ))}
      </Canvas>

      {/* Debug indicators - Responsive */}
      {process.env.NODE_ENV === "development" && (
        <div
          className={`absolute text-white bg-black/50 rounded p-2 text-xs ${
            orientation === "portrait"
              ? "top-20 left-2 right-2 text-center"
              : "top-20 right-4 space-y-1"
          }`}
        >
          {orientation === "portrait" ? (
            <div>
              Lane: {playerLane} | J: {isJumping ? "Y" : "N"} | S:{" "}
              {isSliding ? "Y" : "N"} | Speed: {gameSpeed.toFixed(1)}x | Obs:{" "}
              {obstacles.length}
            </div>
          ) : (
            <>
              <div>FPS: 60 | Speed: {gameSpeed.toFixed(1)}x</div>
              <div>
                Lane: {playerLane} | Jumping: {isJumping ? "Yes" : "No"} |
                Sliding: {isSliding ? "Yes" : "No"}
              </div>
              <div>Obstacles: {obstacles.length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
