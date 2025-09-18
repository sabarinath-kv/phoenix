import { useState, useEffect } from 'react';
import { CameraBox } from '@/components/CameraBox';
import { EmojiPrompt } from '@/components/EmojiPrompt';
import { CompletionScreen } from '@/components/CompletionScreen';
import { GameInstructionsModal } from '@/components/GameInstructionsModal';
import { Button } from '@/components/ui/button';

type GameState = 'instructions' | 'playing' | 'completed';

const EMOJIS = ['😐', '😠', '😢', '😊', '😁']; // neutral, angry, sad, happy, happy with teeth

export const CameraEmoji = () => {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentEmoji, setCurrentEmoji] = useState('😊');
  const [isEmotionDetected, setIsEmotionDetected] = useState(false);

  const getRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * EMOJIS.length);
    return EMOJIS[randomIndex];
  };

  const startGame = () => {
    const newEmoji = getRandomEmoji();
    console.log(`🎮 GAME STARTED: Target emoji is ${newEmoji}`);
    setCurrentEmoji(newEmoji);
    setIsEmotionDetected(false);
    setGameState('playing');
  };

  const handleEmotionDetected = () => {
    console.log('✅ GAME COMPLETED: Emotion successfully detected');
    setGameState('completed');
  };

  const handleTimeout = () => {
    console.log('⏰ GAME TIMEOUT: 30 seconds elapsed without emotion detection');
    setGameState('completed');
  };

  const handleStartAgain = () => {
    const newEmoji = getRandomEmoji();
    console.log(`🔄 GAME RESTARTED: New target emoji is ${newEmoji}`);
    setCurrentEmoji(newEmoji);
    setIsEmotionDetected(false);
    setGameState('playing');
  };

  const handleTargetEmotionDetected = () => {
    console.log('🎯 TARGET EMOTION DETECTED: Ending game immediately');
    setIsEmotionDetected(true);
    // End game immediately when target emotion is detected
    setTimeout(() => {
      setGameState('completed');
    }, 1000); // Small delay to show success feedback
  };

  return (
    <>
      {/* Instructions Modal */}
      <GameInstructionsModal 
        isOpen={gameState === 'instructions'} 
        onStartGame={startGame} 
      />

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
                targetEmotion={currentEmoji}
                onTargetEmotionDetected={handleTargetEmotionDetected}
                showDebugInfo={false}
              />
            </div>
            </div>
          )}
        </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Copy My Face
          </h1>
          <p className="text-center text-white/90 mt-1 text-sm sm:text-base">
            Make the same face as the emoji
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
              {gameState === 'playing' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-purple-300 mx-2">
                  <EmojiPrompt
                    emoji={currentEmoji}
                    onEmotionDetected={handleEmotionDetected}
                    onTimeout={handleTimeout}
                    duration={30000}
                    isEmotionDetected={isEmotionDetected}
                  />
                </div>
              )}

              {gameState === 'completed' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-green-300 mx-2">
                  <CompletionScreen onStartAgain={handleStartAgain} />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Camera Section - Desktop */}
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="text-2xl font-bold text-center text-green-600">
                  Your Face
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-green-200">
                  <CameraBox 
                    isActive={gameState === 'playing' || gameState === 'completed'} 
                    className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg"
                    targetEmotion={currentEmoji}
                    onTargetEmotionDetected={handleTargetEmotionDetected}
                    showDebugInfo={true}
                  />
                </div>
              </div>

              {/* Game Section - Desktop */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-2xl font-bold text-center text-blue-600">
                  Let's Play
                </h2>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200">
                  {gameState === 'playing' && (
                    <EmojiPrompt
                      emoji={currentEmoji}
                      onEmotionDetected={handleEmotionDetected}
                      onTimeout={handleTimeout}
                      duration={30000}
                      isEmotionDetected={isEmotionDetected}
                    />
                  )}

                  {gameState === 'completed' && (
                    <CompletionScreen onStartAgain={handleStartAgain} />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      </div>
    </>
  );
};