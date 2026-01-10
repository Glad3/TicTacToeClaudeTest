import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cell } from './Cell';

describe('Cell', () => {
  it('renders an empty cell', () => {
    render(<Cell value={null} position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('');
  });

  it('renders X marker', () => {
    render(<Cell value="X" position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('X');
  });

  it('renders O marker', () => {
    render(<Cell value="O" position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('O');
  });

  it('calls onClick when empty cell is clicked', () => {
    const handleClick = vi.fn();
    render(<Cell value={null} position={4} onClick={handleClick} disabled={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledWith(4);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when occupied cell is clicked', () => {
    const handleClick = vi.fn();
    render(<Cell value="X" position={0} onClick={handleClick} disabled={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Cell value={null} position={0} onClick={handleClick} disabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has correct aria-label for empty cell', () => {
    render(<Cell value={null} position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cell 1, empty');
  });

  it('has correct aria-label for X cell', () => {
    render(<Cell value="X" position={4} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cell 5, X');
  });

  it('has correct aria-label for O cell', () => {
    render(<Cell value="O" position={8} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cell 9, O');
  });

  it('applies correct CSS class for X', () => {
    render(<Cell value="X" position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cell--x');
  });

  it('applies correct CSS class for O', () => {
    render(<Cell value="O" position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cell--o');
  });

  it('applies disabled class when disabled', () => {
    render(<Cell value={null} position={0} onClick={() => {}} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cell--disabled');
  });

  it('button is disabled when cell is occupied', () => {
    render(<Cell value="X" position={0} onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
