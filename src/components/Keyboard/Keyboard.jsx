import './Keyboard.css';

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Enter','Z','X','C','V','B','N','M','⌫'],
];

export default function Keyboard({ onKey, letterStatuses }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, ri) => (
        <div className="keyboard-row" key={ri}>
          {row.map(key => {
            const status = key.length === 1 ? letterStatuses[key] : undefined;
            return (
              <button
                key={key}
                className={`key${key.length > 1 ? ' key--wide' : ''}${status ? ` key--${status}` : ''}`}
                onClick={() => onKey(key === '⌫' ? 'Backspace' : key)}
                aria-label={key === '⌫' ? 'Backspace' : key}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
