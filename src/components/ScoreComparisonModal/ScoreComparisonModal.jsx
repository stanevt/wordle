import { useState, useEffect } from 'react';
import { todayISO } from '../../utils/dateUtils';
import { fetchScoreComparison } from '../../lib/gameSync';
import './ScoreComparisonModal.css';

function guessDisplay(guessCount, status) {
  if (status === null) return '—';
  if (status === 'lost') return 'X/6';
  return `${guessCount}/6`;
}

function buildScoreData(rawRows) {
  let user1Score = 0;
  let user2Score = 0;
  let hasIncomplete = false;

  const rows = rawRows.map(row => {
    const u1 = row.user1_status !== null;
    const u2 = row.user2_status !== null;

    if (!u1 || !u2) {
      hasIncomplete = true;
      return {
        date: row.date,
        user1Display: guessDisplay(row.user1_guess_count, row.user1_status),
        user2Display: guessDisplay(row.user2_guess_count, row.user2_status),
        winner: 'incomplete',
        pointLabel: '—',
      };
    }

    let winner;
    const u1Won = row.user1_status === 'won';
    const u2Won = row.user2_status === 'won';

    if (u1Won && u2Won) {
      if (row.user1_guess_count < row.user2_guess_count) winner = 'user1';
      else if (row.user1_guess_count > row.user2_guess_count) winner = 'user2';
      else winner = 'draw';
    } else if (u1Won && !u2Won) {
      winner = 'user1';
    } else if (!u1Won && u2Won) {
      winner = 'user2';
    } else {
      winner = 'draw';
    }

    if (winner === 'user1') user1Score++;
    else if (winner === 'user2') user2Score++;

    return {
      date: row.date,
      user1Display: guessDisplay(row.user1_guess_count, row.user1_status),
      user2Display: guessDisplay(row.user2_guess_count, row.user2_status),
      winner,
      pointLabel: winner === 'user1' ? '◀' : winner === 'user2' ? '▶' : '=',
    };
  });

  return { user1Score, user2Score, rows, hasIncomplete };
}

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function ScoreComparisonModal({ isOpen, onClose, username }) {
  const [opponent, setOpponent] = useState('');
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayISO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setScoreData(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canCalculate = opponent.trim().length > 0 && startDate && endDate && startDate <= endDate && !isLoading;

  async function handleCalculate() {
    const opp = opponent.trim();
    setIsLoading(true);
    setError(null);
    setScoreData(null);
    try {
      const rawRows = await fetchScoreComparison(username, opp, startDate, endDate);
      setScoreData(buildScoreData(rawRows));
    } catch {
      setError('Could not load comparison. Check the username and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal score-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">Score Comparison</h2>

        <div className="score-form">
          <div className="score-players-row">
            <div className="score-player-block">
              <span className="score-label">You</span>
              <span className="score-username-you">{username}</span>
            </div>
            <span className="score-vs">vs.</span>
            <div className="score-player-block">
              <label className="score-label" htmlFor="score-opponent">Opponent</label>
              <input
                id="score-opponent"
                className="score-input"
                type="text"
                placeholder="username"
                value={opponent}
                onChange={e => setOpponent(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="score-date-row">
            <div className="score-date-field">
              <label className="score-label" htmlFor="score-start">From</label>
              <input
                id="score-start"
                className="score-input"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="score-date-field">
              <label className="score-label" htmlFor="score-end">To</label>
              <input
                id="score-end"
                className="score-input"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            className="score-calculate-btn"
            onClick={handleCalculate}
            disabled={!canCalculate}
          >
            {isLoading ? 'Calculating…' : 'Calculate'}
          </button>
        </div>

        {error && <p className="score-error">{error}</p>}

        {scoreData && (
          <div className="score-results">
            <div className="score-tally">
              <div className="score-tally-player">
                <span className="score-tally-name">{username}</span>
                <span className={`score-tally-value${scoreData.user1Score > scoreData.user2Score ? ' score-tally-value--winner' : ''}`}>
                  {scoreData.user1Score}
                </span>
              </div>
              <span className="score-tally-sep">–</span>
              <div className="score-tally-player score-tally-player--right">
                <span className={`score-tally-value${scoreData.user2Score > scoreData.user1Score ? ' score-tally-value--winner' : ''}`}>
                  {scoreData.user2Score}
                </span>
                <span className="score-tally-name">{opponent.trim()}</span>
              </div>
            </div>

            {scoreData.hasIncomplete && (
              <p className="score-warning">
                Not every day has been completed — those days are excluded from the score.
              </p>
            )}

            {scoreData.rows.length > 0 ? (
              <div className="score-table-wrap">
                <table className="score-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>{username}</th>
                      <th>{opponent.trim()}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreData.rows.map(row => (
                      <tr key={row.date} className={`score-row score-row--${row.winner}`}>
                        <td className="score-cell-date">{row.date}</td>
                        <td className="score-cell">{row.user1Display}</td>
                        <td className="score-cell">{row.user2Display}</td>
                        <td className="score-cell-point">{row.pointLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="score-empty">No completed days found in this date range.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
