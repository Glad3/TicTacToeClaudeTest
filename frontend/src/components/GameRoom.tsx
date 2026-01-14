import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Board } from './Board';
import { ConnectionStatus } from './ConnectionStatus';
import { TurnIndicator } from './TurnIndicator';
import { useRoomSync } from '../hooks/useRoomSync';
import * as api from '../services/api';
import '../styles/gameRoom.css';

// Generate or retrieve player ID from session storage
function getPlayerId(): string {
  const storageKey = 'tictactoe_player_id';
  let playerId = sessionStorage.getItem(storageKey);
  if (!playerId) {
    playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(storageKey, playerId);
  }
  return playerId;
}

export function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate roomId format
  useEffect(() => {
    if (!roomId || !roomId.startsWith('room-')) {
      setValidationError('Invalid room ID format');
    }
  }, [roomId]);

  const playerId = getPlayerId();

  const {
    gameState,
    roomInfo,
    syncStatus,
    error,
    isMyTurn,
    myMarker,
    opponentConnected,
    lastSyncTime,
    refresh,
    makeMove,
  } = useRoomSync(validationError ? undefined : roomId, playerId, {
    pollingInterval: 1500,
    maxRetries: 5,
  });

  const handleCellClick = async (position: number) => {
    if (!isMyTurn) return;
    await makeMove(position);
  };

  const handlePlayAgain = async () => {
    if (!roomId) return;
    try {
      await api.resetRoom(roomId);
      // Trigger immediate refresh to see the reset board
      await refresh();
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Show validation error
  if (validationError) {
    return (
      <div className="game-room">
        <div className="game-room__error">
          <h2 className="game-room__error-title">Room Error</h2>
          <p className="game-room__error-message">{validationError}</p>
          <button
            className="game-room__error-button"
            onClick={handleGoHome}
            aria-label="Return to lobby"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Show connection error
  if (syncStatus === 'error' && error) {
    return (
      <div className="game-room">
        <div className="game-room__error">
          <h2 className="game-room__error-title">Connection Error</h2>
          <p className="game-room__error-message">{error}</p>
          <div className="game-room__error-actions">
            <button
              className="game-room__error-button game-room__error-button--primary"
              onClick={refresh}
              aria-label="Retry connection"
            >
              Retry
            </button>
            <button
              className="game-room__error-button game-room__error-button--secondary"
              onClick={handleGoHome}
              aria-label="Return to lobby"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (syncStatus === 'connecting' && !roomInfo) {
    return (
      <div className="game-room">
        <div className="game-room__loading">
          <div className="game-room__spinner" role="status" aria-label="Loading room"></div>
          <p className="game-room__loading-text">Loading game room...</p>
        </div>
      </div>
    );
  }

  const isGameOver = gameState.state === 'won' || gameState.state === 'draw';
  const playerX = roomInfo?.playerX;
  const playerO = roomInfo?.playerO;
  const bothPlayersPresent = playerX && playerO;

  const opponentName = myMarker === 'X'
    ? playerO?.name || 'Opponent'
    : playerX?.name || 'Opponent';

  return (
    <div className="game-room">
      <div className="game-room__container">
        <div className="game-room__header">
          <h1 className="game-room__title">Tic Tac Toe - Online Game</h1>
          <p className="game-room__room-id">Room: {roomId}</p>
        </div>

        <ConnectionStatus
          syncStatus={syncStatus}
          opponentConnected={opponentConnected}
          opponentName={opponentName}
          lastSyncTime={lastSyncTime}
          onRefresh={refresh}
        />

        {!bothPlayersPresent && (
          <div className="game-room__waiting" role="status">
            <p className="game-room__waiting-text">Waiting for opponent to join...</p>
            <p className="game-room__waiting-hint">Share the room URL with a friend</p>
          </div>
        )}

        {bothPlayersPresent && (
          <>
            <TurnIndicator
              currentPlayer={gameState.currentPlayer}
              myMarker={myMarker}
              isMyTurn={isMyTurn}
              gameStatus={gameState.state}
              winner={gameState.winner}
              playerXName={playerX.name}
              playerOName={playerO.name}
            />

            <div className="game-room__players">
              <div className={`game-room__player ${myMarker === 'X' ? 'game-room__player--me' : ''}`}>
                <span className="game-room__player-marker">X</span>
                <span className="game-room__player-name">
                  {playerX.name}
                  {myMarker === 'X' && <span className="game-room__player-you">(You)</span>}
                </span>
              </div>
              <div className={`game-room__player ${myMarker === 'O' ? 'game-room__player--me' : ''}`}>
                <span className="game-room__player-marker">O</span>
                <span className="game-room__player-name">
                  {playerO.name}
                  {myMarker === 'O' && <span className="game-room__player-you">(You)</span>}
                </span>
              </div>
            </div>
          </>
        )}

        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          disabled={!isMyTurn || isGameOver || !bothPlayersPresent}
        />

        {isGameOver && (
          <div className="game-room__game-over">
            <button
              className="game-room__play-again"
              onClick={handlePlayAgain}
              aria-label="Play again in the same room"
            >
              Play Again
            </button>
          </div>
        )}

        <button
          className="game-room__exit-button"
          onClick={handleGoHome}
          aria-label="Exit to main menu"
        >
          Exit to Menu
        </button>
      </div>
    </div>
  );
}
