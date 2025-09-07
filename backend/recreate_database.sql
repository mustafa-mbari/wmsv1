-- Complete database recreation script
-- Run as postgres superuser

-- Drop and recreate database
DROP DATABASE IF EXISTS wmlab;
CREATE DATABASE wmlab OWNER mustafa;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE wmlab TO mustafa;

-- Connect to wmlab database
\c wmlab

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO mustafa;
ALTER SCHEMA public OWNER TO mustafa;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mustafa;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mustafa;
