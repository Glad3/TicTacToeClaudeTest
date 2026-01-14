<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Integration;

use PHPUnit\Framework\TestCase;
use TicTacToe\Api\Router;
use TicTacToe\Game\RoomManager;

/**
 * Stream wrapper for mocking php://input in tests
 */
class TestStreamWrapper
{
    public static $data = '';
    private $position = 0;

    public function stream_open($path, $mode, $options, &$opened_path)
    {
        $this->position = 0;
        return true;
    }

    public function stream_read($count)
    {
        $ret = substr(static::$data, $this->position, $count);
        $this->position += strlen($ret);
        return $ret;
    }

    public function stream_eof()
    {
        return $this->position >= strlen(static::$data);
    }

    public function stream_stat()
    {
        return [];
    }

    public function stream_tell()
    {
        return $this->position;
    }
}

class RoomApiTest extends TestCase
{
    private Router $router;

    protected function setUp(): void
    {
        // Clear any previous session data
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }

        // Clear superglobals
        $_SERVER = [];
        $_POST = [];
        $_GET = [];

        $this->router = new Router();
    }

    protected function tearDown(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }

    private function simulateRequest(string $method, string $uri, ?array $body = null): array
    {
        $_SERVER['REQUEST_METHOD'] = $method;
        $_SERVER['REQUEST_URI'] = $uri;

        if ($body !== null) {
            // Simulate input stream
            $tmpfile = tmpfile();
            fwrite($tmpfile, json_encode($body));
            rewind($tmpfile);
        }

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        return json_decode($output, true);
    }

    public function testCreateRoom(): void
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $response = json_decode($output, true);

        $this->assertTrue($response['success']);
        $this->assertArrayHasKey('roomId', $response);
        $this->assertStringStartsWith('room-', $response['roomId']);
        $this->assertArrayHasKey('joinUrl', $response);
        $this->assertEquals('Room created successfully', $response['message']);
    }

    public function testGetRoomNotFound(): void
    {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/api/rooms/room-nonexistent';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $response = json_decode($output, true);

        $this->assertFalse($response['success']);
        $this->assertEquals('ROOM_NOT_FOUND', $response['error']);
        $this->assertEquals('Room not found', $response['message']);
    }

    public function testFullRoomCreationAndJoinFlow(): void
    {
        // Create a room
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);

        $this->assertTrue($createResponse['success']);
        $roomId = $createResponse['roomId'];

        // Get room info
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $getResponse = json_decode($output, true);

        $this->assertTrue($getResponse['success']);
        $this->assertArrayHasKey('room', $getResponse);
        $this->assertEquals($roomId, $getResponse['room']['roomId']);
        $this->assertEquals('waiting', $getResponse['room']['status']);

        // Verify creator is Player X
        $this->assertNotNull($getResponse['room']['playerX']);
        $this->assertNull($getResponse['room']['playerO']);
    }

    public function testJoinRoomAsSecondPlayer(): void
    {
        // First, create a room with player 1
        session_start();
        $_SESSION['player_id'] = 'player1';
        $_SESSION['player_name'] = 'Alice';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);

        $roomId = $createResponse['roomId'];
        session_destroy();

        // Now join as player 2
        session_start();
        $_SESSION['player_id'] = 'player2';
        $_SESSION['player_name'] = 'Bob';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['name' => 'Bob']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        $joinResponse = json_decode($output, true);

        $this->assertTrue($joinResponse['success']);
        $this->assertEquals('Joined room successfully', $joinResponse['message']);
        $this->assertEquals('O', $joinResponse['marker']);
        $this->assertEquals('playing', $joinResponse['room']['status']);
    }

    public function testRoomFullError(): void
    {
        // Create room with player 1
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        // Join as player 2
        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        session_destroy();

        // Try to join as player 3
        session_start();
        $_SESSION['player_id'] = 'player3';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $joinResponse = json_decode($output, true);

        $this->assertFalse($joinResponse['success']);
        $this->assertEquals('ROOM_FULL', $joinResponse['error']);
        $this->assertEquals('Room is full', $joinResponse['message']);
    }

    public function testMakeMoveInRoom(): void
    {
        // Create room with player 1 (X)
        session_start();
        $_SESSION['player_id'] = 'player1';
        $_SESSION['player_name'] = 'Alice';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        // Join as player 2 (O)
        session_start();
        $_SESSION['player_id'] = 'player2';
        $_SESSION['player_name'] = 'Bob';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        // Mock php://input for join request
        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['name' => 'Bob']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        session_destroy();

        // Player 1 makes first move
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/move";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['position' => 0]);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        $moveResponse = json_decode($output, true);

        $this->assertTrue($moveResponse['success']);
        $this->assertEquals('X', $moveResponse['state']['board'][0]);
        $this->assertEquals('O', $moveResponse['state']['currentPlayer']);
    }

    public function testNotYourTurnError(): void
    {
        // Create room and join second player
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['name' => 'Player2']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');

        // Player 2 (O) tries to move first (X's turn)
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/move";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['position' => 0]);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        $moveResponse = json_decode($output, true);

        $this->assertFalse($moveResponse['success']);
        $this->assertEquals('NOT_YOUR_TURN', $moveResponse['error']);
    }

    public function testGetRoomState(): void
    {
        // Create room
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];

        // Get room state
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/state";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $stateResponse = json_decode($output, true);

        $this->assertTrue($stateResponse['success']);
        $this->assertArrayHasKey('state', $stateResponse);
        $this->assertArrayHasKey('room', $stateResponse);
        $this->assertArrayHasKey('timestamp', $stateResponse);
        $this->assertIsInt($stateResponse['timestamp']);
    }

    public function testResetRoom(): void
    {
        // Create room and make a move
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        // Join second player
        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['name' => 'Player2']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        session_destroy();

        // Player 1 makes a move
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/move";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['position' => 0]);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');

        // Player 1 votes for reset
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/reset";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $firstVoteResponse = json_decode($output, true);

        $this->assertTrue($firstVoteResponse['success']);
        $this->assertEquals('Waiting for other player to vote for rematch', $firstVoteResponse['message']);
        $this->assertFalse($firstVoteResponse['bothVoted']);

        session_destroy();

        // Player 2 votes for reset
        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/reset";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $resetResponse = json_decode($output, true);

        $this->assertTrue($resetResponse['success']);
        $this->assertEquals('Game reset successfully', $resetResponse['message']);
        $this->assertTrue($resetResponse['bothVoted']);

        // Verify board is cleared
        $board = $resetResponse['state']['board'];
        foreach ($board as $cell) {
            $this->assertNull($cell);
        }
    }

    public function testLeaveRoom(): void
    {
        // Create room
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];

        // Leave room
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/leave";

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $leaveResponse = json_decode($output, true);

        $this->assertTrue($leaveResponse['success']);
        $this->assertEquals('Left room successfully', $leaveResponse['message']);
    }

    public function testGetRoomStats(): void
    {
        // Create a couple of rooms first so we have data
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        session_destroy();

        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        session_destroy();

        // Now get stats
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/api/rooms/stats';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $statsResponse = json_decode($output, true);

        $this->assertTrue($statsResponse['success']);
        $this->assertArrayHasKey('stats', $statsResponse);
        $this->assertArrayHasKey('total', $statsResponse['stats']);
        $this->assertArrayHasKey('active', $statsResponse['stats']);
        $this->assertArrayHasKey('waiting', $statsResponse['stats']);
        $this->assertArrayHasKey('finished', $statsResponse['stats']);
        $this->assertIsInt($statsResponse['stats']['total']);
        $this->assertGreaterThanOrEqual(2, $statsResponse['stats']['total']);
    }

    public function testInvalidPositionError(): void
    {
        // Create room and join second player
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        session_start();
        $_SESSION['player_id'] = 'player2';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/join";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['name' => 'Player2']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        session_destroy();

        // Try to make move with invalid position
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/move";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['position' => 'invalid']);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        $moveResponse = json_decode($output, true);

        $this->assertFalse($moveResponse['success']);
        $this->assertEquals('INVALID_INPUT', $moveResponse['error']);
    }

    public function testNotInRoomError(): void
    {
        // Create room as player 1
        session_start();
        $_SESSION['player_id'] = 'player1';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/api/rooms';

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();
        $createResponse = json_decode($output, true);
        $roomId = $createResponse['roomId'];
        session_destroy();

        // Try to make move as player 3 (not in room)
        session_start();
        $_SESSION['player_id'] = 'player3';

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = "/api/rooms/{$roomId}/move";

        stream_wrapper_unregister('php');
        stream_wrapper_register('php', TestStreamWrapper::class);
        TestStreamWrapper::$data = json_encode(['position' => 0]);

        ob_start();
        $this->router->handleRequest();
        $output = ob_get_clean();

        stream_wrapper_restore('php');
        $moveResponse = json_decode($output, true);

        $this->assertFalse($moveResponse['success']);
        $this->assertEquals('NOT_IN_ROOM', $moveResponse['error']);
    }
}
