-- Guest votes: store votes from users who haven't signed up yet.
-- When they sign up, votes are "claimed" (moved to votes table).
CREATE TABLE IF NOT EXISTS guest_votes (
  id VARCHAR(50) PRIMARY KEY,
  guest_id VARCHAR(64) NOT NULL,
  election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id VARCHAR(50) NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, election_id)
);
CREATE INDEX IF NOT EXISTS idx_guest_votes_guest ON guest_votes(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_votes_election ON guest_votes(election_id);
CREATE INDEX IF NOT EXISTS idx_guest_votes_candidate ON guest_votes(candidate_id);
