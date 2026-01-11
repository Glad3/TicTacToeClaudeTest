import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from './Board';
import { BoardState } from '../types/game';

describe('Board', () => {
  const emptyBoard: BoardState = Array(9).fill(null);

  it('renders 9 cells', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} disabled={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('renders cells with correct values', () => {
    const board: BoardState = ['X', 'O', null, null, 'X', null, null, null, 'O'];
    render(<Board board={board} onCellClick={() => {}} disabled={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('X');
    expect(buttons[1]).toHaveTextContent('O');
    expect(buttons[2]).toHaveTextContent('');
    expect(buttons[4]).toHaveTextContent('X');
    expect(buttons[8]).toHaveTextContent('O');
  });

  it('calls onCellClick with correct position', () => {
    const handleClick = vi.fn();
    render(<Board board={emptyBoard} onCellClick={handleClick} disabled={false} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);

    expect(handleClick).toHaveBeenCalledWith(4);
  });

  it('calls onCellClick for different positions', () => {
    const handleClick = vi.fn();
    render(<Board board={emptyBoard} onCellClick={handleClick} disabled={false} />);

    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(handleClick).toHaveBeenCalledWith(0);

    fireEvent.click(buttons[8]);
    expect(handleClick).toHaveBeenCalledWith(8);
  });

  it('does not call onCellClick for occupied cells', () => {
    const handleClick = vi.fn();
    const board: BoardState = ['X', null, null, null, null, null, null, null, null];
    render(<Board board={board} onCellClick={handleClick} disabled={false} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Occupied cell

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disables all cells when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Board board={emptyBoard} onCellClick={handleClick} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      fireEvent.click(button);
    });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has grid role for accessibility', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} disabled={false} />);

    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} disabled={false} />);

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'Tic Tac Toe board');
  });
});
