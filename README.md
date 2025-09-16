# WM-Labv1 Project

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### 1. Setup on New Device
```bash
# Clone the repository
git clone <your-repository-url>
cd wm-labv1

# Install all dependencies (root, backend, frontend, shared)
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment files and configure them
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit the .env files with your database credentials and API URLs
```

### 3. Database Setup
```bash
# Generate Prisma client
cd backend && npx prisma generate

# Run database migrations
cd backend && npx prisma migrate dev

# Seed the database with initial data
npm run seed
# or specifically: npm run seed:full

# to run the prisma studio
cd backend; npx prisma studio
```

### 4. Run the Application

#### Option A: Run Both (Recommended)
```bash
# Run both backend and frontend concurrently
npm run dev
```

#### Option B: Run Separately
```bash
# Terminal 1 - Backend (API Server)
npm run backend:dev
# Backend runs on: http://localhost:8000

# Terminal 2 - Frontend (Next.js)
npm run frontend:dev  
# Frontend runs on: http://localhost:3003
```

### 5. Additional Commands

#### Package Management
```bash
# Update all packages
npm run install:all

# Install new package in backend
cd backend && npm install <package-name>

# Install new package in frontend  
cd frontend && npm install <package-name>

# Install new package in shared
cd shared && npm install <package-name>
```

#### Database Operations
```bash
# Reset database and reseed
npm run seed:reset && npm run seed:full

# Seed specific data types
npm run seed:users       # Create users and roles
npm run seed:products    # Create product categories
npm run seed:warehouses  # Create warehouse data
```

#### Build & Production
```bash
# Build all projects
npm run build

# Start production servers
npm run start
```

---

## 📁 Project Structure

```
wm-labv1/
├── package.json                # Root workspace dependencies and scripts
├── .env                        # Environment variables (root level)
├── .gitignore                  # Git ignore patterns
├── README.md                   # This file
│
├── backend/                    # 🔧 Backend API Server (Express.js)
│   ├── package.json            # Backend dependencies (Express, Prisma, etc.)
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .env                    # Backend environment variables
│   ├── prisma/                 # Database schema and migrations
│   │   ├── schema.prisma       # Database schema definition
│   │   ├── migrations/         # Database migration files
│   │   └── seeds/              # Database seeding scripts
│   │       └── seed.ts         # Main seeding script
│   ├── src/                    # Backend source code
│   │   ├── server.ts           # Server entry point
│   │   ├── app.ts              # Express app configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route handlers
│   │   │   ├── authRoutes.ts   # Authentication endpoints
│   │   │   ├── userRoutes.ts   # User management endpoints
│   │   │   └── ...             # Other route files
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Data models and types
│   │   └── utils/              # Utility functions and helpers
│   └── uploads/                # File upload storage
│
├── frontend/                   # 🎨 Frontend Web App (Next.js)
│   ├── package.json            # Frontend dependencies (Next.js, React, etc.)
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── .env.local              # Frontend environment variables
│   ├── src/                    # Frontend source code
│   │   ├── app/                # Next.js app directory
│   │   │   ├── globals.css     # Global styles
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Home page
│   │   │   └── dashboard/      # Dashboard pages
│   │   ├── components/         # Reusable React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # Layout components
│   │   │   └── providers/      # Context providers
│   │   ├── lib/                # Utility libraries
│   │   └── hooks/              # Custom React hooks
│   └── public/                 # Static assets
│
└── shared/                     # 📦 Shared Code & Types
    ├── package.json            # Shared dependencies
    ├── tsconfig.json           # TypeScript configuration
    └── src/                    # Shared source code
        ├── index.ts            # Entry point
        ├── types/              # TypeScript type definitions
        └── utils/              # Shared utility functions
```

## Project Description

**WM-Labv1** is a full-stack Warehouse Management System built with Node.js/Express for the backend and Next.js/React for the frontend. The project is organized into three main parts:

- **🔧 backend/**: API server with Express.js, PostgreSQL database, Prisma ORM, authentication, file uploads, and comprehensive logging
- **🎨 frontend/**: Modern Next.js web application with React, TypeScript, Tailwind CSS, shadcn/ui components, and responsive design  
- **📦 shared/**: Common types, utilities, and shared code used across both backend and frontend for consistency

### Key Features
- 🔐 **Authentication & Authorization**: JWT-based auth with role-based permissions
- 👥 **User Management**: Complete user profiles with role assignments
- 📊 **Dashboard**: Modern responsive dashboard with data visualization
- 📁 **File Management**: Profile picture uploads and file handling
- 🗄️ **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- 🔍 **Logging**: Comprehensive logging system for debugging and monitoring

---

## 🛠️ Development

### Available Scripts

#### Root Level Scripts
```bash
npm run dev              # Run both backend and frontend
npm run build           # Build all projects  
npm run start           # Start production servers
npm run install:all     # Install dependencies for all workspaces
npm run clean           # Clean build artifacts
```

#### Database Scripts
```bash
npm run seed            # Run basic database seeding
npm run seed:full       # Complete database seeding
npm run seed:users      # Seed users and roles
npm run seed:products   # Seed product categories  
npm run seed:warehouses # Seed warehouse data
npm run seed:reset      # Reset database and reseed
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wm-labv1"
JWT_SECRET="your-secret-key"
PORT=8000
```

#### Frontend (.env.local)  
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Schema Updates
```bash
# After modifying prisma/schema.prisma
cd backend

# Generate migration
npx prisma migrate dev --name describe-changes

# Generate Prisma client
npx prisma generate

# Apply to production
npx prisma migrate deploy
```

---

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify database exists
psql -h localhost -p 5432 -U your_username -d wm-labv1
```

#### Port Already in Use
```bash
# Kill process on port 8000 (backend)
npx kill-port 8000

# Kill process on port 3003 (frontend)  
npx kill-port 3003
```

#### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install:all
```

#### Prisma Client Issues
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.
