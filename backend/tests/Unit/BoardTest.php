<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\Board;
use InvalidArgumentException;

class BoardTest extends TestCase
{
    private Board $board;

    protected function setUp(): void
    {
        $this->board = new Board();
    }

    public function testBoardInitializesWithNineCells(): void
    {
        $cells = $this->board->getCells();

        $this->assertCount(9, $cells);
        foreach ($cells as $cell) {
            $this->assertNull($cell);
        }
    }

    public function testSetCellSucceedsOnEmptyCell(): void
    {
        $result = $this->board->setCell(0, 'X');

        $this->assertTrue($result);
        $this->assertEquals('X', $this->board->getCell(0));
    }

    public function testSetCellFailsOnOccupiedCell(): void
    {
        $this->board->setCell(0, 'X');
        $result = $this->board->setCell(0, 'O');

        $this->assertFalse($result);
        $this->assertEquals('X', $this->board->getCell(0));
    }

    public function testGetCellReturnsNullForEmptyCell(): void
    {
        $this->assertNull($this->board->getCell(4));
    }

    public function testGetCellReturnsMarkerForOccupiedCell(): void
    {
        $this->board->setCell(4, 'O');

        $this->assertEquals('O', $this->board->getCell(4));
    }

    public function testIsEmptyReturnsTrueForEmptyCell(): void
    {
        $this->assertTrue($this->board->isEmpty(0));
    }

    public function testIsEmptyReturnsFalseForOccupiedCell(): void
    {
        $this->board->setCell(0, 'X');

        $this->assertFalse($this->board->isEmpty(0));
    }

    public function testIsFullReturnsFalseForEmptyBoard(): void
    {
        $this->assertFalse($this->board->isFull());
    }

    public function testIsFullReturnsFalseForPartialBoard(): void
    {
        $this->board->setCell(0, 'X');
        $this->board->setCell(1, 'O');
        $this->board->setCell(2, 'X');

        $this->assertFalse($this->board->isFull());
    }

    public function testIsFullReturnsTrueForFullBoard(): void
    {
        for ($i = 0; $i < 9; $i++) {
            $this->board->setCell($i, $i % 2 === 0 ? 'X' : 'O');
        }

        $this->assertTrue($this->board->isFull());
    }

    public function testResetClearsAllCells(): void
    {
        $this->board->setCell(0, 'X');
        $this->board->setCell(4, 'O');
        $this->board->setCell(8, 'X');

        $this->board->reset();

        $cells = $this->board->getCells();
        foreach ($cells as $cell) {
            $this->assertNull($cell);
        }
    }

    public function testGetCellThrowsExceptionForNegativePosition(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->board->getCell(-1);
    }

    public function testGetCellThrowsExceptionForPositionAboveEight(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->board->getCell(9);
    }

    public function testSetCellThrowsExceptionForInvalidPosition(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->board->setCell(10, 'X');
    }

    public function testIsEmptyThrowsExceptionForInvalidPosition(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->board->isEmpty(-5);
    }
}
