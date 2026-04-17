-- Add avatar_url column to users table if it doesn't exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text;

SELECT 'avatar_url column added ✓' AS status;
