<?php

declare(strict_types=1);

namespace TicTacToe\Api;

use TicTacToe\Game\GameController;
use TicTacToe\Game\RoomManager;
use TicTacToe\Game\PlayerInfo;

/**
 * Simple router for the Tic Tac Toe API
 */
class Router
{
    private GameController $game;
    private RoomManager $roomManager;

    public function __construct()
    {
        $this->game = new GameController();
        $this->roomManager = new RoomManager();
        $this->loadGameState();
    }

    public function handleRequest(): void
    {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Player-ID');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            return;
        }

        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        try {
            $response = $this->route($method, $uri);
            $this->saveGameState();
            echo json_encode($response);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function route(string $method, string $uri): array
    {
        // Check exact matches first to avoid regex conflicts
        $exactMatch = match (true) {
            $uri === '/api/health' && $method === 'GET' => $this->health(),
            $uri === '/api/rooms' && $method === 'POST' => $this->createRoom(),
            $uri === '/api/rooms/stats' && $method === 'GET' => $this->getRoomStats(),
            $uri === '/api/game' && $method === 'GET' => $this->getGame(),
            $uri === '/api/game/move' && $method === 'POST' => $this->makeMove(),
            $uri === '/api/game/reset' && $method === 'POST' => $this->resetGame(),
            default => null,
        };

        if ($exactMatch !== null) {
            return $exactMatch;
        }

        // Room API endpoints with parameters
        if (preg_match('#^/api/rooms/([^/]+)/(.+)$#', $uri, $matches)) {
            $roomId = $matches[1];
            $action = $matches[2];

            return match (true) {
                $action === 'join' && $method === 'POST' => $this->joinRoom($roomId),
                $action === 'leave' && $method === 'POST' => $this->leaveRoom($roomId),
                $action === 'move' && $method === 'POST' => $this->makeRoomMove($roomId),
                $action === 'reset' && $method === 'POST' => $this->resetRoom($roomId),
                $action === 'state' && $method === 'GET' => $this->getRoomState($roomId),
                default => $this->notFound(),
            };
        }

        if (preg_match('#^/api/rooms/([^/]+)$#', $uri, $matches)) {
            $roomId = $matches[1];
            return match ($method) {
                'GET' => $this->getRoom($roomId),
                default => $this->notFound(),
            };
        }

        return $this->notFound();
    }

    /**
     * @return array{status: string}
     */
    private function health(): array
    {
        return ['status' => 'ok'];
    }

    /**
     * @return array{success: bool, state: array}
     */
    private function getGame(): array
    {
        return [
            'success' => true,
            'state' => $this->game->getGameState(),
        ];
    }

    /**
     * @return array{success: bool, message: string, state: array}
     */
    private function makeMove(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['position']) || !is_int($input['position'])) {
            throw new \InvalidArgumentException('Position is required and must be an integer');
        }

