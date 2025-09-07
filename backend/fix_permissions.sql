-- Connect as superuser postgres
-- Run: psql -U postgres -h localhost -p 5432

-- Grant necessary permissions to mustafa user
GRANT ALL PRIVILEGES ON DATABASE wmlab TO mustafa;
GRANT USAGE ON SCHEMA public TO mustafa;
GRANT CREATE ON SCHEMA public TO mustafa;
GRANT ALL PRIVILEGES ON SCHEMA public TO mustafa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mustafa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mustafa;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO mustafa;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mustafa;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mustafa;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO mustafa;

-- Make mustafa owner of the schema
ALTER SCHEMA public OWNER TO mustafa;

-- Verify permissions
\l
\dn+
