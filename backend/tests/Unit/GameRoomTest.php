<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\GameRoom;
use TicTacToe\Game\PlayerInfo;
use TicTacToe\Game\GameController;

class GameRoomTest extends TestCase
{
    public function testConstructor(): void
    {
        $room = new GameRoom('room-abc123');

        $this->assertEquals('room-abc123', $room->getRoomId());
        $this->assertInstanceOf(GameController::class, $room->getGame());
        $this->assertNull($room->getPlayerX());
        $this->assertNull($room->getPlayerO());
        $this->assertEquals('waiting', $room->getStatus());
        $this->assertIsInt($room->getCreatedAt());
        $this->assertIsInt($room->getLastActivity());
    }

    public function testSetPlayerX(): void
    {
        $room = new GameRoom('room-abc123');
        $player = new PlayerInfo('player1', 'Alice', 'X');

        $room->setPlayerX($player);

        $this->assertSame($player, $room->getPlayerX());
        $this->assertEquals('waiting', $room->getStatus());
    }

    public function testSetPlayerO(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->setPlayerX($playerX);
        $room->setPlayerO($playerO);

        $this->assertSame($playerO, $room->getPlayerO());
    }

    public function testStatusChangesToPlayingWhenBothPlayersJoin(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->setPlayerX($playerX);
        $this->assertEquals('waiting', $room->getStatus());

        $room->setPlayerO($playerO);
        $this->assertEquals('playing', $room->getStatus());
    }

    public function testIsFull(): void
    {
        $room = new GameRoom('room-abc123');

        $this->assertFalse($room->isFull());

        $room->setPlayerX(new PlayerInfo('player1', 'Alice', 'X'));
        $this->assertFalse($room->isFull());

        $room->setPlayerO(new PlayerInfo('player2', 'Bob', 'O'));
        $this->assertTrue($room->isFull());
    }

    public function testHasPlayer(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $this->assertFalse($room->hasPlayer('player1'));
        $this->assertFalse($room->hasPlayer('player2'));

        $room->setPlayerX($playerX);
        $this->assertTrue($room->hasPlayer('player1'));
        $this->assertFalse($room->hasPlayer('player2'));

        $room->setPlayerO($playerO);
        $this->assertTrue($room->hasPlayer('player1'));
        $this->assertTrue($room->hasPlayer('player2'));
        $this->assertFalse($room->hasPlayer('player3'));
    }

    public function testGetPlayerMarker(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->setPlayerX($playerX);
        $room->setPlayerO($playerO);

        $this->assertEquals('X', $room->getPlayerMarker('player1'));
        $this->assertEquals('O', $room->getPlayerMarker('player2'));
        $this->assertNull($room->getPlayerMarker('player3'));
    }

    public function testUpdateActivity(): void
    {
        $room = new GameRoom('room-abc123');
        $initialActivity = $room->getLastActivity();

        sleep(1);
        $room->updateActivity();

        $this->assertGreaterThan($initialActivity, $room->getLastActivity());
    }

    public function testSetPlayerUpdatesActivity(): void
    {
        $room = new GameRoom('room-abc123');
        $initialActivity = $room->getLastActivity();

        sleep(1);
        $room->setPlayerX(new PlayerInfo('player1', 'Alice', 'X'));

        $this->assertGreaterThan($initialActivity, $room->getLastActivity());
    }

    public function testSetStatus(): void
    {
        $room = new GameRoom('room-abc123');

        $room->setStatus('finished');
        $this->assertEquals('finished', $room->getStatus());

        $room->setStatus('waiting');
        $this->assertEquals('waiting', $room->getStatus());
    }

    public function testToArray(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');

        $room->setPlayerX($playerX);

        $array = $room->toArray();

        $this->assertIsArray($array);
        $this->assertEquals('room-abc123', $array['roomId']);
        $this->assertEquals('waiting', $array['status']);
        $this->assertIsArray($array['playerX']);
        $this->assertNull($array['playerO']);
        $this->assertIsInt($array['createdAt']);
        $this->assertIsInt($array['lastActivity']);
    }

    public function testSerialize(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $room->setPlayerX($playerX);

        $serialized = $room->serialize();

        $this->assertIsArray($serialized);
        $this->assertEquals('room-abc123', $serialized['roomId']);
        $this->assertIsArray($serialized['gameState']);
        $this->assertIsArray($serialized['playerX']);
        $this->assertNull($serialized['playerO']);
        $this->assertEquals('waiting', $serialized['status']);
    }

