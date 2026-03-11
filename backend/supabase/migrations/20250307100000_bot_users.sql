-- Add is_bot flag to users (for engagement bots)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_is_bot ON users(is_bot) WHERE is_bot = TRUE;
