<?php

declare(strict_types=1);

namespace TicTacToe\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TicTacToe\Game\GameController;
use TicTacToe\Game\Player;

class GameControllerTest extends TestCase
{
    private GameController $game;

    protected function setUp(): void
    {
        $this->game = new GameController();
    }

    public function testGameInitializesWithCorrectState(): void
    {
        $state = $this->game->getGameState();

        $this->assertCount(9, $state['board']);
        $this->assertEquals('X', $state['currentPlayer']);
        $this->assertEquals('playing', $state['state']);
        $this->assertNull($state['winner']);
    }

    public function testMakeMoveSucceedsOnValidMove(): void
    {
        $result = $this->game->makeMove(4);

        $this->assertTrue($result['success']);
        $this->assertEquals('X', $this->game->getBoard()->getCell(4));
        $this->assertEquals('O', $this->game->getCurrentPlayer());
    }

    public function testMakeMoveFailsOnOccupiedCell(): void
    {
        $this->game->makeMove(4);
        $result = $this->game->makeMove(4);

        $this->assertFalse($result['success']);
        $this->assertEquals('Cell is already occupied', $result['message']);
    }

    public function testPlayersAlternateTurns(): void
    {
        $this->assertEquals('X', $this->game->getCurrentPlayer());

        $this->game->makeMove(0);
        $this->assertEquals('O', $this->game->getCurrentPlayer());

        $this->game->makeMove(1);
        $this->assertEquals('X', $this->game->getCurrentPlayer());

        $this->game->makeMove(2);
        $this->assertEquals('O', $this->game->getCurrentPlayer());
    }

