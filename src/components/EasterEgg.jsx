import { useState, useEffect, useRef } from 'react';
import './EasterEgg.css';

export default function EasterEgg({ message }) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    clearTimeout(timerRef.current);
    setDisplayed(message);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timerRef.current);
  }, [message]);

  if (!displayed) return null;

  return (
    <div className={`egg-overlay${visible ? ' egg-overlay--in' : ' egg-overlay--out'}`}>
      <span className="egg-text">{displayed}</span>
    </div>
  );
}
