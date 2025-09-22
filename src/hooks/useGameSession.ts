import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createGameSession, CreateGameSessionRequest } from "@/api/apis";

interface GameSessionMetrics {
  [key: string]: any;
}

export const useGameSession = (gameId: number) => {
  const { user } = useAuth();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startSession = useCallback(() => {
    setSessionStartTime(new Date());
    setIsSessionActive(true);
  }, []);

  const endSession = useCallback(
    async (
      success: boolean,
      points: number,
      rawData: GameSessionMetrics = {}
    ) => {
      if (!sessionStartTime || !user || !isSessionActive) {
        console.warn("Cannot end session: missing session data or user");
        return;
      }

      const endTime = new Date();
      const durationSeconds = Math.floor(
        (endTime.getTime() - sessionStartTime.getTime()) / 1000
      );

      const sessionData: CreateGameSessionRequest = {
        user_id: user.id,
        game_id: gameId,
        started_at: sessionStartTime.toISOString(),
        success,
        points,
        duration_seconds: durationSeconds,
        raw_data: rawData,
      };

      try {
        const response = await createGameSession(sessionData);
        console.log("Game session created successfully:", response);
        setIsSessionActive(false);
        setSessionStartTime(null);
        return response;
      } catch (error) {
        console.error("Failed to create game session:", error);
        throw error;
      }
    },
    [sessionStartTime, user, gameId, isSessionActive]
  );

  const endSessionWithHardcodedData = useCallback(
    async (gameName: string) => {
      // Hardcoded values for games other than BubblePopping
      const hardcodedData = {
        "symbol-spotter": {
          success: true,
          points: Math.floor(Math.random() * 100) + 50, // 50-150 points
          rawData: {
            targetEmoji: "🎯",
            correctClicks: Math.floor(Math.random() * 10) + 5,
            wrongClicks: Math.floor(Math.random() * 3),
            accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
          },
        },
        "freeze-cat": {
          success: true,
          points: Math.floor(Math.random() * 80) + 40, // 40-120 points
          rawData: {
            correctTaps: Math.floor(Math.random() * 15) + 10,
            incorrectTaps: Math.floor(Math.random() * 5),
            totalTaps: Math.floor(Math.random() * 20) + 15,
            accuracy: Math.floor(Math.random() * 25) + 75, // 75-100%
          },
        },
        "letter-sound": {
          success: true,
          points: Math.floor(Math.random() * 7) + 1, // 1-7 points (max 7 rounds)
          rawData: {
            totalRounds: 7,
            correctAnswers: Math.floor(Math.random() * 3) + 5, // 5-7 correct
            accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
          },
        },
        "letter-reversal-spotter": {
          success: true,
          points: Math.floor(Math.random() * 200) + 100, // 100-300 points
          rawData: {
            totalChallenges: Math.floor(Math.random() * 10) + 15,
            correctAnswers: Math.floor(Math.random() * 5) + 12,
            difficultyLevel: Math.floor(Math.random() * 3) + 2, // 2-4
            accuracy: Math.floor(Math.random() * 25) + 75, // 75-100%
          },
        },
        "emotion-detector": {
          success: true,
          points: 5, // Always complete all 5 emotions
          rawData: {
            totalEmojis: 5,
            completedEmojis: 5,
            averageDetectionTime: Math.floor(Math.random() * 5000) + 3000, // 3-8 seconds
            accuracy: 100, // Always successful in emotion detection
          },
        },
      };

      const gameData = hardcodedData[gameName as keyof typeof hardcodedData];
      if (gameData) {
        return await endSession(
          gameData.success,
          gameData.points,
          gameData.rawData
        );
      } else {
        // Fallback for unknown games
        return await endSession(true, 50, { gameName, completed: true });
      }
    },
    [endSession]
  );

  return {
    startSession,
    endSession,
    endSessionWithHardcodedData,
    isSessionActive,
    sessionStartTime,
  };
};
