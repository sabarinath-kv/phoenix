import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
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

// Enhanced metrics tracking interfaces
interface ClickEvent {
  timestamp: number;
  bubbleId: number;
  clickX: number;
  clickY: number;
  bubbleX: number;
  bubbleY: number;
  bubbleSize: number;
  isHit: boolean;
  distance?: number;
  accuracy?: number;
  reactionTime?: number;
  gameTime: number;
  screenQuadrant: number; // 1-4 for screen coverage analysis
}

interface BubblePoppedEvent {
  timestamp: number;
  bubbleId: number;
  bubbleSize: number;
  bubbleAge: number; // How long the bubble existed
  gameTime: number;
  screenQuadrant: number;
  wasLargestAvailable: boolean;
  wasNearestToCenter: boolean;
  wasInTrajectory: boolean; // If bubble was moving toward user's last click area
}

interface BubblePoppingMetrics {
  // Speed Metrics
  pop_velocity: number;
  movement_pattern: "systematic" | "random" | "nearest_first";
  screen_coverage: number;

  // Strategy Metrics
  prioritization: number; // 0-1 score for targeting big bubbles first
  planning_ahead: number; // 0-1 score for trajectory-based popping
  risk_taking: number; // 0-1 score for going after difficult bubbles

  // Persistence Metrics
  effort_consistency: number; // 0-1 score for maintaining speed
  frustration_point: number; // Time when performance drops significantly
  recovery_from_misses: number; // Speed recovery after missing

  // Raw data for analysis
  all_clicks: ClickEvent[];
  bubbles_popped: BubblePoppedEvent[];
  game_duration: number;
  total_bubbles_spawned: number;
  screen_quadrant_usage: number[]; // Usage count for each quadrant
  pop_velocity_over_time: Array<{ time: number; velocity: number }>;
  miss_streaks: number[]; // Lengths of consecutive miss streaks
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

