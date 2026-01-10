import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import './styles/App.css';

function App() {
  const { gameState, isLoading, error, handleCellClick, handleReset } = useGame();

  const isGameOver = gameState.state === 'won' || gameState.state === 'draw';

  return (
    <div className="app">
      <h1 className="app__title">Tic Tac Toe</h1>
      <Board
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={isLoading || isGameOver}
      />
      <GameStatus
        gameState={gameState}
        onReset={handleReset}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default App;