    // Win condition tests - Rows
    public function testWinConditionTopRow(): void
    {
        // X X X
        // O O .
        // . . .
        $this->game->makeMove(0); // X
        $this->game->makeMove(3); // O
        $this->game->makeMove(1); // X
        $this->game->makeMove(4); // O
        $result = $this->game->makeMove(2); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testWinConditionMiddleRow(): void
    {
        // O O .
        // X X X
        // . . .
        $this->game->makeMove(3); // X
        $this->game->makeMove(0); // O
        $this->game->makeMove(4); // X
        $this->game->makeMove(1); // O
        $result = $this->game->makeMove(5); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testWinConditionBottomRow(): void
    {
        // O O .
        // . . .
        // X X X
        $this->game->makeMove(6); // X
        $this->game->makeMove(0); // O
        $this->game->makeMove(7); // X
        $this->game->makeMove(1); // O
        $result = $this->game->makeMove(8); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    // Win condition tests - Columns
    public function testWinConditionLeftColumn(): void
    {
        // X O .
        // X O .
        // X . .
        $this->game->makeMove(0); // X
        $this->game->makeMove(1); // O
        $this->game->makeMove(3); // X
        $this->game->makeMove(4); // O
        $result = $this->game->makeMove(6); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testWinConditionMiddleColumn(): void
    {
        // O X .
        // O X .
        // . X .
        $this->game->makeMove(1); // X
        $this->game->makeMove(0); // O
        $this->game->makeMove(4); // X
        $this->game->makeMove(3); // O
        $result = $this->game->makeMove(7); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testWinConditionRightColumn(): void
    {
        // O . X
        // O . X
        // . . X
        $this->game->makeMove(2); // X
        $this->game->makeMove(0); // O
        $this->game->makeMove(5); // X
        $this->game->makeMove(3); // O
        $result = $this->game->makeMove(8); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    // Win condition tests - Diagonals
    public function testWinConditionDiagonalTopLeftToBottomRight(): void
    {
        // X O .
        // O X .
        // . . X
        $this->game->makeMove(0); // X
        $this->game->makeMove(1); // O
        $this->game->makeMove(4); // X
        $this->game->makeMove(3); // O
        $result = $this->game->makeMove(8); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testWinConditionDiagonalTopRightToBottomLeft(): void
    {
        // O . X
        // O X .
        // X . .
        $this->game->makeMove(2); // X
        $this->game->makeMove(0); // O
        $this->game->makeMove(4); // X
        $this->game->makeMove(3); // O
        $result = $this->game->makeMove(6); // X wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('X', $result['state']['winner']);
    }

    public function testPlayerOCanWin(): void
    {
        // X X O
        // X O .
        // O . .
        $this->game->makeMove(0); // X
        $this->game->makeMove(2); // O
        $this->game->makeMove(1); // X
        $this->game->makeMove(4); // O
        $this->game->makeMove(3); // X
        $result = $this->game->makeMove(6); // O wins

        $this->assertEquals('won', $result['state']['state']);
        $this->assertEquals('O', $result['state']['winner']);
    }

    public function testDrawCondition(): void
    {
        // X O X
        // X O O
        // O X X
        $this->game->makeMove(0); // X
        $this->game->makeMove(1); // O
        $this->game->makeMove(2); // X
        $this->game->makeMove(4); // O
        $this->game->makeMove(3); // X
        $this->game->makeMove(5); // O
        $this->game->makeMove(7); // X
        $this->game->makeMove(6); // O
        $result = $this->game->makeMove(8); // X - Draw

        $this->assertEquals('draw', $result['state']['state']);
        $this->assertNull($result['state']['winner']);
    }

    public function testMoveAfterWinFails(): void
    {
        // X X X - X wins
        $this->game->makeMove(0); // X
        $this->game->makeMove(3); // O
        $this->game->makeMove(1); // X
        $this->game->makeMove(4); // O
        $this->game->makeMove(2); // X wins

        $result = $this->game->makeMove(5); // Try to move after game over

        $this->assertFalse($result['success']);
        $this->assertEquals('Game is already over', $result['message']);
    }

    public function testMoveAfterDrawFails(): void
    {
        // Create a draw
        $this->game->makeMove(0); // X
        $this->game->makeMove(1); // O
        $this->game->makeMove(2); // X
        $this->game->makeMove(4); // O
        $this->game->makeMove(3); // X
        $this->game->makeMove(5); // O
        $this->game->makeMove(7); // X
        $this->game->makeMove(6); // O
        $this->game->makeMove(8); // X - Draw

        $result = $this->game->makeMove(0); // Try to move after draw

        $this->assertFalse($result['success']);
    }

    public function testResetGameClearsState(): void
    {
        $this->game->makeMove(0);
        $this->game->makeMove(1);
        $this->game->makeMove(4);

        $this->game->resetGame();

        $state = $this->game->getGameState();
        $this->assertEquals('X', $state['currentPlayer']);
        $this->assertEquals('playing', $state['state']);
        $this->assertNull($state['winner']);
        foreach ($state['board'] as $cell) {
            $this->assertNull($cell);
        }
    }

    public function testRestoreStateRestoresFullState(): void
    {
        $savedState = [
            'board' => ['X', 'O', 'X', null, 'O', null, null, null, null],
            'currentPlayer' => 'X',
            'state' => 'playing',
            'winner' => null,
        ];

        $this->game->restoreState($savedState);

        $state = $this->game->getGameState();
        $this->assertEquals($savedState['board'], $state['board']);
        $this->assertEquals('X', $state['currentPlayer']);
        $this->assertEquals('playing', $state['state']);
    }

    public function testRestoreStateRestoresWonGame(): void
    {
        $savedState = [
            'board' => ['X', 'X', 'X', 'O', 'O', null, null, null, null],
            'currentPlayer' => 'O',
            'state' => 'won',
            'winner' => 'X',
        ];

        $this->game->restoreState($savedState);

        $state = $this->game->getGameState();
        $this->assertEquals('won', $state['state']);
        $this->assertEquals('X', $state['winner']);
    }

    public function testCheckWinnerReturnsNullForNoWinner(): void
    {
        $this->game->makeMove(0); // X
        $this->game->makeMove(4); // O

        $this->assertNull($this->game->checkWinner());
    }

    public function testCheckDrawReturnsFalseWhenNotFull(): void
    {
        $this->game->makeMove(0);

        $this->assertFalse($this->game->checkDraw());
    }

    public function testCanPlayerMoveReturnsTrueWhenPlayersTurn(): void
    {
        $this->assertTrue($this->game->canPlayerMove('X'));
        $this->assertFalse($this->game->canPlayerMove('O'));

        $this->game->makeMove(0); // X moves

        $this->assertFalse($this->game->canPlayerMove('X'));
        $this->assertTrue($this->game->canPlayerMove('O'));
    }

    public function testCanPlayerMoveReturnsFalseWhenGameOver(): void
    {
        // X wins
        $this->game->makeMove(0); // X
        $this->game->makeMove(3); // O
        $this->game->makeMove(1); // X
        $this->game->makeMove(4); // O
        $this->game->makeMove(2); // X wins

        $this->assertFalse($this->game->canPlayerMove('X'));
        $this->assertFalse($this->game->canPlayerMove('O'));
    }

    public function testMakeMoveWithPlayerContextValidatesTurn(): void
    {
        // Try to make move as O when it's X's turn
        $result = $this->game->makeMove(0, 'player2', 'O');

        $this->assertFalse($result['success']);
        $this->assertEquals('Not your turn', $result['message']);
    }

    public function testMakeMoveWithPlayerContextSucceedsOnCorrectTurn(): void
    {
        // Make move as X when it's X's turn
        $result = $this->game->makeMove(0, 'player1', 'X');

        $this->assertTrue($result['success']);
        $this->assertEquals('X', $this->game->getBoard()->getCell(0));
    }

    public function testMakeMoveWithoutPlayerContextStillWorks(): void
    {
        // Backward compatibility - no player validation
        $result = $this->game->makeMove(0);

        $this->assertTrue($result['success']);
        $this->assertEquals('X', $this->game->getBoard()->getCell(0));
    }
}
