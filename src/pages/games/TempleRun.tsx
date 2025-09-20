import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { TEMPLE_RUN } from '@/constants/game';
import { useOrientation } from '@/utils/useOrientation';
import { Terrain } from '@/components/world/Terrain';
import { Sky } from '@/components/world/Sky';
import { Obstacle } from '@/components/world/Obstacles';
import { Lighting } from '@/components/world/Lighting';
import { Player } from '@/components/world/Player';
import { Temple, Vegetation } from '@/components/world/Environment';

type GameState = 'countdown' | 'playing' | 'gameOver';

interface ObstacleData {
  id: number;
  position: [number, number, number];
  type: 'rock' | 'tree' | 'wall';
}

export const TempleRun = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [countdown, setCountdown] = useState<number>(TEMPLE_RUN.COUNTDOWN_DURATION);
  const [score, setScore] = useState(0);
  const [playerLane, setPlayerLane] = useState(0); // -1, 0, 1
  const [isJumping, setIsJumping] = useState(false);
  const [jumpStartTime, setJumpStartTime] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  
  // Refs
  const gameStartTime = useRef<number>(0);
  const lastObstacleSpawn = useRef<number>(0);
  const obstacleIdCounter = useRef<number>(0);

  // Handle input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    switch (event.key) {
      case 'ArrowLeft':
        setPlayerLane(prev => Math.max(prev - 1, -1));
        break;
      case 'ArrowRight':
        setPlayerLane(prev => Math.min(prev + 1, 1));
        break;
      case 'ArrowUp':
      case ' ':
        if (!isJumping) {
          setIsJumping(true);
          setJumpStartTime(Date.now());
          setTimeout(() => setIsJumping(false), TEMPLE_RUN.JUMP_DURATION);
        }
        break;
    }
  }, [gameState, isJumping]);

  // Touch/swipe handling for mobile
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStart.current || gameState !== 'playing') return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold) {
        setPlayerLane(prev => Math.min(prev + 1, 1)); // Swipe right
      } else if (deltaX < -threshold) {
        setPlayerLane(prev => Math.max(prev - 1, -1)); // Swipe left
      }
    } else if (deltaY < -threshold) {
      // Swipe up
      if (!isJumping) {
        setIsJumping(true);
        setJumpStartTime(Date.now());
        setTimeout(() => setIsJumping(false), TEMPLE_RUN.JUMP_DURATION);
      }
    }

    touchStart.current = null;
  }, [gameState, isJumping]);

  // Game countdown
  const startCountdown = useCallback(() => {
    setGameState('countdown');
    let currentCount = TEMPLE_RUN.COUNTDOWN_DURATION;
    setCountdown(currentCount);

    const countdownInterval = setInterval(() => {
      currentCount--;
      if (currentCount <= 0) {
        clearInterval(countdownInterval);
        setGameState('playing');
        gameStartTime.current = Date.now();
        lastObstacleSpawn.current = Date.now();
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  }, []);

  // Spawn obstacles
  const spawnObstacle = useCallback(() => {
    const now = Date.now();
    const timeSinceStart = now - gameStartTime.current;
    const timeSinceLastSpawn = now - lastObstacleSpawn.current;
    
    // Dynamic spawn rate based on game time
    const baseInterval = TEMPLE_RUN.SPAWN_INTERVAL_MIN + 
      (TEMPLE_RUN.SPAWN_INTERVAL_MAX - TEMPLE_RUN.SPAWN_INTERVAL_MIN) * 
      Math.max(0, (60000 - timeSinceStart) / 60000); // Faster over time
    
    if (timeSinceLastSpawn > baseInterval) {
      const lanes = [-4, 0, 4]; // Lane positions
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
      const obstacleTypes: ('rock' | 'tree' | 'wall')[] = ['rock', 'tree', 'wall'];
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      const newObstacle: ObstacleData = {
        id: obstacleIdCounter.current++,
        position: [randomLane, 0.5, -30],
        type: randomType
      };

      setObstacles(prev => [...prev, newObstacle]);
      lastObstacleSpawn.current = now;
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Update score based on time survived
      const elapsed = Date.now() - gameStartTime.current;
      setScore(Math.floor(elapsed / 100 * TEMPLE_RUN.SCORE_MULTIPLIER));
      
      // Spawn obstacles
      spawnObstacle();
      
      // Clean up old obstacles
      setObstacles(prev => prev.filter(obstacle => obstacle.position[2] < 15));
      
      // Check game duration
      if (elapsed > TEMPLE_RUN.GAME_DURATION) {
        setGameState('gameOver');
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameState, spawnObstacle]);

  // Handle collision
  const handleCollision = useCallback(() => {
    setGameState('gameOver');
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setPlayerLane(0);
    setIsJumping(false);
    setObstacles([]);
    obstacleIdCounter.current = 0;
    startCountdown();
  }, [startCountdown]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleKeyPress, handleTouchStart, handleTouchEnd]);

  // Start game on mount
  useEffect(() => {
    startCountdown();
  }, [startCountdown]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-300 to-orange-200">
      {/* Orientation Warning */}
      {orientation === 'portrait' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 text-white">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold mb-2">Rotate Your Device</h2>
            <p className="text-lg">Please rotate to landscape mode for the best experience</p>
          </div>
        </div>
      )}

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white bg-black/30 hover:bg-black/50"
          >
            ← Back
          </Button>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white bg-black/30 rounded-xl px-4 py-2">
              Score: {score}
            </div>
          </div>
          
          <div className="w-20"></div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="text-8xl font-bold text-white animate-pulse mb-4">
              {countdown}
            </div>
            <p className="text-2xl text-white">Get Ready!</p>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🏁</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <div className="text-2xl font-bold text-orange-600 mb-6">
              Final Score: {score}
            </div>
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 text-xl font-bold rounded-full"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Controls Hint */}
      <div className="absolute bottom-4 left-4 right-4 z-40 text-center">
        <div className="bg-black/30 rounded-xl p-3 text-white text-sm">
          {orientation === 'landscape' ? (
            <>
              <span className="hidden sm:inline">Arrows: Move/Jump</span>
              <span className="sm:hidden">Swipe: Move • Swipe Up: Jump</span>
            </>
          ) : null}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
        gl={{ antialias: false }} // Performance optimization
      >
        <fog attach="fog" args={['#87CEEB', 10, 100]} />
        
        <Lighting />
        <Sky />
        
        {/* Player */}
        <Player 
          lane={playerLane} 
          isJumping={isJumping} 
          jumpStartTime={jumpStartTime} 
        />
        
        {/* Terrain segments */}
        {Array.from({ length: TEMPLE_RUN.VISIBLE_SEGMENTS }, (_, i) => (
          <Terrain
            key={i}
            position={[0, -0.5, -i * TEMPLE_RUN.TERRAIN_SEGMENT_LENGTH]}
            segment={i}
          />
        ))}
        
        {/* Environment objects */}
        <Temple position={[-15, 0, -20]} />
        <Temple position={[15, 0, -35]} />
        <Vegetation position={[-8, 0, -15]} />
        <Vegetation position={[8, 0, -25]} />
        <Vegetation position={[-12, 0, -40]} />
        
        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <Obstacle
            key={obstacle.id}
            position={obstacle.position}
            type={obstacle.type}
            onCollision={handleCollision}
          />
        ))}
      </Canvas>

      {/* TODO Comments for future enhancements */}
      {/* 
        TODO: Add sound effects for running, jumping, collisions
        TODO: Add particle effects for dust trails and collision sparks
        TODO: Add power-ups (speed boost, invincibility, score multiplier)
        TODO: Add confetti animation for high scores
        TODO: Add different temple themes and environments
        TODO: Add character selection and customization
        TODO: Add daily challenges and achievements
        TODO: Add multiplayer racing mode
        TODO: Add coin collection mechanics
        TODO: Add more obstacle types and interactive elements
      */}
    </div>
  );
};