    public function testUnserialize(): void
    {
        $data = [
            'roomId' => 'room-xyz789',
            'gameState' => [
                'board' => [null, null, null, null, null, null, null, null, null],
                'currentPlayer' => 'X',
                'state' => 'playing',
                'winner' => null,
            ],
            'playerX' => [
                'playerId' => 'player1',
                'name' => 'Alice',
                'marker' => 'X',
                'isConnected' => true,
                'joinedAt' => 1234567890,
                'lastSeen' => 1234567900,
            ],
            'playerO' => [
                'playerId' => 'player2',
                'name' => 'Bob',
                'marker' => 'O',
                'isConnected' => true,
                'joinedAt' => 1234567895,
                'lastSeen' => 1234567905,
            ],
            'createdAt' => 1234567880,
            'lastActivity' => 1234567910,
            'status' => 'playing',
        ];

        $room = GameRoom::unserialize($data);

        $this->assertEquals('room-xyz789', $room->getRoomId());
        $this->assertEquals('playing', $room->getStatus());
        $this->assertNotNull($room->getPlayerX());
        $this->assertEquals('Alice', $room->getPlayerX()->getName());
        $this->assertNotNull($room->getPlayerO());
        $this->assertEquals('Bob', $room->getPlayerO()->getName());
        $this->assertEquals(1234567880, $room->getCreatedAt());
        $this->assertEquals(1234567910, $room->getLastActivity());
    }

    public function testSerializationRoundTrip(): void
    {
        $original = new GameRoom('room-test123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $original->setPlayerX($playerX);
        $original->setPlayerO($playerO);

        // Make a move to change game state
        $original->getGame()->makeMove(0);

        $serialized = $original->serialize();
        $restored = GameRoom::unserialize($serialized);

        $this->assertEquals($original->getRoomId(), $restored->getRoomId());
        $this->assertEquals($original->getStatus(), $restored->getStatus());
        $this->assertEquals($original->getPlayerX()->getPlayerId(), $restored->getPlayerX()->getPlayerId());
        $this->assertEquals($original->getPlayerO()->getPlayerId(), $restored->getPlayerO()->getPlayerId());

        // Verify game state is restored
        $originalState = $original->getGame()->getGameState();
        $restoredState = $restored->getGame()->getGameState();
        $this->assertEquals($originalState['board'], $restoredState['board']);
        $this->assertEquals($originalState['currentPlayer'], $restoredState['currentPlayer']);
    }

    public function testAddPlayerAssignsFirstPlayerAsX(): void
    {
        $room = new GameRoom('room-abc123');
        $player = new PlayerInfo('player1', 'Alice', 'X');

        $result = $room->addPlayer($player);

        $this->assertTrue($result);
        $this->assertSame($player, $room->getPlayerX());
        $this->assertNull($room->getPlayerO());
        $this->assertEquals('waiting', $room->getStatus());
    }

    public function testAddPlayerAssignsSecondPlayerAsO(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->addPlayer($playerX);
        $result = $room->addPlayer($playerO);

        $this->assertTrue($result);
        $this->assertSame($playerX, $room->getPlayerX());
        $this->assertSame($playerO, $room->getPlayerO());
        $this->assertEquals('playing', $room->getStatus());
    }

    public function testAddPlayerRejectsThirdPlayer(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');
        $playerThird = new PlayerInfo('player3', 'Charlie', 'X');

        $room->addPlayer($playerX);
        $room->addPlayer($playerO);
        $result = $room->addPlayer($playerThird);

        $this->assertFalse($result);
        $this->assertEquals(2, $room->isFull() ? 2 : 0);
    }

    public function testCanPlayerMoveValidatesPlayerInRoom(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->addPlayer($playerX);
        $room->addPlayer($playerO);

        // Player not in room
        $this->assertFalse($room->canPlayerMove('player3', 0));
    }

    public function testCanPlayerMoveValidatesTurn(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->addPlayer($playerX);
        $room->addPlayer($playerO);

        // X's turn
        $this->assertTrue($room->canPlayerMove('player1', 0));
        $this->assertFalse($room->canPlayerMove('player2', 0));

        // Make move as X
        $room->getGame()->makeMove(0);

        // Now O's turn
        $this->assertFalse($room->canPlayerMove('player1', 1));
        $this->assertTrue($room->canPlayerMove('player2', 1));
    }

    public function testCanPlayerMoveReturnsFalseWhenGameOver(): void
    {
        $room = new GameRoom('room-abc123');
        $playerX = new PlayerInfo('player1', 'Alice', 'X');
        $playerO = new PlayerInfo('player2', 'Bob', 'O');

        $room->addPlayer($playerX);
        $room->addPlayer($playerO);

        // X wins
        $room->getGame()->makeMove(0); // X
        $room->getGame()->makeMove(3); // O
        $room->getGame()->makeMove(1); // X
        $room->getGame()->makeMove(4); // O
        $room->getGame()->makeMove(2); // X wins

        // Neither player can move
        $this->assertFalse($room->canPlayerMove('player1', 5));
        $this->assertFalse($room->canPlayerMove('player2', 5));
    }
}
