import './Tile.css';

const EVAL_COLORS = {
  correct: 'var(--color-correct)',
  present: 'var(--color-present)',
  absent:  'var(--color-absent)',
};

export default function Tile({ letter, evaluation, isRevealing, position }) {
  const isRevealed = evaluation && !isRevealing;
  const isAnimating = evaluation && isRevealing;

  let className = 'tile';
  if (letter && !evaluation) className += ' tile--filled';
  if (isRevealed) className += ' tile--revealed';
  if (isAnimating) className += ' tile--flip';

  const style = {
    '--tile-index': position,
    '--tile-result-color': evaluation ? EVAL_COLORS[evaluation] : undefined,
    backgroundColor: isRevealed ? EVAL_COLORS[evaluation] : undefined,
    borderColor: isRevealed ? 'transparent' : undefined,
    color: isRevealed ? '#fff' : undefined,
  };

  return (
    <div className={className} style={style}>
      {letter}
    </div>
  );
}
