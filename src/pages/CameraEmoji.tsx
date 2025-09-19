import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraBox } from '@/components/CameraBox';
import { EmojiPrompt } from '@/components/EmojiPrompt';
import { GameInstructionsModal } from '@/components/GameInstructionsModal';
import { ProgressStepper } from '@/components/ProgressStepper';
import { GameSuccessModal } from '@/components/GameSuccessModal';
import { Button } from '@/components/ui/button';

type GameState = 'instructions' | 'playing' | 'completed';

const EMOJIS = ['😐', '😠', '😢', '😊', '😁']; // neutral, angry, sad, happy, happy with teeth

export const CameraEmoji = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const [completedEmojis, setCompletedEmojis] = useState<number[]>([]);
  const [isEmotionDetected, setIsEmotionDetected] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Refs to store timeout IDs for cleanup
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentEmoji = EMOJIS[currentEmojiIndex];

  const startGame = () => {
    console.log(`🎮 GAME STARTED: Starting with first emoji ${EMOJIS[0]}`);
    
    // Clean up any existing timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    
    // Reset all game state
    setCurrentEmojiIndex(0);
    setCompletedEmojis([]);
    setIsEmotionDetected(false);
    setIsRecognitionActive(false);
    setShowSuccessModal(false);
    setGameState('playing');
    
    // Start recognition after 2 seconds
    recognitionTimeoutRef.current = setTimeout(() => {
      console.log('🔍 RECOGNITION STARTED: 2-second delay completed');
      setIsRecognitionActive(true);
    }, 2000);
  };

  const handleEmotionDetected = useCallback(() => {
    console.log(`✅ EMOJI COMPLETED: ${currentEmoji} detected successfully`);
    
    // Stop recognition immediately to prevent multiple detections
    setIsRecognitionActive(false);
    setIsEmotionDetected(true);
    
    // Add current emoji to completed list
    const newCompletedEmojis = [...completedEmojis, currentEmojiIndex];
    setCompletedEmojis(newCompletedEmojis);
    
    // Clean up any existing success timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    
    // Wait 1.5 seconds to show success message, then proceed
    successTimeoutRef.current = setTimeout(() => {
      
      // Check if this was the last emoji
      if (currentEmojiIndex === EMOJIS.length - 1) {
        console.log('🏆 GAME FULLY COMPLETED: All emojis detected!');
        setGameState('completed');
        setShowSuccessModal(true);
      } else {
        // Move to next emoji after additional delay
        const nextIndex = currentEmojiIndex + 1;
        console.log(`➡️ MOVING TO NEXT: ${EMOJIS[nextIndex]}`);
        setCurrentEmojiIndex(nextIndex);
        setIsEmotionDetected(false);
        
        // Clean up any existing recognition timeout
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current);
        }
        
        // Start recognition for next emoji after 2 seconds
        recognitionTimeoutRef.current = setTimeout(() => {
          console.log('🔍 RECOGNITION STARTED: 2-second delay completed for next emoji');
          setIsRecognitionActive(true);
        }, 2000);
      }
    }, 1500); // 1.5 second delay to show "Great!" message
  }, [currentEmoji, currentEmojiIndex, completedEmojis]);

  const handleTimeout = useCallback(() => {
    console.log('⏰ EMOJI TIMEOUT: 30 seconds elapsed, moving to next');
    handleEmotionDetected(); // Treat timeout as completion for now
  }, [handleEmotionDetected]);

  const handlePlayAgain = () => {
    setShowSuccessModal(false);
    startGame();
  };

  const handleGoBack = () => {
    navigate('/');
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
    };
  }, []);

  const handleTargetEmotionDetected = useCallback(() => {
    console.log('🎯 TARGET EMOTION DETECTED: Ending game immediately');
    setIsEmotionDetected(true);
    // End game immediately when target emotion is detected
    handleEmotionDetected();
  }, [handleEmotionDetected]);

  return (
    <>
      {/* Instructions Modal */}
      <GameInstructionsModal 
        isOpen={gameState === 'instructions'} 
        onStartGame={startGame} 
      />

      {/* Success Modal */}
      <GameSuccessModal 
        isOpen={showSuccessModal}
        onPlayAgain={handlePlayAgain}
        onGoBack={handleGoBack}
      />


      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Floating Camera Box for Mobile/Small screens */}
        <div className="fixed bottom-4 right-4 z-20 lg:hidden">
          {(gameState === 'playing' || gameState === 'completed') && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <div className="text-xs text-center text-purple-600 font-semibold mb-1">Your Face</div>
            <div className="w-36 h-36 rounded-xl overflow-hidden shadow-sm">
              <CameraBox 
                isActive={gameState === 'playing' || gameState === 'completed'} 
                className="w-full h-full [&>div]:!aspect-square [&>div]:h-full"
                targetEmotion={currentEmoji}
                onTargetEmotionDetected={handleTargetEmotionDetected}
                showDebugInfo={false}
                recognitionActive={isRecognitionActive}
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
          
          {/* Progress Stepper - Show during playing state */}
          {gameState === 'playing' && (
            <div className="mb-6">
              <ProgressStepper 
                totalSteps={EMOJIS.length}
                currentStep={currentEmojiIndex}
                completedSteps={completedEmojis}
                className="mb-4"
              />
            </div>
          )}
          
          {/* Mobile Layout: Emoji-first, full width */}
          <div className="lg:hidden">
            {/* Main Game Area - Takes full mobile width */}
            <div className="mb-6">
              {gameState === 'playing' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl mx-2">
                  <EmojiPrompt
                    emoji={currentEmoji}
                    onEmotionDetected={handleEmotionDetected}
                    onTimeout={handleTimeout}
                    duration={30000}
                    isEmotionDetected={isEmotionDetected}
                    recognitionActive={isRecognitionActive}
                  />
                </div>
              )}

            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:block">
            {/* Progress Stepper for Desktop */}
            {gameState === 'playing' && (
              <div className="mb-8">
                <ProgressStepper 
                  totalSteps={EMOJIS.length}
                  currentStep={currentEmojiIndex}
                  completedSteps={completedEmojis}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Camera Section - Desktop */}
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="text-2xl font-bold text-center text-green-600">
                  Your Face
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <CameraBox 
                    isActive={gameState === 'playing' || gameState === 'completed'} 
                    className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg"
                    targetEmotion={currentEmoji}
                    onTargetEmotionDetected={handleTargetEmotionDetected}
                    showDebugInfo={true}
                    recognitionActive={isRecognitionActive}
                  />
                </div>
              </div>

              {/* Game Section - Desktop */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-2xl font-bold text-center text-blue-600">
                  Let's Play
                </h2>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  {gameState === 'playing' && (
                    <EmojiPrompt
                      emoji={currentEmoji}
                      onEmotionDetected={handleEmotionDetected}
                      onTimeout={handleTimeout}
                      duration={30000}
                      isEmotionDetected={isEmotionDetected}
                      recognitionActive={isRecognitionActive}
                    />
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