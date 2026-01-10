import { useState, useEffect, useCallback } from 'react';
import { GameState, Player } from '../types/game';
import * as api from '../services/api';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  state: 'playing',
  winner: null,
};

interface UseGameResult {
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  handleCellClick: (position: number) => Promise<void>;
  handleReset: () => Promise<void>;
}

export function useGame(): UseGameResult {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getGameState();
      if (response.success) {
        setGameState(response.state);
      }
    } catch (err) {
      setError('Failed to load game state');
      console.error('Error fetching game state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  const handleCellClick = useCallback(async (position: number) => {
    if (gameState.state !== 'playing') {
      return;
    }

    if (gameState.board[position] !== null) {
      return;
    }

    try {
      setError(null);
      const response = await api.makeMove(position);
      if (response.success) {
        setGameState(response.state);
      } else {
        setError(response.message || 'Invalid move');
      }
    } catch (err) {
      setError('Failed to make move');
      console.error('Error making move:', err);
    }
  }, [gameState.state, gameState.board]);

  const handleReset = useCallback(async () => {
    try {
      setError(null);
      const response = await api.resetGame();
      if (response.success) {
        setGameState(response.state);
      }
    } catch (err) {
      setError('Failed to reset game');
      console.error('Error resetting game:', err);
    }
  }, []);

  return {
    gameState,
    isLoading,
    error,
    handleCellClick,
    handleReset,
  };
}
