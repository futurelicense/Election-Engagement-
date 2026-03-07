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
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'news' 
        AND column_name = 'title' 
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE news ALTER COLUMN title TYPE TEXT;
        RAISE NOTICE 'Updated news.title from VARCHAR to TEXT';
    ELSE
        RAISE NOTICE 'news.title is already TEXT or does not exist';
    END IF;
END $$;

-- Fix image column (VARCHAR(500) might be too short for long URLs)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'news' 
        AND column_name = 'image' 
        AND data_type = 'character varying'
        AND character_maximum_length <= 500
    ) THEN
        ALTER TABLE news ALTER COLUMN image TYPE TEXT;
        RAISE NOTICE 'Updated news.image from VARCHAR(500) to TEXT';
    ELSE
        RAISE NOTICE 'news.image is already TEXT or does not exist';
    END IF;
END $$;

-- Verify the changes
-- Run this query to check:
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'news' 
-- AND column_name IN ('title', 'image');
-- 
-- You should see data_type = 'text' for both columns
