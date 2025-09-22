import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  enteredZoneTime?: number; // Track when emoji enters the center zone
  isInZone: boolean; // Track if emoji is currently in zone
}

// Metrics tracking interfaces
interface ClickEvent {
  timestamp: number;
  emojiId: number;
  emoji: string;
  isCorrect: boolean;
  isInZone: boolean;
  reactionTime?: number; // Time from entering zone to click
  gameTime: number; // Time elapsed in game
}

interface SymbolSpotterMetrics {
  // Precision Metrics
  click_accuracy: number;
  false_positives: number;
  missed_opportunities: number;
  reaction_time: number;

  // Attention Metrics
  attention_span: number[];
  distractor_resistance: number;

  // Impulsivity Metrics
  premature_clicks: number;
  click_restraint: number;
  click_pattern: "rapid_fire" | "calculated";

  // Raw data for detailed analysis
  all_clicks: ClickEvent[];
  symbols_in_zone: Array<{
    emojiId: number;
    emoji: string;
    enteredTime: number;
    exitedTime?: number;
    wasClicked: boolean;
    isCorrect?: boolean;
  }>;
  game_duration: number;
  total_symbols_spawned: number;
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

const GAME_DURATION = 30000; // 30 seconds for better gameplay
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

  // Metrics tracking state
  const [allClicks, setAllClicks] = useState<ClickEvent[]>([]);
  const [symbolsInZone, setSymbolsInZone] = useState<
    Array<{
      emojiId: number;
      emoji: string;
      enteredTime: number;
      exitedTime?: number;
      wasClicked: boolean;
      isCorrect?: boolean;
    }>
  >([]);
  const [totalSymbolsSpawned, setTotalSymbolsSpawned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickTimes, setClickTimes] = useState<number[]>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const emojiIdCounter = useRef(0);

  // Refs to store current metrics data for accurate calculation
  const metricsDataRef = useRef({
    allClicks: [] as ClickEvent[],
    symbolsInZone: [] as Array<{
      emojiId: number;
      emoji: string;
      enteredTime: number;
      exitedTime?: number;
      wasClicked: boolean;
      isCorrect?: boolean;
    }>,
    totalSymbolsSpawned: 0,
    clickTimes: [] as number[],
  });

