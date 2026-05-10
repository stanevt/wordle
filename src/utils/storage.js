import { ANSWER_STORAGE_PREFIX, STATE_STORAGE_PREFIX, WORD_LIST_STORAGE_KEY } from './constants';

export function loadGameState(dateStr) {
  try {
    const raw = localStorage.getItem(STATE_STORAGE_PREFIX + dateStr);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGameState(dateStr, state) {
  try {
    localStorage.setItem(STATE_STORAGE_PREFIX + dateStr, JSON.stringify(state));
  } catch {}
}

export function loadCachedAnswer(dateStr) {
  return localStorage.getItem(ANSWER_STORAGE_PREFIX + dateStr) || null;
}

export function saveCachedAnswer(dateStr, word) {
  try {
    localStorage.setItem(ANSWER_STORAGE_PREFIX + dateStr, word);
  } catch {}
}

export function loadWordList() {
  return localStorage.getItem(WORD_LIST_STORAGE_KEY) || null;
}

export function saveWordList(rawText) {
  try {
    localStorage.setItem(WORD_LIST_STORAGE_KEY, rawText);
  } catch {}
}

export function getAllGameStates() {
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STATE_STORAGE_PREFIX)) {
      const dateStr = key.slice(STATE_STORAGE_PREFIX.length);
      try {
        result[dateStr] = JSON.parse(localStorage.getItem(key));
      } catch {}
    }
  }
  return result;
}
