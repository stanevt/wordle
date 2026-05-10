import './Board.css';
import Row from './Row';
import { MAX_GUESSES } from '../../utils/constants';

export default function Board({ guesses, evaluations, currentInput, revealingRow, shakingRow }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_GUESSES }, (_, i) => {
        const isCurrentRow = i === guesses.length;
        const isRevealing = i === revealingRow;
        const isShaking = i === shakingRow;
        return (
          <Row
            key={i}
            guess={guesses[i] || ''}
            evaluation={evaluations[i] || null}
            currentInput={isCurrentRow ? currentInput : ''}
            isCurrentRow={isCurrentRow}
            isRevealing={isRevealing}
            isShaking={isShaking}
          />
        );
      })}
    </div>
  );
}
