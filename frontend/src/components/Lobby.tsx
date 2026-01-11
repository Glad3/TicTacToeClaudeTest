import { useNavigate } from 'react-router-dom';
import '../styles/lobby.css';

export function Lobby() {
  const navigate = useNavigate();

  const handlePlayLocally = () => {
    navigate('/local');
  };

  const handleCreateOnline = () => {
    navigate('/create');
  };

  const handleJoinOnline = () => {
    navigate('/join');
  };

  return (
    <div className="lobby">
      <h1 className="lobby__title">Tic Tac Toe</h1>
      <p className="lobby__subtitle">Choose your game mode</p>

      <div className="lobby__buttons">
        <button
          className="lobby__button lobby__button--local"
          onClick={handlePlayLocally}
          aria-label="Play locally with two players on the same device"
        >
          Play Locally
        </button>

        <button
          className="lobby__button lobby__button--create"
          onClick={handleCreateOnline}
          aria-label="Create a new online game room to play with a friend"
        >
          Create Online Game
        </button>

        <button
          className="lobby__button lobby__button--join"
          onClick={handleJoinOnline}
          aria-label="Join an existing online game room using a room code"
        >
          Join Online Game
        </button>
      </div>

      <div className="lobby__help">
        <p><strong>Play Locally:</strong> Two players on the same device</p>
        <p><strong>Create Online:</strong> Get a room code to share with a friend</p>
        <p><strong>Join Online:</strong> Enter a room code to join a friend's game</p>
      </div>
    </div>
  );
}
