import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GAME_CLASS } from '@/constants/game';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  color: string;
  bgGradient: string;
}

// Mapping from game IDs to their display information and routes
const GAME_INFO_MAP: Record<string, GameInfo> = {
  'symbol-spotter': {
    id: 'symbol-spotter',
    name: 'Symbol Spotter',
    description: 'Find the hidden symbols!',
    route: '/symbol-spotter',
    icon: '🔍',
    color: 'text-game-warning',
    bgGradient: 'bg-gradient-playful'
  },
  'bubble-popping': {
    id: 'bubble-popping',
    name: 'Bubble Popping',
    description: 'Pop colorful bubbles for points!',
    route: '/bubble-popping',
    icon: '🫧',
    color: 'text-game-info',
    bgGradient: 'bg-gradient-primary'
  },
  'freeze-cat': {
    id: 'freeze-cat',
    name: 'Freeze Cat',
    description: 'Tap the animals! But do not tap the cat.',
    route: '/games/freeze-cat',
    icon: '🐱',
    color: 'text-game-primary',
    bgGradient: 'bg-gradient-playful'
  },
  'letter-sound': {
    id: 'letter-sound',
    name: 'Letter-Sound Matching',
    description: 'Match letters with sounds!',
    route: '/games/letter-sound-matcher',
    icon: '🔤',
    color: 'text-game-secondary',
    bgGradient: 'bg-gradient-secondary'
  },
  'letter-reversal-spotter': {
    id: 'letter-reversal-spotter',
    name: 'Letter Reversal Spotter',
    description: 'Help Panda find the right letters!',
    route: '/games/letter-reversal-spotter',
    icon: '🐼',
    color: 'text-game-primary',
    bgGradient: 'bg-gradient-primary'
  },
  'emotion-adventure': {
    id: 'emotion-adventure',
    name: 'Emotion Adventure',
    description: 'Go on an emotion journey!',
    route: '/emotion-detector', // Using existing emotion detector for now
    icon: '🌈',
    color: 'text-game-primary',
    bgGradient: 'bg-gradient-playful'
  },
  'emotion-detector': {
    id: 'emotion-detector',
    name: 'Emotion Detector',
    description: 'Copy the emoji faces!',
    route: '/emotion-detector',
    icon: '😊',
    color: 'text-game-info',
    bgGradient: 'bg-gradient-secondary'
  }
};

type GameClass = keyof typeof GAME_CLASS;

interface LocationState {
  gameClass: GameClass;
  completedGames?: string[];
}

export const GameRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [gameClass, setGameClass] = useState<GameClass | null>(null);
  const [gameSequence, setGameSequence] = useState<GameInfo[]>([]);
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  useEffect(() => {
    // Get game class from route state
    if (state?.gameClass && GAME_CLASS[state.gameClass]) {
      setGameClass(state.gameClass);
      setCompletedGames(state.completedGames || []);
      
      // Map game IDs to game info
      const gameIds = GAME_CLASS[state.gameClass];
      const games = gameIds.map(id => GAME_INFO_MAP[id]).filter(Boolean);
      setGameSequence(games);
      
      // Find current game index based on completed games
      const completedCount = state.completedGames?.length || 0;
      setCurrentGameIndex(completedCount);
    } else {
      // If no valid game class, redirect to game selection
      navigate('/');
    }
  }, [state, navigate]);

  const handleStartGame = (gameIndex: number) => {
    if (gameIndex < gameSequence.length) {
      const game = gameSequence[gameIndex];
      // Navigate to game with state indicating we're in redirect flow
      navigate(game.route, {
        state: {
          fromGameRedirect: true,
          gameClass,
          gameSequence: gameSequence.map(g => g.id),
          completedGames,
          currentGameIndex: gameIndex
        }
      });
    }
  };

  const handleGoToNextGame = () => {
    const nextIndex = currentGameIndex + 1;
    if (nextIndex < gameSequence.length) {
      setCurrentGameIndex(nextIndex);
      handleStartGame(nextIndex);
    } else {
      // All games completed, redirect to homepage
      navigate('/homepage');
    }
  };

  const getProgressPercentage = () => {
    if (gameSequence.length === 0) return 0;
    return (completedGames.length / gameSequence.length) * 100;
  };

  const getGameClassDisplayName = (gameClass: GameClass) => {
    switch (gameClass) {
      case 'ADHD':
        return 'ADHD Focus Games';
      case 'DYSLEXIA':
        return 'Dyslexia Support Games';
      case 'AUTISM':
        return 'Autism Friendly Games';
      default:
        return 'Learning Games';
    }
  };

  if (!gameClass || gameSequence.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-muted-foreground">Loading games...</h2>
        </div>
      </div>
    );
  }

  const allGamesCompleted = completedGames.length === gameSequence.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              {getGameClassDisplayName(gameClass)}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Complete all games in sequence to finish your learning journey
            </p>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-white shadow-soft border border-border mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Progress</h2>
              <span className="text-sm text-muted-foreground">
                {completedGames.length} of {gameSequence.length} completed
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        </Card>

        {/* Games List */}
        <div className="space-y-4">
          {gameSequence.map((game, index) => {
            const isCompleted = completedGames.includes(game.id);
            const isCurrent = index === currentGameIndex && !allGamesCompleted;
            const isLocked = index > currentGameIndex && !allGamesCompleted;

            return (
              <Card
                key={game.id}
                className={`
                  ${game.bgGradient} shadow-soft border-0 transition-all duration-300
                  ${isCurrent ? 'ring-4 ring-primary/50 shadow-lg' : ''}
                  ${isLocked ? 'opacity-50' : 'hover:shadow-hover'}
                `}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{game.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {game.name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {game.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isCompleted && (
                        <div className="text-2xl text-green-400">✅</div>
                      )}
                      
                      {isCurrent && !isCompleted && (
                        <Button
                          onClick={() => handleStartGame(index)}
                          size="lg"
                          className="bg-white text-primary hover:bg-white/90 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Start Game
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <Button
                          onClick={() => handleStartGame(index)}
                          variant="outline"
                          size="sm"
                          className="text-white border-white/30 hover:bg-white/10 rounded-full"
                        >
                          Play Again
                        </Button>
                      )}
                      
                      {isLocked && (
                        <div className="text-white/50 text-sm font-medium">
                          🔒 Locked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion Section */}
        {allGamesCompleted && (
          <Card className="bg-gradient-to-r from-green-400 to-blue-500 shadow-soft border-0 mt-8">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-white/90 text-lg mb-6">
                You've completed all {gameClass} games! Great job on your learning journey.
              </p>
              <Button
                onClick={() => navigate('/homepage')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Homepage
              </Button>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Game Selection
          </Button>
        </div>
      </div>
    </div>
  );
}; 