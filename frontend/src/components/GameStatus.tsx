import { GameState } from '../types/game';
import '../styles/GameStatus.css';

interface GameStatusProps {
  gameState: GameState;
  onReset: () => void;
  isLoading: boolean;
  error: string | null;
}

export function GameStatus({ gameState, onReset, isLoading, error }: GameStatusProps) {
  const getStatusMessage = (): string => {
    if (isLoading) {
      return 'Loading...';
    }

    if (error) {
      return error;
    }

    switch (gameState.state) {
      case 'won':
        return `Player ${gameState.winner} wins!`;
      case 'draw':
        return "It's a draw!";
      case 'playing':
      default:
        return `Player ${gameState.currentPlayer}'s turn`;
    }
  };

  const isGameOver = gameState.state === 'won' || gameState.state === 'draw';

  return (
    <div className="game-status">
      <p
        className={`game-status__message ${error ? 'game-status__message--error' : ''} ${isGameOver ? 'game-status__message--gameover' : ''}`}
        role="status"
        aria-live="polite"
      >
        {getStatusMessage()}
      </p>
      <button
        className="game-status__reset-btn"
        onClick={onReset}
        disabled={isLoading}
      >
        {isGameOver ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}
