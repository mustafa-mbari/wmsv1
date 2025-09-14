/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - name
 *         - first_name
 *         - last_name
 *         - is_active
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: integer
 *           description: User unique identifier
 *           example: 1
 *         username:
 *           type: string
 *           description: Unique username
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john.doe@example.com"
 *         name:
 *           type: string
 *           description: Full name (first + last)
 *           example: "John Doe"
 *         first_name:
 *           type: string
 *           description: User first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User last name
 *           example: "Doe"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: User phone number
 *           example: "+1234567890"
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           description: Profile picture URL
 *           example: "/uploads/profile-pictures/avatar-1-123456789.jpg"
 *         language:
 *           type: string
 *           description: User preferred language
 *           example: "en"
 *         timeZone:
 *           type: string
 *           description: User timezone
 *           example: "UTC"
 *         is_active:
 *           type: boolean
 *           description: Account status
 *           example: true
 *         email_verified:
 *           type: boolean
 *           description: Email verification status
 *           example: true
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Email verification timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last login timestamp
 *           example: "2024-01-15T14:20:00Z"
 *         last_password_change:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last password change timestamp
 *           example: "2024-01-10T09:15:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2024-01-01T00:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last profile update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         role_names:
 *           type: array
 *           items:
 *             type: string
 *           description: User role names
 *           example: ["admin", "manager"]
 *         role_slugs:
 *           type: array
 *           items:
 *             type: string
 *           description: User role slugs
 *           example: ["admin", "manager"]
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Full name (will be split into first and last name)
 *           example: "John Smith"
 *         username:
 *           type: string
 *           description: Unique username
 *           example: "johnsmith"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john.smith@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: User phone number
 *           example: "+1987654321"
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           description: Profile picture URL
 *           example: "/uploads/profile-pictures/avatar-1-987654321.jpg"
 *         language:
 *           type: string
 *           description: User preferred language
 *           example: "es"
 *         timeZone:
 *           type: string
 *           description: User timezone
 *           example: "America/New_York"
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Current password for verification
 *           example: "currentpass123"
 *         newPassword:
 *           type: string
 *           format: password
 *           description: New password (minimum 8 characters)
 *           example: "newpassword123"
 *     AvatarUploadResponse:
 *       type: object
 *       properties:
 *         avatarUrl:
 *           type: string
 *           description: URL of the uploaded avatar
 *           example: "/uploads/profile-pictures/avatar-1-123456789.jpg"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             username:
 *               type: string
 *               example: "johndoe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             profilePicture:
 *               type: string
 *               nullable: true
 *               example: "/uploads/profile-pictures/avatar-1-123456789.jpg"
 */

