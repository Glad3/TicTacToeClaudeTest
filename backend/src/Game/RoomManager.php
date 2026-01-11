<?php

declare(strict_types=1);

namespace TicTacToe\Game;

/**
 * Manages all active game rooms
 */
class RoomManager
{
    private array $rooms = [];
    private const ROOM_TIMEOUT = 3600; // 1 hour in seconds

    public function createRoom(): GameRoom
    {
        $roomId = $this->generateRoomId();
        $room = new GameRoom($roomId);
        $this->rooms[$roomId] = $room;

        return $room;
    }

    public function getRoom(string $roomId): ?GameRoom
    {
        return $this->rooms[$roomId] ?? null;
    }

    public function deleteRoom(string $roomId): bool
    {
        if (isset($this->rooms[$roomId])) {
            unset($this->rooms[$roomId]);
            return true;
        }

        return false;
    }

    public function roomExists(string $roomId): bool
    {
        return isset($this->rooms[$roomId]);
    }

    public function cleanupInactiveRooms(): int
    {
        $now = time();
        $cleaned = 0;

        foreach ($this->rooms as $roomId => $room) {
            if (($now - $room->getLastActivity()) > self::ROOM_TIMEOUT) {
                $this->deleteRoom($roomId);
                $cleaned++;
            }
        }

        return $cleaned;
    }

    public function getRoomCount(): int
    {
        return count($this->rooms);
    }

    public function getActiveRoomCount(): int
    {
        return count(array_filter(
            $this->rooms,
            fn($room) => $room->getStatus() === 'playing'
        ));
    }

    public function getWaitingRoomCount(): int
    {
        return count(array_filter(
            $this->rooms,
            fn($room) => $room->getStatus() === 'waiting'
        ));
    }

    public function getFinishedRoomCount(): int
    {
        return count(array_filter(
            $this->rooms,
            fn($room) => $room->getStatus() === 'finished'
        ));
    }

    private function generateRoomId(): string
    {
        do {
            $roomId = 'room-' . bin2hex(random_bytes(3));
        } while ($this->roomExists($roomId));

        return $roomId;
    }
}
