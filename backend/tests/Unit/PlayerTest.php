<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\Player;
use InvalidArgumentException;

class PlayerTest extends TestCase
{
    public function testPlayerXCanBeCreated(): void
    {
        $player = new Player('X');

        $this->assertEquals('X', $player->getMarker());
    }

    public function testPlayerOCanBeCreated(): void
    {
        $player = new Player('O');

        $this->assertEquals('O', $player->getMarker());
    }

    public function testInvalidMarkerThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Player('Z');
    }

    public function testIsXReturnsTrueForPlayerX(): void
    {
        $player = new Player('X');

        $this->assertTrue($player->isX());
        $this->assertFalse($player->isO());
    }

    public function testIsOReturnsTrueForPlayerO(): void
    {
        $player = new Player('O');

        $this->assertTrue($player->isO());
        $this->assertFalse($player->isX());
    }

    public function testCreatePlayerXFactory(): void
    {
        $player = Player::createPlayerX();

        $this->assertEquals('X', $player->getMarker());
        $this->assertTrue($player->isX());
    }

    public function testCreatePlayerOFactory(): void
    {
        $player = Player::createPlayerO();

        $this->assertEquals('O', $player->getMarker());
        $this->assertTrue($player->isO());
    }

    public function testGetOppositeMarkerReturnsOForX(): void
    {
        $opposite = Player::getOppositeMarker('X');

        $this->assertEquals('O', $opposite);
    }

    public function testGetOppositeMarkerReturnsXForO(): void
    {
        $opposite = Player::getOppositeMarker('O');

        $this->assertEquals('X', $opposite);
    }

    public function testMarkerXConstant(): void
    {
        $this->assertEquals('X', Player::MARKER_X);
    }

    public function testMarkerOConstant(): void
    {
        $this->assertEquals('O', Player::MARKER_O);
    }
}
