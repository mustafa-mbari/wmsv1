# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WMSv1 is a TypeScript monorepo warehouse management system with three main workspaces:

- **backend/**: Express.js API with Prisma ORM and PostgreSQL
- **frontend/**: Next.js React app with shadcn/ui components
- **shared/**: Common types and utilities

## Development Commands


### Essential Commands
```bash
# Start both backend and frontend in development mode
npm run dev

# Install all dependencies across workspaces
npm run install:all

# Build all projects
npm run build

# Generate Prisma client and run migrations
cd backend && npx prisma generate
cd backend && npx prisma migrate dev

# Database seeding
npm run seed:full        # Complete database seeding
npm run seed:users       # Seed users and roles only
npm run seed:warehouses  # Seed warehouse data only
npm run seed:reset       # Reset and reseed database
```

### Individual Workspace Commands
```bash
# Backend (runs on port 8000)
cd backend && npm run dev

# Frontend (runs on port 3003)
cd frontend && npm run dev

# Frontend linting and type checking
cd frontend && npm run lint
cd frontend && npm run type-check

# Backend API documentation generation
cd backend && npm run docs:generate
```

## Architecture Notes

### Database Schema
- Uses PostgreSQL with Prisma ORM
- Schema defined in `backend/prisma/schema.prisma`
- All tables follow consistent patterns with audit fields (created_by, updated_by, deleted_by)
- Do not use soft delete, All deletions must be hard deletes to ensure data consistency and avoid hidden records
- Complex warehouse structure with zones, aisles, locations, and bin types
- Always update the Swagger documentation when making changes
- When creating new tables or making changes in the database, always update schema.prisma, Swagger and the seeder classes, and create seed data

### API Structure
- RESTful API with Swagger documentation
- JWT-based authentication with role-based permissions
- File upload handling for profile pictures
- Comprehensive logging with Winston
- API types auto-generated from OpenAPI spec

### Frontend Architecture
- Next.js App Router (v14+)
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling
- React Query for state management and API calls
- TypeScript with strict type checking
- Responsive design with mobile-first approach
- Always use our new components (e.g., `searchable-select`, `alert-dialog`) instead of the basic ones
- Always use our `advanced-data-table` when working with data tables

### Shared Types
- API types generated from backend OpenAPI specification
- Common utilities and validation schemas
- Cross-workspace TypeScript configuration

### Authentication & Authorization
- JWT tokens stored in HTTP-only cookies
- Role-based access control (RBAC)
- User profile management with file uploads
- Password hashing with bcryptjs

### Key Configuration Files
- Root: `package.json` (workspace configuration)
- Backend: `backend/.env` (database URL, JWT secret, port)
- Frontend: `frontend/.env.local` (API URL configuration)
- Database: `backend/prisma/schema.prisma`

### Testing & Quality
- Frontend uses Next.js built-in linting
- Backend uses nodemon for development
- TypeScript strict mode across all workspaces
- API documentation validation with Swagger
- Always test data fetching functionality
- Do not use mock data, Always work with real API responses or seeded database data 

### Development Workflow
1. Always run `npm run install:all` after cloning
2. Set up environment variables in respective `.env` files
3. Generate Prisma client: `cd backend && npx prisma generate`
4. Run migrations: `cd backend && npx prisma migrate dev`
5. Seed database: `npm run seed:full`
6. Start development: `npm run dev`
7. Do not commit or push any changes to Git until I have done so 

### File Structure Notes
- Backend routes in `backend/src/routes/`
- Frontend pages in `frontend/src/app/`
- Shared components in `frontend/src/components/`
- Database migrations in `backend/prisma/migrations/`
- Seeding scripts in `backend/prisma/seeds/`
- Add to memorize, in database the tables are distributed on schemas (public, product, inventory, warehouse)