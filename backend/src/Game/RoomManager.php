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
    private const FINISHED_ROOM_TIMEOUT = 300; // 5 minutes in seconds
    private string $storageFile;

    public function __construct()
    {
        // Store rooms in a temporary file
        $this->storageFile = sys_get_temp_dir() . '/tictactoe_rooms.json';
        $this->loadRooms();
    }

    public function __destruct()
    {
        $this->saveRooms();
    }

    public function createRoom(): GameRoom
    {
        $roomId = $this->generateRoomId();
        $room = new GameRoom($roomId);
        $this->rooms[$roomId] = $room;
        $this->saveRooms();

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
            $this->saveRooms();
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
            // Use shorter timeout for finished games
            $timeout = $room->getStatus() === 'finished'
                ? self::FINISHED_ROOM_TIMEOUT
                : self::ROOM_TIMEOUT;

            if (($now - $room->getLastActivity()) > $timeout) {
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

    private function loadRooms(): void
    {
        if (!file_exists($this->storageFile)) {
            return;
        }

        $data = file_get_contents($this->storageFile);
        if ($data === false) {
            return;
        }

        $serialized = json_decode($data, true);
        if (!is_array($serialized)) {
            return;
        }

        foreach ($serialized as $roomData) {
            $room = GameRoom::unserialize($roomData);
            $this->rooms[$room->getRoomId()] = $room;
        }

        // Clean up old rooms after loading
        $this->cleanupInactiveRooms();
    }

    private function saveRooms(): void
    {
        $serialized = [];
        foreach ($this->rooms as $room) {
            $serialized[] = $room->toArray();
        }

        file_put_contents($this->storageFile, json_encode($serialized));
    }
}
