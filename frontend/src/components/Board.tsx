import { BoardState } from '../types/game';
import { Cell } from './Cell';
import '../styles/Board.css';

interface BoardProps {
  board: BoardState;
  onCellClick: (position: number) => void;
  disabled: boolean;
}

export function Board({ board, onCellClick, disabled }: BoardProps) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          position={index}
          onClick={onCellClick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
