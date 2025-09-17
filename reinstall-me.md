# WM-Lab v1 - Complete Setup Guide for New PC

This guide provides comprehensive step-by-step instructions for setting up and running the WM-Lab v1 warehouse management laboratory application on a new PC.

## Prerequisites and Environment Setup

### 1. Install Required Software

#### Node.js and npm
- Download and install Node.js (version 18.0.0 or later) from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### PostgreSQL Database
- Download and install PostgreSQL (version 13 or later) from [postgresql.org](https://www.postgresql.org/download/)
- During installation, remember the password for the `postgres` user
- Verify installation:
  ```bash
  psql --version
  ```

#### Git (if not already installed)
- Download and install Git from [git-scm.com](https://git-scm.com/)
- Verify installation:
  ```bash
  git --version
  ```

### 2. Environment Verification
Run the following commands to ensure all prerequisites are properly installed:
```bash
node --version    # Should show v18.0.0 or later
npm --version     # Should show npm version
psql --version    # Should show PostgreSQL version
git --version     # Should show Git version
```

## Project Setup

### 3. Clone the Repository
```bash
git clone <repository-url>
cd wmsv1
```

### 4. Install All Dependencies
Install dependencies for all workspaces (backend, frontend, shared):
```bash
npm run install:all
```

This command will install dependencies for:
- Root workspace
- Backend workspace (Express.js API)
- Frontend workspace (Next.js app)
- Shared workspace (common types and utilities)

## Database Configuration

### 5. Delete Existing Database Configuration (if any)
If you have any existing PostgreSQL databases or configurations that might conflict:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Drop the database if it exists (replace 'wmsv1' with your database name)
DROP DATABASE IF EXISTS wmsv1;

# Exit PostgreSQL
\q
```

### 6. Create New Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE wmsv1;

# Create a dedicated user (optional but recommended)
CREATE USER wmsv1_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wmsv1 TO wmsv1_user;

# Exit PostgreSQL
\q
```

### 7. Configure Environment Variables

#### Backend Environment (.env)
Navigate to the backend directory and create the environment file:
```bash
cd backend
```

Create `.env` file with the following content:
```env
# Database Configuration
DATABASE_URL="postgresql://wmsv1_user:your_secure_password@localhost:5432/wmsv1"

# JWT Configuration
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=8000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL="http://localhost:3003"
```

#### Frontend Environment (.env.local)
Navigate to the frontend directory and create the environment file:
```bash
cd ../frontend
```

Create `.env.local` file with the following content:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Return to the root directory:
```bash
cd ..
```

## Database Setup and Migrations

### 8. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### 9. Run Database Migrations
Create the database schema:
```bash
npx prisma migrate dev
```

When prompted for a migration name, you can use: `initial_migration`

### 10. Seed the Database
Return to the root directory and run the complete database seeding:
```bash
cd ..
npm run seed:full
```

Alternative seeding options:
```bash
# Seed only users and roles
npm run seed:users

# Seed only warehouse data
npm run seed:warehouses

# Reset and reseed entire database
npm run seed:reset
```

## Building and Testing

### 11. Build the Application
Build all workspaces:
```bash
npm run build
```

This will:
- Build the backend API
- Build the frontend Next.js application
- Compile shared TypeScript types

### 12. Start Development Servers
Start both backend and frontend in development mode:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:8000`
- Frontend Next.js application on `http://localhost:3003`

### 13. Verify Installation

#### Test Backend API
Open a new terminal and test the API:
```bash
curl http://localhost:8000/api/health
```

You should receive a response indicating the API is running.

#### Test Frontend Application
Open your web browser and navigate to:
```
http://localhost:3003
```

You should see the WM-Lab v1 application interface.

#### Test Database Connection
```bash
cd backend
npx prisma studio
```

This will open Prisma Studio in your browser, allowing you to view and manage your database.

## Alternative Individual Startup

If you prefer to run services individually:

### Backend Only
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:8000`

### Frontend Only
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3003`

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
If you get port conflicts:
```bash
# Check what's using the ports
netstat -ano | findstr :8000
netstat -ano | findstr :3003

# Kill processes if needed (replace PID with actual process ID)
taskkill /F /PID <process_id>
```

#### Database Connection Issues
- Verify PostgreSQL is running
- Check your `.env` DATABASE_URL is correct
- Ensure the database user has proper permissions

#### Missing Dependencies
If you encounter missing package errors:
```bash
# Clean install all dependencies
npm run install:all
```

#### Prisma Issues
If you encounter Prisma-related errors:
```bash
cd backend
npx prisma generate
npx prisma migrate reset --force
cd ..
npm run seed:full
```

## Additional Development Commands

### Linting and Type Checking
```bash
# Frontend linting
cd frontend
npm run lint

# Frontend type checking
cd frontend
npm run type-check
```

### API Documentation
```bash
# Generate API documentation
cd backend
npm run docs:generate
```

### Database Management
```bash
# View database in Prisma Studio
cd backend
npx prisma studio

# Reset database and reseed
npm run seed:reset
```

## Verification Checklist

- [ ] Node.js and npm installed and working
- [ ] PostgreSQL installed and running
- [ ] Repository cloned successfully
- [ ] All dependencies installed (`npm run install:all`)
- [ ] Environment variables configured (`.env` and `.env.local`)
- [ ] Database created and configured
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] Database seeded successfully
- [ ] Application builds without errors (`npm run build`)
- [ ] Backend API starts and responds (`http://localhost:8000`)
- [ ] Frontend application loads (`http://localhost:3003`)
- [ ] Can log in and navigate the application
- [ ] Prisma Studio can connect to database

## Support

If you encounter issues not covered in this guide:
1. Check the console output for specific error messages
2. Verify all environment variables are correctly set
3. Ensure PostgreSQL service is running
4. Try restarting the development servers
5. Check the project's main documentation in `CLAUDE.md`

---

**Note**: Replace placeholder values (like `your_secure_password`, `your_jwt_secret_key_here`) with actual secure values appropriate for your environment.