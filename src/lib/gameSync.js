import { supabase } from './supabase';
import { saveGameState, getAllGameStates, removeGameState } from '../utils/storage';

function normalizeGuesses(guesses) {
  if (Array.isArray(guesses)) return guesses;
  if (typeof guesses === 'string') {
    try {
      const parsed = JSON.parse(guesses);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function displayName(row) {
  return row.username || `User ${row.user_id.slice(0, 5)}`;
}

function normalizeLeader(row) {
  const guesses = normalizeGuesses(row.guesses);
  return {
    username: row.username || (row.user_id ? displayName(row) : 'Unknown'),
    guesses,
    guessCount: row.guess_count ?? guesses.length
  };
}

export async function fetchDailyLeaderboard(date) {
  const { data, error } = await supabase.rpc('get_daily_leaderboard', { today_date: date });
  if (error) throw error;
  return (data || []).map(normalizeLeader);
}

export async function fetchTodaysStriker(date) {
  const { data, error } = await supabase.rpc('get_todays_striker', { today_date: date });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row?.username ? { username: row.username } : null;
}

export async function upsertResult(userId, date, guesses, status, username) {
  await supabase
    .from('game_results')
    .upsert({
      user_id: userId,
      date,
      guesses,
      status,
      username
    }, { onConflict: 'user_id,date' });
}

export async function syncFromRemote(userId) {
  const { data, error } = await supabase
    .from('game_results')
    .select('date, guesses, status')
    .eq('user_id', userId);
  if (error) throw error;

  const remoteDates = new Set(data.map(r => r.date));

  // Remove any local completed game states not present in Supabase
  const localStates = getAllGameStates(userId);
  for (const [date, state] of Object.entries(localStates)) {
    if ((state.status === 'won' || state.status === 'lost') && !remoteDates.has(date)) {
      removeGameState(date, userId);
    }
  }

  // Write remote results to localStorage
  for (const row of data) {
    if (row.status === 'won' || row.status === 'lost') {
      saveGameState(row.date, { guesses: row.guesses, status: row.status }, userId);
    }
  }
}
