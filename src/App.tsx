import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import ParentCompanionAI from "./pages/ParentCompanionAI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><GameSelection /></ProtectedRoute>} />
            <Route path="/emotion-detector" element={<ProtectedRoute><CameraEmoji /></ProtectedRoute>} />
            <Route path="/symbol-spotter" element={<ProtectedRoute><SymbolSpotter /></ProtectedRoute>} />
            <Route path="/bubble-popping" element={<ProtectedRoute><BubblePopping /></ProtectedRoute>} />
            <Route path="/games/freeze-cat" element={<ProtectedRoute><FreezeCat /></ProtectedRoute>} />
            <Route path="/games/letter-sound-matcher" element={<ProtectedRoute><LetterSoundMatcher /></ProtectedRoute>} />
            <Route path="/games/temple-run" element={<ProtectedRoute><TempleRun /></ProtectedRoute>} />
            <Route path="/games/letter-reversal-spotter" element={<ProtectedRoute><LetterReversalSpotter /></ProtectedRoute>} />
            <Route path="/parent-companion" element={<ProtectedRoute><ParentCompanionAI /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
