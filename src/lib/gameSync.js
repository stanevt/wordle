import { supabase } from './supabase';
import { saveGameState, getAllGameStates } from '../utils/storage';

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

  // Write completed remote results to localStorage
  for (const row of data) {
    if (row.status === 'won' || row.status === 'lost') {
      saveGameState(row.date, { guesses: row.guesses, status: row.status });
    }
  }

  // Upload local completed games missing from remote
  const remoteDates = new Set(data.map(r => r.date));
  const localStates = getAllGameStates();
  const toUpload = [];
  for (const [date, state] of Object.entries(localStates)) {
    if ((state.status === 'won' || state.status === 'lost') && !remoteDates.has(date)) {
      toUpload.push({ user_id: userId, date, guesses: state.guesses, status: state.status });
    }
  }
  if (toUpload.length > 0) {
    await supabase.from('game_results').upsert(toUpload, { onConflict: 'user_id,date' });
  }
}
