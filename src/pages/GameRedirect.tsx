import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GAME_CLASS } from "@/constants/game";
import { Clock, Check, Circle, Play, Lock } from "lucide-react";
import { motion } from "framer-motion";

// Import game images
import game1Image from "@/assets/images/game1.png";
import game2Image from "@/assets/images/game2.png";
import game3Image from "@/assets/images/game3.png";
import checkLine from "@/assets/images/check-line.png";
import GamePad from "@/assets/images/gamepad.png";

interface GameInfo {
  id: string;
  name: string;
  description: string;
  route: string;
  duration: string;
  imageUrl: string;
}

// Mapping from game IDs to their display information and routes
const GAME_INFO_MAP: Record<string, GameInfo> = {
  "symbol-spotter": {
    id: "symbol-spotter",
    name: "Symbol Spotter",
    description: "Tap moving rockets in sequence!",
    route: "/symbol-spotter",
    duration: "3 min",
    imageUrl: game1Image,
  },
  "bubble-popping": {
    id: "bubble-popping",
    name: "Bubble Popping",
    description: "Pop colorful bubbles for points!",
    route: "/bubble-popping",
    duration: "2 min",
    imageUrl: game2Image,
  },
  "freeze-cat": {
    id: "freeze-cat",
    name: "Freeze Cat",
    description: "Tap the animals! But do not tap the cat.",
    route: "/games/freeze-cat",
    duration: "2 min",
    imageUrl: game2Image,
  },
  "letter-sound": {
    id: "letter-sound",
    name: "Letter-Sound Matching",
    description: "Match letters with sounds!",
    route: "/games/letter-sound-matcher",
    duration: "2 min",
    imageUrl: game3Image,
  },
  "letter-reversal-spotter": {
    id: "letter-reversal-spotter",
    name: "Letter Reversal Spotter",
    description: "Help Panda find the right letters!",
    route: "/games/letter-reversal-spotter",
    duration: "3 min",
    imageUrl: game1Image,
  },
  "emotion-adventure": {
    id: "emotion-adventure",
    name: "Emotion Adventure",
    description: "Go on an emotion journey!",
    route: "/emotion-detector", // Using existing emotion detector for now
    duration: "5 min",
    imageUrl: game2Image,
  },
  "emotion-detector": {
    id: "emotion-detector",
    name: "Emotion Detector",
    description: "Copy the emoji faces!",
    route: "/emotion-detector",
    duration: "2 min",
    imageUrl: game1Image,
  },
};

// Hardcoded additional games that appear after config games
const HARDCODED_GAMES: GameInfo[] = [
  {
    id: "memory-match",
    name: "Memory Match",
    description: "Test your memory with colorful cards!",
    route: "/memory-match",
    duration: "4 min",
    imageUrl: game1Image,
  },
  {
    id: "pattern-puzzle",
    name: "Pattern Puzzle",
    description: "Complete the missing patterns!",
    route: "/pattern-puzzle",
    duration: "3 min",
    imageUrl: game2Image,
  },
  {
    id: "word-builder",
    name: "Word Builder",
    description: "Build words from letter blocks!",
    route: "/word-builder",
    duration: "5 min",
    imageUrl: game3Image,
  },
  {
    id: "shape-sorter",
    name: "Shape Sorter",
    description: "Sort shapes into the right places!",
    route: "/shape-sorter",
    duration: "2 min",
    imageUrl: game1Image,
  },
  {
    id: "number-adventure",
    name: "Number Adventure",
    description: "Go on a counting adventure!",
    route: "/number-adventure",
    duration: "4 min",
    imageUrl: game2Image,
  },
];

type GameClass = keyof typeof GAME_CLASS;

interface LocationState {
  gameClass: GameClass;
  completedGames?: string[];
}

