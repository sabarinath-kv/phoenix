import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FaceDetectionTest } from "@/components/FaceDetectionTest";

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
    color: "text-blue-700",
    bgGradient: "from-blue-200 to-purple-200",
    icon: "😊",
    isImplemented: true,
    route: "/emotion-detector",
  },
  {
    id: "letter-sound",
    name: "Letter-Sound Matching",
    description: "Match letters with sounds!",
    color: "text-green-700",
    bgGradient: "from-green-200 to-emerald-200",
    icon: "🔤",
    isImplemented: true,
    route: "/games/letter-sound-matcher",
  },
  {
    id: "symbol-spotter",
    name: "Symbol Spotter",
    description: "Find the hidden symbols!",
    color: "text-orange-700",
    bgGradient: "from-orange-200 to-yellow-200",
    icon: "🔍",
    isImplemented: true,
    route: "/symbol-spotter",
  },
  {
    id: "bubble-popping",
    name: "Bubble Popping",
    description: "Pop colorful bubbles for points!",
    color: "text-cyan-700",
    bgGradient: "from-cyan-200 to-blue-200",
    icon: "🫧",
    isImplemented: true,
    route: "/bubble-popping",

  },
  {
    id: "freeze-cat",
    name: "Freeze Cat",
    description: "Tap the animals! But do not tap the cat. Stay frozen when you see a cat.",
    color: "text-purple-700",
    bgGradient: "from-purple-200 to-pink-200",
    icon: "🐱",
    isImplemented: true,
    route: "/games/freeze-cat",
  },
  {
    id: "temple-run",
    name: "Crossroad Racer",
    description: "Race through traffic! Avoid cars and navigate crossroads.",
    color: "text-amber-700",
    bgGradient: "from-amber-200 to-orange-200",
    icon: "🚗",
    isImplemented: true,
    route: "/games/temple-run",
  },
  {
    id: "emotion-adventure",
    name: "Emotion Adventure",
    description: "Go on an emotion journey!",
    color: "text-pink-700",
    bgGradient: "from-pink-200 to-rose-200",
    icon: "🌈",
    isImplemented: false,
  },
];

export const GameSelection = () => {
  const navigate = useNavigate();

  const handleGameClick = (game: GameCard) => {
    if (game.isImplemented && game.route) {
      navigate(game.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            Fun Learning Games
          </h1>
          <p className="text-center text-white/90 mt-2 text-sm sm:text-base">
            Choose a game to play and learn
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2">
              Welcome to Learning Time
            </h2>
            <p className="text-purple-600 text-lg">
              Pick a game and let's have fun learning together
            </p>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-gradient-to-br ${
                  game.bgGradient
                } border-2 border-white/50 shadow-lg ${
                  game.isImplemented ? "hover:shadow-2xl" : "opacity-75"
                }`}
                onClick={() => handleGameClick(game)}
              >
                <div className="p-6 text-center h-full flex flex-col justify-between min-h-[200px]">
                  {/* Game Icon */}
                  <div className="text-6xl sm:text-7xl mb-4">{game.icon}</div>

                  {/* Game Info */}
                  <div className="space-y-3">
                    <h3
                      className={`text-lg sm:text-xl font-bold ${game.color}`}
                    >
                      {game.name}
                    </h3>
                    <p
                      className={`text-sm ${game.color.replace(
                        "700",
                        "600"
                      )} leading-relaxed`}
                    >
                      {game.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    {game.isImplemented ? (
                      <div className="inline-flex items-center gap-1 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-green-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-semibold text-green-700">
                          Ready to Play
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 bg-gray-400/20 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-300">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-xs font-semibold text-gray-600">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Face Detection Test */}
          <div className="mt-8">
            <FaceDetectionTest />
          </div>
        </div>
      </main>
    </div>
  );
};
