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
