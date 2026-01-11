import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CreateGame } from './CreateGame';
import * as api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api');

describe('CreateGame', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.createRoom).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    expect(screen.getByText(/creating your game room/i)).toBeInTheDocument();
  });

  it('creates room on mount and displays room info', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

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

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/game room created/i)).toBeInTheDocument();
    });

    expect(screen.getByText('room-test123')).toBeInTheDocument();
    expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument();
  });

  it('displays shareable URL', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

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
        playerX: null,
        playerO: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      },
      timestamp: Date.now(),
    });

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    await waitFor(() => {
      const urlInput = screen.getByRole('textbox', { name: /join url/i }) as HTMLInputElement;
      expect(urlInput.value).toContain('room-test123');
    });
  });

  it('handles room creation error', async () => {
    vi.mocked(api.createRoom).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to create game room/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/back to lobby/i)).toBeInTheDocument();
  });

  it('shows opponent joined when both players present', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

    // Opponent already joined
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

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    // Wait for room creation
    await waitFor(() => {
      expect(screen.getByText(/game room created/i)).toBeInTheDocument();
    });

    // Wait for polling to detect opponent
    await waitFor(
      () => {
        expect(screen.getByText(/opponent joined/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('navigates back to lobby when cancel is clicked', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

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
        playerX: null,
        playerO: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      },
      timestamp: Date.now(),
    });

    render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/game room created/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
