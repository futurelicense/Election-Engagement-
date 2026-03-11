-- Store bot engagement run history for admin visibility
CREATE TABLE IF NOT EXISTS bot_runs (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT,
  actions JSONB DEFAULT '[]'::jsonb,
  trigger VARCHAR(20) NOT NULL DEFAULT 'cron'  -- 'cron' | 'admin'
);
CREATE INDEX IF NOT EXISTS idx_bot_runs_started ON bot_runs(started_at DESC);
