import './StatsModal.css';

export default function StatsModal({ isOpen, onClose, stats }) {
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
