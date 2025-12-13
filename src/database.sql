-- ============================================
-- AFRICAN ELECTIONS PLATFORM - DATABASE SCHEMA
-- Complete SQL dump with all mock data
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS african_elections;
USE african_elections;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    pin_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Insert Users
INSERT INTO users (id, name, email, phone, pin_hash, is_admin) VALUES
('user_admin', 'Admin User', 'admin@election.com', '+1234567890', '$2b$10$hashed_1234', TRUE),
('user_demo', 'Demo User', 'user@example.com', '+1987654321', '$2b$10$hashed_5678', FALSE),
('user_1', 'Amaka Johnson', 'amaka.johnson@email.com', '+2348012345678', '$2b$10$hashed_pin', FALSE),
('user_2', 'Kwame Mensah', 'kwame.mensah@email.com', '+233201234567', '$2b$10$hashed_pin', FALSE),
('user_3', 'Fatima Adeyemi', 'fatima.adeyemi@email.com', '+2348087654321', '$2b$10$hashed_pin', FALSE),
('user_4', 'Chidi Okafor', 'chidi.okafor@email.com', '+2347012345678', '$2b$10$hashed_pin', FALSE);

-- ============================================
-- TABLE: countries
-- ============================================
CREATE TABLE countries (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    flag VARCHAR(10) NOT NULL,
    code VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- Insert Countries
INSERT INTO countries (id, name, flag, code) VALUES
('1', 'Nigeria', '🇳🇬', 'NG'),
('2', 'Kenya', '🇰🇪', 'KE'),
('3', 'South Africa', '🇿🇦', 'ZA'),
('4', 'Ghana', '🇬🇭', 'GH'),
('5', 'Ethiopia', '🇪🇹', 'ET'),
('6', 'Tanzania', '🇹🇿', 'TZ'),
('7', 'Uganda', '🇺🇬', 'UG'),
('8', 'Senegal', '🇸🇳', 'SN');

-- ============================================
-- TABLE: elections
-- ============================================
CREATE TABLE elections (
    id VARCHAR(50) PRIMARY KEY,
    country_id VARCHAR(50) NOT NULL,
    type ENUM('Presidential', 'Parliamentary', 'Local Government') NOT NULL,
    date DATE NOT NULL,
    status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    INDEX idx_country (country_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Insert Elections
INSERT INTO elections (id, country_id, type, date, status, description) VALUES
('e1', '1', 'Presidential', '2025-02-15', 'upcoming', 'Nigerian Presidential Election 2025'),
('e2', '2', 'Parliamentary', '2025-03-20', 'upcoming', 'Kenyan Parliamentary Elections 2025'),
('e3', '3', 'Presidential', '2025-05-10', 'upcoming', 'South African Presidential Election 2025'),
('e4', '4', 'Presidential', '2025-04-05', 'upcoming', 'Ghana Presidential Election 2025'),
('e7', '7', 'Presidential', '2025-01-28', 'upcoming', 'Uganda Presidential Election 2025');

-- ============================================
-- TABLE: candidates
-- ============================================
CREATE TABLE candidates (
    id VARCHAR(50) PRIMARY KEY,
    election_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    bio TEXT,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    INDEX idx_election (election_id)
);

-- Insert Candidates
INSERT INTO candidates (id, election_id, name, party, image, bio, color) VALUES
('c1', 'e1', 'Adebayo Okonkwo', 'Progressive Alliance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Former Governor with 15 years of public service experience', '#10B981'),
('c2', 'e1', 'Chioma Nwankwo', 'Democratic Movement', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'Senator and advocate for education reform', '#3B82F6'),
('c3', 'e1', 'Ibrahim Musa', 'National Unity Party', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Business leader focused on economic development', '#F59E0B'),
('c4', 'e2', 'Amina Wanjiku', 'Kenya Forward', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'Human rights lawyer and activist', '#EF4444'),
('c5', 'e2', 'David Kimani', 'Reform Coalition', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Former Minister of Finance', '#10B981'),
('c7', 'e7', 'Robert Kyagulanyi', 'National Unity Platform', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Musician turned politician, youth advocate', '#EF4444'),
('c8', 'e7', 'Janet Museveni', 'National Resistance Movement', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', 'Incumbent leader, 35 years in politics', '#F59E0B'),
('c9', 'e7', 'Patrick Oboi Amuriat', 'Forum for Democratic Change', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Opposition leader, reform advocate', '#3B82F6');

-- ============================================
-- TABLE: votes
-- ============================================
CREATE TABLE votes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    election_id VARCHAR(50) NOT NULL,
    candidate_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (user_id, election_id),
    INDEX idx_election (election_id),
    INDEX idx_candidate (candidate_id)
);

-- ============================================
-- TABLE: news
-- ============================================
CREATE TABLE news (
    id VARCHAR(50) PRIMARY KEY,
    country_id VARCHAR(50) NOT NULL,
    election_id VARCHAR(50),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(500),
    priority ENUM('breaking', 'important', 'general') DEFAULT 'general',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE SET NULL,
    INDEX idx_country (country_id),
    INDEX idx_priority (priority),
    INDEX idx_timestamp (timestamp)
);

-- Insert News
INSERT INTO news (id, country_id, election_id, title, content, image, priority, timestamp) VALUES
('n1', '1', 'e1', 'Presidential Debates Scheduled for January 2025', '<p>The Electoral Commission announces <strong>three presidential debates</strong> ahead of the February election. All major candidates have confirmed their participation.</p><p>The debates will cover key topics including economy, healthcare, and education reform.</p>', 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800', 'important', NOW()),
('n2', '1', 'e1', 'Voter Registration Reaches Record High', '<p>Over <strong>95 million citizens</strong> have registered to vote in the upcoming presidential election, marking the highest turnout in the nation\'s history.</p>', NULL, 'breaking', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('n3', '2', 'e2', 'Parliamentary Candidates Release Manifestos', '<p>Major parties unveil their policy platforms focusing on <em>healthcare and education reform</em>. Detailed manifestos are now available online.</p><ul><li>Universal healthcare coverage</li><li>Free primary education</li><li>Infrastructure development</li></ul>', NULL, 'general', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('n4', '1', 'e1', 'International Observers Arrive for Election Monitoring', '<p>Teams from the <strong>African Union</strong> and <strong>Commonwealth</strong> have arrived to ensure free and fair elections.</p>', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800', 'general', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('n5', '1', 'e1', 'Youth Voter Turnout Expected to Break Records', '<p>Analysis shows unprecedented engagement from voters aged 18-35, with social media campaigns driving awareness.</p><p><a href="#">Read the full report</a></p>', NULL, 'important', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ============================================
-- TABLE: news_tags
-- ============================================
CREATE TABLE news_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id VARCHAR(50) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    INDEX idx_news (news_id),
    INDEX idx_tag (tag)
);

-- Insert News Tags
INSERT INTO news_tags (news_id, tag) VALUES
('n1', 'debate'),
('n1', 'presidential'),
('n2', 'registration'),
('n2', 'turnout'),
('n3', 'manifesto'),
('n3', 'policy'),
('n4', 'observers'),
('n4', 'international'),
('n5', 'youth'),
('n5', 'turnout');

-- ============================================
-- TABLE: news_hashtags
-- ============================================
CREATE TABLE news_hashtags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id VARCHAR(50) NOT NULL,
    hashtag VARCHAR(100) NOT NULL,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    INDEX idx_news (news_id),
    INDEX idx_hashtag (hashtag)
);

-- Insert News Hashtags
INSERT INTO news_hashtags (news_id, hashtag) VALUES
('n1', 'Election2025'),
('n1', 'PresidentialDebate'),
('n1', 'Democracy'),
('n2', 'VoterRegistration'),
('n2', 'RecordTurnout'),
('n2', 'YouthVote'),
('n3', 'PolicyMatters'),
('n3', 'Manifesto2025'),
('n3', 'ChangeIsHere'),
('n4', 'FairElections'),
('n4', 'Transparency'),
('n4', 'Democracy'),
('n5', 'YouthVote'),
('n5', 'GenZVotes'),
('n5', 'FutureLeaders');

-- ============================================
-- TABLE: comments
-- ============================================
CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    election_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    parent_comment_id VARCHAR(50),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    flagged BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_election (election_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_comment_id)
);

-- Insert Comments
INSERT INTO comments (id, election_id, user_id, parent_comment_id, content, timestamp, likes, flagged, approved) VALUES
('cm1', 'e1', 'user_1', NULL, 'Really excited about this election! The debates will be crucial for making an informed decision.', DATE_SUB(NOW(), INTERVAL 1 HOUR), 24, FALSE, TRUE),
('cm1r1', 'e1', 'user_2', 'cm1', 'Agreed! I hope they focus on economic policies.', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 8, FALSE, TRUE),
('cm2', 'e1', 'user_3', NULL, 'The voter registration numbers are impressive! This shows people are ready for change.', DATE_SUB(NOW(), INTERVAL 2 HOUR), 42, FALSE, TRUE),
('cm3', 'e1', 'user_4', NULL, 'Has anyone attended the town halls? Would love to hear about the candidates\' positions on healthcare.', DATE_SUB(NOW(), INTERVAL 3 HOUR), 15, FALSE, TRUE);

-- ============================================
-- TABLE: comment_likes
-- ============================================
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (comment_id, user_id),
    INDEX idx_comment (comment_id)
);

-- Insert Comment Likes
INSERT INTO comment_likes (comment_id, user_id) VALUES
('cm1', 'user_2'),
('cm1', 'user_3'),
('cm1r1', 'user_1'),
('cm2', 'user_1'),
('cm2', 'user_2'),
('cm2', 'user_4'),
('cm3', 'user_3');

-- ============================================
-- TABLE: comment_reactions
-- ============================================
CREATE TABLE comment_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (comment_id, user_id, emoji),
    INDEX idx_comment (comment_id)
);

-- Insert Comment Reactions
INSERT INTO comment_reactions (comment_id, user_id, emoji) VALUES
('cm1', 'user_2', '👍'),
('cm1', 'user_4', '👍'),
('cm1', 'user_3', '🔥'),
('cm2', 'user_1', '❤️'),
('cm2', 'user_2', '❤️'),
('cm2', 'user_4', '🎉'),
('cm3', 'user_1', '👍');

-- ============================================
-- TABLE: chat_rooms
-- ============================================
CREATE TABLE chat_rooms (
    id VARCHAR(100) PRIMARY KEY,
    type ENUM('country', 'election', 'candidate') NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_users INT DEFAULT 0,
    INDEX idx_type (type),
    INDEX idx_entity (entity_id)
);

-- Insert Chat Rooms (auto-generated for countries, elections, candidates)
INSERT INTO chat_rooms (id, type, entity_id, name, description, active_users) VALUES
('country_1', 'country', '1', '🇳🇬 Nigeria', 'Discuss elections and politics in Nigeria', 0),
('country_2', 'country', '2', '🇰🇪 Kenya', 'Discuss elections and politics in Kenya', 0),
('country_7', 'country', '7', '🇺🇬 Uganda', 'Discuss elections and politics in Uganda', 0),
('election_e1', 'election', 'e1', 'Nigerian Presidential Election 2025', 'Chat about the Nigeria Presidential Election', 0),
('election_e7', 'election', 'e7', 'Uganda Presidential Election 2025', 'Chat about the Uganda Presidential Election', 0),
('candidate_c1', 'candidate', 'c1', 'Adebayo Okonkwo Supporters', 'Support and discuss Adebayo Okonkwo\'s campaign', 0),
('candidate_c7', 'candidate', 'c7', 'Robert Kyagulanyi Supporters', 'Support and discuss Robert Kyagulanyi\'s campaign', 0);

-- ============================================
-- TABLE: chat_messages
-- ============================================
CREATE TABLE chat_messages (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    flagged BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_timestamp (timestamp)
);

-- ============================================
-- TABLE: chat_moderators
-- ============================================
CREATE TABLE chat_moderators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_moderator (room_id, user_id),
    INDEX idx_room (room_id)
);

-- ============================================
-- TABLE: saved_countries
-- ============================================
CREATE TABLE saved_countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    country_id VARCHAR(50) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, country_id),
    INDEX idx_user (user_id)
);

-- ============================================
-- TABLE: platform_settings
-- ============================================
CREATE TABLE platform_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Platform Settings
INSERT INTO platform_settings (setting_key, setting_value) VALUES
('featured_election_id', 'e7'),
('banner_enabled', 'true'),
('platform_name', 'African Elections'),
('support_email', 'support@elections.com'),
('enable_comments', 'true'),
('enable_sharing', 'true'),
('enable_notifications', 'true'),
('auto_approve_comments', 'false');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Vote Statistics View
CREATE VIEW vote_statistics AS
SELECT 
    e.id AS election_id,
    e.description AS election_name,
    c.id AS candidate_id,
    c.name AS candidate_name,
    c.party,
    c.color,
    COUNT(v.id) AS vote_count,
    ROUND(COUNT(v.id) * 100.0 / SUM(COUNT(v.id)) OVER (PARTITION BY e.id), 2) AS percentage
FROM elections e
JOIN candidates c ON e.id = c.election_id
LEFT JOIN votes v ON c.id = v.candidate_id
GROUP BY e.id, c.id
ORDER BY e.id, vote_count DESC;

-- Comment Statistics View
CREATE VIEW comment_statistics AS
SELECT 
    e.id AS election_id,
    e.description AS election_name,
    COUNT(DISTINCT cm.id) AS total_comments,
    COUNT(DISTINCT cm.user_id) AS unique_commenters,
    SUM(cm.likes) AS total_likes,
    COUNT(CASE WHEN cm.flagged = TRUE THEN 1 END) AS flagged_count
FROM elections e
LEFT JOIN comments cm ON e.id = cm.election_id
GROUP BY e.id;

-- Chat Activity View
CREATE VIEW chat_activity AS
SELECT 
    cr.id AS room_id,
    cr.name AS room_name,
    cr.type AS room_type,
    COUNT(cm.id) AS message_count,
    COUNT(DISTINCT cm.user_id) AS unique_participants,
    MAX(cm.timestamp) AS last_activity
FROM chat_rooms cr
LEFT JOIN chat_messages cm ON cr.id = cm.room_id AND cm.deleted = FALSE
GROUP BY cr.id;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_votes_timestamp ON votes(timestamp);
CREATE INDEX idx_comments_timestamp ON comments(timestamp);
CREATE INDEX idx_news_country_priority ON news(country_id, priority);
CREATE INDEX idx_chat_messages_room_timestamp ON chat_messages(room_id, timestamp);

-- ============================================
-- END OF DATABASE SCHEMA
-- ============================================