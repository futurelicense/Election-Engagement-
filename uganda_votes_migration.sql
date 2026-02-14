-- ============================================
-- Uganda Election Votes Migration Script
-- ============================================
-- This script updates candidate names and inserts vote counts for Uganda election
-- Election ID: e7
-- Candidates:
--   c7: Robert Kyagulanyi (Bobi Wine) - 7814 votes
--   c8: Yoweri Museveni - 6392 votes
--   c9: Mugisha Muntu - 3246 votes
-- ============================================

-- Step 1: Ensure candidates exist and update their names
-- First, ensure all Uganda election candidates exist
INSERT INTO candidates (id, election_id, name, party, image, bio, color) VALUES
('c7', 'e7', 'Robert Kyagulanyi', 'National Unity Platform', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Musician turned politician, youth advocate', '#EF4444'),
('c8', 'e7', 'Yoweri Museveni', 'National Resistance Movement', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', 'Incumbent leader, 35 years in politics', '#F59E0B'),
('c9', 'e7', 'Mugisha Muntu', 'Forum for Democratic Change', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Opposition leader, reform advocate', '#3B82F6')
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    party = EXCLUDED.party,
    image = EXCLUDED.image,
    bio = EXCLUDED.bio,
    color = EXCLUDED.color;

-- Step 2: Verify candidates exist before proceeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = 'c7' AND election_id = 'e7') THEN
        RAISE EXCEPTION 'Candidate c7 (Robert Kyagulanyi) does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = 'c8' AND election_id = 'e7') THEN
        RAISE EXCEPTION 'Candidate c8 (Yoweri Museveni) does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = 'c9' AND election_id = 'e7') THEN
        RAISE EXCEPTION 'Candidate c9 (Mugisha Muntu) does not exist';
    END IF;
END $$;

-- Step 3: Delete existing votes for Uganda election (e7) to start fresh
DELETE FROM votes WHERE election_id = 'e7';

-- Step 4: Create a temporary function to generate unique user IDs for votes
-- We'll create dummy users for the votes
-- First, let's create users in batches

-- Create users for Bobi Wine votes (7814 votes)
DO $$
DECLARE
    i INTEGER;
    user_id VARCHAR(50);
    vote_id VARCHAR(50);
BEGIN
    FOR i IN 1..7814 LOOP
        user_id := 'uganda_vote_user_' || LPAD(i::TEXT, 6, '0') || '_bobi';
        
        -- Insert user if not exists
        INSERT INTO users (id, name, email, phone, pin_hash, is_admin)
        VALUES (
            user_id,
            'Voter ' || i,
            'voter_bobi_' || i || '@uganda.election',
            '+256' || LPAD((700000000 + i)::TEXT, 9, '0'),
            '$2b$10$hashed_pin',
            FALSE
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert vote
        vote_id := 'vote_uganda_bobi_' || LPAD(i::TEXT, 6, '0');
        INSERT INTO votes (id, user_id, election_id, candidate_id, timestamp)
        VALUES (
            vote_id,
            user_id,
            'e7',
            'c7',
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Create users for Yoweri Museveni votes (6392 votes)
DO $$
DECLARE
    i INTEGER;
    user_id VARCHAR(50);
    vote_id VARCHAR(50);
BEGIN
    FOR i IN 1..6392 LOOP
        user_id := 'uganda_vote_user_' || LPAD((7814 + i)::TEXT, 6, '0') || '_museveni';
        
        -- Insert user if not exists
        INSERT INTO users (id, name, email, phone, pin_hash, is_admin)
        VALUES (
            user_id,
            'Voter ' || (7814 + i),
            'voter_museveni_' || i || '@uganda.election',
            '+256' || LPAD((700000000 + 7814 + i)::TEXT, 9, '0'),
            '$2b$10$hashed_pin',
            FALSE
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert vote
        vote_id := 'vote_uganda_museveni_' || LPAD(i::TEXT, 6, '0');
        INSERT INTO votes (id, user_id, election_id, candidate_id, timestamp)
        VALUES (
            vote_id,
            user_id,
            'e7',
            'c8',
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Create users for Mugisha Muntu votes (3246 votes)
DO $$
DECLARE
    i INTEGER;
    user_id VARCHAR(50);
    vote_id VARCHAR(50);
BEGIN
    FOR i IN 1..3246 LOOP
        user_id := 'uganda_vote_user_' || LPAD((7814 + 6392 + i)::TEXT, 6, '0') || '_muntu';
        
        -- Insert user if not exists
        INSERT INTO users (id, name, email, phone, pin_hash, is_admin)
        VALUES (
            user_id,
            'Voter ' || (7814 + 6392 + i),
            'voter_muntu_' || i || '@uganda.election',
            '+256' || LPAD((700000000 + 7814 + 6392 + i)::TEXT, 9, '0'),
            '$2b$10$hashed_pin',
            FALSE
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert vote
        vote_id := 'vote_uganda_muntu_' || LPAD(i::TEXT, 6, '0');
        INSERT INTO votes (id, user_id, election_id, candidate_id, timestamp)
        VALUES (
            vote_id,
            user_id,
            'e7',
            'c9',
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Step 5: Verify the vote counts
SELECT 
    c.name AS candidate_name,
    c.party,
    COUNT(v.id) AS vote_count
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
WHERE c.election_id = 'e7'
GROUP BY c.id, c.name, c.party
ORDER BY vote_count DESC;

