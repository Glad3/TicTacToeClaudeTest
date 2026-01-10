<?php

declare(strict_types=1);

namespace TicTacToe\Game;

class Board
{
    private const GRID_SIZE = 9;

    /** @var array<int, string|null> */
    private array $cells;

    public function __construct()
    {
        $this->reset();
    }

    public function reset(): void
    {
        $this->cells = array_fill(0, self::GRID_SIZE, null);
    }

    public function getCell(int $position): ?string
    {
        $this->validatePosition($position);
        return $this->cells[$position];
    }

    public function setCell(int $position, string $marker): bool
    {
        $this->validatePosition($position);

        if ($this->cells[$position] !== null) {
            return false;
        }

        $this->cells[$position] = $marker;
        return true;
    }

    public function isFull(): bool
    {
        foreach ($this->cells as $cell) {
            if ($cell === null) {
                return false;
            }
        }
        return true;
    }

    public function isEmpty(int $position): bool
    {
        $this->validatePosition($position);
        return $this->cells[$position] === null;
    }

    /** @return array<int, string|null> */
    public function getCells(): array
    {
        return $this->cells;
    }

    private function validatePosition(int $position): void
    {
        if ($position < 0 || $position >= self::GRID_SIZE) {
            throw new \InvalidArgumentException(
                "Position must be between 0 and " . (self::GRID_SIZE - 1)
            );
        }
    }
}
