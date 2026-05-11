export const WORDLE_START_DATE = '2021-06-19';
export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;
export const NYT_API_BASE = '/api/wordle-answer';
export const WORD_LIST_URL = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words';
export const WORD_LIST_STORAGE_KEY = 'wordle-word-list';
export const ANSWER_STORAGE_PREFIX = 'wordle-answer-v2-';
export const STATE_STORAGE_PREFIX = 'wordle-state-';

export const FALLBACK_WORDS = [
  'crane', 'slate', 'trace', 'crate', 'least',
  'stare', 'snare', 'share', 'shale', 'store',
  'score', 'spare', 'grace', 'place', 'plane',
  'flame', 'blame', 'brave', 'grave', 'glare',
];

export const REVEAL_DURATION_MS = WORD_LENGTH * 300 + 600; // 2100ms
