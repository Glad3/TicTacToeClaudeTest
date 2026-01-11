import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Board } from './Board';
import { GameStatus } from './GameStatus';
import * as api from '../services/api';
import { RoomStateResponse, GameState } from '../types/game';
import '../styles/gameRoom.css';

export function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    state: 'playing',
    winner: null,
  });
  const [roomState, setRoomState] = useState<RoomStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);

  // Validate roomId format
  useEffect(() => {
    if (!roomId || !roomId.startsWith('room-')) {
      setError('Invalid room ID format');
      setIsLoading(false);
    }
  }, [roomId]);

  // Fetch initial room state
  useEffect(() => {
    if (!roomId || error) return;

    const fetchRoomState = async () => {
      try {
        const response = await api.getRoomState(roomId);
        setRoomState(response);
        setGameState(response.state);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load room. The room may not exist or has expired.');
        setIsLoading(false);
      }
    };

    fetchRoomState();
  }, [roomId, error]);

  // Poll for room state updates
  useEffect(() => {
    if (!roomId || error || isLoading) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.getRoomState(roomId);
        setRoomState(response);
        setGameState(response.state);
        setPollingError(null);
      } catch (err) {
        setPollingError('Connection lost. Retrying...');
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [roomId, error, isLoading]);

  const handleCellClick = async (position: number) => {
    // This will be implemented when we add the room move API
    // For now, show a placeholder message
    console.log(`Cell ${position} clicked in room ${roomId}`);
  };

  const handleReset = () => {
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="game-room">
        <div className="game-room__error">
          <h2 className="game-room__error-title">Room Error</h2>
          <p className="game-room__error-message">{error}</p>
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

  if (isLoading) {
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
  const playerX = roomState?.room.playerX;
  const playerO = roomState?.room.playerO;
  const bothPlayersPresent = playerX && playerO;

  return (
    <div className="game-room">
      <div className="game-room__container">
        <div className="game-room__header">
          <h1 className="game-room__title">Tic Tac Toe - Online Game</h1>
          <p className="game-room__room-id">Room: {roomId}</p>
        </div>

        {pollingError && (
          <div className="game-room__polling-error" role="alert">
            {pollingError}
          </div>
        )}

        {!bothPlayersPresent && (
          <div className="game-room__waiting" role="status">
            <p className="game-room__waiting-text">Waiting for opponent to join...</p>
          </div>
        )}

        {bothPlayersPresent && (
          <div className="game-room__players">
            <div className="game-room__player">
              <span className="game-room__player-marker">X</span>
              <span className="game-room__player-name">{playerX.name}</span>
            </div>
            <div className="game-room__player">
              <span className="game-room__player-marker">O</span>
              <span className="game-room__player-name">{playerO.name}</span>
            </div>
          </div>
        )}

        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          disabled={isLoading || isGameOver || !bothPlayersPresent}
        />

        <GameStatus
          gameState={gameState}
          onReset={handleReset}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
