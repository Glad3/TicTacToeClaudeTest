import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, RoomInfo, Player } from '../types/game';
import * as api from '../services/api';

export type SyncStatus = 'connecting' | 'connected' | 'syncing' | 'error' | 'disconnected';

export interface UseRoomSyncOptions {
  pollingInterval?: number;
  maxRetries?: number;
  onGameEnd?: () => void;
}

export interface UseRoomSyncResult {
  gameState: GameState;
  roomInfo: RoomInfo | null;
  syncStatus: SyncStatus;
  error: string | null;
  isMyTurn: boolean;
  myMarker: Player | null;
  opponentConnected: boolean;
  lastSyncTime: number | null;
  refresh: () => Promise<void>;
  makeMove: (position: number) => Promise<boolean>;
}

const DEFAULT_POLLING_INTERVAL = 1500; // 1.5 seconds
const DEFAULT_MAX_RETRIES = 5;

const initialGameState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  state: 'playing',
  winner: null,
};

export function useRoomSync(
  roomId: string | undefined,
  playerId: string | null,
  options: UseRoomSyncOptions = {}
): UseRoomSyncResult {
  const {
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    maxRetries = DEFAULT_MAX_RETRIES,
    onGameEnd,
  } = options;

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const retryCountRef = useRef(0);
  const lastTimestampRef = useRef<number>(0);
  const isPollingRef = useRef(false);

  // Determine player's marker based on playerId
  const myMarker: Player | null = roomInfo
    ? roomInfo.playerX?.playerId === playerId
      ? 'X'
      : roomInfo.playerO?.playerId === playerId
        ? 'O'
        : null
    : null;

  // Check if it's the player's turn
  const isMyTurn = myMarker !== null && gameState.currentPlayer === myMarker && gameState.state === 'playing';

  // Check if opponent is connected
  const opponentConnected = roomInfo
    ? myMarker === 'X'
      ? roomInfo.playerO?.isConnected ?? false
      : roomInfo.playerX?.isConnected ?? false
    : false;

  // Fetch room state
  const fetchRoomState = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;

    try {
      const response = await api.getRoomState(roomId);

      // Only update if timestamp is newer
      if (response.timestamp > lastTimestampRef.current) {
        lastTimestampRef.current = response.timestamp;
        setGameState(response.state);
        setRoomInfo(response.room);
        setLastSyncTime(Date.now());

        // Check if game ended
        if (response.state.state !== 'playing' && onGameEnd) {
          onGameEnd();
        }
      }

      setSyncStatus('connected');
      setError(null);
      retryCountRef.current = 0;
      return true;
    } catch (err) {
      retryCountRef.current++;

      if (retryCountRef.current >= maxRetries) {
        setSyncStatus('error');
        setError('Connection lost. Please check your network.');
        return false;
      }

      setSyncStatus('syncing');
      return false;
    }
  }, [roomId, maxRetries, onGameEnd]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setSyncStatus('syncing');
    await fetchRoomState();
  }, [fetchRoomState]);

  // Make a move in the room
  const makeMove = useCallback(async (position: number): Promise<boolean> => {
    if (!roomId || !isMyTurn) return false;

    try {
      setSyncStatus('syncing');
      const response = await api.makeRoomMove(roomId, position);

      if (response.success) {
        setGameState(response.state);
        if (response.room) {
          setRoomInfo(response.room);
        }
        lastTimestampRef.current = response.timestamp || Date.now();
        setLastSyncTime(Date.now());
        setSyncStatus('connected');
        return true;
      }

      setError(response.message || 'Failed to make move');
      setSyncStatus('connected');
      return false;
    } catch (err) {
      setError('Failed to make move. Please try again.');
      setSyncStatus('error');
      return false;
    }
  }, [roomId, isMyTurn]);

  // Initial fetch
  useEffect(() => {
    if (!roomId) {
      setSyncStatus('disconnected');
      return;
    }

    setSyncStatus('connecting');
    fetchRoomState();
  }, [roomId, fetchRoomState]);

  // Polling effect
  useEffect(() => {
    if (!roomId || syncStatus === 'error') return;

    // Don't poll if game is over
    if (gameState.state !== 'playing') return;

    // Don't poll if we're already polling
    if (isPollingRef.current) return;

    isPollingRef.current = true;

    const pollInterval = setInterval(async () => {
      // Always poll to keep both players in sync
      // Even if it's our turn, we need to see if opponent made a move
      await fetchRoomState();
    }, pollingInterval);

    return () => {
      clearInterval(pollInterval);
      isPollingRef.current = false;
    };
  }, [roomId, syncStatus, gameState.state, pollingInterval, fetchRoomState]);

  // Reset retry count when connection is restored
  useEffect(() => {
    if (syncStatus === 'connected') {
      retryCountRef.current = 0;
    }
  }, [syncStatus]);

  return {
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
  };
}
