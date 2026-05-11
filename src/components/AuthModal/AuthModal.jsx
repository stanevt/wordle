import { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function reset() {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
  }

  function switchMode(m) {
    setMode(m);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await onSignIn(username.trim(), password);
      } else {
        await onSignUp(username.trim(), password);
      }
      reset();
      onClose();
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="modal-title">{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              className="auth-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className="auth-input"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading || !username || !password}>
            {loading ? '...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button className="auth-link" onClick={() => switchMode('signup')}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="auth-link" onClick={() => switchMode('login')}>Log in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong.';
  if (msg.includes('Invalid login credentials')) return 'Incorrect username or password.';
  if (msg.includes('User already registered')) return 'Username already taken.';
  if (msg.includes('Password should be')) return 'Password must be at least 6 characters.';
  return msg;
}
