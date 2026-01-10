import { CellValue } from '../types/game';
import '../styles/Cell.css';

interface CellProps {
  value: CellValue;
  position: number;
  onClick: (position: number) => void;
  disabled: boolean;
}

export function Cell({ value, position, onClick, disabled }: CellProps) {
  const handleClick = () => {
    if (!disabled && value === null) {
      onClick(position);
    }
  };

  return (
    <button
      className={`cell ${value ? `cell--${value.toLowerCase()}` : ''} ${disabled ? 'cell--disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled || value !== null}
      aria-label={`Cell ${position + 1}${value ? `, ${value}` : ', empty'}`}
    >
      {value}
    </button>
  );
}