export const GameRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {
    gameClass: "ADHD",
    completedGames: [],
  };

  const [gameClass, setGameClass] = useState<GameClass | null>(null);
  const [gameSequence, setGameSequence] = useState<GameInfo[]>([]);
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    // Get game class from route state
    if (state?.gameClass && GAME_CLASS[state.gameClass]) {
      setGameClass(state.gameClass);
      setCompletedGames(state.completedGames || []);

      // Map game IDs to game info
      const gameIds = GAME_CLASS[state.gameClass];
      const games = gameIds.map((id) => GAME_INFO_MAP[id]).filter(Boolean);
      setGameSequence(games);

      // Combine config games with hardcoded games
      const combinedGames = [...games, ...HARDCODED_GAMES];
      setAllGames(combinedGames);

      // Find current game index based on completed games
      const completedCount = state.completedGames?.length || 0;
      setCurrentGameIndex(completedCount);
    } else {
      // If no valid game class, redirect to game selection
      navigate("/");
    }
  }, [state, navigate]);

  const handleStartGame = (gameIndex: number) => {
    if (gameIndex < allGames.length) {
      const game = allGames[gameIndex];

      // Only navigate if it's a config game (not hardcoded)
      if (gameIndex < gameSequence.length) {
        // Navigate to game with state indicating we're in redirect flow
        navigate(game.route, {
          state: {
            fromGameRedirect: true,
            gameClass,
            gameSequence: gameSequence.map((g) => g.id),
            completedGames,
            currentGameIndex: gameIndex,
          },
        });
      } else {
        // For hardcoded games, just show a placeholder or coming soon message
        console.log(`Coming soon: ${game.name}`);
      }
    }
  };

  const handleGoToNextGame = () => {
    const nextIndex = currentGameIndex + 1;
    if (nextIndex < gameSequence.length) {
      setCurrentGameIndex(nextIndex);
      handleStartGame(nextIndex);
    } else {
      // All games completed, redirect to homepage
      navigate("/success");
    }
  };

  const getProgressPercentage = () => {
    if (gameSequence.length === 0) return 0;
    return (completedGames.length / gameSequence.length) * 100;
  };

  const getGameClassDisplayName = (gameClass: GameClass) => {
    switch (gameClass) {
      case "ADHD":
        return "ADHD Focus Games";
      case "DYSLEXIA":
        return "Dyslexia Support Games";
      case "AUTISM":
        return "Autism Friendly Games";
      default:
        return "Learning Games";
    }
  };

  if (!gameClass || allGames.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-muted-foreground">
            Loading games...
          </h2>
        </div>
      </div>
    );
  }

  const allGamesCompleted = completedGames.length === gameSequence.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Yellow Background and Curved Bottom */}
      <div className="relative">
        {/* Yellow Header Background */}
        <div className="flex flex-row bg-[#F9F0CB] relative">
          <div className="container mx-auto px-6 py-8 relative">
            {/* Header Content */}
            <div className="pt-8 pb-16">
              <p className="text-gray-700 text-lg font-medium mb-2">
                Hello, Arjun!
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
                Start with
                <br />
                your games!
              </h1>
            </div>
          </div>
          <img
            src={GamePad}
            alt="GamePad"
            style={{
              width: "87px",
              height: "99px",
              position: "absolute",
              top: "90px",
              left: "320px",
              transform: "rotate(0deg)",
              opacity: 1,
            }}
          />

          {/* Smooth Inward Curve using SVG */}
          <div
            className="absolute bottom-0 left-0 w-full overflow-hidden"
            style={{ height: "60px" }}
          >
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
          {/* Games Layout with Progress Line */}
          <div className="relative pl-6">
            {/* Vertical Progress Line - Background */}
            <div className="absolute left-0 top-24 bottom-8 w-1.5">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
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
            <div className="space-y-8">
              {allGames.map((game, index) => {
                const isCompleted = completedGames.includes(game.id);
                const isCurrent =
                  index === currentGameIndex && !allGamesCompleted;
                const isLocked = index > currentGameIndex && !allGamesCompleted;
                const isHardcodedGame = index >= gameSequence.length;

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative ${
                      isHardcodedGame ? "cursor-default" : "cursor-pointer"
                    }`}
                    onClick={() => !isLocked && handleStartGame(index)}
                  >
                    {/* Progress Dot positioned at center-left of card */}
                    <div className="absolute left-[-2.3rem] top-1/2 transform -translate-y-1/2 z-20">
                      <div
                        className={`w-7 h-7 rounded-full mr-20 border-3 shadow-sm transition-all duration-300
                        `}
                      >
                        {isCompleted && !isHardcodedGame && (
                          <img
                            src={checkLine}
                            className="w-6 h-6 text-white m-1"
                            alt="check"
                          />
                        )}
                        {isCurrent && !isCompleted && !isHardcodedGame && (
                          <div className="w-6 h-6 rounded-full bg-[#FDD201] m-1 border-[3px] border-[#A9A6A2]" />
                        )}
                        {(isLocked || isHardcodedGame) && (
                          <div className="w-6 h-6 rounded-full bg-white m-1 border-[3px] border-[#A9A6A2]" />
                        )}
                      </div>
                    </div>

                    {/* Game Card */}
                    <div
                      className={`bg-[#FAF6F3] rounded-3xl overflow-hidden transition-all duration-300 
                      ${
                        !isLocked && !isHardcodedGame
                          ? "hover:shadow-lg hover:border-gray-200 hover:-translate-y-1"
                          : ""
                      }
                      ${
                        isCurrent && !isHardcodedGame
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }
                    `}
                      style={{
                        boxShadow: "0px 8px 0px 0px #D4D1D2",
                        border: "1px solid #D4D1D2",
                      }}
                    >
                      <div className="flex items-center">
                        {/* Game Content */}
                        <div className="flex-1 py-4 pr-2 pl-6">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                              {game.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-[14px] mb-2 leading-relaxed">
                            {game.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-[#383534] text-sm font-medium">
                              <Clock className="w-4 h-4 mr-2" />
                              {game.duration}
                            </div>
                          </div>
                        </div>

                        {/* Game Illustration */}
                        <div className="w-[132px] h-[132px] py-2 pr-2">
                          <img
                            src={game.imageUrl}
                            alt={game.name}
                            className="w-full h-full object-contain rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Completion Section */}
          {allGamesCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-green-400 to-blue-500 shadow-soft border-0 rounded-3xl">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Congratulations!
                  </h2>
                  <p className="text-white/90 text-lg mb-6">
                    You've completed all {getGameClassDisplayName(gameClass)}{" "}
                    games! Great job on your learning journey.
                  </p>
                  <Button
                    onClick={() => navigate("/homepage")}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Go to Homepage
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Back Button */}
          {/* <div className="text-center mt-8">
            <Button
              onClick={() => navigate("/homepage")}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Homepage
            </Button>
          </div> */}
        </div>
      </main>
    </div>
  );
};
