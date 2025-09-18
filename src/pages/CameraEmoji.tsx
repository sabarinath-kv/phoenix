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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Floating Camera Box for Mobile/Small screens */}
      <div className="fixed bottom-4 right-4 z-20 lg:hidden">
        {(gameState === 'playing' || gameState === 'completed') && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-2 border-purple-200">
            <div className="text-xs text-center text-purple-600 font-semibold mb-1">Your Face</div>
            <div className="w-36 h-36 rounded-xl overflow-hidden shadow-sm">
              <CameraBox 
                isActive={gameState === 'playing' || gameState === 'completed'} 
                className="w-full h-full [&>div]:!aspect-square [&>div]:h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            😊 Copy My Face! 😊
          </h1>
          <p className="text-center text-white/90 mt-1 text-sm sm:text-base">
            Make the same face as the emoji!
          </p>
        </div>
      </header>

      {/* Main Content - Mobile First Design */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Mobile Layout: Emoji-first, full width */}
          <div className="lg:hidden">
            {/* Main Game Area - Takes full mobile width */}
            <div className="mb-6">
              {gameState === 'idle' && (
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-blue-200 mx-2">
                  <div className="text-8xl mb-4 animate-bounce">😊</div>
                  <h3 className="text-2xl font-bold mb-3 text-blue-700">Let's Play!</h3>
                  <p className="text-blue-600 mb-6 text-lg leading-relaxed">
                    I'll show you a face. You make the same face! 
                  </p>
                  <Button 
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-10 py-4 text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    ▶️ Start Playing!
                  </Button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-purple-300 mx-2">
                  <EmojiPrompt
                    emoji={currentEmoji}
                    onTimerComplete={handleTimerComplete}
                    duration={5000}
                  />
                </div>
              )}

              {gameState === 'completed' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-green-300 mx-2">
                  <CompletionScreen onStartAgain={handleStartAgain} />
                </div>
              )}
            </div>

            {/* Camera Section for idle state on mobile */}
            {gameState === 'idle' && (
              <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 mx-2 border border-green-200">
                <h3 className="text-lg font-semibold text-green-600 mb-3">📱 Camera Ready!</h3>
                <p className="text-green-600 text-sm">
                  Make sure I can see your face!
                </p>
              </div>
            )}
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Camera Section - Desktop */}
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="text-2xl font-bold text-center text-green-600">
                  📹 Your Face
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-green-200">
                  <CameraBox 
                    isActive={gameState !== 'idle'} 
                    className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg"
                  />
                  {gameState === 'idle' && (
                    <div className="text-center mt-4">
                      <p className="text-green-600 text-lg">
                        Click "Start Playing!" to begin! 😊
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Section - Desktop */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-2xl font-bold text-center text-blue-600">
                  🎮 Let's Play!
                </h2>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200">
                  {gameState === 'idle' && (
                    <div className="text-center">
                      <div className="text-8xl mb-6 animate-bounce">😊</div>
                      <h3 className="text-3xl font-bold mb-4 text-blue-700">Ready to Play?</h3>
                      <p className="text-blue-600 mb-8 text-lg leading-relaxed">
                        I'll show you a face. You make the same face!
                      </p>
                      <Button 
                        onClick={startGame}
                        size="lg"
                        className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white border-0 px-10 py-4 text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        ▶️ Start Playing!
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
          </div>

          {/* Instructions - Simplified for young children */}
          <div className="mt-8 lg:mt-12 bg-white/60 backdrop-blur-sm rounded-3xl p-4 lg:p-6 shadow-xl border-2 border-yellow-300 mx-2 lg:mx-0">
            <h3 className="text-lg lg:text-xl font-bold mb-4 text-center text-yellow-600">
              🌟 How to Play
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 text-center">
              <div className="bg-white/70 rounded-2xl p-3 lg:p-4 border-2 border-blue-300">
                <div className="text-4xl lg:text-5xl mb-2">👀</div>
                <p className="text-sm lg:text-base font-bold text-blue-600">Look!</p>
                <p className="text-xs lg:text-sm text-blue-500 mt-1">See the face</p>
              </div>
              <div className="bg-white/70 rounded-2xl p-3 lg:p-4 border-2 border-green-300">
                <div className="text-4xl lg:text-5xl mb-2">😊</div>
                <p className="text-sm lg:text-base font-bold text-green-600">Copy!</p>
                <p className="text-xs lg:text-sm text-green-500 mt-1">Make the same face</p>
              </div>
              <div className="bg-white/70 rounded-2xl p-3 lg:p-4 border-2 border-orange-300">
                <div className="text-4xl lg:text-5xl mb-2">🎉</div>
                <p className="text-sm lg:text-base font-bold text-orange-600">Great Job!</p>
                <p className="text-xs lg:text-sm text-orange-500 mt-1">You did it!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};