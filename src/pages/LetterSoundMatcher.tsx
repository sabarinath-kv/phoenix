import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LETTER_SOUND, LETTER_SOUND_ITEMS } from "@/constants/game";

type GameState = "instructions" | "countdown" | "playing" | "completed";

interface GameCard {
  letter: string;
  word: string;
  image: string;
  isCorrect: boolean;
}

interface GameStats {
  score: number;
  currentRound: number;
  totalRounds: number;
}

export const LetterSoundMatcher = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [countdown, setCountdown] = useState<number>(LETTER_SOUND.COUNTDOWN_DURATION);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    currentRound: 0,
    totalRounds: LETTER_SOUND.TOTAL_ROUNDS
  });
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [currentItem, setCurrentItem] = useState<typeof LETTER_SOUND_ITEMS[0]>(LETTER_SOUND_ITEMS[0]);
  const [clickedCardIndex, setClickedCardIndex] = useState<number | null>(null);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);

  // Refs for cleanup
  const countdownTimerRef = useRef<NodeJS.Timeout>();
  const roundDelayRef = useRef<NodeJS.Timeout>();

  // Speech synthesis function with consistent settings (same as LetterReversalSpotter)
  const speakLetter = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait a moment for cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(`Capital ${letter}`);
        
        // Consistent voice settings for all questions
        utterance.rate = 0.7;        // Slower, consistent rate
        utterance.pitch = 1.1;       // Consistent pitch
        utterance.volume = 0.9;      // Consistent volume
        utterance.lang = 'en-US';    // Consistent language
        
        // Try to use the same voice consistently
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        // Priority order for consistent voice selection
        const preferredVoices = [
          'Microsoft Zira - English (United States)',
          'Google US English',
          'Alex',
          'Samantha',
          'Karen',
          'Microsoft David - English (United States)'
        ];
        
        // Find the first available preferred voice
        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find(voice => voice.name === voiceName);
          if (selectedVoice) break;
        }
        
        // Fallback to first English voice if no preferred voice found
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Female') || voice.name.includes('Woman'))
          );
        }
        
        // Final fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  }, []);

  // Generate cards for current round
  const generateCards = useCallback((correctItem: typeof LETTER_SOUND_ITEMS[0]) => {
    const cards: GameCard[] = [];
    
    // Add correct card
    cards.push({
      ...correctItem,
      isCorrect: true
    });

    // Add 3 random distractors
    const otherItems = LETTER_SOUND_ITEMS.filter(item => item.letter !== correctItem.letter);
    const shuffledOthers = otherItems.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3; i++) {
      cards.push({
        ...shuffledOthers[i],
        isCorrect: false
      });
    }

    // Shuffle all cards
    return cards.sort(() => Math.random() - 0.5);
  }, []);

  // Handle card click
  const handleCardClick = useCallback((cardIndex: number, isCorrect: boolean) => {
    if (gameState !== "playing" || clickedCardIndex !== null) return;

    setClickedCardIndex(cardIndex);

    if (isCorrect) {
      // Correct answer
      setStats(prev => ({
        ...prev,
        score: prev.score + LETTER_SOUND.SCORE_INCREMENT
      }));
      
      // Show score animation
      setShowScoreAnimation(true);
      setTimeout(() => setShowScoreAnimation(false), 1000);

      // Move to next round after delay
      roundDelayRef.current = setTimeout(() => {
        const nextRound = stats.currentRound + 1;
        
        if (nextRound >= LETTER_SOUND.TOTAL_ROUNDS) {
          // Game completed
          setGameState("completed");
        } else {
          // Next round
          const nextItem = LETTER_SOUND_ITEMS[nextRound];
          setCurrentItem(nextItem as typeof LETTER_SOUND_ITEMS[0]);
          setStats(prev => ({ ...prev, currentRound: nextRound }));
          setGameCards(generateCards(nextItem as typeof LETTER_SOUND_ITEMS[0]));
          setClickedCardIndex(null);
          
          // Speak the next letter after a short delay
          setTimeout(() => speakLetter(nextItem.letter), 500);
        }
      }, LETTER_SOUND.ROUND_DELAY);
    } else {
      // Wrong answer - just reset click state after animation
      setTimeout(() => {
        setClickedCardIndex(null);
      }, 600);
    }
  }, [gameState, clickedCardIndex, stats.currentRound, generateCards, speakLetter]);

  // Start countdown
  const startCountdown = useCallback(() => {
    console.log("Starting countdown..."); // Debug log
    setGameState("countdown");
    
    // Simple countdown: 3, 2, 1, then start
    let currentCount = LETTER_SOUND.COUNTDOWN_DURATION;
    setCountdown(currentCount);

    // Clear any existing countdown timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }

    const countdownInterval = setInterval(() => {
      currentCount--;
      console.log("Countdown tick:", currentCount); // Debug log
      
      if (currentCount <= 0) {
        console.log("Countdown finished, starting game"); // Debug log
        clearInterval(countdownInterval);
        countdownTimerRef.current = undefined;
        setGameState("playing");
      } else {
        setCountdown(currentCount);
      }
    }, 1000);

    countdownTimerRef.current = countdownInterval;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState("instructions");
    setStats({
      score: 0,
      currentRound: 0,
      totalRounds: LETTER_SOUND.TOTAL_ROUNDS
    });
    setCurrentItem(LETTER_SOUND_ITEMS[0]);
    setGameCards([]);
    setClickedCardIndex(null);
    setShowScoreAnimation(false);

    // Clear timers
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }
    if (roundDelayRef.current) {
      clearTimeout(roundDelayRef.current);
      roundDelayRef.current = undefined;
    }
    
    // Cancel speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Initialize game when starting to play
  useEffect(() => {
    console.log("Game state changed to:", gameState); // Debug log
    if (gameState === "playing") {
      console.log("Initializing game for playing state"); // Debug log
      // Reset to first round
      const firstItem = LETTER_SOUND_ITEMS[0];
      setCurrentItem(firstItem);
      setStats(prev => ({ ...prev, currentRound: 0, score: 0 }));
      setGameCards(generateCards(firstItem));
      setClickedCardIndex(null);
      
      // Speak the first letter after a short delay
      setTimeout(() => speakLetter(firstItem.letter), 1000);
    }
  }, [gameState, generateCards, speakLetter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = undefined;
      }
      if (roundDelayRef.current) {
        clearTimeout(roundDelayRef.current);
        roundDelayRef.current = undefined;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  return (
    <>
      {/* Score Animation */}
      {showScoreAnimation && (
        <div className="fixed top-20 right-8 z-50 pointer-events-none">
          <div className="text-4xl font-bold text-green-500 animate-bounce">
            +{LETTER_SOUND.SCORE_INCREMENT}
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {gameState === "instructions" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/80 via-green-200/80 to-yellow-200/80 backdrop-blur-sm" />

          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔤</div>
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                Letter-Sound Matching
              </h2>
              <p className="text-blue-600 text-lg">
                Match letters with sounds!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 bg-blue-50/60 rounded-2xl p-4 border border-blue-200">
                <div className="text-3xl">👂</div>
                <div>
                  <p className="font-bold text-blue-700">Listen!</p>
                  <p className="text-sm text-blue-600">
                    Hear the letter sound and see the word
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-green-50/60 rounded-2xl p-4 border border-green-200">
                <div className="text-3xl">👆</div>
                <div>
                  <p className="font-bold text-green-700">Tap!</p>
                  <p className="text-sm text-green-600">
                    Tap the picture that starts with that sound
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-yellow-50/60 rounded-2xl p-4 border border-yellow-200">
                <div className="text-3xl">🎯</div>
                <div>
                  <p className="font-bold text-yellow-700">Learn!</p>
                  <p className="text-sm text-yellow-600">
                    Practice letters A through G - works on any device!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={startCountdown}
                size="lg"
                className="bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white border-0 px-8 py-3 text-xl font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Let's Play
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Countdown Screen */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
          <div className="text-center">
            <div className="text-8xl font-bold text-blue-600 animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl text-blue-700 mt-4">Get Ready!</p>
            <p className="text-sm text-gray-600 mt-2">State: {gameState}</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 text-white shadow-xl relative z-30">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                ← Back
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
                Letter-Sound Matching
              </h1>
              <div className="w-16"></div>
            </div>

            {/* Game Stats */}
            {(gameState === "playing" || gameState === "completed") && (
              <div className="flex items-center justify-center mt-4 gap-6 flex-wrap">
                <div className="text-lg font-bold">Score: {stats.score}</div>
                <div className="text-lg font-bold">
                  Round: {stats.currentRound + 1}/{stats.totalRounds}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Game Content */}
        {gameState === "playing" && (
          <div className="container mx-auto px-4 py-8">
            {/* Current Letter Display */}
            <div className="text-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg inline-block">
                <h2 className="text-4xl md:text-6xl font-bold text-blue-700 mb-2">
                  Find the match for:
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-6xl md:text-8xl font-bold text-blue-600 bg-blue-100 rounded-2xl px-6 py-4">
                    {currentItem.letter}
                  </div>
                  <div className="text-2xl md:text-3xl text-gray-700">
                    ({currentItem.word})
                  </div>
                  <Button
                    onClick={() => speakLetter(currentItem.letter)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
                    size="sm"
                    disabled={!('speechSynthesis' in window)}
                    title={'speechSynthesis' in window ? "Play sound" : "Speech not supported"}
                  >
                    🔊
                  </Button>
                </div>
              </div>
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl md:max-w-4xl mx-auto md:grid-cols-4">
              {gameCards.map((card, index) => {
                const isClicked = clickedCardIndex === index;
                const isCorrectClick = isClicked && card.isCorrect;
                const isWrongClick = isClicked && !card.isCorrect;

                return (
                  <div
                    key={`${card.letter}-${index}`}
                    className={`
                      relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg cursor-pointer
                      transition-all duration-300 hover:scale-105 hover:shadow-xl
                      ${isCorrectClick ? 'scale-110 bg-green-100 shadow-2xl ring-4 ring-green-400' : ''}
                      ${isWrongClick ? 'scale-95 bg-red-100 shadow-inner' : ''}
                    `}
                    onClick={() => handleCardClick(index, card.isCorrect)}
                  >
                    <div className="aspect-square flex flex-col items-center justify-center text-center">
                      {/* Placeholder for image - using emoji for now */}
                      <div className="text-6xl md:text-8xl mb-2">
                        {card.word === 'Apple' && '🍎'}
                        {card.word === 'Ball' && '⚽'}
                        {card.word === 'Cat' && '🐱'}
                        {card.word === 'Dog' && '🐶'}
                        {card.word === 'Egg' && '🥚'}
                        {card.word === 'Fish' && '🐟'}
                        {card.word === 'Grapes' && '🍇'}
                      </div>
                    </div>

                    {/* Click Animation */}
                    {isCorrectClick && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-4xl animate-bounce text-green-500">
                          ✓
                        </div>
                      </div>
                    )}
                    {isWrongClick && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-4xl animate-pulse text-red-500">
                          ✗
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {gameState === "completed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/80 via-blue-200/80 to-yellow-200/80 backdrop-blur-sm" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {stats.score === stats.totalRounds ? "🏆" : stats.score >= 5 ? "🎉" : "👍"}
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Great Job!
                </h2>
                <p className="text-green-600 text-lg">
                  {stats.score === stats.totalRounds
                    ? "Perfect score!"
                    : stats.score >= 5
                    ? "Well done!"
                    : "Keep practicing!"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700 mb-2">
                    {stats.score}/{stats.totalRounds}
                  </div>
                  <p className="text-green-600 font-semibold">Final Score</p>
                </div>
              </div>

              <div className="text-center space-y-3">
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TODO: Add confetti animation on completion */}
      {/* TODO: Add sound effect enhancements */}
    </>
  );
};
