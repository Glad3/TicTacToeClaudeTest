<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\RoomManager;
use TicTacToe\Game\GameRoom;
use TicTacToe\Game\PlayerInfo;

class RoomManagerTest extends TestCase
{
    private RoomManager $manager;

    protected function setUp(): void
    {
        $this->manager = new RoomManager();
    }

    public function testCreateRoom(): void
    {
        $room = $this->manager->createRoom();

        $this->assertInstanceOf(GameRoom::class, $room);
        $this->assertStringStartsWith('room-', $room->getRoomId());
        $this->assertEquals(6, strlen(explode('-', $room->getRoomId())[1]));
    }

    public function testCreateRoomGeneratesUniqueIds(): void
    {
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        $this->assertNotEquals($room1->getRoomId(), $room2->getRoomId());
        $this->assertNotEquals($room1->getRoomId(), $room3->getRoomId());
        $this->assertNotEquals($room2->getRoomId(), $room3->getRoomId());
    }

    public function testGetRoom(): void
    {
        $room = $this->manager->createRoom();
        $roomId = $room->getRoomId();

        $retrieved = $this->manager->getRoom($roomId);

        $this->assertSame($room, $retrieved);
    }

    public function testGetRoomReturnsNullForNonExistent(): void
    {
        $room = $this->manager->getRoom('room-nonexistent');

        $this->assertNull($room);
    }

    public function testRoomExists(): void
    {
        $room = $this->manager->createRoom();
        $roomId = $room->getRoomId();

        $this->assertTrue($this->manager->roomExists($roomId));
        $this->assertFalse($this->manager->roomExists('room-nonexistent'));
    }

    public function testDeleteRoom(): void
    {
        $room = $this->manager->createRoom();
        $roomId = $room->getRoomId();

        $this->assertTrue($this->manager->roomExists($roomId));

        $result = $this->manager->deleteRoom($roomId);

        $this->assertTrue($result);
        $this->assertFalse($this->manager->roomExists($roomId));
    }

    public function testDeleteRoomReturnsFalseForNonExistent(): void
    {
        $result = $this->manager->deleteRoom('room-nonexistent');

        $this->assertFalse($result);
    }

    public function testGetRoomCount(): void
    {
        $this->assertEquals(0, $this->manager->getRoomCount());

        $this->manager->createRoom();
        $this->assertEquals(1, $this->manager->getRoomCount());

        $this->manager->createRoom();
        $this->assertEquals(2, $this->manager->getRoomCount());
    }

    public function testGetActiveRoomCount(): void
    {
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        // Set up rooms with different statuses
        $room1->setPlayerX(new PlayerInfo('p1', 'Alice', 'X'));
        $room1->setPlayerO(new PlayerInfo('p2', 'Bob', 'O')); // Status becomes 'playing'

        $room2->setStatus('finished');

        // room3 is still 'waiting'

        $this->assertEquals(1, $this->manager->getActiveRoomCount());
    }

    public function testGetWaitingRoomCount(): void
    {
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        // Set up rooms with different statuses
        $room1->setPlayerX(new PlayerInfo('p1', 'Alice', 'X'));
        $room1->setPlayerO(new PlayerInfo('p2', 'Bob', 'O')); // Status becomes 'playing'

        $room2->setStatus('finished');

        // room3 is still 'waiting'

        $this->assertEquals(1, $this->manager->getWaitingRoomCount());
    }

    public function testGetFinishedRoomCount(): void
    {
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        // Set up rooms with different statuses
        $room1->setPlayerX(new PlayerInfo('p1', 'Alice', 'X'));
        $room1->setPlayerO(new PlayerInfo('p2', 'Bob', 'O')); // Status becomes 'playing'

        $room2->setStatus('finished');
        $room3->setStatus('finished');

        $this->assertEquals(2, $this->manager->getFinishedRoomCount());
    }

    public function testCleanupInactiveRooms(): void
    {
        // Create a room and manipulate its activity timestamp using reflection
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        // Make room1 and room2 inactive (older than 1 hour)
        $reflection1 = new \ReflectionClass($room1);
        $property1 = $reflection1->getProperty('lastActivity');
        $property1->setAccessible(true);
        $property1->setValue($room1, time() - 7200); // 2 hours ago

        $reflection2 = new \ReflectionClass($room2);
        $property2 = $reflection2->getProperty('lastActivity');
        $property2->setAccessible(true);
        $property2->setValue($room2, time() - 3700); // Just over 1 hour ago

        // room3 is active (recent activity)

        $cleaned = $this->manager->cleanupInactiveRooms();

        $this->assertEquals(2, $cleaned);
        $this->assertEquals(1, $this->manager->getRoomCount());
        $this->assertFalse($this->manager->roomExists($room1->getRoomId()));
        $this->assertFalse($this->manager->roomExists($room2->getRoomId()));
        $this->assertTrue($this->manager->roomExists($room3->getRoomId()));
    }

    public function testCleanupWithNoInactiveRooms(): void
    {
        $this->manager->createRoom();
        $this->manager->createRoom();

        $cleaned = $this->manager->cleanupInactiveRooms();

        $this->assertEquals(0, $cleaned);
        $this->assertEquals(2, $this->manager->getRoomCount());
    }

    public function testCleanupWithEmptyManager(): void
    {
        $cleaned = $this->manager->cleanupInactiveRooms();

        $this->assertEquals(0, $cleaned);
        $this->assertEquals(0, $this->manager->getRoomCount());
    }

    public function testMultipleOperations(): void
    {
        // Create multiple rooms
        $room1 = $this->manager->createRoom();
        $room2 = $this->manager->createRoom();
        $room3 = $this->manager->createRoom();

        $this->assertEquals(3, $this->manager->getRoomCount());

        // Delete one room
        $this->manager->deleteRoom($room2->getRoomId());
        $this->assertEquals(2, $this->manager->getRoomCount());

        // Verify specific rooms
        $this->assertTrue($this->manager->roomExists($room1->getRoomId()));
        $this->assertFalse($this->manager->roomExists($room2->getRoomId()));
        $this->assertTrue($this->manager->roomExists($room3->getRoomId()));

        // Retrieve existing room
        $retrieved = $this->manager->getRoom($room1->getRoomId());
        $this->assertSame($room1, $retrieved);
    }

    public function testCleanupFinishedRoomsFaster(): void
    {
        // Create rooms with different statuses
        $activeRoom = $this->manager->createRoom();
        $finishedRoom = $this->manager->createRoom();

        // Set one room as finished
        $finishedRoom->setStatus('finished');

        // Make finished room inactive for 6 minutes (> 5 min timeout)
        $reflection = new \ReflectionClass($finishedRoom);
        $property = $reflection->getProperty('lastActivity');
        $property->setAccessible(true);
        $property->setValue($finishedRoom, time() - 360); // 6 minutes ago

        // Make active room inactive for 10 minutes (< 1 hour timeout)
        $reflectionActive = new \ReflectionClass($activeRoom);
        $propertyActive = $reflectionActive->getProperty('lastActivity');
        $propertyActive->setAccessible(true);
        $propertyActive->setValue($activeRoom, time() - 600); // 10 minutes ago

        $cleaned = $this->manager->cleanupInactiveRooms();

        // Only finished room should be cleaned (6 min > 5 min)
        // Active room should remain (10 min < 1 hour)
        $this->assertEquals(1, $cleaned);
        $this->assertFalse($this->manager->roomExists($finishedRoom->getRoomId()));
        $this->assertTrue($this->manager->roomExists($activeRoom->getRoomId()));
    }
}
