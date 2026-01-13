import { useState, useCallback } from 'react';
import { GameState, Player, CellValue } from '../types/game';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  state: 'playing',
  winner: null,
};

interface UseLocalGameResult {
  gameState: GameState;
  handleCellClick: (position: number) => void;
  handleReset: () => void;
}

function checkWinner(board: CellValue[]): Player | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function checkDraw(board: CellValue[]): boolean {
  return board.every(cell => cell !== null);
}

export function useLocalGame(): UseLocalGameResult {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const handleCellClick = useCallback((position: number) => {
    if (gameState.state !== 'playing') {
      return;
    }

    if (gameState.board[position] !== null) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[position] = gameState.currentPlayer;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && checkDraw(newBoard);

    setGameState({
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      state: winner ? 'won' : isDraw ? 'draw' : 'playing',
      winner: winner,
    });
  }, [gameState]);

  const handleReset = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  return {
    gameState,
    handleCellClick,
    handleReset,
  };
}
