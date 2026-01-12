import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { joinRoom } from '../services/api';
import { extractRoomId, isValidRoomId } from '../utils/roomUtils';
import '../styles/joinGame.css';

export function JoinGame() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if there's a room code in the URL on mount
  const urlRoomId = searchParams.get('room');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Extract room ID from input
    const roomId = extractRoomId(input);

    if (!roomId) {
      setError('Invalid room code or URL format. Please enter a valid room code (e.g., room-abc123) or URL.');
      return;
    }

    if (!isValidRoomId(roomId)) {
      setError('Invalid room code format. Room code should start with "room-" followed by alphanumeric characters.');
      return;
    }

    setIsJoining(true);

    try {
      const response = await joinRoom(roomId);

      if (response.success) {
        // Navigate to the game room
        navigate(`/room/${roomId}`);
      } else {
        setError(response.message || 'Failed to join room. Please try again.');
      }
    } catch (err) {
      // Handle specific error cases
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes('404')) {
          setError('Room not found. Please check the room code and try again.');
        } else if (message.includes('403') || message.includes('full')) {
          setError('Room is full. This game already has 2 players.');
        } else {
          setError('Failed to join room. Please check your connection and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Auto-fill input if room code is in URL
  const handleAutoFill = () => {
    if (urlRoomId) {
      setInput(urlRoomId);
      setError(null);
    }
  };

  return (
    <div className="join-game">
      <div className="join-game__container">
        <h1 className="join-game__title">Join Game</h1>
        <p className="join-game__description">
          Enter a room code or paste a game URL to join an existing game
        </p>

        {urlRoomId && !input && (
          <div className="join-game__url-detected">
            <p className="join-game__url-detected-text">
              Room code detected: <code>{urlRoomId}</code>
            </p>
            <button
              type="button"
              className="join-game__url-detected-button"
              onClick={handleAutoFill}
            >
              Use This Code
            </button>
          </div>
        )}

        <form className="join-game__form" onSubmit={handleSubmit}>
          <div className="join-game__input-group">
            <label htmlFor="room-input" className="join-game__label">
              Room Code or URL
            </label>
            <input
              id="room-input"
              type="text"
              className="join-game__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., room-abc123 or https://example.com/room/room-abc123"
              disabled={isJoining}
              aria-describedby={error ? 'join-error' : undefined}
              aria-invalid={error ? true : undefined}
            />
          </div>

          {error && (
            <div
              id="join-error"
              className="join-game__error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="join-game__actions">
            <button
              type="submit"
              className="join-game__submit"
              disabled={isJoining || !input.trim()}
              aria-busy={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
            <button
              type="button"
              className="join-game__cancel"
              onClick={() => navigate('/')}
              disabled={isJoining}
            >
              Back to Lobby
            </button>
          </div>
        </form>

        <div className="join-game__help">
          <h2 className="join-game__help-title">How to Join</h2>
          <ul className="join-game__help-list">
            <li>Enter the room code shared by your friend (e.g., room-abc123)</li>
            <li>Or paste the full game URL</li>
            <li>Click "Join Game" to start playing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
