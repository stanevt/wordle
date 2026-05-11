import { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ onStatsClick, onCalendarClick, onAuthClick, username, prevAnswer, selectedDate }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setRevealed(false); }, [prevAnswer]);

  return (
    <header className="header">
      <div className="header-left">
        {/* Desktop: yesterday's word */}
        {prevAnswer && (
          <div className="prev-day desktop-only">
            <span className="prev-label">Yesterday:</span>
            <button
              className={`prev-word${revealed ? ' prev-word--revealed' : ''}`}
              onClick={() => setRevealed(r => !r)}
              title={revealed ? 'Click to hide' : 'Click to reveal'}
            >
              {revealed ? prevAnswer : '?????'}
            </button>
          </div>
        )}
        {/* Mobile: calendar toggle */}
        <button className="icon-btn mobile-only" onClick={onCalendarClick} aria-label="Open calendar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
          <span className="cal-date-badge">{selectedDate?.slice(5)}</span>
        </button>
      </div>

      <h1 className="header-title">Todd's Wordle</h1>

      <div className="header-right">
        <button className="icon-btn" onClick={onStatsClick} aria-label="Statistics">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M3 3v18h18v-2H5V3H3zm4 12h2v3H7v-3zm4-5h2v8h-2v-8zm4-4h2v12h-2V6z"/>
          </svg>
        </button>
        <button className="icon-btn auth-btn" onClick={onAuthClick} aria-label={username ? `Signed in as ${username}` : 'Sign in'} title={username ? username : 'Sign in'}>
          {username ? (
            <span className="auth-avatar">{username[0].toUpperCase()}</span>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
