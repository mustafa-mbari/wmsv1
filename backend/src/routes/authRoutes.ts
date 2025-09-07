import { Router, Request, Response } from 'express';
import { LoginDto, createApiResponse, HttpStatus, validateEmail } from '../../../shared/dist'
import logger from '../utils/logger/logger';
import prisma from '../utils/prismaClient'; // Adjust the import based on your project structure
import bcrypt from 'bcryptjs'; // or 'bcrypt' depending on your bcrypt version

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password }: LoginDto = req.body;

  logger.info('Login attempt', { source: 'authRoutes', method: 'login', email });

  // Validation
  if (!email || !password) {
    logger.warn('Login failed: missing credentials', { source: 'authRoutes', method: 'login', email: email || 'undefined' });
    return res.status(HttpStatus.BAD_REQUEST).json(createApiResponse(false, null, 'Email and password are required'));
  }

  if (!validateEmail(email)) {
    logger.warn('Login failed: invalid email format', { source: 'authRoutes', method: 'login', email });
    return res.status(HttpStatus.BAD_REQUEST).json(createApiResponse(false, null, 'Invalid email format'));
  }

  // For now, use the admin credentials we created, but try database first
  let user = null;
  let validPassword = false;

  try {
    // Try to find user in database
    user = await prisma.users.findUnique({ 
      where: { email }
    });
    
    if (user && user.is_active) {
      validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (validPassword) {
        // Get user roles from database
        const userRoles = await prisma.user_roles.findMany({
          where: {
            user_id: user.id,
            deleted_at: null
          },
          include: {
            roles: {
              select: {
                slug: true,
                is_active: true,
                deleted_at: true
              }
            }
          }
        });
        
        // Extract role names for the response (only active roles)
        const roleNames = userRoles
          .filter(ur => ur.roles.is_active && !ur.roles.deleted_at)
          .map(ur => ur.roles.slug);
        
        // Create clean user object for response
        const userResponse = {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          is_active: user.is_active,
          role_names: roleNames,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
        
        logger.info('Login successful (database)', { source: 'authRoutes', method: 'login', email });
        return res.json(createApiResponse(true, { user: userResponse }, 'Login successful'));
      }
    }
  } catch (dbError) {
    logger.warn('Database error, falling back to mock auth', { source: 'authRoutes', method: 'login', error: dbError instanceof Error ? dbError.message : String(dbError) });
  }

  // Fallback to mock authentication if database fails or user not found
  if (email === 'admin@example.com' && password === 'password123') {
    validPassword = true;
    user = {
      id: 7,
      email: 'admin@example.com',
      username: 'superadmin',
      first_name: 'Admin',
      last_name: 'User',
      is_active: true,
      role_names: ['super-admin'],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    logger.info('Login successful (mock)', { source: 'authRoutes', method: 'login', email });
    return res.json(createApiResponse(true, { user }, 'Login successful'));
  }

  logger.warn('Login failed: invalid credentials', { source: 'authRoutes', method: 'login', email });
  res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(false, null, 'Invalid credentials'));
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  logger.info('Auth me request', { source: 'authRoutes', method: 'me' });
  
  // For now, return the admin user since we don't have JWT validation yet
  // In a real implementation, you'd validate the JWT token and get the user ID from it
  try {
    const user = await prisma.users.findUnique({ 
      where: { email: 'admin@example.com' }
    });

    if (user) {
      // Get user roles
      const userRoles = await prisma.user_roles.findMany({
        where: {
          user_id: user.id,
          deleted_at: null
        },
        include: {
          roles: {
            select: {
              slug: true,
              is_active: true,
              deleted_at: true
            }
          }
        }
      });

      // Extract role names for the response (only active roles)
      const roleNames = userRoles
        .filter(ur => ur.roles.is_active && !ur.roles.deleted_at)
        .map(ur => ur.roles.slug);
      
      // Create clean user object for response
      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        role_names: roleNames,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      logger.info('Auth me successful (database)', { source: 'authRoutes', method: 'me' });
      return res.json(createApiResponse(true, { user: userResponse }, 'User retrieved successfully'));
    }
  } catch (error: any) {
    logger.warn('Auth me database error, using fallback', { source: 'authRoutes', method: 'me', error: error.message });
  }

  // Fallback mock user
  const mockUser = {
    id: 7,
    email: 'admin@example.com',
    username: 'superadmin',
    first_name: 'Admin',
    last_name: 'User',
    is_active: true,
    role_names: ['super-admin'],
    created_at: new Date(),
    updated_at: new Date()
  };

  logger.info('Auth me successful (mock)', { source: 'authRoutes', method: 'me' });
  res.json(createApiResponse(true, { user: mockUser }, 'User retrieved successfully'));
});

export default router;