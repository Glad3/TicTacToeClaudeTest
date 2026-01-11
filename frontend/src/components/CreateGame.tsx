import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import '../styles/createGame.css';

export function CreateGame() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  // Create room on component mount
  useEffect(() => {
    const createGameRoom = async () => {
      try {
        const response = await api.createRoom();
        setRoomId(response.roomId);

        // Generate full join URL
        const fullUrl = `${window.location.origin}/join?room=${response.roomId}`;
        setJoinUrl(fullUrl);

        setIsCreating(false);
      } catch (err) {
        setError('Failed to create game room. Please try again.');
        setIsCreating(false);
      }
    };

    createGameRoom();
  }, []);

  // Poll for opponent joining
  useEffect(() => {
    if (!roomId || !isWaiting) return;

    const pollInterval = setInterval(async () => {
      try {
        const state = await api.getRoomState(roomId);

        // Check if opponent has joined (both players present)
        if (state.room.playerX && state.room.playerO) {
          setIsWaiting(false);
          clearInterval(pollInterval);

          // Navigate to game room
          setTimeout(() => {
            navigate(`/room/${roomId}`);
          }, 1000);
        }
      } catch (err) {
        // Silently fail - will retry on next interval
        console.error('Error polling room state:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [roomId, isWaiting, navigate]);

  const handleCopyUrl = async () => {
    if (!joinUrl) return;

    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }

      document.body.removeChild(textArea);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isCreating) {
    return (
      <div className="create-game">
        <div className="create-game__loading">
          <div className="create-game__spinner"></div>
          <p>Creating your game room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-game">
        <div className="create-game__error">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="create-game__button create-game__button--primary"
            onClick={handleCancel}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-game">
      <h1 className="create-game__title">Game Room Created!</h1>

      <div className="create-game__room-info">
        <div className="create-game__section">
          <label className="create-game__label">Room Code:</label>
          <div className="create-game__code">{roomId}</div>
        </div>

        <div className="create-game__section">
          <label className="create-game__label">Share this link with your opponent:</label>
          <div className="create-game__url-container">
            <input
              type="text"
              className="create-game__url-input"
              value={joinUrl || ''}
              readOnly
              aria-label="Join URL"
            />
            <button
              className="create-game__copy-button"
              onClick={handleCopyUrl}
              aria-label="Copy join URL to clipboard"
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          {copySuccess && (
            <p className="create-game__copy-success">URL copied to clipboard!</p>
          )}
        </div>
      </div>

      {isWaiting ? (
        <div className="create-game__waiting">
          <div className="create-game__waiting-spinner"></div>
          <p className="create-game__waiting-text">Waiting for opponent to join...</p>
          <p className="create-game__waiting-hint">Share the link above with a friend</p>
        </div>
      ) : (
        <div className="create-game__ready">
          <p className="create-game__ready-text">✓ Opponent joined! Starting game...</p>
        </div>
      )}

      <button
        className="create-game__button create-game__button--secondary"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </div>
  );
}
