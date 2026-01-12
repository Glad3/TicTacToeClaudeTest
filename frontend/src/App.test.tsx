import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lobby } from './components/Lobby';
import { LocalGame } from './components/LocalGame';
import { CreateGame } from './components/CreateGame';
import { JoinGame } from './components/JoinGame';
import { GameRoom } from './components/GameRoom';
import { NotFound } from './components/NotFound';
import * as api from './services/api';

vi.mock('./services/api');

// Create a test router component that uses the same structure as App
function TestRouter({ initialPath }: { initialPath: string }) {
  window.history.pushState({}, '', initialPath);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Lobby component on root path /', () => {
    render(<TestRouter initialPath="/" />);

    expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
    expect(screen.getByText('Choose your game mode')).toBeInTheDocument();
  });

  it('renders LocalGame component on /local path', () => {
    render(<TestRouter initialPath="/local" />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders CreateGame component on /create path', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

    render(<TestRouter initialPath="/create" />);

    await waitFor(() => {
      expect(screen.getByText(/game room created/i)).toBeInTheDocument();
    });
  });

  it('renders JoinGame component on /join path', () => {
    render(<TestRouter initialPath="/join" />);

    expect(screen.getByRole('heading', { name: 'Join Game' })).toBeInTheDocument();
    expect(screen.getByLabelText(/room code or url/i)).toBeInTheDocument();
  });

  it('renders GameRoom component on /room/:roomId path', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue({
      success: true,
      state: {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        state: 'playing',
        winner: null,
      },
      room: {
        roomId: 'room-test123',
        status: 'waiting',
        playerX: {
          playerId: 'player1',
          name: 'Player 1',
          marker: 'X',
          isConnected: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        },
        playerO: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      },
      timestamp: Date.now(),
    });

    render(<TestRouter initialPath="/room/room-test123" />);

    await waitFor(() => {
      expect(screen.getByText(/room: room-test123/i)).toBeInTheDocument();
    });
  });

  it('renders NotFound component for unknown paths', () => {
    render(<TestRouter initialPath="/unknown-path" />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders NotFound component for invalid routes', () => {
    render(<TestRouter initialPath="/this/does/not/exist" />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('handles nested invalid paths', () => {
    render(<TestRouter initialPath="/local/extra/path" />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
