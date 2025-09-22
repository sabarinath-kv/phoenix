import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CameraBox } from "@/components/CameraBox";
import { EmojiPrompt } from "@/components/EmojiPrompt";
import { GameInstructionsModal } from "@/components/GameInstructionsModal";
import { ProgressStepper } from "@/components/ProgressStepper";
import { GameSuccessModal } from "@/components/GameSuccessModal";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import { useGameRedirect } from "@/hooks/useGameRedirect";
import { useGameSession } from "@/hooks/useGameSession";

type GameState = "instructions" | "countdown" | "playing" | "completed";

const EMOJIS = ["😐", "😠", "😢", "😊", "😁"]; // neutral, angry, sad, happy, happy with teeth

export const CameraEmoji = () => {
  const navigate = useNavigate();
  const gameRedirect = useGameRedirect("emotion-detector");
  const gameSession = useGameSession(1); // gameId 1 for emotion-detector
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [countdown, setCountdown] = useState(3);
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const [completedEmojis, setCompletedEmojis] = useState<number[]>([]);
  const [isEmotionDetected, setIsEmotionDetected] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs to store timeout IDs for cleanup
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentEmoji = EMOJIS[currentEmojiIndex];

  const startCountdown = () => {
    setGameState("countdown");
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
    setGameState("playing");
    gameSession.startSession(); // Start tracking the game session

    // Start recognition after 2 seconds
    recognitionTimeoutRef.current = setTimeout(() => {
      console.log("🔍 RECOGNITION STARTED: 2-second delay completed");
      setIsRecognitionActive(true);
    }, 2000);
  };

  const handleEmotionDetected = useCallback(() => {
    console.log(`✅ EMOJI COMPLETED: ${currentEmoji} detected successfully`);

    // Stop recognition immediately to prevent multiple detections
    setIsRecognitionActive(false);
    setIsEmotionDetected(true);

    // Add current emoji to completed list using functional update
    setCompletedEmojis((prev) => [...prev, currentEmojiIndex]);

    // Clean up any existing timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }

    // Wait 1.5 seconds to show success message, then proceed
    successTimeoutRef.current = setTimeout(() => {
      // Check if this was the last emoji
      if (currentEmojiIndex === EMOJIS.length - 1) {
        console.log("🏆 GAME FULLY COMPLETED: All emojis detected!");
        setGameState("completed");
        setShowSuccessModal(true);
        // Create game session with hardcoded data only if session is active
        if (gameSession.isSessionActive) {
          gameSession
            .endSessionWithHardcodedData("emotion-detector")
            .catch((error) => {
              console.error("Failed to save game session:", error);
            });
        }
      } else {
        // Move to next emoji
        const nextIndex = currentEmojiIndex + 1;
        console.log(`➡️ MOVING TO NEXT: ${EMOJIS[nextIndex]}`);

        // Reset states for next emoji
        setCurrentEmojiIndex(nextIndex);
        setIsEmotionDetected(false);
        setIsRecognitionActive(false); // Ensure recognition is off before starting again

        // Start recognition for next emoji after 2 seconds
        recognitionTimeoutRef.current = setTimeout(() => {
          console.log(
            "🔍 RECOGNITION STARTED: 2-second delay completed for next emoji"
          );
          setIsRecognitionActive(true);
        }, 2000);
      }
    }, 1500); // 1.5 second delay to show "Great!" message
  }, [currentEmoji, currentEmojiIndex]);

  const handleTimeout = useCallback(() => {
    console.log("⏰ EMOJI TIMEOUT: 30 seconds elapsed, moving to next");
    handleEmotionDetectedRef.current(); // Treat timeout as completion for now
  }, []);

  const handlePlayAgain = () => {
    setShowSuccessModal(false);
    startGame();
  };

  const handleGoBack = () => {
    // Clean up timeouts before navigating away
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    navigate("/");
  };

  // Cleanup effect for component unmount
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

  // Use useRef to avoid infinite re-renders
  const handleEmotionDetectedRef = useRef(handleEmotionDetected);
  handleEmotionDetectedRef.current = handleEmotionDetected;

  const handleTargetEmotionDetected = useCallback(() => {
    console.log("🎯 TARGET EMOTION DETECTED: Ending game immediately");
    setIsEmotionDetected(true);
    // End game immediately when target emotion is detected
    handleEmotionDetectedRef.current();
  }, []);

  return (
    <>
      {/* Instructions Modal */}
      <GameInstructionsModal
        isOpen={gameState === "instructions"}
        onStartGame={startCountdown}
      />

      {/* Success Modal */}
      <GameSuccessModal
        isOpen={showSuccessModal}
        onPlayAgain={handlePlayAgain}
        onGoBack={handleGoBack}
        isInRedirectFlow={gameRedirect.isInRedirectFlow}
        onGoToNextGame={gameRedirect.handleGoToNextGame}
        isLastGame={gameRedirect.isLastGame}
      />

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
        {/* Floating Camera Box for Mobile/Small screens */}
        <div className="fixed bottom-4 right-4 z-20 lg:hidden">
          {(gameState === "playing" || gameState === "completed") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <div className="text-xs text-center text-purple-600 font-semibold mb-1">
                Your Face
              </div>
              <div className="w-36 h-36 rounded-xl overflow-hidden shadow-sm">
                <CameraBox
                  isActive={
                    gameState === "playing" || gameState === "completed"
                  }
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
        <header className="bg-white/90 backdrop-blur-sm border border-white/40 relative" style={{ height: '100px' }}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Copy My Face
              </h1>
            </div>
          </div>
          {/* Back Button */}
          <BackButton onClick={() => navigate("/")} />
        </header>

        {/* Main Content - Mobile First Design */}
        <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Layout: Emoji-first, full width */}
            <div className="lg:hidden">
              {/* Main Game Area - Takes full mobile width */}
              <div className="mb-6">
                {gameState === "playing" && (
                  <div className="space-y-4">
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
                    {/* Progress Stepper - Below emoji box with margin */}
                    <div className="mt-6 px-2">
                      <ProgressStepper
                        totalSteps={EMOJIS.length}
                        currentStep={currentEmojiIndex}
                        completedSteps={completedEmojis}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                      />
                    </div>
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
                  <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                    <CameraBox
                      isActive={
                        gameState === "playing" || gameState === "completed"
                      }
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
                    {gameState === "playing" && (
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
                  {/* Progress Stepper - Below emoji box for desktop */}
                  {gameState === "playing" && (
                    <div className="mt-6">
                      <ProgressStepper
                        totalSteps={EMOJIS.length}
                        currentStep={currentEmojiIndex}
                        completedSteps={completedEmojis}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
