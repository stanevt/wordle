-- Migration: Enrich game_results table for statistics feature
-- Run this in the Supabase SQL Editor

-- 1. Add username column (denormalized from auth.users metadata)
ALTER TABLE game_results ADD COLUMN IF NOT EXISTS username text;

-- 2. Add generated column for guess count (used for leaderboard sorting)
ALTER TABLE game_results ADD COLUMN IF NOT EXISTS guess_count
  integer GENERATED ALWAYS AS (array_length(guesses, 1)) STORED;

-- 3. Unique constraint: one result per user per date
ALTER TABLE game_results
  ADD CONSTRAINT game_results_user_date_unique UNIQUE (user_id, date);

-- 4. Backfill NULL usernames from auth.users metadata
UPDATE game_results gr
SET username = u.raw_user_meta_data->>'username'
FROM auth.users u
WHERE gr.user_id = u.id
  AND gr.username IS NULL;
