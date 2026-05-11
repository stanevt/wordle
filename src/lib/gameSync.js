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

  // Supabase is the source of truth — overwrite local with remote data
  for (const row of data) {
    if (row.status === 'won' || row.status === 'lost') {
      saveGameState(row.date, { guesses: row.guesses, status: row.status });
    }
  }
}