import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared'
import logger from '../../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user profile
 *     description: Retrieve the complete profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {

    logger.info('Fetching current user profile', { 
      source: 'profileRoutes', 
      method: 'getProfile',
      userId: req.user!.id.toString()
    });
    
    const user = await prisma.users.findUnique({
      where: { 
        id: parseInt(req.user!.id.toString())
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
        userId: req.user!.id.toString()
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
      userId: req.user!.id.toString(),
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

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update current user profile
 *     description: Update profile information for the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             update_profile:
 *               value:
 *                 name: "John Smith"
 *                 username: "johnsmith"
 *                 email: "john.smith@example.com"
 *                 phone: "+1987654321"
 *                 language: "es"
 *                 timeZone: "America/New_York"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "User with this email or username already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/', authenticateToken, async (req: Request, res: Response) => {
  try {

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
      userId: req.user!.id.toString()
    });

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { 
        id: parseInt(req.user!.id.toString())
      }
    });

    if (!existingUser) {
      logger.warn('Profile update failed: user not found', { 
        source: 'profileRoutes', 
        method: 'updateProfile',
        userId: req.user!.id.toString()
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
          id: { not: parseInt(req.user!.id.toString()) }
        }
      });

      if (conflictUser) {
        logger.warn('Profile update failed: email or username already exists', { 
          source: 'profileRoutes', 
          method: 'updateProfile',
          userId: req.user!.id.toString(),
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
      where: { id: parseInt(req.user!.id.toString()) },
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
      userId: req.user!.id.toString(),
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

/**
 * @swagger
 * /api/profile/password:
 *   post:
 *     tags: [Profile]
 *     summary: Change user password
 *     description: Change the password for the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           examples:
 *             change_password:
 *               value:
 *                 currentPassword: "currentpass123"
 *                 newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Password changed successfully"
 *       400:
 *         description: Bad request - Invalid current password or weak new password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_current_password:
 *                 value:
 *                   success: false
 *                   data: null
 *                   message: "Current password is incorrect"
 *               weak_password:
 *                 value:
 *                   success: false
 *                   data: null
 *                   message: "New password must be at least 8 characters long"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/password', authenticateToken, async (req: Request, res: Response) => {
  try {

    const { currentPassword, newPassword } = req.body;

    logger.info('Changing password for current user', { 
      source: 'profileRoutes', 
      method: 'changePassword',
      userId: req.user!.id.toString()
    });

    if (!currentPassword || !newPassword) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Current password and new password are required')
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(req.user!.id.toString()) }
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
        userId: req.user!.id.toString()
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
      where: { id: parseInt(req.user!.id.toString()) },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date()
      }
    });

    logger.info('Password changed successfully', { 
      source: 'profileRoutes', 
      method: 'changePassword',
      userId: req.user!.id.toString()
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
    if (!req.user) {
      cb(new Error('Unauthorized'), '');
      return;
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const newFileName = `avatar-${req.user.id}-${uniqueSuffix}${fileExtension}`;
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

/**
 * @swagger
 * /api/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload profile picture
 *     description: Upload a new profile picture for the currently authenticated user (JPEG/PNG, max 5MB)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file (JPEG/PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AvatarUploadResponse'
 *                 message:
 *                   type: string
 *                   example: "Avatar uploaded successfully"
 *       400:
 *         description: Bad request - No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               no_file:
 *                 value:
 *                   success: false
 *                   data: null
 *                   message: "No file uploaded"
 *               invalid_type:
 *                 value:
 *                   success: false
 *                   data: null
 *                   message: "Only JPEG and PNG files are allowed"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       413:
 *         description: Payload too large - File size exceeds 5MB limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/avatar', authenticateToken, upload.single('avatar') as any, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'No file uploaded')
      );
    }

    logger.info('Processing avatar upload', { 
      source: 'profileRoutes', 
      method: 'uploadAvatar',
      userId: req.user!.id.toString(),
      fileName: req.file.filename,
      fileSize: req.file.size
    });

    // Delete old avatar file if it exists
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(req.user!.id.toString()) }
    });

    if (existingUser?.avatar_url) {
      try {
        const oldFilePath = path.join(process.cwd(), existingUser.avatar_url.substring(1)); // Remove leading slash
        await fs.unlink(oldFilePath);
        logger.info('Old avatar file deleted', { 
          source: 'profileRoutes', 
          method: 'uploadAvatar',
          userId: req.user!.id.toString(),
          oldFile: oldFilePath
        });
      } catch (error) {
        logger.warn('Failed to delete old avatar file', { 
          source: 'profileRoutes', 
          method: 'uploadAvatar',
          userId: req.user!.id.toString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Generate the URL for the uploaded file
    const avatarUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user's avatar_url in database
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(req.user!.id.toString()) },
      data: {
        avatar_url: avatarUrl,
        updated_at: new Date()
      }
    });

    logger.info('Avatar uploaded successfully', { 
      source: 'profileRoutes', 
      method: 'uploadAvatar',
      userId: req.user!.id.toString(),
      avatarUrl
    });

    res.json(createApiResponse(true, {
      avatarUrl: avatarUrl,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        profilePicture: updatedUser.avatar_url
      }
    }, 'Avatar uploaded successfully'));

  } catch (error) {
    logger.error('Error uploading avatar', {
      source: 'profileRoutes',
      method: 'uploadAvatar',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Clean up uploaded file if database update failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to clean up uploaded file after error', {
          source: 'profileRoutes',
          method: 'uploadAvatar',
          error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error'
        });
      }
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to upload avatar')
    );
  }
});

/**
 * @swagger
 * /api/profile/avatar:
 *   delete:
 *     tags: [Profile]
 *     summary: Remove profile picture
 *     description: Remove the current profile picture for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         profilePicture:
 *                           type: null
 *                           example: null
 *                 message:
 *                   type: string
 *                   example: "Avatar removed successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/avatar', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Removing avatar', { 
      source: 'profileRoutes', 
      method: 'removeAvatar',
      userId: req.user!.id.toString()
    });

    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(req.user!.id.toString()) }
    });

    if (!existingUser) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Delete avatar file if it exists
    if (existingUser.avatar_url) {
      try {
        const filePath = path.join(process.cwd(), existingUser.avatar_url.substring(1)); // Remove leading slash
        await fs.unlink(filePath);
        logger.info('Avatar file deleted', { 
          source: 'profileRoutes', 
          method: 'removeAvatar',
          userId: req.user!.id.toString(),
          filePath
        });
      } catch (error) {
        logger.warn('Failed to delete avatar file', { 
          source: 'profileRoutes', 
          method: 'removeAvatar',
          userId: req.user!.id.toString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update user's avatar_url to null in database
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(req.user!.id.toString()) },
      data: {
        avatar_url: null,
        updated_at: new Date()
      }
    });

    logger.info('Avatar removed successfully', { 
      source: 'profileRoutes', 
      method: 'removeAvatar',
      userId: req.user!.id.toString()
    });

    res.json(createApiResponse(true, {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        profilePicture: null
      }
    }, 'Avatar removed successfully'));

  } catch (error) {
    logger.error('Error removing avatar', {
      source: 'profileRoutes',
      method: 'removeAvatar',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to remove avatar')
    );
  }
});

export default router;