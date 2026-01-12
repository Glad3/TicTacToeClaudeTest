import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRoomSync } from './useRoomSync';
import * as api from '../services/api';

vi.mock('../services/api');

describe('useRoomSync', () => {
  const mockRoomState = {
    success: true,
    state: {
      board: Array(9).fill(null),
      currentPlayer: 'X' as const,
      state: 'playing' as const,
      winner: null,
    },
    room: {
      roomId: 'room-test123',
      status: 'playing' as const,
      playerX: {
        playerId: 'player-123',
        name: 'Player 1',
        marker: 'X' as const,
        isConnected: true,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      },
      playerO: {
        playerId: 'player-456',
        name: 'Player 2',
        marker: 'O' as const,
        isConnected: true,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      },
      createdAt: Date.now(),
      lastActivity: Date.now(),
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state when roomId is undefined', () => {
    const { result } = renderHook(() => useRoomSync(undefined, 'player-123'));

    expect(result.current.syncStatus).toBe('disconnected');
    expect(result.current.gameState.board).toEqual(Array(9).fill(null));
    expect(result.current.roomInfo).toBeNull();
  });

  it('fetches room state on mount', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    expect(result.current.syncStatus).toBe('connecting');

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(api.getRoomState).toHaveBeenCalledWith('room-test123');
    expect(result.current.roomInfo?.roomId).toBe('room-test123');
  });

  it('determines myMarker correctly for player X', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.myMarker).toBe('X');
  });

  it('determines myMarker correctly for player O', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-456'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.myMarker).toBe('O');
  });

  it('returns null myMarker for spectators', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-spectator'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.myMarker).toBeNull();
  });

  it('determines isMyTurn correctly', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    // Player X should have turn when currentPlayer is X
    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.isMyTurn).toBe(true);
  });

  it('determines isMyTurn as false for opponent', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    // Player O should not have turn when currentPlayer is X
    const { result } = renderHook(() => useRoomSync('room-test123', 'player-456'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.isMyTurn).toBe(false);
  });

  it('detects opponent connected status', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.opponentConnected).toBe(true);
  });

  it('detects opponent disconnected status', async () => {
    const disconnectedState = {
      ...mockRoomState,
      room: {
        ...mockRoomState.room,
        playerO: {
          ...mockRoomState.room.playerO!,
          isConnected: false,
        },
      },
    };
    vi.mocked(api.getRoomState).mockResolvedValue(disconnectedState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.opponentConnected).toBe(false);
  });

  it('handles API error and sets error status', async () => {
    vi.mocked(api.getRoomState).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useRoomSync('room-test123', 'player-123', { maxRetries: 1 })
    );

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('error');
    });

    expect(result.current.error).toBe('Connection lost. Please check your network.');
  });

  it('makes a move successfully', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);
    vi.mocked(api.makeRoomMove).mockResolvedValue({
      success: true,
      state: {
        ...mockRoomState.state,
        board: ['X', null, null, null, null, null, null, null, null],
        currentPlayer: 'O',
      },
      room: mockRoomState.room,
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    let moveResult: boolean = false;
    await act(async () => {
      moveResult = await result.current.makeMove(0);
    });

    expect(moveResult).toBe(true);
    expect(api.makeRoomMove).toHaveBeenCalledWith('room-test123', 0);
    expect(result.current.gameState.board[0]).toBe('X');
  });

  it('prevents move when not player turn', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    // Player O tries to move when it's X's turn
    const { result } = renderHook(() => useRoomSync('room-test123', 'player-456'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    let moveResult: boolean = true;
    await act(async () => {
      moveResult = await result.current.makeMove(0);
    });

    expect(moveResult).toBe(false);
    expect(api.makeRoomMove).not.toHaveBeenCalled();
  });

  it('updates lastSyncTime on successful fetch', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    expect(result.current.lastSyncTime).not.toBeNull();
  });

  it('provides refresh function', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue(mockRoomState);

    const { result } = renderHook(() => useRoomSync('room-test123', 'player-123'));

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('connected');
    });

    // Clear mock to verify refresh calls
    vi.mocked(api.getRoomState).mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(api.getRoomState).toHaveBeenCalledWith('room-test123');
  });
});
