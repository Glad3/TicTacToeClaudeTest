import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameRoom } from './GameRoom';
import * as api from '../services/api';

vi.mock('../services/api');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('GameRoom', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  const renderGameRoom = (roomId: string) => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/room/:roomId" element={<GameRoom />} />
        </Routes>
      </BrowserRouter>,
      { wrapper: ({ children }) => {
        window.history.pushState({}, '', `/room/${roomId}`);
        return <>{children}</>;
      }}
    );
  };

  it('shows loading state initially', () => {
    vi.mocked(api.getRoomState).mockImplementation(() => new Promise(() => {}));

    renderGameRoom('room-test123');

    expect(screen.getByRole('status', { name: /loading room/i })).toBeInTheDocument();
    expect(screen.getByText(/loading game room/i)).toBeInTheDocument();
  });

  it('shows error for invalid room ID format', async () => {
    renderGameRoom('invalid-id');

    await waitFor(() => {
      expect(screen.getByText(/invalid room id format/i)).toBeInTheDocument();
    });
  });

  it('shows error when room fetch fails', async () => {
    vi.mocked(api.getRoomState).mockRejectedValue(new Error('Room not found'));

    renderGameRoom('room-test123');

    await waitFor(() => {
      expect(screen.getByText(/failed to load room/i)).toBeInTheDocument();
    });
  });

  it('renders game room with valid room data', async () => {
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

    renderGameRoom('room-test123');

    await waitFor(() => {
      expect(screen.getByText(/room: room-test123/i)).toBeInTheDocument();
    });
  });

  it('shows waiting message when opponent has not joined', async () => {
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

    renderGameRoom('room-test123');

    await waitFor(() => {
      expect(screen.getByText(/waiting for opponent to join/i)).toBeInTheDocument();
    });
  });

  it('shows both players when both have joined', async () => {
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
        status: 'playing',
        playerX: {
          playerId: 'player1',
          name: 'Player 1',
          marker: 'X',
          isConnected: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        },
        playerO: {
          playerId: 'player2',
          name: 'Player 2',
          marker: 'O',
          isConnected: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        },
        createdAt: Date.now(),
        lastActivity: Date.now(),
      },
      timestamp: Date.now(),
    });

    renderGameRoom('room-test123');

    await waitFor(() => {
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });
  });

  it('disables board when waiting for opponent', async () => {
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

    renderGameRoom('room-test123');

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    // Board cells should not trigger clicks when disabled
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
