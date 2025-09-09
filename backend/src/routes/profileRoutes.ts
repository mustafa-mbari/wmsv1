import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared'
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const prisma = new PrismaClient();

// Middleware to extract user from auth (assuming auth middleware sets req.user)
const getUserFromAuth = (req: Request): { id: number } | null => {
  // For now, using mock user ID - this should be replaced with actual auth
  // The auth middleware should set req.user after validating the JWT token
  return { id: 1 }; // Mock user ID - replace with actual implementation
};

// GET /api/profile - Get current user profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Unauthorized')
      );
    }

    logger.info('Fetching current user profile', { 
      source: 'profileRoutes', 
      method: 'getProfile',
      userId: authUser.id.toString()
    });
    
    const user = await prisma.users.findUnique({
      where: { 
        id: authUser.id
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
      logger.warn('Profile not found', { 
        source: 'profileRoutes', 
        method: 'getProfile',
        userId: authUser.id.toString()
      });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Profile not found')
      );
    }

    // Transform the data to match frontend expectations
    const profileData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      profilePicture: user.avatar_url,
      language: user.language || 'en',
      timeZone: user.time_zone || 'UTC',
      is_active: user.is_active,
      email_verified: user.email_verified,
      email_verified_at: user.email_verified_at?.toISOString() || null,
      last_login_at: user.last_login_at?.toISOString() || null,
      last_password_change: user.updated_at?.toISOString() || null,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      role_names: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name),
      role_slugs: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    };
    
    logger.info('Profile retrieved successfully', { 
      source: 'profileRoutes', 
      method: 'getProfile',
      userId: authUser.id.toString(),
      userEmail: profileData.email
    });

    res.json(createApiResponse(true, profileData, 'Profile retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching profile', {
      source: 'profileRoutes',
      method: 'getProfile',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch profile')
    );
  }
});

// PATCH /api/profile - Update current user profile
router.patch('/', async (req: Request, res: Response) => {
  try {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Unauthorized')
      );
    }

    const { 
      name,
      username, 
      email, 
      phone, 
      profilePicture,
      language,
      timeZone
    } = req.body;

    logger.info('Updating user profile', { 
      source: 'profileRoutes', 
      method: 'updateProfile',
      userId: authUser.id.toString()
    });

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { 
        id: authUser.id
      }
    });

    if (!existingUser) {
      logger.warn('Profile update failed: user not found', { 
        source: 'profileRoutes', 
        method: 'updateProfile',
        userId: authUser.id.toString()
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
          id: { not: authUser.id }
        }
      });

      if (conflictUser) {
        logger.warn('Profile update failed: email or username already exists', { 
          source: 'profileRoutes', 
          method: 'updateProfile',
          userId: authUser.id.toString(),
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

    // Handle name field (split into first_name and last_name)
    if (name) {
      const nameParts = name.trim().split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (profilePicture !== undefined) updateData.avatar_url = profilePicture || null;
    if (language !== undefined) updateData.language = language || 'en';
    if (timeZone !== undefined) updateData.time_zone = timeZone || 'UTC';

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: authUser.id },
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
    const profileResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      phone: updatedUser.phone,
      profilePicture: updatedUser.avatar_url,
      language: updatedUser.language,
      timeZone: updatedUser.time_zone,
      is_active: updatedUser.is_active,
      email_verified: updatedUser.email_verified,
      email_verified_at: updatedUser.email_verified_at?.toISOString() || null,
      last_login_at: updatedUser.last_login_at?.toISOString() || null,
      last_password_change: updatedUser.updated_at?.toISOString() || null,
      created_at: updatedUser.created_at.toISOString(),
      updated_at: updatedUser.updated_at.toISOString(),
      role_names: updatedUser.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name),
      role_slugs: updatedUser.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    };

    logger.info('Profile updated successfully', { 
      source: 'profileRoutes', 
      method: 'updateProfile',
      userId: authUser.id.toString(),
      email: updatedUser.email
    });

    res.json(createApiResponse(true, profileResponse, 'Profile updated successfully'));
  } catch (error) {
    logger.error('Error updating profile', {
      source: 'profileRoutes',
      method: 'updateProfile',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update profile')
    );
  }
});

