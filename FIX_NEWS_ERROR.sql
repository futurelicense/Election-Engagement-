-- ============================================
-- QUICK FIX FOR SUPABASE/POSTGRESQL
-- Run this in Supabase SQL Editor
-- ============================================
-- This fixes the "value too long for type character varying(500)" error
-- ============================================

-- Fix title column
ALTER TABLE news ALTER COLUMN title TYPE TEXT;

-- Fix image column  
ALTER TABLE news ALTER COLUMN image TYPE TEXT;

-- Done! Now try creating a news article again.
