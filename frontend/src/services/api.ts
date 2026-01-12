import { ApiResponse, GameState, MoveRequest, CreateRoomResponse, RoomStateResponse, RoomMoveResponse } from '../types/game';

const API_BASE_URL = '/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getGameState(): Promise<ApiResponse<GameState>> {
  return fetchApi<ApiResponse<GameState>>('/game');
}

export async function makeMove(position: number): Promise<ApiResponse<GameState>> {
  const body: MoveRequest = { position };
  return fetchApi<ApiResponse<GameState>>('/game/move', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function resetGame(): Promise<ApiResponse<GameState>> {
  return fetchApi<ApiResponse<GameState>>('/game/reset', {
    method: 'POST',
  });
}

export async function checkHealth(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>('/health');
}

export async function createRoom(): Promise<CreateRoomResponse> {
  return fetchApi<CreateRoomResponse>('/rooms', {
    method: 'POST',
  });
}

export async function getRoomState(roomId: string): Promise<RoomStateResponse> {
  return fetchApi<RoomStateResponse>(`/rooms/${roomId}/state`);
}

export async function makeRoomMove(roomId: string, position: number): Promise<RoomMoveResponse> {
  const body: MoveRequest = { position };
  return fetchApi<RoomMoveResponse>(`/rooms/${roomId}/move`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
