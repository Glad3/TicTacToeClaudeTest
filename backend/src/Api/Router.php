<?php

declare(strict_types=1);

namespace TicTacToe\Api;

use TicTacToe\Game\GameController;

/**
 * Simple router for the Tic Tac Toe API
 */
class Router
{
    private GameController $game;

    public function __construct()
    {
        $this->game = new GameController();
        $this->loadGameState();
    }

    public function handleRequest(): void
    {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

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
        return match (true) {
            $uri === '/api/health' && $method === 'GET' => $this->health(),
            $uri === '/api/game' && $method === 'GET' => $this->getGame(),
            $uri === '/api/game/move' && $method === 'POST' => $this->makeMove(),
            $uri === '/api/game/reset' && $method === 'POST' => $this->resetGame(),
            default => $this->notFound(),
        };
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
     * Get or generate a unique player ID from the session
     */
    private function getPlayerId(): string
    {
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
