import { useMemo } from 'react';
import { getAllGameStates } from '../utils/storage';
import { todayISO, previousDay } from '../utils/dateUtils';
import { WORDLE_START_DATE } from '../utils/constants';

export function useStats(refreshKey, userId) {
  return useMemo(() => {
    const allStates = getAllGameStates(userId);
    const dates = Object.keys(allStates).sort();

    let gamesPlayed = 0;
    let gamesWon = 0;
    const guessDistribution = [0, 0, 0, 0, 0, 0]; // index = guesses-1

    for (const date of dates) {
      if (date < WORDLE_START_DATE) continue;
      const s = allStates[date];
      if (s.status === 'playing') continue;
      gamesPlayed++;
      if (s.status === 'won') {
        gamesWon++;
        const count = s.guesses.length;
        if (count >= 1 && count <= 6) guessDistribution[count - 1]++;
      }
    }

    const winRate = gamesPlayed ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

    // Current streak: walk backwards from today
    let currentStreak = 0;
    let cursor = todayISO();
    while (cursor >= WORDLE_START_DATE) {
      const s = allStates[cursor];
      if (s && s.status === 'won') {
        currentStreak++;
        cursor = previousDay(cursor);
      } else if (s && s.status === 'lost') {
        break;
      } else if (!s && cursor < todayISO()) {
        break;
      } else {
        cursor = previousDay(cursor);
      }
    }

    // Max streak: forward pass
    let maxStreak = 0;
    let streak = 0;
    let prevDate = null;
    for (const date of dates) {
      if (date < WORDLE_START_DATE) continue;
      const s = allStates[date];
      if (s.status === 'playing') continue;
      if (s.status === 'won') {
        if (prevDate && previousDay(date) === prevDate) {
          streak++;
        } else {
          streak = 1;
        }
        maxStreak = Math.max(maxStreak, streak);
        prevDate = date;
      } else {
        streak = 0;
        prevDate = date;
      }
    }

    return { gamesPlayed, gamesWon, winRate, currentStreak, maxStreak, guessDistribution };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, userId]);
}