        return $this->game->makeMove($input['position']);
    }

    /**
     * @return array{success: bool, message: string, state: array}
     */
    private function resetGame(): array
    {
        $this->game->resetGame();
        return [
            'success' => true,
            'message' => 'Game reset successfully',
            'state' => $this->game->getGameState(),
        ];
    }

    /**
     * @return array{success: bool, message: string}
     */
    private function notFound(): array
    {
        http_response_code(404);
        return [
            'success' => false,
            'message' => 'Endpoint not found',
        ];
    }

    /**
     * POST /api/rooms - Create a new game room
     * @return array{success: bool, roomId: string, joinUrl: string, message: string}
     */
    private function createRoom(): array
    {
        $room = $this->roomManager->createRoom();
        $playerId = $this->getPlayerId();
        $playerName = $this->getPlayerName();

        // Creator becomes Player X
        $player = new PlayerInfo($playerId, $playerName, 'X');
        $room->addPlayer($player);

        // Save room with player added
        $this->roomManager->saveRoom($room);

        http_response_code(201);
        return [
            'success' => true,
            'roomId' => $room->getRoomId(),
            'joinUrl' => '/game?room=' . $room->getRoomId(),
            'message' => 'Room created successfully',
        ];
    }

    /**
     * GET /api/rooms/:roomId - Get room information
     * @return array{success: bool, room: array}
     */
    private function getRoom(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        return [
            'success' => true,
            'room' => $room->toArray(),
            'gameState' => $room->getGame()->getGameState(),
        ];
    }

    /**
     * POST /api/rooms/:roomId/join - Join an existing room
     * @return array{success: bool, message: string, marker?: string}
     */
    private function joinRoom(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        $playerId = $this->getPlayerId();

        // Check if player is already in the room
        if ($room->hasPlayer($playerId)) {
            $marker = $room->getPlayerMarker($playerId);
            return [
                'success' => true,
                'message' => 'Already in room',
                'marker' => $marker,
                'room' => $room->toArray(),
                'gameState' => $room->getGame()->getGameState(),
            ];
        }

        // Get player name from request body or session
        $input = json_decode(file_get_contents('php://input'), true);
        $playerName = $input['name'] ?? $this->getPlayerName();

        // Update session name if provided
        if (isset($input['name'])) {
            $this->setPlayerName($playerName);
        }

        // Determine marker based on which slot is empty
        $marker = $room->getPlayerX() === null ? 'X' : 'O';
        $player = new PlayerInfo($playerId, $playerName, $marker);

        $success = $room->addPlayer($player);

        if (!$success) {
            http_response_code(403);
            return [
                'success' => false,
                'error' => 'ROOM_FULL',
                'message' => 'Room is full',
            ];
        }

        // Save room with new player added
        $this->roomManager->saveRoom($room);

        return [
            'success' => true,
            'message' => 'Joined room successfully',
            'marker' => $marker,
            'room' => $room->toArray(),
            'gameState' => $room->getGame()->getGameState(),
        ];
    }

    /**
     * POST /api/rooms/:roomId/leave - Leave a room
     * @return array{success: bool, message: string}
     */
    private function leaveRoom(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        // For now, we'll mark the room status as finished
        // In future, could handle player disconnection more gracefully
        $room->setStatus('finished');

        return [
            'success' => true,
            'message' => 'Left room successfully',
        ];
    }

    /**
     * POST /api/rooms/:roomId/move - Make a move in the room
     * @return array{success: bool, message: string, state: array}
     */
    private function makeRoomMove(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['position']) || !is_int($input['position'])) {
            http_response_code(400);
            return [
                'success' => false,
                'error' => 'INVALID_INPUT',
                'message' => 'Position is required and must be an integer',
            ];
        }

        $playerId = $this->getPlayerId();

        if (!$room->hasPlayer($playerId)) {
            http_response_code(403);
            return [
                'success' => false,
                'error' => 'NOT_IN_ROOM',
                'message' => 'You are not in this room',
            ];
        }

        if (!$room->canPlayerMove($playerId, $input['position'])) {
            http_response_code(403);
            return [
                'success' => false,
                'error' => 'NOT_YOUR_TURN',
                'message' => 'Not your turn',
            ];
        }

        $marker = $room->getPlayerMarker($playerId);
        $result = $room->getGame()->makeMove($input['position'], $playerId, $marker);

        // Update room activity
        $room->updateActivity();

        // Update room status if game is over
        if ($result['state']['state'] !== 'playing') {
            $room->setStatus('finished');
        }

        // Save room after move
        $this->roomManager->saveRoom($room);

        // Add room info and timestamp to response
        $result['room'] = $room->toArray();
        $result['timestamp'] = time();

        return $result;
    }

    /**
     * POST /api/rooms/:roomId/reset - Reset the game in the room
     * @return array{success: bool, message: string, state: array}
     */
    private function resetRoom(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        $playerId = $this->getPlayerId();

        if (!$room->hasPlayer($playerId)) {
            http_response_code(403);
            return [
                'success' => false,
                'error' => 'NOT_IN_ROOM',
                'message' => 'You are not in this room',
            ];
        }

        // Reset the game
        $room->getGame()->resetGame();
        $room->setStatus('playing');
        $room->updateActivity();

        // Save room after reset
        $this->roomManager->saveRoom($room);

        return [
            'success' => true,
            'message' => 'Game reset successfully',
            'state' => $room->getGame()->getGameState(),
        ];
    }

    /**
     * GET /api/rooms/:roomId/state - Get current game state
     * @return array{success: bool, state: array, timestamp: int}
     */
    private function getRoomState(string $roomId): array
    {
        $room = $this->roomManager->getRoom($roomId);

        if ($room === null) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'ROOM_NOT_FOUND',
                'message' => 'Room not found',
            ];
        }

        return [
            'success' => true,
            'state' => $room->getGame()->getGameState(),
            'room' => $room->toArray(),
            'timestamp' => time(),
        ];
    }

    /**
     * GET /api/rooms/stats - Get room statistics
     * @return array{success: bool, stats: array}
     */
    private function getRoomStats(): array
    {
        return [
            'success' => true,
            'stats' => [
                'total' => $this->roomManager->getRoomCount(),
                'active' => $this->roomManager->getActiveRoomCount(),
                'waiting' => $this->roomManager->getWaitingRoomCount(),
                'finished' => $this->roomManager->getFinishedRoomCount(),
            ],
        ];
    }

    private function loadGameState(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION['game_state'])) {
            $this->game->restoreState($_SESSION['game_state']);
        }
    }

    private function saveGameState(): void
    {
        $_SESSION['game_state'] = $this->game->getGameState();
    }

    /**
     * Get or generate a unique player ID from the X-Player-ID header
     */
    private function getPlayerId(): string
    {
        // Try to get player ID from header first
        // Check both Apache-style and nginx-style header names
        $playerId = $_SERVER['HTTP_X_PLAYER_ID'] ?? null;

        if ($playerId !== null && $playerId !== '') {
            return $playerId;
        }

        // Fallback to session-based ID for backwards compatibility
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['player_id'])) {
            $_SESSION['player_id'] = bin2hex(random_bytes(16));
        }

        return $_SESSION['player_id'];
    }

    /**
     * Get the player name from the session
     */
    private function getPlayerName(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return $_SESSION['player_name'] ?? 'Guest';
    }

    /**
     * Set the player name in the session
     */
    private function setPlayerName(string $name): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['player_name'] = $name;
    }
}
