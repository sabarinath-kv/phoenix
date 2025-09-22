import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaceDetectionTest } from "@/components/FaceDetectionTest";
import { Chip } from "@/components/ui/chip";
import { Mic, MessageCircle, LogOut, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ParentCompanionAI from './ParentCompanionAI';
import { motion } from "framer-motion";

interface GameCard {
  id: string;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  isImplemented: boolean;
  route?: string;
}

const games: GameCard[] = [
  {
    id: "emotion-detector",
    name: "Emotion Detector",
    description: "Copy the emoji faces!",
    color: "text-game-info",
    bgGradient: "bg-gradient-secondary",
    icon: "😊",
    isImplemented: true,
    route: "/emotion-detector",
  },
  {
    id: "letter-sound",
    name: "Letter-Sound Matching",
    description: "Match letters with sounds!",
    color: "text-game-secondary",
    bgGradient: "bg-gradient-secondary",
    icon: "🔤",
    isImplemented: true,
    route: "/games/letter-sound-matcher",
  },
  {
    id: "symbol-spotter",
    name: "Symbol Spotter",
    description: "Find the hidden symbols!",
    color: "text-game-warning",
    bgGradient: "bg-gradient-playful",
    icon: "🔍",
    isImplemented: true,
    route: "/symbol-spotter",
  },
  {
    id: "bubble-popping",
    name: "Bubble Popping",
    description: "Pop colorful bubbles for points!",
    color: "text-game-info",
    bgGradient: "bg-gradient-primary",
    icon: "🫧",
    isImplemented: true,
    route: "/bubble-popping",
  },
  {
    id: "freeze-cat",
    name: "Freeze Cat",
    description: "Tap the animals! But do not tap the cat. Stay frozen when you see a cat.",
    color: "text-game-primary",
    bgGradient: "bg-gradient-playful",
    icon: "🐱",
    isImplemented: true,
    route: "/games/freeze-cat",
  },
  {
    id: "temple-run",
    name: "Crossroad Racer",
    description: "Race through traffic! Avoid cars and navigate crossroads.",
    color: "text-game-warning",
    bgGradient: "bg-gradient-secondary",
    icon: "🚗",
    isImplemented: true,
    route: "/games/temple-run",
  },
  {
    id: "letter-reversal-spotter",
    name: "Letter Reversal Spotter",
    description: "Help Panda find the right letters! Spot confusing letters and words.",
    color: "text-game-primary",
    bgGradient: "bg-gradient-primary",
    icon: "🐼",
    isImplemented: true,
    route: "/games/letter-reversal-spotter",
  },
  {
    id: "emotion-adventure",
    name: "Emotion Adventure",
    description: "Go on an emotion journey!",
    color: "text-game-primary",
    bgGradient: "bg-gradient-playful",
    icon: "🌈",
    isImplemented: false,
  },
];

export const GameSelection = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleGameClick = (game: GameCard) => {
    if (game.isImplemented && game.route) {
      navigate(game.route);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="relative">
            {/* Logout Button */}
            <div className="absolute top-0 right-0">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Header Content */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                Fun Learning Games
              </h1>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                Choose a game to play and learn together in a safe, engaging environment
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Welcome to Learning Time
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Pick a game and let's have fun learning together. Each game is designed to help children develop important skills while having fun.
            </p>
            
            {/* Voice Chat Feature Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                onClick={() => navigate('/voice-chat')}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-semibold shadow-hover group"
              >
                <Mic className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                Start Voice Chat
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>Talk with our AI companion!</span>
              </div>
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`group relative overflow-hidden card-hover cursor-pointer ${
                  game.isImplemented ? "" : "opacity-75"
                }`}
                onClick={() => handleGameClick(game)}
              >
                <div className="p-8 text-center h-full flex flex-col justify-between min-h-[280px]">
                  {/* Game Icon */}
                  <div className="text-7xl sm:text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>

                  {/* Game Info */}
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {game.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-6">
                    {game.isImplemented ? (
                      <Chip variant="success" className="gap-2">
                        <div className="w-2 h-2 bg-game-success rounded-full" />
                        Ready to Play
                      </Chip>
                    ) : (
                      <Chip variant="default" className="gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                        Coming Soon
                      </Chip>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Face Detection Test */}
          <div className="mt-16 bg-card rounded-lg shadow-card p-8 border border-border">
            <FaceDetectionTest />
          </div>
        </div>
      </main>

      {/* Parent Companion AI Floating Button */}
      <motion.button
        key="floating-button"
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-hover backdrop-blur-sm border border-primary/20 bg-primary/90 hover:bg-primary`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/parent-companion')}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Heart className="w-8 h-8 text-white mx-auto" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
};
