-- Migration: Add profile fields to users table
-- Created: 2025-01-15

-- Add language and time_zone columns to users table
ALTER TABLE users 
ADD COLUMN language VARCHAR(10) DEFAULT 'en',
ADD COLUMN time_zone VARCHAR(100) DEFAULT 'UTC';

-- Update existing users to have default values
UPDATE users 
SET language = 'en', time_zone = 'UTC' 
WHERE language IS NULL OR time_zone IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.language IS 'User preferred language (ISO 639-1 code)';
COMMENT ON COLUMN users.time_zone IS 'User preferred timezone (IANA timezone identifier)';