  // Ref to store current score for accurate session data
  const scoreRef = useRef(0);

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
    if (!gameAreaRef.current) {
      return null;
    }

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
      isInZone: false, // Initialize as not in zone
    };

    // Calculate angle for straight line movement
    const dx = emoji.targetX - emoji.x;
    const dy = emoji.targetY - emoji.y;
    emoji.angle = Math.atan2(dy, dx);

    // Increment total symbols spawned for metrics
    setTotalSymbolsSpawned((prev) => prev + 1);

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
    if (!gameAreaRef.current) return;

    const width = gameAreaRef.current.offsetWidth;
    const height = gameAreaRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const boxLeft = centerX - CENTER_BOX_SIZE / 2;
    const boxRight = centerX + CENTER_BOX_SIZE / 2;
    const boxTop = centerY - CENTER_BOX_SIZE / 2;
    const boxBottom = centerY + CENTER_BOX_SIZE / 2;

    setFlyingEmojis((prev) =>
      prev
        .map((emoji) => {
          // Don't move emojis that are animating
          if (emoji.clickAnimation) {
            return emoji;
          }

          const newX = emoji.x + Math.cos(emoji.angle) * emoji.speed;
          const newY = emoji.y + Math.sin(emoji.angle) * emoji.speed;

          // Check if emoji is now in the center zone
          const wasInZone = emoji.isInZone;
          const isNowInZone =
            newX >= boxLeft &&
            newX <= boxRight &&
            newY >= boxTop &&
            newY <= boxBottom;

          let updatedEmoji = {
            ...emoji,
            x: newX,
            y: newY,
            isInZone: isNowInZone,
          };

          // Track zone entry for metrics
          if (!wasInZone && isNowInZone) {
            updatedEmoji.enteredZoneTime = Date.now();
            // Add to symbols in zone tracking
            setSymbolsInZone((prevSymbols) => [
              ...prevSymbols,
              {
                emojiId: emoji.id,
                emoji: emoji.emoji,
                enteredTime: Date.now(),
                wasClicked: false,
              },
            ]);
          }

          // Track zone exit for metrics
          if (wasInZone && !isNowInZone && emoji.enteredZoneTime) {
            setSymbolsInZone((prevSymbols) =>
              prevSymbols.map((symbol) =>
                symbol.emojiId === emoji.id && !symbol.exitedTime
                  ? { ...symbol, exitedTime: Date.now() }
                  : symbol
              )
            );
          }

          return updatedEmoji;
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

      const currentTime = Date.now();
      const gameTime = currentTime - gameStartTime;
      const isInZone = isEmojiInCenterBox(clickedEmoji);
      const isCorrect = clickedEmoji.emoji === targetEmoji && isInZone;

      // Calculate reaction time if emoji was in zone
      let reactionTime: number | undefined;
      if (clickedEmoji.enteredZoneTime && isInZone) {
        reactionTime = currentTime - clickedEmoji.enteredZoneTime;
      }

      // Record click event for metrics
      const clickEvent: ClickEvent = {
        timestamp: currentTime,
        emojiId: clickedEmoji.id,
        emoji: clickedEmoji.emoji,
        isCorrect,
        isInZone,
        reactionTime,
        gameTime,
      };

      setAllClicks((prev) => [...prev, clickEvent]);

      // Track click timing for click pattern analysis
      setClickTimes((prev) => [...prev, currentTime]);
      setLastClickTime(currentTime);

      // Update symbols in zone tracking
      if (isInZone) {
        setSymbolsInZone((prevSymbols) =>
          prevSymbols.map((symbol) =>
            symbol.emojiId === clickedEmoji.id
              ? { ...symbol, wasClicked: true, isCorrect }
              : symbol
          )
        );

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
                  animationStartTime: currentTime,
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
      gameStartTime,
    ]
  );

  // Metrics calculation function
  const calculateMetrics = useCallback((): SymbolSpotterMetrics => {
    const totalClicks = allClicks.length;
    const correctClicks = allClicks.filter((click) => click.isCorrect).length;
    const clicksInZone = allClicks.filter((click) => click.isInZone).length;
    const clicksOutsideZone = totalClicks - clicksInZone;

    // Precision Metrics
    const clickAccuracy = totalClicks > 0 ? correctClicks / totalClicks : 0;
    const falsePositives = allClicks.filter(
      (click) => click.isInZone && !click.isCorrect
    ).length;
    const correctSymbolsInZone = symbolsInZone.filter(
      (symbol) => symbol.emoji === targetEmoji
    );
    const missedOpportunities = correctSymbolsInZone.filter(
      (symbol) => !symbol.wasClicked
    ).length;

    // Calculate average reaction time
    const reactionTimes = allClicks
      .filter((click) => click.reactionTime !== undefined)
      .map((click) => click.reactionTime!);
    const avgReactionTime =
      reactionTimes.length > 0
        ? reactionTimes.reduce((sum, time) => sum + time, 0) /
          reactionTimes.length
        : 0;

    // Attention Metrics - accuracy over time segments
    const gameDuration = GAME_DURATION;
    const segmentDuration = gameDuration / 4; // 7.5 seconds each
    const attentionSpan: number[] = [];

    for (let i = 0; i < 4; i++) {
      const segmentStart = i * segmentDuration;
      const segmentEnd = (i + 1) * segmentDuration;
      const segmentClicks = allClicks.filter(
        (click) => click.gameTime >= segmentStart && click.gameTime < segmentEnd
      );
      const segmentCorrect = segmentClicks.filter(
        (click) => click.isCorrect
      ).length;
      const segmentAccuracy =
        segmentClicks.length > 0 ? segmentCorrect / segmentClicks.length : 0;
      attentionSpan.push(segmentAccuracy);
    }

    // Distractor resistance - accuracy when multiple symbols are present
    // This is approximated by looking at accuracy during high-activity periods
    const highActivityPeriods = allClicks.filter((click, index) => {
      const timeWindow = 2000; // 2 second window
      const nearbyClicks = allClicks.filter(
        (otherClick) =>
          Math.abs(otherClick.timestamp - click.timestamp) <= timeWindow
      );
      return nearbyClicks.length >= 3; // 3+ clicks in 2 seconds = high activity
    });
    const distractorResistance =
      highActivityPeriods.length > 0
        ? highActivityPeriods.filter((click) => click.isCorrect).length /
          highActivityPeriods.length
        : clickAccuracy;

    // Impulsivity Metrics
    const prematureClicks = clicksOutsideZone; // Clicks outside the zone are premature
    const clickRestraint =
      symbolsInZone.length > 0
        ? (symbolsInZone.length -
            symbolsInZone.filter(
              (symbol) => symbol.wasClicked && !symbol.isCorrect
            ).length) /
          symbolsInZone.length
        : 1;

    // Click pattern analysis
    let clickPattern: "rapid_fire" | "calculated" = "calculated";
    if (clickTimes.length >= 3) {
      const intervals = [];
      for (let i = 1; i < clickTimes.length; i++) {
        intervals.push(clickTimes[i] - clickTimes[i - 1]);
      }
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      const rapidFireThreshold = 800; // Less than 800ms between clicks on average = rapid fire
      if (avgInterval < rapidFireThreshold) {
        clickPattern = "rapid_fire";
      }
    }

    return {
      click_accuracy: clickAccuracy,
      false_positives: falsePositives,
      missed_opportunities: missedOpportunities,
      reaction_time: avgReactionTime,
      attention_span: attentionSpan,
      distractor_resistance: distractorResistance,
      premature_clicks: prematureClicks,
      click_restraint: clickRestraint,
      click_pattern: clickPattern,
      all_clicks: allClicks,
      symbols_in_zone: symbolsInZone,
      game_duration: gameDuration,
      total_symbols_spawned: totalSymbolsSpawned,
    };
  }, [allClicks, symbolsInZone, targetEmoji, totalSymbolsSpawned, clickTimes]);

  // Keep refs in sync with state for accurate metrics calculation
  useEffect(() => {
    metricsDataRef.current.allClicks = allClicks;
  }, [allClicks]);

  useEffect(() => {
    metricsDataRef.current.symbolsInZone = symbolsInZone;
  }, [symbolsInZone]);

  useEffect(() => {
    metricsDataRef.current.totalSymbolsSpawned = totalSymbolsSpawned;
  }, [totalSymbolsSpawned]);

  useEffect(() => {
    metricsDataRef.current.clickTimes = clickTimes;
  }, [clickTimes]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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

  const calculateMetricsFromRefs = useCallback((): SymbolSpotterMetrics => {
    const { allClicks, symbolsInZone, totalSymbolsSpawned, clickTimes } =
      metricsDataRef.current;

    // Debug: Log metrics calculation data
    console.log("Calculating metrics from refs:", {
      allClicksCount: allClicks.length,
      symbolsInZoneCount: symbolsInZone.length,
      totalSymbolsSpawned,
      clickTimesCount: clickTimes.length,
    });

    const totalClicks = allClicks.length;
    const correctClicks = allClicks.filter((click) => click.isCorrect).length;
    const clicksInZone = allClicks.filter((click) => click.isInZone).length;
    const clicksOutsideZone = totalClicks - clicksInZone;

    // Precision Metrics
    const clickAccuracy = totalClicks > 0 ? correctClicks / totalClicks : 0;
    const falsePositives = allClicks.filter(
      (click) => click.isInZone && !click.isCorrect
    ).length;
    const correctSymbolsInZone = symbolsInZone.filter(
      (symbol) => symbol.emoji === targetEmoji
    );
    const missedOpportunities = correctSymbolsInZone.filter(
      (symbol) => !symbol.wasClicked
    ).length;

    // Calculate average reaction time
    const reactionTimes = allClicks
      .filter((click) => click.reactionTime !== undefined)
      .map((click) => click.reactionTime!);
    const avgReactionTime =
      reactionTimes.length > 0
        ? reactionTimes.reduce((sum, time) => sum + time, 0) /
          reactionTimes.length
        : 0;

    // Attention Metrics - accuracy over time segments
    const gameDuration = GAME_DURATION;
    const segmentDuration = gameDuration / 4; // 7.5 seconds each
    const attentionSpan: number[] = [];

    for (let i = 0; i < 4; i++) {
      const segmentStart = i * segmentDuration;
      const segmentEnd = (i + 1) * segmentDuration;
      const segmentClicks = allClicks.filter(
        (click) => click.gameTime >= segmentStart && click.gameTime < segmentEnd
      );
      const segmentCorrect = segmentClicks.filter(
        (click) => click.isCorrect
      ).length;
      const segmentAccuracy =
        segmentClicks.length > 0 ? segmentCorrect / segmentClicks.length : 0;
      attentionSpan.push(segmentAccuracy);
    }

    // Distractor resistance - accuracy when multiple symbols are present
    const highActivityPeriods = allClicks.filter((click, index) => {
      const timeWindow = 2000; // 2 second window
      const nearbyClicks = allClicks.filter(
        (otherClick) =>
          Math.abs(otherClick.timestamp - click.timestamp) <= timeWindow
      );
      return nearbyClicks.length >= 3; // 3+ clicks in 2 seconds = high activity
    });
    const distractorResistance =
      highActivityPeriods.length > 0
        ? highActivityPeriods.filter((click) => click.isCorrect).length /
          highActivityPeriods.length
        : clickAccuracy;

    // Impulsivity Metrics
    const prematureClicks = clicksOutsideZone; // Clicks outside the zone are premature
    const clickRestraint =
      symbolsInZone.length > 0
        ? (symbolsInZone.length -
            symbolsInZone.filter(
              (symbol) => symbol.wasClicked && !symbol.isCorrect
            ).length) /
          symbolsInZone.length
        : 1;

    // Click pattern analysis
    let clickPattern: "rapid_fire" | "calculated" = "calculated";
    if (clickTimes.length >= 3) {
      const intervals = [];
      for (let i = 1; i < clickTimes.length; i++) {
        intervals.push(clickTimes[i] - clickTimes[i - 1]);
      }
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      const rapidFireThreshold = 800; // Less than 800ms between clicks on average = rapid fire
      if (avgInterval < rapidFireThreshold) {
        clickPattern = "rapid_fire";
      }
    }

    return {
      click_accuracy: clickAccuracy,
      false_positives: falsePositives,
      missed_opportunities: missedOpportunities,
      reaction_time: avgReactionTime,
      attention_span: attentionSpan,
      distractor_resistance: distractorResistance,
      premature_clicks: prematureClicks,
      click_restraint: clickRestraint,
      click_pattern: clickPattern,
      all_clicks: allClicks,
      symbols_in_zone: symbolsInZone,
      game_duration: gameDuration,
      total_symbols_spawned: totalSymbolsSpawned,
    };
  }, [targetEmoji]);

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

        // Calculate comprehensive metrics using current ref values
    if (gameSession.isSessionActive) {
      try {
        const metrics = calculateMetricsFromRefs();
        const currentScore = scoreRef.current;
        const success = currentScore > 0; // Game is successful if score is positive
        
        console.log("Game ending with metrics:", {
          score: currentScore,
          success,
          totalClicks: metricsDataRef.current.allClicks.length,
          totalSymbolsSpawned: metricsDataRef.current.totalSymbolsSpawned,
          symbolsInZone: metricsDataRef.current.symbolsInZone.length,
          metrics,
        });
        
        await gameSession.endSession(success, currentScore, {
          metrics,
        });
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    }
  }, [gameState, gameSession, calculateMetricsFromRefs]);

  const resetGame = useCallback(() => {
    setGameState("instructions");
    setScore(0);
    setFlyingEmojis([]);
    setGameTimeLeft(GAME_DURATION);

    // Reset metrics tracking state
    setAllClicks([]);
    setSymbolsInZone([]);
    setTotalSymbolsSpawned(0);
    setGameStartTime(0);
    setLastClickTime(0);
    setClickTimes([]);

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

      // Initialize metrics tracking
      setAllClicks([]);
      setSymbolsInZone([]);
      setTotalSymbolsSpawned(0);
      setClickTimes([]);
      const startTime = Date.now();
      setGameStartTime(startTime);

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Start spawning emojis
        spawnEmoji();

        // Start animation loop
        animationFrameRef.current = requestAnimationFrame(updateEmojiPositions);
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
  }, [gameState]); // Keep minimal dependencies to avoid infinite re-renders

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
      {gameState === "instructions" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 via-yellow-200/80 to-red-200/80 backdrop-blur-sm" />

          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-orange-700 mb-2">
                Symbol Spotter
              </h2>
              <p className="text-orange-600 text-lg">
                Catch the flying symbols!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 bg-orange-50/60 rounded-2xl p-4 border border-orange-200">
                <div className="text-3xl">👀</div>
                <div>
                  <p className="font-bold text-orange-700">Watch!</p>
                  <p className="text-sm text-orange-600">
                    Look for the target symbol at the top
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-yellow-50/60 rounded-2xl p-4 border border-yellow-200">
                <div className="text-3xl">🎯</div>
                <div>
                  <p className="font-bold text-yellow-700">Click!</p>
                  <p className="text-sm text-yellow-600">
                    Click the target symbol when it's in the center box
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-red-50/60 rounded-2xl p-4 border border-red-200">
                <div className="text-3xl">⏱️</div>
                <div>
                  <p className="font-bold text-red-700">Quick!</p>
                  <p className="text-sm text-red-600">
                    You have 30 seconds to score as much as possible
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-green-50/60 rounded-2xl p-4 border border-green-200">
                <div className="text-3xl">📊</div>
                <div>
                  <p className="font-bold text-green-700">Score!</p>
                  <p className="text-sm text-green-600">
                    +1 for correct, -1 for wrong clicks
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={startCountdown}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Let's Play
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <header className="bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-white shadow-xl relative z-30">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="group flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium text-sm">Back to Games</span>
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
                Symbol Spotter
              </h1>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>

            {/* Target Emoji Display */}
            {(gameState === "playing" || gameState === "completed") && (
              <div className="flex items-center justify-center mt-4 gap-4">
                <span className="text-lg font-semibold">Target:</span>
                <div className="text-4xl bg-white/20 rounded-full px-4 py-2">
                  {targetEmoji}
                </div>
                <div className="text-lg font-bold">Score: {score}</div>
                {gameState === "playing" && (
                  <div className="text-lg font-bold">
                    Time: {Math.ceil(gameTimeLeft / 1000)}s
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

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
