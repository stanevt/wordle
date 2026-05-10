import { useEffect, useRef } from 'react';
import './Toast.css';

export default function Toast({ message }) {
  const prevMsg = useRef(message);
  const key = useRef(0);
  if (message && message !== prevMsg.current) key.current++;
  prevMsg.current = message;

  return (
    <div className={`toast-container${message ? ' toast-container--visible' : ''}`}>
      {message && (
        <div className="toast" key={key.current}>
          {message}
        </div>
      )}
    </div>
  );
}
