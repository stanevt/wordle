import { supabase } from './supabase';
import { saveGameState, getAllGameStates } from '../utils/storage';
import { STATE_STORAGE_PREFIX } from '../utils/constants';

export async function fetchDailyLeaderboard(date) {
  const { data, error } = await supabase
    .from('game_results')
    .select(`
      user_id,
      username,
      guesses,
      status,
      created_at
    `)
    .eq('date', date)
    .eq('status', 'won')
    .order('guess_count', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(2);

  if (error) throw error;

  return data.map(row => ({
    username: row.username || `User ${row.user_id.slice(0, 5)}`,
    guesses: row.guesses,
    guessCount: row.guesses.length
  }));
}

export async function fetchTodaysStriker(date) {
  const { data, error } = await supabase
    .from('game_results')
    .select('user_id, username')
    .eq('date', date)
    .eq('status', 'lost')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data?.[0]) return null;
  return {
    username: data[0].username || `User ${data[0].user_id.slice(0, 5)}`
  };
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
  const localStates = getAllGameStates();
  for (const [date, state] of Object.entries(localStates)) {
    if ((state.status === 'won' || state.status === 'lost') && !remoteDates.has(date)) {
      localStorage.removeItem(STATE_STORAGE_PREFIX + date);
    }
  }

  // Write remote results to localStorage
  for (const row of data) {
    if (row.status === 'won' || row.status === 'lost') {
      saveGameState(row.date, { guesses: row.guesses, status: row.status });
    }
  }
}
