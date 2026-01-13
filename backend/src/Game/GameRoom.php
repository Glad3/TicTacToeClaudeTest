<?php

declare(strict_types=1);

namespace TicTacToe\Game;

/**
 * Represents a game room that wraps a GameController with player assignments
 */
class GameRoom
{
    private string $roomId;
    private GameController $game;
    private ?PlayerInfo $playerX = null;
    private ?PlayerInfo $playerO = null;
    private int $createdAt;
    private int $lastActivity;
    private string $status; // 'waiting', 'playing', 'finished'
    private string $nextStarter; // 'X' or 'O' - who starts the next game

    public function __construct(string $roomId)
    {
        $this->roomId = $roomId;
        $this->game = new GameController();
        $this->createdAt = time();
        $this->lastActivity = time();
        $this->status = 'waiting';
        $this->nextStarter = 'X'; // X starts the first game
    }

    public function getRoomId(): string
    {
        return $this->roomId;
    }

    public function getGame(): GameController
    {
        return $this->game;
    }

    public function getPlayerX(): ?PlayerInfo
    {
        return $this->playerX;
    }

    public function getPlayerO(): ?PlayerInfo
    {
        return $this->playerO;
    }

    public function setPlayerX(PlayerInfo $player): void
    {
        $this->playerX = $player;
        $this->updateActivity();
    }

    public function setPlayerO(PlayerInfo $player): void
    {
        $this->playerO = $player;
        $this->updateActivity();

        // Start the game when both players are present
        if ($this->isFull()) {
            $this->status = 'playing';
        }
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
        $this->updateActivity();
    }

    public function getLastActivity(): int
    {
        return $this->lastActivity;
    }

    public function updateActivity(): void
    {
        $this->lastActivity = time();
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function isFull(): bool
    {
        return $this->playerX !== null && $this->playerO !== null;
    }

    public function hasPlayer(string $playerId): bool
    {
        if ($this->playerX !== null && $this->playerX->getPlayerId() === $playerId) {
            return true;
        }

        if ($this->playerO !== null && $this->playerO->getPlayerId() === $playerId) {
            return true;
        }

        return false;
    }

    public function getPlayerMarker(string $playerId): ?string
    {
        if ($this->playerX !== null && $this->playerX->getPlayerId() === $playerId) {
            return $this->playerX->getMarker();
        }

        if ($this->playerO !== null && $this->playerO->getPlayerId() === $playerId) {
            return $this->playerO->getMarker();
        }

        return null;
    }

    /**
     * Add a player to the room
     * First player becomes X, second player becomes O
     * Returns true if added successfully, false if room is full
     */
    public function addPlayer(PlayerInfo $player): bool
    {
        // First player becomes X
        if ($this->playerX === null) {
            $this->setPlayerX($player);
            return true;
        }

        // Second player becomes O
        if ($this->playerO === null) {
            $this->setPlayerO($player);
            return true;
        }

        // Room is full
        return false;
    }

    /**
     * Check if a player can make a move in this room
     * Validates: player is in room, it's their turn, game is playing
     */
    public function canPlayerMove(string $playerId, int $position): bool
    {
        // Check if player is in this room
        if (!$this->hasPlayer($playerId)) {
            return false;
        }

        // Get player's marker
        $marker = $this->getPlayerMarker($playerId);
        if ($marker === null) {
            return false;
        }

        // Check if it's their turn
        return $this->game->canPlayerMove($marker);
    }

    /**
     * Reset the game for a rematch, alternating who goes first
     */
    public function resetForRematch(): void
    {
        // Determine who should start next (alternate from last game)
        $this->game->resetGame($this->nextStarter);

        // Alternate the starter for next time
        $this->nextStarter = $this->nextStarter === 'X' ? 'O' : 'X';

        // Update room status
        $this->status = 'playing';
        $this->updateActivity();
    }

    public function toArray(): array
    {
        return [
            'roomId' => $this->roomId,
            'status' => $this->status,
            'playerX' => $this->playerX?->toArray(),
            'playerO' => $this->playerO?->toArray(),
            'createdAt' => $this->createdAt,
            'lastActivity' => $this->lastActivity,
        ];
    }

    public function serialize(): array
    {
        return [
            'roomId' => $this->roomId,
            'gameState' => $this->game->getGameState(),
            'playerX' => $this->playerX?->toArray(),
            'playerO' => $this->playerO?->toArray(),
            'createdAt' => $this->createdAt,
            'lastActivity' => $this->lastActivity,
            'status' => $this->status,
            'nextStarter' => $this->nextStarter,
        ];
    }

    public static function unserialize(array $data): GameRoom
    {
        $room = new GameRoom($data['roomId']);
        $room->game->restoreState($data['gameState']);

        if ($data['playerX'] !== null) {
            $room->setPlayerX(PlayerInfo::fromArray($data['playerX']));
        }

        if ($data['playerO'] !== null) {
            $room->setPlayerO(PlayerInfo::fromArray($data['playerO']));
        }

        $room->createdAt = $data['createdAt'];
        $room->lastActivity = $data['lastActivity'];
        $room->status = $data['status'];
        $room->nextStarter = $data['nextStarter'] ?? 'X'; // Default to X for backwards compatibility

        return $room;
    }
}
