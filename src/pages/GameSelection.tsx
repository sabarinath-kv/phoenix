import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaceDetectionTest } from "@/components/FaceDetectionTest";
import { Chip } from "@/components/ui/chip";
import { Mic, MessageCircle, LogOut, Heart, Clock, Check, Circle, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { PreloadedImage } from "@/components/LazyImage";
import ParentCompanionAI from "./ParentCompanionAI";

// Import game images
import game1Image from "@/assets/images/game1.png";
import game2Image from "@/assets/images/game2.png";
import game3Image from "@/assets/images/game3.png";
import checkLine from "@/assets/images/check-line.png";

interface GameCard {
  id: string;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  isImplemented: boolean;
  route?: string;
  gameId?: number;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending';
  illustration: string;
  imageUrl: string;
}

const games: GameCard[] = [
  {
    id: "space-focus",
    gameId: 1,
    name: "Space Focus",
    description: "Tap moving rockets in sequence",
    color: "text-blue-600",
    bgGradient: "bg-gradient-to-br from-blue-500 to-purple-600",
    icon: "🚀",
    isImplemented: true,
    route: "/emotion-detector",
    duration: "2 min",
    status: 'completed',
    illustration: "🚀✨",
    imageUrl: game1Image
  },
  {
    id: "freeze-cat",
    gameId: 2,
    name: "Freeze-Cat",
    description: "Whack-a-mole but \"freeze\" on a cat",
    color: "text-orange-600",
    bgGradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    icon: "🐱",
    isImplemented: true,
    route: "/games/freeze-cat",
    duration: "2 min",
    status: 'in-progress',
    illustration: "🐱☁️",
    imageUrl: game2Image
  },
  {
    id: "space-focus-2",
    gameId: 3,
    name: "Letter sound matcher",
    description: "Tap moving rockets in sequence",
    color: "text-orange-600",
    bgGradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    icon: "😊",
    isImplemented: true,
    route: "/games/letter-sound-matcher",
    duration: "2 min",
    status: 'pending',
    illustration: "😊🎵",
    imageUrl: game3Image
  },
  {
    id: "symbol-spotter",
    gameId: 4,
    name: "Symbol Spotter",
    description: "Find the hidden symbols!",
    color: "text-game-warning",
    bgGradient: "bg-gradient-playful",
    icon: "🔍",
    isImplemented: true,
    route: "/symbol-spotter",
    duration: "3 min",
    status: 'pending',
    illustration: "🔍✨",
    imageUrl: game1Image
  },
  {
    id: "bubble-popping",
    gameId: 5,
    name: "Bubble Popping",
    description: "Pop colorful bubbles for points!",
    color: "text-game-info",
    bgGradient: "bg-gradient-primary",
    icon: "🫧",
    isImplemented: true,
    route: "/bubble-popping",
    duration: "2 min",
    status: 'pending',
    illustration: "🫧💫",
    imageUrl: game2Image
  },
  {
    id: "temple-run",
    gameId: 6,
    name: "Crossroad Racer",
    description: "Race through traffic! Avoid cars and navigate crossroads.",
    color: "text-game-warning",
    bgGradient: "bg-gradient-secondary",
    icon: "🚗",
    isImplemented: true,
    route: "/games/temple-run",
    duration: "4 min",
    status: 'pending',
    illustration: "🚗🏁",
    imageUrl: game3Image
  },
  {
    id: "letter-reversal-spotter",
    gameId: 7,
    name: "Letter Reversal Spotter",
    description: "Help Panda find the right letters! Spot confusing letters and words.",
    color: "text-game-primary",
    bgGradient: "bg-gradient-primary",
    icon: "🐼",
    isImplemented: true,
    route: "/games/letter-reversal-spotter",
    duration: "3 min",
    status: 'pending',
    illustration: "🐼📝",
    imageUrl: game1Image
  },
  {
    id: "emotion-adventure",
    gameId: 8,
    name: "Emotion Adventure",
    description: "Go on an emotion journey!",
    color: "text-game-primary",
    bgGradient: "bg-gradient-playful",
    icon: "🌈",
    isImplemented: false,
    duration: "5 min",
    status: 'pending',
    illustration: "🌈✨",
    imageUrl: game2Image
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
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Yellow Background and Curved Bottom */}
      <div className="relative">
        {/* Yellow Header Background */}
        <div className="bg-yellow-400 relative">
          <div className="container mx-auto px-6 py-8 relative">
            {/* Header Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={() => navigate("/game-insights")}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-black/10 hover:text-gray-800 transition-all duration-300"
                title="Game Insights"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-black/10 hover:text-gray-800 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Header Content */}
            <div className="pt-8 pb-16">
              <p className="text-gray-700 text-lg font-medium mb-2">
                Hello, Arjun
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
                Start with<br />
                your games!
              </h1>
            </div>
          </div>
          
          {/* Smooth Inward Curve using SVG */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: '60px' }}>
            <svg 
              viewBox="0 0 1440 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path 
                d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" 
                fill="#f9fafb"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 pt-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Voice Chat Feature Button */}
          {/* <div className="flex justify-center mb-12">
            <Button
              onClick={() => navigate("/voice-chat")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Mic className="w-5 h-5 mr-3" />
              Start Voice Chat
            </Button>
          </div> */}

          {/* Games Layout with Progress Line */}
          <div className="relative pl-12">
            {/* Vertical Progress Line - Background */}
            <div className="absolute left-6 top-24 bottom-8 w-1.5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <line
                  x1="50%"
                  y1="0"
                  x2="50%"
                  y2="100%"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="7,10"
                />
              </svg>
            </div>
            
            {/* Game Cards with Integrated Progress Dots */}
            <div className="space-y-6">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="cursor-pointer relative"
                  onClick={() => handleGameClick(game)}
                >
                  {/* Progress Dot positioned at center-left of card */}
                  <div className="absolute left-[-2.3rem] top-1/2 transform -translate-y-1/2 z-20">
                    <div className={`w-7 h-7 rounded-full mr-20 border-3 shadow-sm transition-all duration-300
                      `}>
                      {game.status === 'completed' && (
                        <img src={checkLine} className="w-6 h-6 text-white m-1" alt="check" />
                      )}
                      {game.status === 'in-progress' && (
                        <div className="w-6 h-6 rounded-full bg-[#FDD201] m-1 border-[3px] border-[#A9A6A2]" />
                      )}
                        {game.status === 'pending' && (
                        <div className="w-6 h-6 rounded-full bg-white m-1 border-[3px] border-[#A9A6A2]" />
                      )}
                    </div>
                  </div>

                  {/* Game Card */}
                  <Card className=" bg-[#FAF6F3] rounded-3xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1" style={{boxShadow: '0px 8px 0px 0px #D4D1D2', border: '1px solid #D4D1D2'}}>
                    <div className="flex items-stretch">
                      {/* Game Content */}
                      <div className="flex-1 p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                          {game.name}
                        </h3>
                        <p className="text-gray-600 text-base mb-4 leading-relaxed">
                          {game.description}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          {game.duration}
                        </div>
                      </div>

                      {/* Game Illustration - With padding and rounded corners like reference */}
                      <div className="w-[134px] py-2 pr-2">
                        <PreloadedImage 
                          src={game.imageUrl} 
                          alt={game.name}
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Parent Companion AI Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      >
        <motion.button
          className="w-16 h-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/parent-companion')}
        >
          <Heart className="w-8 h-8 mx-auto" />
        </motion.button>
      </motion.div>
    </div>
  );
};