  // Enhanced metrics tracking state
  const [allClicks, setAllClicks] = useState<ClickEvent[]>([]);
  const [bubblesPopped, setBubblesPopped] = useState<BubblePoppedEvent[]>([]);
  const [totalBubblesSpawned, setTotalBubblesSpawned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [screenQuadrantUsage, setScreenQuadrantUsage] = useState<number[]>([
    0, 0, 0, 0,
  ]);
  const [popVelocityOverTime, setPopVelocityOverTime] = useState<
    Array<{ time: number; velocity: number }>
  >([]);
  const [missStreaks, setMissStreaks] = useState<number[]>([]);
  const [currentMissStreak, setCurrentMissStreak] = useState(0);
  const [lastClickPosition, setLastClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const bubbleIdCounter = useRef(0);

  // Refs to store current metrics data for accurate calculation
  const metricsDataRef = useRef({
    allClicks: [] as ClickEvent[],
    bubblesPopped: [] as BubblePoppedEvent[],
    totalBubblesSpawned: 0,
    screenQuadrantUsage: [0, 0, 0, 0],
    popVelocityOverTime: [] as Array<{ time: number; velocity: number }>,
    missStreaks: [] as number[],
  });

  // Ref to store current score for accurate session data
  const scoreRef = useRef(0);

  // Keep refs in sync with state for accurate metrics calculation
  useEffect(() => {
    metricsDataRef.current.allClicks = allClicks;
  }, [allClicks]);

  useEffect(() => {
    metricsDataRef.current.bubblesPopped = bubblesPopped;
  }, [bubblesPopped]);

  useEffect(() => {
    metricsDataRef.current.totalBubblesSpawned = totalBubblesSpawned;
  }, [totalBubblesSpawned]);

  useEffect(() => {
    metricsDataRef.current.screenQuadrantUsage = screenQuadrantUsage;
  }, [screenQuadrantUsage]);

  useEffect(() => {
    metricsDataRef.current.popVelocityOverTime = popVelocityOverTime;
  }, [popVelocityOverTime]);

  useEffect(() => {
    metricsDataRef.current.missStreaks = missStreaks;
  }, [missStreaks]);

  useEffect(() => {
    scoreRef.current = metrics.score;
  }, [metrics.score]);

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

    // Track total bubbles spawned for metrics
    setTotalBubblesSpawned((prev) => prev + 1);

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

  // Helper functions for metrics tracking
  const getScreenQuadrant = useCallback((x: number, y: number): number => {
    if (!gameAreaRef.current) return 1;

    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;
    const midX = width / 2;
    const midY = height / 2;

    if (x <= midX && y <= midY) return 1; // Top-left
    if (x > midX && y <= midY) return 2; // Top-right
    if (x <= midX && y > midY) return 3; // Bottom-left
    return 4; // Bottom-right
  }, []);

  const findLargestBubble = useCallback(
    (availableBubbles: Bubble[]): Bubble | null => {
      if (availableBubbles.length === 0) return null;
      return availableBubbles.reduce((largest, bubble) =>
        bubble.size > largest.size ? bubble : largest
      );
    },
    []
  );

  const findNearestBubbleToCenter = useCallback(
    (availableBubbles: Bubble[]): Bubble | null => {
      if (!gameAreaRef.current || availableBubbles.length === 0) return null;

      const centerX = gameAreaRef.current.offsetWidth / 2;
      const centerY = gameAreaRef.current.offsetHeight / 2;

      return availableBubbles.reduce((nearest, bubble) => {
        const bubbleCenterX = bubble.x + bubble.size / 2;
        const bubbleCenterY = bubble.y + bubble.size / 2;
        const distToBubble = calculateDistance(
          centerX,
          centerY,
          bubbleCenterX,
          bubbleCenterY
        );

        const nearestCenterX = nearest.x + nearest.size / 2;
        const nearestCenterY = nearest.y + nearest.size / 2;
        const distToNearest = calculateDistance(
          centerX,
          centerY,
          nearestCenterX,
          nearestCenterY
        );

        return distToBubble < distToNearest ? bubble : nearest;
      });
    },
    []
  );

  const isBubbleInTrajectory = useCallback(
    (bubble: Bubble, lastClick: { x: number; y: number } | null): boolean => {
      if (!lastClick) return false;

      // Simple trajectory check: is bubble moving towards the last click area?
      const bubbleCenterX = bubble.x + bubble.size / 2;
      const bubbleCenterY = bubble.y + bubble.size / 2;

      // Calculate if bubble is moving towards the last click position
      const futureX = bubble.x + bubble.velocityX * 100; // 100 frames ahead
      const futureY = bubble.y + bubble.velocityY * 100;

      const currentDist = calculateDistance(
        bubbleCenterX,
        bubbleCenterY,
        lastClick.x,
        lastClick.y
      );
      const futureDist = calculateDistance(
        futureX,
        futureY,
        lastClick.x,
        lastClick.y
      );

      return futureDist < currentDist; // Moving closer
    },
    []
  );

  const handleBubbleClick = useCallback(
    (clickedBubble: Bubble, clickX: number, clickY: number) => {
      if (gameState !== "playing" || clickedBubble.isPopping) return;

      const now = Date.now();
      const gameTime = now - gameStartTime;
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
      const bubbleAge = now - clickedBubble.createdAt;
      const quadrant = getScreenQuadrant(clickX, clickY);

      // Strategy analysis
      const availableBubbles = bubbles.filter(
        (b) => !b.isPopping && b.id !== clickedBubble.id
      );
      const largestBubble = findLargestBubble(availableBubbles);
      const nearestBubble = findNearestBubbleToCenter(availableBubbles);
      const wasLargestAvailable = largestBubble
        ? clickedBubble.size >= largestBubble.size
        : true;
      const wasNearestToCenter = nearestBubble
        ? clickedBubble.id === nearestBubble.id
        : true;
      const wasInTrajectory = isBubbleInTrajectory(
        clickedBubble,
        lastClickPosition
      );

      // Record bubble popped event for metrics
      const bubblePoppedEvent: BubblePoppedEvent = {
        timestamp: now,
        bubbleId: clickedBubble.id,
        bubbleSize: clickedBubble.size,
        bubbleAge,
        gameTime,
        screenQuadrant: quadrant,
        wasLargestAvailable,
        wasNearestToCenter,
        wasInTrajectory,
      };

      setBubblesPopped((prev) => [...prev, bubblePoppedEvent]);

      // Update screen quadrant usage
      setScreenQuadrantUsage((prev) => {
        const newUsage = [...prev];
        newUsage[quadrant - 1]++;
        return newUsage;
      });

      // Track pop velocity over time
      const timeSegment = Math.floor(gameTime / 5000); // 5-second segments
      setPopVelocityOverTime((prev) => {
        const existing = prev.find(
          (p) => Math.floor(p.time / 5000) === timeSegment
        );
        if (existing) {
          existing.velocity++;
        } else {
          prev.push({ time: gameTime, velocity: 1 });
        }
        return [...prev];
      });

      // Reset miss streak on successful pop
      if (currentMissStreak > 0) {
        setMissStreaks((prev) => [...prev, currentMissStreak]);
        setCurrentMissStreak(0);
      }

      // Update last click position for trajectory analysis
      setLastClickPosition({ x: clickX, y: clickY });

      // Calculate score (existing logic)
      const baseScore = Math.round(clickedBubble.size / 10);
      const accuracyBonus = Math.round(accuracy * 50);
      const totalScore = baseScore + accuracyBonus;

      // Update existing metrics
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
    [
      gameState,
      currentTap,
      playPopSound,
      bubbles,
      gameStartTime,
      getScreenQuadrant,
      findLargestBubble,
      findNearestBubbleToCenter,
      isBubbleInTrajectory,
      lastClickPosition,
      currentMissStreak,
    ]
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
      const gameTime = Date.now() - gameStartTime;
      const quadrant = getScreenQuadrant(clickX, clickY);

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

      // Record click event for metrics
      const clickEvent: ClickEvent = {
        timestamp: Date.now(),
        bubbleId: hitBubble?.id || -1,
        clickX,
        clickY,
        bubbleX: hitBubble?.x || 0,
        bubbleY: hitBubble?.y || 0,
        bubbleSize: hitBubble?.size || 0,
        isHit: !!hitBubble,
        distance: hitBubble
          ? calculateDistance(
              clickX,
              clickY,
              hitBubble.x + hitBubble.size / 2,
              hitBubble.y + hitBubble.size / 2
            )
          : undefined,
        accuracy: hitBubble
          ? Math.max(
              0,
              1 -
                calculateDistance(
                  clickX,
                  clickY,
                  hitBubble.x + hitBubble.size / 2,
                  hitBubble.y + hitBubble.size / 2
                ) /
                  (hitBubble.size / 2)
            )
          : 0,
        reactionTime: currentTap ? Date.now() - currentTap.startTime : 0,
        gameTime,
        screenQuadrant: quadrant,
      };

      setAllClicks((prev) => [...prev, clickEvent]);

      if (hitBubble) {
        handleBubbleClick(hitBubble, clickX, clickY);
      } else {
        // Miss - increment miss streak
        setCurrentMissStreak((prev) => prev + 1);

        // Update screen quadrant usage even for misses
        setScreenQuadrantUsage((prev) => {
          const newUsage = [...prev];
          newUsage[quadrant - 1]++;
          return newUsage;
        });

        // Update last click position for trajectory analysis
        setLastClickPosition({ x: clickX, y: clickY });

        // Existing miss logic
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
    [
      gameState,
      currentTap,
      bubbles,
      handleBubbleClick,
      playMissSound,
      gameStartTime,
      getScreenQuadrant,
    ]
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

  // Comprehensive metrics calculation function
  const calculateBubblePoppingMetrics =
    useCallback((): BubblePoppingMetrics => {
      const gameDuration = GAME_DURATION;
      const totalPops = bubblesPopped.length;
      const totalClicks = allClicks.length;

      // Speed Metrics
      const popVelocity = totalPops > 0 ? totalPops / (gameDuration / 1000) : 0;

      // Movement pattern analysis
      let movementPattern: "systematic" | "random" | "nearest_first" = "random";
      if (bubblesPopped.length > 5) {
        const nearestFirstCount = bubblesPopped.filter(
          (pop) => pop.wasNearestToCenter
        ).length;
        const largestFirstCount = bubblesPopped.filter(
          (pop) => pop.wasLargestAvailable
        ).length;

        if (nearestFirstCount / totalPops > 0.6) {
          movementPattern = "nearest_first";
        } else if (largestFirstCount / totalPops > 0.6) {
          movementPattern = "systematic";
        }
      }

      // Screen coverage - percentage of screen quadrants used
      const usedQuadrants = screenQuadrantUsage.filter(
        (usage) => usage > 0
      ).length;
      const screenCoverage = usedQuadrants / 4;

      // Strategy Metrics
      const prioritization =
        totalPops > 0
          ? bubblesPopped.filter((pop) => pop.wasLargestAvailable).length /
            totalPops
          : 0;

      const planningAhead =
        totalPops > 0
          ? bubblesPopped.filter((pop) => pop.wasInTrajectory).length /
            totalPops
          : 0;

      // Risk taking - going for smaller, harder to hit bubbles
      const avgBubbleSize =
        bubblesPopped.length > 0
          ? bubblesPopped.reduce((sum, pop) => sum + pop.bubbleSize, 0) /
            bubblesPopped.length
          : 0;
      const maxPossibleSize = MAX_BUBBLE_SIZE;
      const riskTaking =
        avgBubbleSize > 0 ? 1 - avgBubbleSize / maxPossibleSize : 0;

      // Persistence Metrics
      // Effort consistency - variance in pop velocity over time
      let effortConsistency = 1;
      if (popVelocityOverTime.length > 2) {
        const velocities = popVelocityOverTime.map((v) => v.velocity);
        const avgVelocity =
          velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
        const variance =
          velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) /
          velocities.length;
        effortConsistency = Math.max(0, 1 - variance / (avgVelocity || 1));
      }

      // Frustration point - when performance significantly drops
      let frustrationPoint = gameDuration; // Default to end of game
      if (popVelocityOverTime.length > 3) {
        const firstHalfAvg = popVelocityOverTime
          .filter((v) => v.time < gameDuration / 2)
          .reduce((sum, v, _, arr) => sum + v.velocity / arr.length, 0);

        for (
          let i = Math.floor(popVelocityOverTime.length / 2);
          i < popVelocityOverTime.length;
          i++
        ) {
          const segment = popVelocityOverTime[i];
          if (segment.velocity < firstHalfAvg * 0.6) {
            // 40% drop
            frustrationPoint = segment.time;
            break;
          }
        }
      }

      // Recovery from misses - how quickly speed recovers after miss streaks
      let recoveryFromMisses = 1;
      if (missStreaks.length > 0 && allClicks.length > 10) {
        const avgMissStreak =
          missStreaks.reduce((sum, streak) => sum + streak, 0) /
          missStreaks.length;
        recoveryFromMisses = Math.max(0, 1 - avgMissStreak / 10); // Normalize to 0-1
      }

      return {
        pop_velocity: popVelocity,
        movement_pattern: movementPattern,
        screen_coverage: screenCoverage,
        prioritization,
        planning_ahead: planningAhead,
        risk_taking: riskTaking,
        effort_consistency: effortConsistency,
        frustration_point: frustrationPoint,
        recovery_from_misses: recoveryFromMisses,
        all_clicks: allClicks,
        bubbles_popped: bubblesPopped,
        game_duration: gameDuration,
        total_bubbles_spawned: totalBubblesSpawned,
        screen_quadrant_usage: screenQuadrantUsage,
        pop_velocity_over_time: popVelocityOverTime,
        miss_streaks: missStreaks,
      };
    }, [
      allClicks,
      bubblesPopped,
      totalBubblesSpawned,
      screenQuadrantUsage,
      popVelocityOverTime,
      missStreaks,
    ]);

  // Metrics calculation using current ref values
  const calculateBubblePoppingMetricsFromRefs =
    useCallback((): BubblePoppingMetrics => {
      const {
        allClicks,
        bubblesPopped,
        totalBubblesSpawned,
        screenQuadrantUsage,
        popVelocityOverTime,
        missStreaks,
      } = metricsDataRef.current;

      const gameDuration = GAME_DURATION;
      const totalPops = bubblesPopped.length;
      const totalClicks = allClicks.length;

      // Speed Metrics
      const popVelocity = totalPops > 0 ? totalPops / (gameDuration / 1000) : 0;

      // Movement pattern analysis
      let movementPattern: "systematic" | "random" | "nearest_first" = "random";
      if (bubblesPopped.length > 5) {
        const nearestFirstCount = bubblesPopped.filter(
          (pop) => pop.wasNearestToCenter
        ).length;
        const largestFirstCount = bubblesPopped.filter(
          (pop) => pop.wasLargestAvailable
        ).length;

        if (nearestFirstCount / totalPops > 0.6) {
          movementPattern = "nearest_first";
        } else if (largestFirstCount / totalPops > 0.6) {
          movementPattern = "systematic";
        }
      }

      // Screen coverage - percentage of screen quadrants used
      const usedQuadrants = screenQuadrantUsage.filter(
        (usage) => usage > 0
      ).length;
      const screenCoverage = usedQuadrants / 4;

      // Strategy Metrics
      const prioritization =
        totalPops > 0
          ? bubblesPopped.filter((pop) => pop.wasLargestAvailable).length /
            totalPops
          : 0;

      const planningAhead =
        totalPops > 0
          ? bubblesPopped.filter((pop) => pop.wasInTrajectory).length /
            totalPops
          : 0;

      // Risk taking - going for smaller, harder to hit bubbles
      const avgBubbleSize =
        bubblesPopped.length > 0
          ? bubblesPopped.reduce((sum, pop) => sum + pop.bubbleSize, 0) /
            bubblesPopped.length
          : 0;
      const maxPossibleSize = MAX_BUBBLE_SIZE;
      const riskTaking =
        avgBubbleSize > 0 ? 1 - avgBubbleSize / maxPossibleSize : 0;

      // Persistence Metrics
      // Effort consistency - variance in pop velocity over time
      let effortConsistency = 1;
      if (popVelocityOverTime.length > 2) {
        const velocities = popVelocityOverTime.map((v) => v.velocity);
        const avgVelocity =
          velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
        const variance =
          velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) /
          velocities.length;
        effortConsistency = Math.max(0, 1 - variance / (avgVelocity || 1));
      }

      // Frustration point - when performance significantly drops
      let frustrationPoint = gameDuration; // Default to end of game
      if (popVelocityOverTime.length > 3) {
        const firstHalfAvg = popVelocityOverTime
          .filter((v) => v.time < gameDuration / 2)
          .reduce((sum, v, _, arr) => sum + v.velocity / arr.length, 0);

        for (
          let i = Math.floor(popVelocityOverTime.length / 2);
          i < popVelocityOverTime.length;
          i++
        ) {
          const segment = popVelocityOverTime[i];
          if (segment.velocity < firstHalfAvg * 0.6) {
            // 40% drop
            frustrationPoint = segment.time;
            break;
          }
        }
      }

      // Recovery from misses - how quickly speed recovers after miss streaks
      let recoveryFromMisses = 1;
      if (missStreaks.length > 0 && allClicks.length > 10) {
        const avgMissStreak =
          missStreaks.reduce((sum, streak) => sum + streak, 0) /
          missStreaks.length;
        recoveryFromMisses = Math.max(0, 1 - avgMissStreak / 10); // Normalize to 0-1
      }

      return {
        pop_velocity: popVelocity,
        movement_pattern: movementPattern,
        screen_coverage: screenCoverage,
        prioritization,
        planning_ahead: planningAhead,
        risk_taking: riskTaking,
        effort_consistency: effortConsistency,
        frustration_point: frustrationPoint,
        recovery_from_misses: recoveryFromMisses,
        all_clicks: allClicks,
        bubbles_popped: bubblesPopped,
        game_duration: gameDuration,
        total_bubbles_spawned: totalBubblesSpawned,
        screen_quadrant_usage: screenQuadrantUsage,
        pop_velocity_over_time: popVelocityOverTime,
        miss_streaks: missStreaks,
      };
    }, []);

  const endGame = useCallback(async () => {
    // Prevent multiple calls
    if (gameState === "completed") return;

    setGameState("completed");

    // Clear all timers and intervals
    if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);

    // Calculate comprehensive metrics and send to session API
    if (gameSession.isSessionActive) {
      try {
        const bubblePoppingMetrics = calculateBubblePoppingMetricsFromRefs();
        const currentScore = scoreRef.current;
        const success = currentScore > 100; // Consider success if score > 100

        await gameSession.endSession(
          success,
          currentScore,
          bubblePoppingMetrics
        );
      } catch (error) {
        console.error("Failed to save game session:", error);
        // Game continues even if session saving fails
      }
    }
  }, [gameState, gameSession, calculateBubblePoppingMetricsFromRefs]);

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

    // Reset enhanced metrics tracking state
    setAllClicks([]);
    setBubblesPopped([]);
    setTotalBubblesSpawned(0);
    setGameStartTime(0);
    setScreenQuadrantUsage([0, 0, 0, 0]);
    setPopVelocityOverTime([]);
    setMissStreaks([]);
    setCurrentMissStreak(0);
    setLastClickPosition(null);

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

      // Initialize enhanced metrics tracking
      setAllClicks([]);
      setBubblesPopped([]);
      setTotalBubblesSpawned(0);
      setScreenQuadrantUsage([0, 0, 0, 0]);
      setPopVelocityOverTime([]);
      setMissStreaks([]);
      setCurrentMissStreak(0);
      setLastClickPosition(null);
      const startTime = Date.now();
      setGameStartTime(startTime);

      // Start spawning bubbles
      setTimeout(() => {
        spawnBubble();
        animationFrameRef.current = requestAnimationFrame(updateBubbles);
      }, 100);

      // Start game timer
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
            subtext: "Click on bubbles to pop them",
          },
          {
            icon: "🎯",
            text: "Accuracy!",
            subtext: "Hit the center for bonus points",
          },
          {
            icon: "⏱️",
            text: "Speed!",
            subtext: "You have 60 seconds",
          },
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
        <header
          className="backdrop-blur-sm relative z-30"
          style={{ height: "100px" }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              {/* Left side - Back button and title */}
              <div className="flex items-center gap-4">
                <BackButton onClick={() => navigate("/")} />
              </div>

              {/* Right side - Score and Timer */}
              {(gameState === "playing" || gameState === "completed") && (
                <div className="flex items-center gap-3">
                  {/* Score */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2 shadow-sm w-[80px]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-lg">🏆</div>
                      <div className="text-sm font-bold text-gray-800 font-mono tabular-nums">
                        {metrics.score}
                      </div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2 shadow-sm w-[80px]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-lg">⏱️</div>
                      <div className="text-sm font-bold text-gray-800 font-mono tabular-nums">
                        {Math.ceil(gameTimeLeft / 1000)}s
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
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
                <h2 className="text-2xl font-bold text-black-700 mb-2">
                  Game Complete!
                </h2>
                <p className="text-black-600 text-lg">
                  {metrics.score >= 500
                    ? "Amazing! You're a bubble master!"
                    : metrics.score >= 300
                    ? "Great job! You popped those bubbles!"
                    : metrics.score >= 100
                    ? "Good work! Keep practicing your aim!"
                    : "Keep practicing to improve your popping skills!"}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 bg-black-50/60 rounded-2xl p-4 border border-black-200">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="font-bold text-black-700">Final Score</p>
                    <p className="text-2xl font-bold text-black-800">
                      {metrics.score}
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
                      {gameRedirect.isLastGame ? "Finish" : "Go to Next Game"}
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
