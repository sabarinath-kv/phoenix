import { useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface GameRedirectState {
  fromGameRedirect?: boolean;
  gameClass?: string;
  gameSequence?: string[];
  completedGames?: string[];
  currentGameIndex?: number;
}

export const useGameRedirect = (currentGameId: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GameRedirectState;

  const isInRedirectFlow = Boolean(state?.fromGameRedirect);
  const gameClass = state?.gameClass;
  const gameSequence = state?.gameSequence || [];
  const completedGames = state?.completedGames || [];
  const currentGameIndex = state?.currentGameIndex || 0;

  const handleGameComplete = useCallback(() => {
    if (isInRedirectFlow) {
      // Add current game to completed games
      const updatedCompletedGames = [...completedGames];
      if (!updatedCompletedGames.includes(currentGameId)) {
        updatedCompletedGames.push(currentGameId);
      }

      // Navigate back to game redirect with updated progress
      navigate("/game-redirect", {
        state: {
          gameClass,
          completedGames: updatedCompletedGames,
        },
      });
    }
  }, [isInRedirectFlow, completedGames, currentGameId, gameClass, navigate]);

  const handleGoToNextGame = useCallback(() => {
    if (isInRedirectFlow) {
      const nextIndex = currentGameIndex + 1;

      // Add current game to completed games
      const updatedCompletedGames = [...completedGames];
      if (!updatedCompletedGames.includes(currentGameId)) {
        updatedCompletedGames.push(currentGameId);
      }

      if (nextIndex < gameSequence.length) {
        // Navigate back to redirect page with updated progress
        navigate("/game-redirect", {
          state: {
            gameClass,
            completedGames: updatedCompletedGames,
          },
        });
      } else {
        // All games completed, go to homepage
        navigate("/profile");
      }
    }
  }, [
    isInRedirectFlow,
    currentGameIndex,
    gameSequence.length,
    completedGames,
    currentGameId,
    gameClass,
    navigate,
  ]);

  const getNextGameName = useCallback(() => {
    if (isInRedirectFlow && currentGameIndex + 1 < gameSequence.length) {
      const nextGameId = gameSequence[currentGameIndex + 1];
      // You could expand this to return proper game names
      return nextGameId;
    }
    return null;
  }, [isInRedirectFlow, currentGameIndex, gameSequence]);

  const isLastGame =
    isInRedirectFlow && currentGameIndex + 1 >= gameSequence.length;

  return {
    isInRedirectFlow,
    gameClass,
    gameSequence,
    completedGames,
    currentGameIndex,
    isLastGame,
    handleGameComplete,
    handleGoToNextGame,
    getNextGameName,
  };
};
