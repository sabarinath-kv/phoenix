import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameSelection } from "./pages/GameSelection";
import { CameraEmoji } from "./pages/CameraEmoji";
import { SymbolSpotter } from "./pages/SymbolSpotter";
import { BubblePopping } from "./pages/BubblePopping";
import { FreezeCat } from "./pages/FreezeCat";
import { LetterSoundMatcher } from "./pages/LetterSoundMatcher";
import { TempleRun } from "./pages/games/TempleRun";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameSelection />} />
          <Route path="/emotion-detector" element={<CameraEmoji />} />
          <Route path="/symbol-spotter" element={<SymbolSpotter />} />
          <Route path="/bubble-popping" element={<BubblePopping />} />
          <Route path="/games/freeze-cat" element={<FreezeCat />} />
          <Route path="/games/letter-sound-matcher" element={<LetterSoundMatcher />} />
          <Route path="/games/temple-run" element={<TempleRun />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
