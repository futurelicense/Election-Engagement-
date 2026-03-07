-- ============================================
-- Election Engagement Platform - PostgreSQL (Supabase)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Users (auth is custom JWT; store users in this table)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  pin_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  is_sub_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  code VARCHAR(2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- Elections (create enums only if not exist)
DO $$ BEGIN
  CREATE TYPE election_type AS ENUM ('Presidential', 'Parliamentary', 'Local Government');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE election_status AS ENUM ('upcoming', 'ongoing', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS elections (
  id VARCHAR(50) PRIMARY KEY,
  country_id VARCHAR(50) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  type election_type NOT NULL,
  date DATE NOT NULL,
  status election_status DEFAULT 'upcoming',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_elections_country ON elections(country_id);
CREATE INDEX IF NOT EXISTS idx_elections_date ON elections(date);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id VARCHAR(50) PRIMARY KEY,
  election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(255) NOT NULL,
  image TEXT,
  bio TEXT,
  color VARCHAR(7) NOT NULL,
  vote_display_override INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);

-- Votes (one per user per election)
CREATE TABLE IF NOT EXISTS votes (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id VARCHAR(50) NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, election_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON votes(timestamp);

-- News
DO $$ BEGIN
  CREATE TYPE news_priority AS ENUM ('breaking', 'important', 'general');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(50) PRIMARY KEY,
  country_id VARCHAR(50) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  election_id VARCHAR(50) REFERENCES elections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  priority news_priority DEFAULT 'general',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_country ON news(country_id);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority);
CREATE INDEX IF NOT EXISTS idx_news_timestamp ON news(timestamp);

-- News tags and hashtags
CREATE TABLE IF NOT EXISTS news_tags (
  id SERIAL PRIMARY KEY,
  news_id VARCHAR(50) NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_news_tags_news ON news_tags(news_id);

CREATE TABLE IF NOT EXISTS news_hashtags (
  id SERIAL PRIMARY KEY,
  news_id VARCHAR(50) NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  hashtag VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_news_hashtags_news ON news_hashtags(news_id);

-- Comments (likes column used for denormalized count)
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(50) PRIMARY KEY,
  election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id VARCHAR(50) REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_comments_election ON comments(election_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp);

CREATE TABLE IF NOT EXISTS comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id VARCHAR(50) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);

CREATE TABLE IF NOT EXISTS comment_reactions (
  id SERIAL PRIMARY KEY,
  comment_id VARCHAR(50) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);

-- Chat
DO $$ BEGIN
  CREATE TYPE chat_room_type AS ENUM ('country', 'election', 'candidate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS chat_rooms (
  id VARCHAR(100) PRIMARY KEY,
  type chat_room_type NOT NULL,
  entity_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active_users INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_entity ON chat_rooms(entity_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(50) PRIMARY KEY,
  room_id VARCHAR(100) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

CREATE TABLE IF NOT EXISTS chat_moderators (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(100) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: enable RLS and policies if you use Supabase Auth alongside this app.
-- This schema is designed for backend-only access with SUPABASE_SERVICE_KEY.
