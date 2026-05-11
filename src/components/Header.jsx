import { useState, useEffect, useRef } from 'react';
import './Header.css';

export default function Header({ onStatsClick, onCalendarClick, onAuthClick, onSignOut, onToggleTheme, lightMode, username, prevAnswer, selectedDate }) {
  const [revealed, setRevealed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setRevealed(false); }, [prevAnswer]);

  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

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

      <h1 className="header-title">Todd's <br/>Wordle</h1>

      <div className="header-right">
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {lightMode ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="5" y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/>
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
              <line x1="19.07" y1="4.93" x2="16.95" y2="7.05"/>
              <line x1="7.05" y1="16.95" x2="4.93" y2="19.07"/>
            </svg>
          )}
        </button>
        <button className="icon-btn" onClick={onStatsClick} aria-label="Statistics">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M3 3v18h18v-2H5V3H3zm4 12h2v3H7v-3zm4-5h2v8h-2v-8zm4-4h2v12h-2V6z"/>
          </svg>
        </button>
        <div className="auth-btn-wrap" ref={dropdownRef}>
          <button
            className="icon-btn auth-btn"
            onClick={() => username ? setShowDropdown(v => !v) : onAuthClick()}
            aria-label={username ? `Signed in as ${username}` : 'Sign in'}
            title={username ? username : 'Sign in'}
          >
            {username ? (
              <span className="auth-avatar">{username[0].toUpperCase()}</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </button>
          {showDropdown && (
            <div className="auth-dropdown">
              <span className="auth-dropdown-user">{username}</span>
              <button className="auth-dropdown-item auth-dropdown-item--danger" onClick={() => { setShowDropdown(false); onSignOut(); }}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
