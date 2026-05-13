-- Migration: add an explicit completion day for accurate streak tracking
-- Run this in the Supabase SQL Editor

ALTER TABLE game_results
  ADD COLUMN IF NOT EXISTS completed_on text;

-- Historical rows intentionally remain NULL.
-- The app did not previously record exact completion day, so backfilling would be guesswork.
