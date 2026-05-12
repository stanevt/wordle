import { useState, useEffect } from 'react';
import { fetchTodaysStriker, fetchDailyLeaderboard } from '../../lib/gameSync';
import { todayISO } from '../../utils/dateUtils';
import ViewBoardModal from '../ViewBoardModal/ViewBoardModal';
import './StatsModal.css';

export default function StatsModal({ isOpen, onClose, stats, selectedDate, currentUserStatus, answer }) {
  const [leaders, setLeaders] = useState([]);
  const [striker, setStriker] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);

  const dateToFetch = selectedDate || todayISO();
  const canViewBoards = currentUserStatus === 'won' || currentUserStatus === 'lost';

  useEffect(() => {
    if (!isOpen) return;
    setLeaders([]);
    setStriker(null);

    fetchDailyLeaderboard(dateToFetch)
      .then(setLeaders)
      .catch(console.error);

    fetchTodaysStriker(dateToFetch)
      .then(setStriker)
      .catch(console.error);
  }, [isOpen, dateToFetch]);

  if (!isOpen) return null;

  const { gamesPlayed, gamesWon, winRate, currentStreak, maxStreak, guessDistribution } = stats;
  const maxDist = Math.max(...guessDistribution, 1);

  const champion = leaders[0];
  const runnerUp = leaders[1];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          <h2 className="modal-title">Statistics</h2>

          {selectedDate && selectedDate !== todayISO() && (
            <div className="stats-date-header">
              Results for {selectedDate}
            </div>
          )}

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
            <h3 className="champion-title">Leaderboard</h3>
            <div className="leader-cards">
              {champion ? (
                <div className="champion-card">
                  <div className="champion-rank">
                    <svg className="champion-crown" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                      <path d="M2 20h20v-2H2v2zm2-4h16l-2-8-4 3-2-6-2 6-4-3-2 8z"/>
                    </svg>
                  </div>
                  <div className="champion-info">
                    <span className="champion-name">{champion.username}</span>
                    <span className="champion-guesses">
                      {champion.guessCount} {champion.guessCount === 1 ? 'guess' : 'guesses'}
                    </span>
                  </div>
                  {canViewBoards && (
                    <button
                      className="view-board-btn"
                      onClick={() => setViewingPlayer(champion)}
                      title="View board"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <p className="champion-empty">No winners yet — be the first!</p>
              )}

              {runnerUp && (
                <div className="champion-card runner-up">
                  <div className="champion-rank">
                    <span className="runner-up-label">2nd</span>
                  </div>
                  <div className="champion-info">
                    <span className="champion-name">{runnerUp.username}</span>
                    <span className="champion-guesses">
                      {runnerUp.guessCount} {runnerUp.guessCount === 1 ? 'guess' : 'guesses'}
                    </span>
                  </div>
                  {canViewBoards && (
                    <button
                      className="view-board-btn"
                      onClick={() => setViewingPlayer(runnerUp)}
                      title="View board"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
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
              <p className="striker-empty">No strike outs — impressive!</p>
            )}
          </div>
        </div>
      </div>

      <ViewBoardModal
        isOpen={!!viewingPlayer}
        onClose={() => setViewingPlayer(null)}
        username={viewingPlayer?.username}
        guesses={viewingPlayer?.guesses || []}
        answer={answer}
      />
    </>
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
