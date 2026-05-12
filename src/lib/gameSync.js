import { supabase } from './supabase';
import { saveGameState, getAllGameStates } from '../utils/storage';
import { STATE_STORAGE_PREFIX } from '../utils/constants';

export async function fetchDailyLeaderboard(date) {
  const { data, error } = await supabase
    .from('game_results')
    .select(`
      user_id,
      guesses,
      status,
      created_at,
      profiles:user_id (username)
    `)
    .eq('date', date)
    .eq('status', 'won')
    .order('guess_count', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(2);

  if (error) throw error;

  return data.map(row => ({
    username: row.profiles?.username || 'Unknown',
    guesses: row.guesses,
    guessCount: row.guesses.length
  }));
}

export async function fetchTodaysChampion(date) {
  const { data, error } = await supabase.rpc('get_todays_champion', { today_date: date });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function fetchTodaysStriker(date) {
  const { data, error } = await supabase.rpc('get_todays_striker', { today_date: date });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function upsertResult(userId, date, guesses, status) {
  await supabase
    .from('game_results')
    .upsert({ user_id: userId, date, guesses, status }, { onConflict: 'user_id,date' });
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
