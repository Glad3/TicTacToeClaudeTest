<?php

declare(strict_types=1);

namespace TicTacToe\Game;

class Player
{
    public const MARKER_X = 'X';
    public const MARKER_O = 'O';

    private string $marker;

    public function __construct(string $marker)
    {
        $this->validateMarker($marker);
        $this->marker = $marker;
    }

    public function getMarker(): string
    {
        return $this->marker;
    }

    public function isX(): bool
    {
        return $this->marker === self::MARKER_X;
    }

    public function isO(): bool
    {
        return $this->marker === self::MARKER_O;
    }

    public static function createPlayerX(): self
    {
        return new self(self::MARKER_X);
    }

    public static function createPlayerO(): self
    {
        return new self(self::MARKER_O);
    }

    public static function getOppositeMarker(string $marker): string
    {
        return $marker === self::MARKER_X ? self::MARKER_O : self::MARKER_X;
    }

    private function validateMarker(string $marker): void
    {
        if ($marker !== self::MARKER_X && $marker !== self::MARKER_O) {
            throw new \InvalidArgumentException(
                "Marker must be '" . self::MARKER_X . "' or '" . self::MARKER_O . "'"
            );
        }
    }
}
