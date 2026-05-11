import { useState, useEffect } from 'react';
import { fetchTodaysChampion, fetchTodaysStriker } from '../../lib/gameSync';
import { todayISO } from '../../utils/dateUtils';
import './StatsModal.css';

export default function StatsModal({ isOpen, onClose, stats }) {
  const [champion, setChampion] = useState(null);
  const [striker, setStriker] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchTodaysChampion(todayISO()).then(setChampion).catch(() => {});
    fetchTodaysStriker(todayISO()).then(setStriker).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const { gamesPlayed, gamesWon, winRate, currentStreak, maxStreak, guessDistribution } = stats;
  const maxDist = Math.max(...guessDistribution, 1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">Statistics</h2>

        <div className="stats-row">
          <Stat value={gamesPlayed} label="Played" />
          <Stat value={winRate} label="Win %" />
          <Stat value={currentStreak} label="Current Streak" />
          <Stat value={maxStreak} label="Max Streak" />
        </div>

        <h3 className="dist-title">Guess Distribution</h3>
        <div className="dist-chart">
          {guessDistribution.map((count, i) => (
            <div className="dist-row" key={i}>
              <span className="dist-label">{i + 1}</span>
              <div
                className={`dist-bar${count === Math.max(...guessDistribution) && count > 0 ? ' dist-bar--highlight' : ''}`}
                style={{ width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 4)}%` }}
              >
                {count > 0 && count}
              </div>
            </div>
          ))}
        </div>

        <div className="champion-section">
          <h3 className="champion-title">Today's Champion</h3>
          {champion ? (
            <div className="champion-card">
              <svg className="champion-crown" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                <path d="M2 20h20v-2H2v2zm2-4h16l-2-8-4 3-2-6-2 6-4-3-2 8z"/>
              </svg>
              <div className="champion-info">
                <span className="champion-name">{champion.username}</span>
                <span className="champion-guesses">
                  {champion.guess_count} {champion.guess_count === 1 ? 'guess' : 'guesses'}
                </span>
              </div>
            </div>
          ) : (
            <p className="champion-empty">No winner yet today — be the first!</p>
          )}
        </div>

        <div className="striker-section">
          <h3 className="striker-title">Wall of Shame</h3>
          {striker ? (
            <div className="striker-card">
              <svg className="striker-icon" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div className="striker-info">
                <span className="striker-name">{striker.username}</span>
                <span className="striker-label">struck out</span>
              </div>
            </div>
          ) : (
            <p className="striker-empty">No strike outs today — impressive!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
