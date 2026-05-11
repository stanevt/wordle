import { useCallback, useEffect, useReducer, useRef } from 'react';
import { MAX_GUESSES, WORD_LENGTH, REVEAL_DURATION_MS } from '../utils/constants';
import { evaluateGuess } from '../utils/tileEvaluation';
import { loadGameState, saveGameState } from '../utils/storage';
import { upsertResult } from '../lib/gameSync';

function initState(dateStr, answer) {
  const saved = loadGameState(dateStr);
  if (saved && answer) {
    const evaluations = saved.guesses.map(g => evaluateGuess(g, answer));
    return {
      guesses: saved.guesses,
      evaluations,
      status: saved.status,
      currentInput: '',
      revealingRow: null,
      shakingRow: null,
      toastMessage: null,
    };
  }
  return {
    guesses: [],
    evaluations: [],
    status: 'playing',
    currentInput: '',
    revealingRow: null,
    shakingRow: null,
    toastMessage: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return initState(action.dateStr, action.answer);
    case 'ADD_LETTER':
      if (state.status !== 'playing' || state.revealingRow !== null) return state;
      if (state.currentInput.length >= WORD_LENGTH) return state;
      return { ...state, currentInput: state.currentInput + action.letter };
    case 'DELETE_LETTER':
      if (state.status !== 'playing' || state.revealingRow !== null) return state;
      return { ...state, currentInput: state.currentInput.slice(0, -1) };
    case 'SET_TOAST':
      return { ...state, toastMessage: action.message };
    case 'SET_SHAKING':
      return { ...state, shakingRow: action.row };
    case 'CLEAR_SHAKING':
      return { ...state, shakingRow: null };
    case 'COMMIT_GUESS': {
      const newGuesses = [...state.guesses, action.guess];
      const newEvals = [...state.evaluations, action.evaluation];
      return {
        ...state,
        guesses: newGuesses,
        evaluations: newEvals,
        currentInput: '',
        revealingRow: newGuesses.length - 1,
      };
    }
    case 'FINISH_REVEAL': {
      return {
        ...state,
        revealingRow: null,
        status: action.status,
        toastMessage: action.toastMessage,
      };
    }
    default:
      return state;
  }
}

export function useGame({ answer, dateStr, isValidWord, userId }) {
  const [state, dispatch] = useReducer(reducer, null, () =>
    initState(dateStr, answer)
  );

  const prevDateStr = useRef(dateStr);
  const prevAnswer = useRef(answer);

  // Reset when date or answer changes
  useEffect(() => {
    if (dateStr !== prevDateStr.current || (answer && answer !== prevAnswer.current && prevAnswer.current === null)) {
      prevDateStr.current = dateStr;
      prevAnswer.current = answer;
      dispatch({ type: 'RESET', dateStr, answer });
    } else if (answer && !prevAnswer.current) {
      prevAnswer.current = answer;
      dispatch({ type: 'RESET', dateStr, answer });
    }
  }, [dateStr, answer]);

  const revealTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const submitGuess = useCallback(() => {
    if (state.status !== 'playing' || state.revealingRow !== null) return;
    const input = state.currentInput;

    if (input.length < WORD_LENGTH) {
      dispatch({ type: 'SET_TOAST', message: 'Not enough letters' });
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 1200);
      return;
    }

    if (!isValidWord(input)) {
      dispatch({ type: 'SET_TOAST', message: 'Not in word list' });
      dispatch({ type: 'SET_SHAKING', row: state.guesses.length });
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 1200);
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_SHAKING' }), 600);
      return;
    }

    if (!answer) return;

    const evaluation = evaluateGuess(input, answer);
    dispatch({ type: 'COMMIT_GUESS', guess: input, evaluation });

    const newGuesses = [...state.guesses, input];
    const won = input === answer;
    const lost = !won && newGuesses.length >= MAX_GUESSES;

    // Persist immediately
    const newStatus = won ? 'won' : lost ? 'lost' : 'playing';
    saveGameState(dateStr, { guesses: newGuesses, status: newStatus });
    if (userId) upsertResult(userId, dateStr, newGuesses, newStatus).catch(() => {});

    clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => {
      let toastMsg = null;
      if (won) {
        const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
        toastMsg = msgs[Math.min(newGuesses.length - 1, msgs.length - 1)];
      } else if (lost) {
        toastMsg = answer;
      }
      dispatch({ type: 'FINISH_REVEAL', status: newStatus, toastMessage: toastMsg });
      if (toastMsg) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(
          () => dispatch({ type: 'SET_TOAST', message: null }),
          won ? 4000 : 6000
        );
      }
    }, REVEAL_DURATION_MS);
  }, [state.status, state.revealingRow, state.currentInput, state.guesses, answer, dateStr, isValidWord]);

  const handleKey = useCallback((key) => {
    if (key === 'Enter') {
      submitGuess();
    } else if (key === 'Backspace' || key === 'Delete') {
      dispatch({ type: 'DELETE_LETTER' });
    } else if (/^[A-Za-z]$/.test(key)) {
      dispatch({ type: 'ADD_LETTER', letter: key.toUpperCase() });
    }
  }, [submitGuess]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      handleKey(e.key);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  // Compute letter statuses for keyboard coloring
  const letterStatuses = {};
  const priority = { correct: 3, present: 2, absent: 1 };
  state.guesses.forEach((guess, gi) => {
    state.evaluations[gi]?.forEach((ev, li) => {
      const letter = guess[li];
      if ((priority[ev] || 0) > (priority[letterStatuses[letter]] || 0)) {
        letterStatuses[letter] = ev;
      }
    });
  });

  return { ...state, handleKey, letterStatuses };
}
