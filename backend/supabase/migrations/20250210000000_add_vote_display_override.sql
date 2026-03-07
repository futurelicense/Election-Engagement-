-- Optional: set a display vote count for a candidate (used in stats instead of real vote count).
-- Run this in Supabase SQL Editor if you use Supabase migrations elsewhere.
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS vote_display_override integer NULL;

COMMENT ON COLUMN candidates.vote_display_override IS 'When set, election stats show this number as votes for this candidate instead of counting from votes table.';
