import './ViewBoardModal.css';
import Row from '../Board/Row';
import { WORD_LENGTH, MAX_GUESSES } from '../../utils/constants';
import { evaluateGuess } from '../../utils/tileEvaluation';

export default function ViewBoardModal({ isOpen, onClose, username, guesses, answer }) {
  if (!isOpen) return null;

  const evaluations = guesses.map(g => evaluateGuess(g, answer));

  // Fill empty rows if player won in fewer than MAX_GUESSES
  const rows = [...guesses];
  const padding = MAX_GUESSES - rows.length;
  for (let i = 0; i < padding; i++) {
    rows.push('');
  }

  return (
    <div className="view-modal-backdrop" onClick={onClose}>
      <div className="view-modal" onClick={e => e.stopPropagation()}>
        <button className="view-modal-close" onClick={onClose}>✕</button>
        <h2 className="view-modal-title">{username}'s Game</h2>
        <div className="view-board">
          {rows.map((guess, i) => (
            <Row
              key={i}
              guess={guess}
              evaluation={evaluations[i]}
              isRevealing={false}
              isShaking={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
