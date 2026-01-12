import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TurnIndicator } from './TurnIndicator';

describe('TurnIndicator', () => {
  it('shows "Your turn" when it is player turn', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={true}
        gameStatus="playing"
        winner={null}
      />
    );

    expect(screen.getByText('Your turn')).toBeInTheDocument();
    expect(screen.getByText('Make your move!')).toBeInTheDocument();
  });

  it('shows opponent turn when not player turn', () => {
    render(
      <TurnIndicator
        currentPlayer="O"
        myMarker="X"
        isMyTurn={false}
        gameStatus="playing"
        winner={null}
        playerOName="Player 2"
      />
    );

    expect(screen.getByText("Player 2's turn")).toBeInTheDocument();
  });

  it('uses default player name when not provided', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="O"
        isMyTurn={false}
        gameStatus="playing"
        winner={null}
      />
    );

    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('shows win message when player wins', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={false}
        gameStatus="won"
        winner="X"
      />
    );

    expect(screen.getByText('You won!')).toBeInTheDocument();
  });

  it('shows opponent wins when opponent wins', () => {
    render(
      <TurnIndicator
        currentPlayer="O"
        myMarker="X"
        isMyTurn={false}
        gameStatus="won"
        winner="O"
        playerOName="Player 2"
      />
    );

    expect(screen.getByText('Player 2 wins!')).toBeInTheDocument();
  });

  it('shows draw message on draw', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={false}
        gameStatus="draw"
        winner={null}
      />
    );

    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('displays current player marker', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={true}
        gameStatus="playing"
        winner={null}
      />
    );

    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('displays O marker when O turn', () => {
    render(
      <TurnIndicator
        currentPlayer="O"
        myMarker="X"
        isMyTurn={false}
        gameStatus="playing"
        winner={null}
      />
    );

    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('has my-turn styling class when player turn', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={true}
        gameStatus="playing"
        winner={null}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('turn-indicator--my-turn');
  });

  it('has opponent-turn styling class when opponent turn', () => {
    render(
      <TurnIndicator
        currentPlayer="O"
        myMarker="X"
        isMyTurn={false}
        gameStatus="playing"
        winner={null}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('turn-indicator--opponent-turn');
  });

  it('has win styling class when player wins', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={false}
        gameStatus="won"
        winner="X"
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('turn-indicator--win');
  });

  it('has lose styling class when opponent wins', () => {
    render(
      <TurnIndicator
        currentPlayer="O"
        myMarker="X"
        isMyTurn={false}
        gameStatus="won"
        winner="O"
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('turn-indicator--lose');
  });

  it('has draw styling class on draw', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={false}
        gameStatus="draw"
        winner={null}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('turn-indicator--draw');
  });

  it('has proper accessibility role', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={true}
        gameStatus="playing"
        winner={null}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-live polite for dynamic updates', () => {
    render(
      <TurnIndicator
        currentPlayer="X"
        myMarker="X"
        isMyTurn={true}
        gameStatus="playing"
        winner={null}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });
});
