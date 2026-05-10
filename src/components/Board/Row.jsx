import './Row.css';
import Tile from './Tile';
import { WORD_LENGTH } from '../../utils/constants';

export default function Row({ guess, evaluation, currentInput, isCurrentRow, isRevealing, isShaking }) {
  const src = isCurrentRow ? currentInput : (guess || '');
  const letters = Array.from({ length: WORD_LENGTH }, (_, i) => src[i] || '');

  return (
    <div className={`row${isShaking ? ' row--shake' : ''}`}>
      {letters.map((letter, i) => (
        <Tile
          key={i}
          letter={letter.trim() || ''}
          evaluation={evaluation?.[i] || null}
          isRevealing={isRevealing}
          position={i}
        />
      ))}
    </div>
  );
}
