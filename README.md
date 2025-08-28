# WMSv1 Project

## Project Structure

```
Root Directory
├── package.json                # Project dependencies and scripts (root level)
├── .env                        # Environment variables (root level)
├── backend/                    # Backend server code (Node.js/Express)
│   ├── package.json            # Backend dependencies and scripts
│   ├── testRequests.js         # Test scripts for API requests
│   ├── tsconfig.json           # TypeScript configuration for backend
│   ├── shared/                 # Shared backend resources
│   │   └── logs/               # Backend log files
│   │       ├── app.log         # Application log (backend)
│   │       ├── debug.log       # Debug log (backend)
│   │       └── error.log       # Error log (backend)
│   ├── src/                    # Backend source code
│   │   ├── app.ts              # Main Express app setup
│   │   ├── server.ts           # Server entry point
│   │   ├── middleware/         # Express middleware
│   │   │   └── requestLogger.ts# Logs incoming requests
│   │   ├── routes/             # API route handlers
│   │   │   ├── authRoutes.ts   # Authentication routes
│   │   │   └── userRoutes.ts   # User management routes
│   │   └── utils/              # Utility functions
│   │       └── logger/         # Logging utilities
│   │           ├── logger.ts   # Logger implementation
│   │           └── testLogger.ts# Logger test utilities
├── frontend/                   # Frontend client code (Next.js/React)
│   ├── next-env.d.ts           # Next.js TypeScript environment definitions
│   ├── next.config.js          # Next.js configuration
│   ├── package.json            # Frontend dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration for frontend
│   ├── app/                    # Main app entry and global styles
│   │   ├── globals.css         # Global CSS styles
│   │   ├── layout.tsx          # App layout component
│   │   └── page.tsx            # Main page component
│   └── components/             # Reusable React components
│       ├── LoginForm.tsx       # Login form component
│       └── UserList.tsx        # User list display component
├── shared/                     # Shared code and types
│   ├── package.json            # Shared dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration for shared code
│   ├── logs/                   # Shared log files
│   │   ├── app.log             # Application log (shared)
│   │   ├── debug.log           # Debug log (shared)
│   │   └── error.log           # Error log (shared)
│   └── src/                    # Shared source code
│       ├── index.ts            # Entry point for shared utilities
│       ├── types/              # Shared TypeScript types
│       │   └── index.ts        # Type definitions
│       └── utils/              # Shared utility functions
│           └── index.ts        # Utility function definitions
```

## Project Description

**WMSv1** is a full-stack Warehouse Management System built with Node.js/Express for the backend and Next.js/React for the frontend. The project is organized into three main parts:
- **backend/**: Handles API endpoints, authentication, user management, logging, and server logic.
- **frontend/**: Provides a modern web interface for users to interact with the system, including login and user management features.
- **shared/**: Contains code, types, and utilities that are reused across both backend and frontend, ensuring consistency and reducing duplication.

The project is designed for scalability, maintainability, and ease of development, with clear separation of concerns and modular structure. Logging is implemented at both backend and shared levels for robust monitoring and debugging.
