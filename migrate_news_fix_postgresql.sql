-- ============================================
-- PostgreSQL/Supabase Migration
-- Fix news table column length issues
-- ============================================
-- This migration fixes the "value too long for type character varying(500)" error
-- by changing columns from VARCHAR(500) to TEXT
-- 
-- Run this script in your Supabase SQL Editor or PostgreSQL database
-- ============================================

-- Fix title column (if it's still VARCHAR)
ALTER TABLE news ALTER COLUMN title TYPE TEXT;

-- Fix image column (VARCHAR(500) might be too short for long URLs)
ALTER TABLE news ALTER COLUMN image TYPE TEXT;

-- Verify the changes
-- Run this query to check:
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'news' 
-- AND column_name IN ('title', 'image');
-- 
-- You should see data_type = 'text' for both columns
