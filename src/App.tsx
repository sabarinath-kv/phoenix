import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { preloadImagesWithPriority } from "@/utils/imagePreloader";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { GameSelection } from "./pages/GameSelection";
import { CameraEmoji } from "./pages/CameraEmoji";
import { SymbolSpotter } from "./pages/SymbolSpotter";
import { BubblePopping } from "./pages/BubblePopping";
import { FreezeCat } from "./pages/FreezeCat";
import { LetterSoundMatcher } from "./pages/LetterSoundMatcher";
import { TempleRun } from "./pages/games/TempleRun";
import { LetterReversalSpotter } from "./pages/games/LetterReversalSpotter";
import { GameRedirect } from "./pages/GameRedirect";
import VoiceChat from "./pages/VoiceChat";
import NotFound from "./pages/NotFound";
import { Homepage } from "./pages/Homepage";
import FollowupChatPage from "./pages/FollowupChat";
import { GameInsights } from "./pages/GameInsights";
import { UserProfile } from "./pages/UserProfile";
import EndChat from "./pages/EndChat";
import { UploadPage } from "./pages/UploadPage";
import { WelcomeScreen } from "./pages/WelcomeScreen";
import { Success } from "./pages/Success";
import { PlayJourney } from "./pages/PlayJourney";
import TutorialIntro from "./pages/TutorialIntro";
import ProgressInsights from "./pages/ProgressInsights";
import NewHomepage from "./pages/NewHomepage";
import ReportPage from "./pages/ReportPage";
import Experts from "./pages/Experts";

const queryClient = new QueryClient();

const App = () => {
  // Preload images when the app starts
  useEffect(() => {
    preloadImagesWithPriority().catch((error) => {
      console.error("Error preloading images:", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Welcome screen - shown after login */}
              <Route
                path="/welcome"
                element={
                  // <ProtectedRoute>
                  <WelcomeScreen />
                  // </ProtectedRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <GameSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emotion-detector"
                element={
                  <ProtectedRoute>
                    <CameraEmoji />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/symbol-spotter"
                element={
                  <ProtectedRoute>
                    <SymbolSpotter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voice-chat"
                element={
                  <ProtectedRoute>
                    <VoiceChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bubble-popping"
                element={
                  <ProtectedRoute>
                    <BubblePopping />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/freeze-cat"
                element={
                  <ProtectedRoute>
                    <FreezeCat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/letter-sound-matcher"
                element={
                  <ProtectedRoute>
                    <LetterSoundMatcher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/temple-run"
                element={
                  <ProtectedRoute>
                    <TempleRun />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/letter-reversal-spotter"
                element={
                  <ProtectedRoute>
                    <LetterReversalSpotter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent-companion"
                element={
                  <ProtectedRoute>
                    <FollowupChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homepage"
                element={
                  <ProtectedRoute>
                    <Homepage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-redirect"
                element={
                  <ProtectedRoute>
                    <GameRedirect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-insights"
                element={
                  <ProtectedRoute>
                    <GameInsights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/end-chat"
                element={
                  <ProtectedRoute>
                    <EndChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/success"
                element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play-journey"
                element={
                  <ProtectedRoute>
                    <PlayJourney />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutorial-intro"
                element={
                  <ProtectedRoute>
                    <TutorialIntro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress-insights"
                element={
                  <ProtectedRoute>
                    <ProgressInsights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-homepage"
                element={
                  <ProtectedRoute>
                    <NewHomepage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert-listing"
                element={
                  <ProtectedRoute>
                    <Experts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
