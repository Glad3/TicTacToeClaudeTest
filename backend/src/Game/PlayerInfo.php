<?php

declare(strict_types=1);

namespace TicTacToe\Game;

/**
 * Represents a player within a game room
 */
class PlayerInfo
{
    private string $playerId;
    private string $name;
    private string $marker;
    private bool $isConnected;
    private int $joinedAt;
    private int $lastSeen;

    public function __construct(string $playerId, string $name, string $marker)
    {
        $this->playerId = $playerId;
        $this->name = $name;
        $this->marker = $marker;
        $this->isConnected = true;
        $this->joinedAt = time();
        $this->lastSeen = time();
    }

    public function getPlayerId(): string
    {
        return $this->playerId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getMarker(): string
    {
        return $this->marker;
    }

    public function isConnected(): bool
    {
        return $this->isConnected;
    }

    public function setConnected(bool $connected): void
    {
        $this->isConnected = $connected;
        if ($connected) {
            $this->updateLastSeen();
        }
    }

    public function updateLastSeen(): void
    {
        $this->lastSeen = time();
    }

    public function getJoinedAt(): int
    {
        return $this->joinedAt;
    }

    public function getLastSeen(): int
    {
        return $this->lastSeen;
    }

    public function toArray(): array
    {
        return [
            'playerId' => $this->playerId,
            'name' => $this->name,
            'marker' => $this->marker,
            'isConnected' => $this->isConnected,
            'joinedAt' => $this->joinedAt,
            'lastSeen' => $this->lastSeen,
        ];
    }

    public static function fromArray(array $data): PlayerInfo
    {
        $player = new PlayerInfo(
            $data['playerId'],
            $data['name'],
            $data['marker']
        );

        $player->isConnected = $data['isConnected'];
        $player->joinedAt = $data['joinedAt'];
        $player->lastSeen = $data['lastSeen'];

        return $player;
    }
}
