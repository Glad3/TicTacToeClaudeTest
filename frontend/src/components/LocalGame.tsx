import { useLocalGame } from '../hooks/useLocalGame';
import { Board } from './Board';
import { GameStatus } from './GameStatus';
import '../styles/App.css';

export function LocalGame() {
  const { gameState, handleCellClick, handleReset } = useLocalGame();

  const isGameOver = gameState.state === 'won' || gameState.state === 'draw';

  return (
    <div className="app">
      <h1 className="app__title">Tic Tac Toe - Local Game</h1>
      <Board
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={isGameOver}
      />
      <GameStatus
        gameState={gameState}
        onReset={handleReset}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
