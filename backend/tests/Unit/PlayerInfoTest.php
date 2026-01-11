<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\PlayerInfo;

class PlayerInfoTest extends TestCase
{
    public function testConstructor(): void
    {
        $player = new PlayerInfo('player123', 'Alice', 'X');

        $this->assertEquals('player123', $player->getPlayerId());
        $this->assertEquals('Alice', $player->getName());
        $this->assertEquals('X', $player->getMarker());
        $this->assertTrue($player->isConnected());
        $this->assertIsInt($player->getJoinedAt());
        $this->assertIsInt($player->getLastSeen());
    }

    public function testSetConnected(): void
    {
        $player = new PlayerInfo('player123', 'Alice', 'X');

        $player->setConnected(false);
        $this->assertFalse($player->isConnected());

        $player->setConnected(true);
        $this->assertTrue($player->isConnected());
    }

    public function testUpdateLastSeen(): void
    {
        $player = new PlayerInfo('player123', 'Alice', 'X');
        $initialLastSeen = $player->getLastSeen();

        sleep(1);
        $player->updateLastSeen();

        $this->assertGreaterThan($initialLastSeen, $player->getLastSeen());
    }

    public function testSetConnectedTrueUpdatesLastSeen(): void
    {
        $player = new PlayerInfo('player123', 'Alice', 'X');
        $player->setConnected(false);

        $initialLastSeen = $player->getLastSeen();
        sleep(1);

        $player->setConnected(true);

        $this->assertGreaterThan($initialLastSeen, $player->getLastSeen());
    }

    public function testToArray(): void
    {
        $player = new PlayerInfo('player123', 'Alice', 'X');
        $array = $player->toArray();

        $this->assertIsArray($array);
        $this->assertEquals('player123', $array['playerId']);
        $this->assertEquals('Alice', $array['name']);
        $this->assertEquals('X', $array['marker']);
        $this->assertTrue($array['isConnected']);
        $this->assertIsInt($array['joinedAt']);
        $this->assertIsInt($array['lastSeen']);
    }

    public function testFromArray(): void
    {
        $data = [
            'playerId' => 'player456',
            'name' => 'Bob',
            'marker' => 'O',
            'isConnected' => false,
            'joinedAt' => 1234567890,
            'lastSeen' => 1234567900,
        ];

        $player = PlayerInfo::fromArray($data);

        $this->assertEquals('player456', $player->getPlayerId());
        $this->assertEquals('Bob', $player->getName());
        $this->assertEquals('O', $player->getMarker());
        $this->assertFalse($player->isConnected());
        $this->assertEquals(1234567890, $player->getJoinedAt());
        $this->assertEquals(1234567900, $player->getLastSeen());
    }

    public function testSerializationRoundTrip(): void
    {
        $original = new PlayerInfo('player789', 'Charlie', 'X');
        $original->setConnected(false);

        $array = $original->toArray();
        $restored = PlayerInfo::fromArray($array);

        $this->assertEquals($original->getPlayerId(), $restored->getPlayerId());
        $this->assertEquals($original->getName(), $restored->getName());
        $this->assertEquals($original->getMarker(), $restored->getMarker());
        $this->assertEquals($original->isConnected(), $restored->isConnected());
        $this->assertEquals($original->getJoinedAt(), $restored->getJoinedAt());
        $this->assertEquals($original->getLastSeen(), $restored->getLastSeen());
    }

    public function testTimestampsAreReasonable(): void
    {
        $before = time();
        $player = new PlayerInfo('player123', 'Alice', 'X');
        $after = time();

        $this->assertGreaterThanOrEqual($before, $player->getJoinedAt());
        $this->assertLessThanOrEqual($after, $player->getJoinedAt());
        $this->assertGreaterThanOrEqual($before, $player->getLastSeen());
        $this->assertLessThanOrEqual($after, $player->getLastSeen());
    }
}
