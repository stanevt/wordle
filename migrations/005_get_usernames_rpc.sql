-- Migration: Fetch all registered usernames for autocomplete
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.get_usernames()
RETURNS TABLE (username text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT DISTINCT
    COALESCE(gr.username, u.raw_user_meta_data->>'username') AS username
  FROM public.game_results gr
  JOIN auth.users u ON u.id = gr.user_id
  WHERE COALESCE(gr.username, u.raw_user_meta_data->>'username') IS NOT NULL
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_usernames() TO authenticated;
