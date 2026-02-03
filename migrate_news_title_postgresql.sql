-- ============================================
-- PostgreSQL/Supabase Migration
-- Fix news.title column length issue
-- ============================================
-- This migration fixes the "value too long for type character varying(500)" error
-- by changing the title column from VARCHAR(500) to TEXT
-- 
-- Run this script in your Supabase SQL Editor or PostgreSQL database
-- ============================================

ALTER TABLE news ALTER COLUMN title TYPE TEXT;

-- Verify the change
-- Run: SELECT column_name, data_type, character_maximum_length 
--      FROM information_schema.columns 
--      WHERE table_name = 'news' AND column_name = 'title';
-- 
-- You should see data_type = 'text' instead of 'character varying'

