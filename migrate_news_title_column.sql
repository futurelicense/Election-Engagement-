-- ============================================
-- Migration: Fix news.title column length issue
-- ============================================
-- This migration fixes the "value too long for type character varying(500)" error
-- by changing the title column from VARCHAR(500) to TEXT
-- 
-- Run this script on your existing database if you're getting the error
-- ============================================

-- For PostgreSQL/Supabase
-- ALTER TABLE news ALTER COLUMN title TYPE TEXT;

-- For MySQL/MariaDB
-- ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;

-- ============================================
-- PostgreSQL/Supabase Migration
-- ============================================
-- Uncomment and run this if using PostgreSQL/Supabase:
/*
ALTER TABLE news ALTER COLUMN title TYPE TEXT;
*/

-- ============================================
-- MySQL/MariaDB Migration
-- ============================================
-- Uncomment and run this if using MySQL/MariaDB:
/*
ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;
*/

-- ============================================
-- Verify the change
-- ============================================
-- After running the migration, verify with:
-- PostgreSQL: \d news
-- MySQL: DESCRIBE news;
-- You should see title as TEXT type instead of VARCHAR(500)

