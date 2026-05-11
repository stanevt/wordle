import { useState, useEffect } from 'react';

export function useTheme() {
  const [light, setLight] = useState(() => localStorage.getItem('wordle-theme') === 'light');

  useEffect(() => {
    if (light) {
      document.documentElement.classList.add('light');
      localStorage.setItem('wordle-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('wordle-theme', 'dark');
    }
  }, [light]);

  return { light, toggleTheme: () => setLight(v => !v) };
}