// POST /api/profile/password - Change password
router.post('/password', async (req: Request, res: Response) => {
  try {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Unauthorized')
      );
    }

    const { currentPassword, newPassword } = req.body;

    logger.info('Changing password for current user', { 
      source: 'profileRoutes', 
      method: 'changePassword',
      userId: authUser.id.toString()
    });

    if (!currentPassword || !newPassword) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Current password and new password are required')
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: authUser.id }
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
        source: 'profileRoutes', 
        method: 'changePassword',
        userId: authUser.id.toString()
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Current password is incorrect')
      );
    }

    // Validate new password strength (basic validation - frontend should handle comprehensive validation)
    if (newPassword.length < 8) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'New password must be at least 8 characters long')
      );
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.users.update({
      where: { id: authUser.id },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date()
      }
    });

    logger.info('Password changed successfully', { 
      source: 'profileRoutes', 
      method: 'changePassword',
      userId: authUser.id.toString()
    });

    res.json(createApiResponse(true, null, 'Password changed successfully'));
  } catch (error) {
    logger.error('Error changing password', {
      source: 'profileRoutes',
      method: 'changePassword',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to change password')
    );
  }
});

// POST /api/profile/profile-picture/upload-url - Get signed upload URL for profile picture
router.post('/profile-picture/upload-url', async (req: Request, res: Response) => {
  try {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Unauthorized')
      );
    }

    const { fileName, fileType } = req.body;

    logger.info('Generating profile picture upload URL', { 
      source: 'profileRoutes', 
      method: 'getProfilePictureUploadUrl',
      userId: authUser.id.toString(),
      fileName,
      fileType
    });

    if (!fileName || !fileType) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'File name and type are required')
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Only JPEG and PNG files are allowed')
      );
    }

    // For now, we'll use a simple local upload approach
    // In production, you would generate a signed URL for S3/Cloudinary
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = fileName.split('.').pop();
    const newFileName = `avatar-${authUser.id}-${uniqueSuffix}.${fileExtension}`;
    const imageUrl = `/uploads/profile-pictures/${newFileName}`;

    // Create upload directory if it doesn't exist
    const path = require('path');
    const fs = require('fs/promises');
    const uploadDir = path.join(process.cwd(), 'uploads/profile-pictures');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    logger.info('Profile picture upload URL generated', { 
      source: 'profileRoutes', 
      method: 'getProfilePictureUploadUrl',
      userId: authUser.id.toString(),
      imageUrl
    });

    // Return mock signed URL response
    // In production, replace this with actual cloud storage signed URL
    res.json(createApiResponse(true, {
      url: '/api/profile/profile-picture/upload', // Mock upload endpoint
      imageUrl: imageUrl,
      fields: {
        key: newFileName,
        'Content-Type': fileType
      }
    }, 'Profile picture upload URL generated successfully'));

  } catch (error) {
    logger.error('Error generating profile picture upload URL', {
      source: 'profileRoutes',
      method: 'getProfilePictureUploadUrl',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to generate profile picture upload URL')
    );
  }
});

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'uploads/profile-pictures');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: any, file: any, cb: any) => {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      cb(new Error('Unauthorized'), '');
      return;
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const newFileName = `profile-picture-${authUser.id}-${uniqueSuffix}${fileExtension}`;
    cb(null, newFileName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Only JPEG and PNG files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// POST /api/profile/profile-picture/upload - Upload profile picture file
router.post('/profile-picture/upload', upload.single('profilePicture') as any, async (req: Request, res: Response) => {
  try {
    const authUser = getUserFromAuth(req);
    if (!authUser) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Unauthorized')
      );
    }

    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'No file uploaded')
      );
    }

    logger.info('Processing profile picture upload', { 
      source: 'profileRoutes', 
      method: 'uploadProfilePicture',
      userId: authUser.id.toString(),
      fileName: req.file.filename,
      fileSize: req.file.size
    });

    // Generate the URL for the uploaded file
    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user's avatar_url in database
    const updatedUser = await prisma.users.update({
      where: { id: authUser.id },
      data: {
        avatar_url: imageUrl,
        updated_at: new Date()
      }
    });

    logger.info('Profile picture uploaded successfully', { 
      source: 'profileRoutes', 
      method: 'uploadProfilePicture',
      userId: authUser.id.toString(),
      imageUrl
    });

    res.json(createApiResponse(true, {
      imageUrl: imageUrl,
      message: 'Profile picture uploaded successfully'
    }, 'Profile picture uploaded successfully'));

  } catch (error) {
    logger.error('Error uploading profile picture', {
      source: 'profileRoutes',
      method: 'uploadProfilePicture',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to upload profile picture')
    );
  }
});

export default router;