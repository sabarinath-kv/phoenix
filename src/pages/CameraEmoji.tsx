import { useState, useEffect } from 'react';
import { CameraBox } from '@/components/CameraBox';
import { EmojiPrompt } from '@/components/EmojiPrompt';
import { CompletionScreen } from '@/components/CompletionScreen';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'playing' | 'completed';

const EMOJIS = ['😊', '😢', '😮', '😠', '😴', '🤔', '😄', '😨', '🥱', '😍'];

export const CameraEmoji = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentEmoji, setCurrentEmoji] = useState('😊');

  const getRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * EMOJIS.length);
    return EMOJIS[randomIndex];
  };

  const startGame = () => {
    setCurrentEmoji(getRandomEmoji());
    setGameState('playing');
  };

  const handleTimerComplete = () => {
    setGameState('completed');
  };

  const handleStartAgain = () => {
    setCurrentEmoji(getRandomEmoji());
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Emoji Mimic Challenge
          </h1>
          <p className="text-center text-white/80 mt-2">
            Test your facial expressions!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Camera Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center lg:text-left">
                Your Camera
              </h2>
              <CameraBox 
                isActive={gameState !== 'idle'} 
                className="w-full max-w-md mx-auto lg:mx-0"
              />
              {gameState === 'idle' && (
                <div className="text-center lg:text-left">
                  <p className="text-muted-foreground mb-4">
                    Click "Start Challenge" to begin the emoji mimicking game!
                  </p>
                </div>
              )}
            </div>

            {/* Game Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center lg:text-left">
                Challenge
              </h2>
              
              <div className="max-w-md mx-auto lg:mx-0">
                {gameState === 'idle' && (
                  <div className="text-center p-8">
                    <div className="text-6xl mb-6">🎭</div>
                    <h3 className="text-2xl font-bold mb-4">Ready to Play?</h3>
                    <p className="text-muted-foreground mb-6">
                      We'll show you an emoji and you have 5 seconds to mimic the expression!
                    </p>
                    <Button 
                      onClick={startGame}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-hover text-white border-0 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
                    >
                      Start Challenge
                    </Button>
                  </div>
                )}

                {gameState === 'playing' && (
                  <EmojiPrompt
                    emoji={currentEmoji}
                    onTimerComplete={handleTimerComplete}
                    duration={5000}
                  />
                )}

                {gameState === 'completed' && (
                  <CompletionScreen onStartAgain={handleStartAgain} />
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-gradient-card rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 text-center">How to Play</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-3xl">📱</div>
                <p className="text-sm font-medium">Allow Camera Access</p>
                <p className="text-xs text-muted-foreground">Grant permission to use your camera</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">😊</div>
                <p className="text-sm font-medium">Mimic the Emoji</p>
                <p className="text-xs text-muted-foreground">Match the facial expression shown</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">⏱️</div>
                <p className="text-sm font-medium">Beat the Timer</p>
                <p className="text-xs text-muted-foreground">You have 5 seconds per expression</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};