import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameStatus } from './GameStatus';
import { GameState } from '../types/game';

describe('GameStatus', () => {
  const playingState: GameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    state: 'playing',
    winner: null,
  };

  const xWonState: GameState = {
    board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
    currentPlayer: 'O',
    state: 'won',
    winner: 'X',
  };

  const oWonState: GameState = {
    board: ['X', 'X', null, 'O', 'O', 'O', 'X', null, null],
    currentPlayer: 'X',
    state: 'won',
    winner: 'O',
  };

  const drawState: GameState = {
    board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
    currentPlayer: 'O',
    state: 'draw',
    winner: null,
  };

  it('displays current player turn for X', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('displays current player turn for O', () => {
    const oTurnState = { ...playingState, currentPlayer: 'O' as const };
    render(
      <GameStatus
        gameState={oTurnState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("Player O's turn")).toBeInTheDocument();
  });

  it('displays X wins message', () => {
    render(
      <GameStatus
        gameState={xWonState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
  });

  it('displays O wins message', () => {
    render(
      <GameStatus
        gameState={oWonState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Player O wins!')).toBeInTheDocument();
  });

  it('displays draw message', () => {
    render(
      <GameStatus
        gameState={drawState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('displays loading message', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={false}
        error="Failed to make move"
      />
    );

    expect(screen.getByText('Failed to make move')).toBeInTheDocument();
  });

  it('shows Reset Game button during play', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Reset Game')).toBeInTheDocument();
  });

  it('shows Play Again button after win', () => {
    render(
      <GameStatus
        gameState={xWonState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('shows Play Again button after draw', () => {
    render(
      <GameStatus
        gameState={drawState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const handleReset = vi.fn();
    render(
      <GameStatus
        gameState={playingState}
        onReset={handleReset}
        isLoading={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByText('Reset Game'));

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('disables reset button when loading', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={true}
        error={null}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('has status role for accessibility', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies error class when error exists', () => {
    render(
      <GameStatus
        gameState={playingState}
        onReset={() => {}}
        isLoading={false}
        error="Some error"
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveClass('game-status__message--error');
  });

  it('applies gameover class when game is won', () => {
    render(
      <GameStatus
        gameState={xWonState}
        onReset={() => {}}
        isLoading={false}
        error={null}
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveClass('game-status__message--gameover');
  });
});
