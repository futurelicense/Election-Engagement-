-- ============================================
-- MySQL/MariaDB Migration
-- Fix news.title column length issue
-- ============================================
-- This migration fixes the "value too long for type character varying(500)" error
-- by changing the title column from VARCHAR(500) to TEXT
-- 
-- Run this script in your MySQL/MariaDB database
-- ============================================

ALTER TABLE news MODIFY COLUMN title TEXT NOT NULL;

-- Verify the change
-- Run: DESCRIBE news;
-- You should see title as TEXT type instead of VARCHAR(500)

