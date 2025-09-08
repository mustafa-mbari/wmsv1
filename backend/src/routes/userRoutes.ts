import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '../../../shared/dist'
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
      include: {
        user_roles_user_roles_user_idTousers: {
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
        id: parseInt(id)
      },
      include: {
        user_roles_user_roles_user_idTousers: {
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

// POST /api/users (Create new user)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      phone, 
      address, 
      password, 
      isActive = true, 
      isAdmin = false
    } = req.body;

    logger.info('Creating new user', { 
      source: 'userRoutes', 
      method: 'createUser',
      email,
      username
    });

    // Validation
    if (!username || !email || !firstName || !lastName || !password) {
      logger.warn('User creation failed: missing required fields', { 
        source: 'userRoutes', 
        method: 'createUser',
        email: email || 'undefined',
        username: username || 'undefined'
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Username, email, first name, last name, and password are required')
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      logger.warn('User creation failed: user already exists', { 
        source: 'userRoutes', 
        method: 'createUser',
        email,
        username
      });
      return res.status(HttpStatus.CONFLICT).json(
        createApiResponse(false, null, 'User with this email or username already exists')
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        address: address || null,
        password_hash: passwordHash,
        is_active: isActive,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Transform response
    const userResponse = {
      id: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone: newUser.phone,
      address: newUser.address,
      is_active: newUser.is_active,
      email_verified: newUser.email_verified,
      created_at: newUser.created_at.toISOString(),
      updated_at: newUser.updated_at.toISOString(),
      role_names: [],
      role_slugs: []
    };

    logger.info('User created successfully', { 
      source: 'userRoutes', 
      method: 'createUser',
      userId: newUser.id.toString(),
      email: newUser.email
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, userResponse, 'User created successfully')
    );
  } catch (error) {
    logger.error('Error creating user', {
      source: 'userRoutes',
      method: 'createUser',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create user')
    );
  }
});

// PUT /api/users/:id (Update user)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      phone, 
      address, 
      password, 
      isActive, 
      isAdmin
    } = req.body;

    logger.info('Updating user', { 
      source: 'userRoutes', 
      method: 'updateUser',
      userId: id
    });

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { 
        id: parseInt(id)
      }
    });

    if (!existingUser) {
      logger.warn('User update failed: user not found', { 
        source: 'userRoutes', 
        method: 'updateUser',
        userId: id
      });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Check for email/username conflicts (excluding current user)
    if (username || email) {
      const conflictUser = await prisma.users.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : [])
          ],
          id: { not: parseInt(id) }
        }
      });

      if (conflictUser) {
        logger.warn('User update failed: email or username already exists', { 
          source: 'userRoutes', 
          method: 'updateUser',
          userId: id,
          email,
          username
        });
        return res.status(HttpStatus.CONFLICT).json(
          createApiResponse(false, null, 'User with this email or username already exists')
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (typeof isActive === 'boolean') updateData.is_active = isActive;

    // Hash password if provided
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user_roles_user_roles_user_idTousers: {
          include: {
            roles: true
          }
        }
      }
    });

    // Transform response
    const userResponse = {
      id: updatedUser.id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      is_active: updatedUser.is_active,
      email_verified: updatedUser.email_verified,
      last_login_at: updatedUser.last_login_at?.toISOString() || null,
      created_at: updatedUser.created_at.toISOString(),
      updated_at: updatedUser.updated_at.toISOString(),
      role_names: updatedUser.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name),
      role_slugs: updatedUser.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    };

    logger.info('User updated successfully', { 
      source: 'userRoutes', 
      method: 'updateUser',
      userId: id,
      email: updatedUser.email
    });

    res.json(createApiResponse(true, userResponse, 'User updated successfully'));
  } catch (error) {
    logger.error('Error updating user', {
      source: 'userRoutes',
      method: 'updateUser',
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update user')
    );
  }
});


// DELETE /api/users/:id (Hard delete user - permanently remove from database)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.info('Permanently deleting user', { 
      source: 'userRoutes', 
      method: 'deleteUser',
      userId: id
    });

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { 
        id: parseInt(id)
      }
    });

    if (!existingUser) {
      logger.warn('User deletion failed: user not found', { 
        source: 'userRoutes', 
        method: 'deleteUser',
        userId: id
      });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Hard delete user and their role assignments
    await prisma.$transaction(async (tx) => {
      // Delete user roles first (foreign key constraint)
      await tx.user_roles.deleteMany({
        where: {
          user_id: parseInt(id)
        }
      });

      // Delete user permanently
      await tx.users.delete({
        where: { id: parseInt(id) }
      });
    });

    logger.info('User permanently deleted', { 
      source: 'userRoutes', 
      method: 'deleteUser',
      userId: id,
      email: existingUser.email
    });

    res.json(createApiResponse(true, null, 'User deleted successfully'));
  } catch (error) {
    logger.error('Error deleting user', {
      source: 'userRoutes',
      method: 'deleteUser',
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete user')
    );
  }
});

export default router;