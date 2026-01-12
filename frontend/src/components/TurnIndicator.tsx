import { Player, GameStatus } from '../types/game';
import '../styles/turnIndicator.css';

export interface TurnIndicatorProps {
  currentPlayer: Player;
  myMarker: Player | null;
  isMyTurn: boolean;
  gameStatus: GameStatus;
  winner: Player | null;
  playerXName?: string;
  playerOName?: string;
}

export function TurnIndicator({
  currentPlayer,
  myMarker,
  isMyTurn,
  gameStatus,
  winner,
  playerXName = 'Player X',
  playerOName = 'Player O',
}: TurnIndicatorProps) {
  const getCurrentPlayerName = () => {
    return currentPlayer === 'X' ? playerXName : playerOName;
  };

  const getWinnerName = () => {
    if (!winner) return null;
    return winner === 'X' ? playerXName : playerOName;
  };

  if (gameStatus === 'won') {
    const isMyWin = winner === myMarker;
    return (
      <div
        className={`turn-indicator turn-indicator--game-over ${
          isMyWin ? 'turn-indicator--win' : 'turn-indicator--lose'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="turn-indicator__icon" aria-hidden="true">
          {isMyWin ? '🎉' : '😔'}
        </span>
        <span className="turn-indicator__text">
          {isMyWin ? 'You won!' : `${getWinnerName()} wins!`}
        </span>
      </div>
    );
  }

  if (gameStatus === 'draw') {
    return (
      <div
        className="turn-indicator turn-indicator--game-over turn-indicator--draw"
        role="status"
        aria-live="polite"
      >
        <span className="turn-indicator__icon" aria-hidden="true">🤝</span>
        <span className="turn-indicator__text">It's a draw!</span>
      </div>
    );
  }

  return (
    <div
      className={`turn-indicator ${
        isMyTurn ? 'turn-indicator--my-turn' : 'turn-indicator--opponent-turn'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="turn-indicator__marker" aria-hidden="true">
        {currentPlayer}
      </span>
      <span className="turn-indicator__text">
        {isMyTurn ? "Your turn" : `${getCurrentPlayerName()}'s turn`}
      </span>
      {isMyTurn && (
        <span className="turn-indicator__hint">Make your move!</span>
      )}
    </div>
  );
}
