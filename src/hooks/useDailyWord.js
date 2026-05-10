import { useEffect, useState } from 'react';
import { NYT_API_BASE, FALLBACK_WORDS, WORDLE_START_DATE } from '../utils/constants';
import { loadCachedAnswer, saveCachedAnswer } from '../utils/storage';
import { daysBetween } from '../utils/dateUtils';

export function useDailyWord(dateStr) {
  const [answer, setAnswer] = useState(() => loadCachedAnswer(dateStr));
  const [loading, setLoading] = useState(!loadCachedAnswer(dateStr));

  useEffect(() => {
    const cached = loadCachedAnswer(dateStr);
    if (cached) {
      setAnswer(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(`${NYT_API_BASE}/${dateStr}.json`, { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        clearTimeout(timeout);
        if (cancelled) return;
        const word = json.solution.toUpperCase();
        saveCachedAnswer(dateStr, word);
        setAnswer(word);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        if (cancelled) return;
        // Fall back to deterministic word from hardcoded list
        const idx = Math.abs(daysBetween(WORDLE_START_DATE, dateStr)) % FALLBACK_WORDS.length;
        setAnswer(FALLBACK_WORDS[idx].toUpperCase());
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [dateStr]);

  return { answer, loading };
}
