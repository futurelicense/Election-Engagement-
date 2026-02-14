-- ============================================
-- MySQL/MariaDB Migration
-- Fix news table column length issues
-- ============================================
-- This migration fixes the "value too long for type character varying(500)" error
-- by changing columns from VARCHAR(500) to TEXT
-- 
-- Run this script in your MySQL/MariaDB database
-- ============================================

-- Fix title column (if it's still VARCHAR)
ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;

-- Fix image column (VARCHAR(500) might be too short for long URLs)
ALTER TABLE news MODIFY COLUMN image TEXT;

-- Verify the changes
-- Run: DESCRIBE news;
-- You should see both title and image as TEXT type
