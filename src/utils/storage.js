import { ANSWER_STORAGE_PREFIX, STATE_STORAGE_PREFIX, WORD_LIST_STORAGE_KEY } from './constants';

function stateScope(scopeId) {
  return scopeId || 'anon';
}

function stateStorageKey(dateStr, scopeId) {
  return `${STATE_STORAGE_PREFIX}${stateScope(scopeId)}-${dateStr}`;
}

export function loadGameState(dateStr, scopeId) {
  try {
    const raw = localStorage.getItem(stateStorageKey(dateStr, scopeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGameState(dateStr, state, scopeId) {
  try {
    localStorage.setItem(stateStorageKey(dateStr, scopeId), JSON.stringify(state));
  } catch {}
}

export function removeGameState(dateStr, scopeId) {
  localStorage.removeItem(stateStorageKey(dateStr, scopeId));
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

export function getAllGameStates(scopeId) {
  const result = {};
  const prefix = `${STATE_STORAGE_PREFIX}${stateScope(scopeId)}-`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const dateStr = key.slice(prefix.length);
      try {
        result[dateStr] = JSON.parse(localStorage.getItem(key));
      } catch {}
    }
  }
  return result;
}
