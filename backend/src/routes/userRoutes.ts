import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared'
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${req.params.id}-${uniqueSuffix}${extension}`);
  }
});

const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG files are allowed'));
    }
  }
});

// GET /api/users - Require admin access
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

// GET /api/users/:id - Require admin access
router.get('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      avatar_url: user.avatar_url,
      language: user.language,
      time_zone: user.time_zone,
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

// POST /api/users (Create new user) - Admin only
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

// PUT /api/users/:id (Update user) - Admin only
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      isAdmin,
      birthDate,
      gender,
      language,
      timeZone
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
    if (birthDate !== undefined) updateData.birth_date = birthDate ? new Date(birthDate) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (language !== undefined) updateData.language = language || 'en';
    if (timeZone !== undefined) updateData.time_zone = timeZone || 'UTC';
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
      birth_date: updatedUser.birth_date?.toISOString() || null,
      gender: updatedUser.gender,
      avatar_url: updatedUser.avatar_url,
      language: updatedUser.language,
      time_zone: updatedUser.time_zone,
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


// DELETE /api/users/:id (Hard delete user - permanently remove from database) - Super admin only
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
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

// POST /api/users/:id/avatar (Upload avatar) - Admin only
router.post('/:id/avatar', authenticateToken, requireAdmin, avatarUpload.single('avatar') as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.info('Uploading avatar for user', { 
      source: 'userRoutes', 
      method: 'uploadAvatar',
      userId: id
    });

    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'No file uploaded')
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Clean up old avatar if exists
    if (existingUser.avatar_url) {
      const oldAvatarPath = path.join(process.cwd(), existingUser.avatar_url);
      await fs.unlink(oldAvatarPath).catch(() => {});
    }

    // Generate relative URL for the uploaded file
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user with new avatar URL
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        avatar_url: avatarUrl,
        updated_at: new Date()
      }
    });

    logger.info('Avatar uploaded successfully', { 
      source: 'userRoutes', 
      method: 'uploadAvatar',
      userId: id,
      filename: req.file.filename
    });

    res.json(createApiResponse(true, {
      avatar_url: avatarUrl,
      message: 'Avatar uploaded successfully'
    }, 'Avatar uploaded successfully'));
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    logger.error('Error uploading avatar', {
      source: 'userRoutes',
      method: 'uploadAvatar',
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to upload avatar')
    );
  }
});

// PUT /api/users/:id/password (Change password) - Admin only
router.put('/:id/password', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, password } = req.body;

    logger.info('Changing password for user', { 
      source: 'userRoutes', 
      method: 'changePassword',
      userId: id
    });

    if (!currentPassword || !password) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Current password and new password are required')
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password_hash);
    if (!isCurrentPasswordValid) {
      logger.warn('Password change failed: invalid current password', { 
        source: 'userRoutes', 
        method: 'changePassword',
        userId: id
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Current password is incorrect')
      );
    }

    // Validate new password strength
    if (password.length < 8) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'New password must be at least 8 characters long')
      );
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date()
      }
    });

    logger.info('Password changed successfully', { 
      source: 'userRoutes', 
      method: 'changePassword',
      userId: id
    });

    res.json(createApiResponse(true, null, 'Password changed successfully'));
  } catch (error) {
    logger.error('Error changing password', {
      source: 'userRoutes',
      method: 'changePassword',
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to change password')
    );
  }
});

export default router;