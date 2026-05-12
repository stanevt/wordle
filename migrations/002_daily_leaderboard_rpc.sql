-- Migration: Public daily leaderboard RPC
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.get_daily_leaderboard(today_date text)
RETURNS TABLE (
  username text,
  guesses jsonb,
  guess_count integer,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    COALESCE(
      gr.username,
      u.raw_user_meta_data->>'username',
      'User ' || LEFT(gr.user_id::text, 5)
    ) AS username,
    gr.guesses,
    COALESCE(gr.guess_count, jsonb_array_length(gr.guesses))::integer AS guess_count,
    gr.created_at
  FROM public.game_results gr
  LEFT JOIN auth.users u ON u.id = gr.user_id
  WHERE gr.date = today_date
    AND gr.status = 'won'
  ORDER BY COALESCE(gr.guess_count, jsonb_array_length(gr.guesses)) ASC, gr.created_at ASC
  LIMIT 2;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_leaderboard(text) TO anon, authenticated;
