-- Migration: Score comparison RPC
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.get_score_comparison(
  p_username1 text,
  p_username2 text,
  p_start_date text,
  p_end_date text
)
RETURNS TABLE (
  date text,
  user1_guess_count integer,
  user2_guess_count integer,
  user1_status text,
  user2_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  WITH
  u1 AS (
    SELECT
      gr.date,
      COALESCE(gr.guess_count, jsonb_array_length(gr.guesses))::integer AS guess_count,
      gr.status
    FROM public.game_results gr
    JOIN auth.users u ON u.id = gr.user_id
    WHERE (gr.username = p_username1 OR u.raw_user_meta_data->>'username' = p_username1)
      AND gr.date >= p_start_date
      AND gr.date <= p_end_date
      AND gr.status IN ('won', 'lost')
  ),
  u2 AS (
    SELECT
      gr.date,
      COALESCE(gr.guess_count, jsonb_array_length(gr.guesses))::integer AS guess_count,
      gr.status
    FROM public.game_results gr
    JOIN auth.users u ON u.id = gr.user_id
    WHERE (gr.username = p_username2 OR u.raw_user_meta_data->>'username' = p_username2)
      AND gr.date >= p_start_date
      AND gr.date <= p_end_date
      AND gr.status IN ('won', 'lost')
  )
  SELECT
    COALESCE(u1.date, u2.date) AS date,
    u1.guess_count                AS user1_guess_count,
    u2.guess_count                AS user2_guess_count,
    u1.status                     AS user1_status,
    u2.status                     AS user2_status
  FROM u1
  FULL OUTER JOIN u2 ON u1.date = u2.date
  ORDER BY COALESCE(u1.date, u2.date) ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_score_comparison(text, text, text, text) TO authenticated;
