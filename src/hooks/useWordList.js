import { useEffect, useState } from 'react';
import { WORD_LIST_URL } from '../utils/constants';
import { loadWordList, saveWordList } from '../utils/storage';

export function useWordList() {
  const [wordSet, setWordSet] = useState(() => {
    const cached = loadWordList();
    if (cached) return new Set(cached.split('\n').filter(Boolean));
    return null;
  });
  const [loading, setLoading] = useState(!wordSet);

  useEffect(() => {
    if (wordSet) return;
    let cancelled = false;

    fetch(WORD_LIST_URL)
      .then(r => r.text())
      .then(text => {
        if (cancelled) return;
        saveWordList(text);
        setWordSet(new Set(text.split('\n').filter(Boolean)));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  function isValidWord(word) {
    if (!wordSet) return true; // allow all when list unavailable
    return wordSet.has(word.toLowerCase());
  }

  return { isValidWord, loading };
}
