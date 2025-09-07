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

    const users = await prisma.user.findMany({
      include: {
        UserRole: {
          include: {
            role: true
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role_names: user.UserRole.map(ur => ur.role.name),
      role_slugs: user.UserRole.map(ur => ur.role.slug)
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
      error: error instanceof Error ? error.message : 'Unknown error'
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
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        UserRole: {
          include: {
            role: true
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
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role_names: user.UserRole.map(ur => ur.role.name),
      role_slugs: user.UserRole.map(ur => ur.role.slug)
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch user')
    );
  }
});

export default router;