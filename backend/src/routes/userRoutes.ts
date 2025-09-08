import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '../../../shared/dist'
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all users from database', { 
      source: 'userRoutes', 
      method: 'getUsers'
    });

    const users = await prisma.users.findMany({
      where: {
        deleted_at: null, // Only get non-deleted users
      },
      include: {
        user_roles_user_roles_user_idTousers: {
          where: {
            deleted_at: null, // Only get non-deleted role assignments
          },
          include: {
            roles: true
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      is_active: user.is_active,
      email_verified: user.email_verified,
      last_login_at: user.last_login_at?.toISOString() || null,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      role_names: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name),
      role_slugs: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    }));

    logger.info('Users retrieved successfully from database', { 
      source: 'userRoutes', 
      method: 'getUsers',
      count: transformedUsers.length
    });

    res.json(createApiResponse(true, transformedUsers, 'Users retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching users from database', {
      source: 'userRoutes',
      method: 'getUsers',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch users')
    );
  }
});

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Fetching user by ID from database', { 
      source: 'userRoutes', 
      method: 'getUserById',
      userId: id
    });
    
    const user = await prisma.users.findUnique({
      where: { 
        id: parseInt(id),
        deleted_at: null // Only get non-deleted user
      },
      include: {
        user_roles_user_roles_user_idTousers: {
          where: {
            deleted_at: null, // Only get non-deleted role assignments
          },
          include: {
            roles: true
          }
        }
      }
    });
    
    if (!user) {
      logger.warn('User not found in database', { 
        source: 'userRoutes', 
        method: 'getUserById',
        userId: id
      });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Transform the data to match frontend expectations
    const transformedUser = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      birth_date: user.birth_date?.toISOString() || null,
      gender: user.gender,
      is_active: user.is_active,
      email_verified: user.email_verified,
      email_verified_at: user.email_verified_at?.toISOString() || null,
      last_login_at: user.last_login_at?.toISOString() || null,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      role_names: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name),
      role_slugs: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    };
    
    logger.info('User retrieved successfully from database', { 
      source: 'userRoutes', 
      method: 'getUserById',
      userId: id,
      userEmail: transformedUser.email
    });

    res.json(createApiResponse(true, transformedUser, 'User retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching user from database', {
      source: 'userRoutes',
      method: 'getUserById',
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch user')
    );
  }
});

export default router;