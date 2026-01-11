<?php

declare(strict_types=1);

namespace TicTacToe\Game;

class GameController
{
    public const STATE_PLAYING = 'playing';
    public const STATE_WON = 'won';
    public const STATE_DRAW = 'draw';

    private const WIN_CONDITIONS = [
        // Rows
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Columns
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonals
        [0, 4, 8],
        [2, 4, 6],
    ];

    private Board $board;
    private string $currentPlayer;
    private string $state;
    private ?string $winner;

    public function __construct()
    {
        $this->board = new Board();
        $this->resetGame();
    }

    public function resetGame(): void
    {
        $this->board->reset();
        $this->currentPlayer = Player::MARKER_X;
        $this->state = self::STATE_PLAYING;
        $this->winner = null;
    }

    /**
     * @return array{success: bool, message: string, state: array}
     */
    public function makeMove(int $position, ?string $playerId = null, ?string $playerMarker = null): array
    {
        if ($this->state !== self::STATE_PLAYING) {
            return [
                'success' => false,
                'message' => 'Game is already over',
                'state' => $this->getGameState(),
            ];
        }

        // Validate player's turn if player context is provided
        if ($playerId !== null && $playerMarker !== null) {
            if (!$this->canPlayerMove($playerMarker)) {
                return [
                    'success' => false,
                    'message' => 'Not your turn',
                    'state' => $this->getGameState(),
                ];
            }
        }

        if (!$this->board->setCell($position, $this->currentPlayer)) {
            return [
                'success' => false,
                'message' => 'Cell is already occupied',
                'state' => $this->getGameState(),
            ];
        }

        $winner = $this->checkWinner();
        if ($winner !== null) {
            $this->state = self::STATE_WON;
            $this->winner = $winner;
            return [
                'success' => true,
                'message' => "Player {$winner} wins!",
                'state' => $this->getGameState(),
            ];
        }

        if ($this->checkDraw()) {
            $this->state = self::STATE_DRAW;
            return [
                'success' => true,
                'message' => 'Game is a draw',
                'state' => $this->getGameState(),
            ];
        }

        $this->currentPlayer = Player::getOppositeMarker($this->currentPlayer);

        return [
            'success' => true,
            'message' => "Player {$this->currentPlayer}'s turn",
            'state' => $this->getGameState(),
        ];
    }

    public function checkWinner(): ?string
    {
        $cells = $this->board->getCells();

        foreach (self::WIN_CONDITIONS as $condition) {
            [$a, $b, $c] = $condition;

            if (
                $cells[$a] !== null &&
                $cells[$a] === $cells[$b] &&
                $cells[$b] === $cells[$c]
            ) {
                return $cells[$a];
            }
        }

        return null;
    }

    public function checkDraw(): bool
    {
        return $this->board->isFull() && $this->checkWinner() === null;
    }

    /**
     * Check if a player with the given marker can make a move
     */
    public function canPlayerMove(string $playerMarker): bool
    {
        return $this->state === self::STATE_PLAYING && $this->currentPlayer === $playerMarker;
    }

    /**
     * @return array{board: array<int, string|null>, currentPlayer: string, state: string, winner: string|null}
     */
    public function getGameState(): array
    {
        return [
            'board' => $this->board->getCells(),
            'currentPlayer' => $this->currentPlayer,
            'state' => $this->state,
            'winner' => $this->winner,
        ];
    }

    public function getCurrentPlayer(): string
    {
        return $this->currentPlayer;
    }

    public function getState(): string
    {
        return $this->state;
    }

    public function getWinner(): ?string
    {
        return $this->winner;
    }

    public function getBoard(): Board
    {
        return $this->board;
    }

    /**
     * Restore game state from a saved state array
     *
     * @param array{board: array<int, string|null>, currentPlayer: string, state: string, winner: string|null} $state
     */
    public function restoreState(array $state): void
    {
        $this->board->reset();

        foreach ($state['board'] as $position => $marker) {
            if ($marker !== null) {
                $this->board->setCell($position, $marker);
            }
        }

        $this->currentPlayer = $state['currentPlayer'];
        $this->state = $state['state'];
        $this->winner = $state['winner'];
    }
}
