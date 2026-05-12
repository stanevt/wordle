import { supabase } from './supabase';
import { saveGameState, getAllGameStates } from '../utils/storage';
import { STATE_STORAGE_PREFIX } from '../utils/constants';

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
    guessCount: row.guess_count ?? guesses.length,
    createdAt: row.created_at
  };
}

export async function fetchDailyLeaderboard(date) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_daily_leaderboard', { today_date: date });
  if (!rpcError && Array.isArray(rpcData)) {
    return rpcData.map(normalizeLeader);
  }

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
    .eq('status', 'won');

  if (error) throw error;

  return data
    .map(normalizeLeader)
    .sort((a, b) => {
      if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
      return new Date(a.createdAt) - new Date(b.createdAt);
    })
    .slice(0, 2);
}

export async function fetchTodaysStriker(date) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_todays_striker', { today_date: date });
  const rpcRow = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!rpcError && rpcRow?.username) return { username: rpcRow.username };

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
    username: displayName(data[0])
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
