export type Player = 'X' | 'O';

export type CellValue = Player | null;

export type BoardState = CellValue[];

export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  state: GameStatus;
  winner: Player | null;
}

export interface ApiResponse<T = GameState> {
  success: boolean;
  message?: string;
  state: T;
}

export interface MoveRequest {
  position: number;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface PlayerInfo {
  playerId: string;
  name: string;
  marker: Player;
  isConnected: boolean;
  joinedAt: number;
  lastSeen: number;
}

export interface RoomInfo {
  roomId: string;
  status: RoomStatus;
  playerX: PlayerInfo | null;
  playerO: PlayerInfo | null;
  createdAt: number;
  lastActivity: number;
}

export interface CreateRoomResponse {
  success: boolean;
  roomId: string;
  joinUrl: string;
  message: string;
}

export interface RoomStateResponse {
  success: boolean;
  state: GameState;
  room: RoomInfo;
  timestamp: number;
}
