-- Set vote display overrides for candidates (run in Supabase SQL Editor).
-- Ensure the column exists first (see migrations/20250210000000_add_vote_display_override.sql).

UPDATE candidates SET vote_display_override = 1039  WHERE id = 'c3';
UPDATE candidates SET vote_display_override = 1322  WHERE id = 'c2';
UPDATE candidates SET vote_display_override = 2309  WHERE id = 'c1';
UPDATE candidates SET vote_display_override = 282   WHERE id = 'c_tXUYUMIxf1wc';
UPDATE candidates SET vote_display_override = 69    WHERE id = 'c_9uV9p1sz2ujJ';
UPDATE candidates SET vote_display_override = 147   WHERE id = 'c1768678359550_u55ge7k7v';
