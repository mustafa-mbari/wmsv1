import { Router, Request, Response } from 'express';
import { LoginDto, createApiResponse, HttpStatus, validateEmail } from '@my-app/shared'
import logger from '../../../../utils/logger/logger';
import prisma from '../../../../utils/prismaClient';
import bcrypt from 'bcryptjs'; // or 'bcrypt' depending on your bcrypt version
import { generateToken, authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: admin@wms.com
 *         password:
 *           type: string
 *           format: password
 *           description: User password (minimum 6 characters)
 *           example: admin123
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User unique identifier
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User email address
 *                 username:
 *                   type: string
 *                   description: Username
 *                 name:
 *                   type: string
 *                   description: Full name
 *                 first_name:
 *                   type: string
 *                   description: First name
 *                 last_name:
 *                   type: string
 *                   description: Last name
 *                 profilePicture:
 *                   type: string
 *                   nullable: true
 *                   description: Profile picture URL
 *                 is_active:
 *                   type: boolean
 *                   description: Account status
 *                 role_names:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: User roles
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *             token:
 *               type: string
 *               description: JWT authentication token
 *         message:
 *           type: string
 *           example: Login successful
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john@example.com
 *         firstName:
 *           type: string
 *           description: First name
 *           example: John
 *         lastName:
 *           type: string
 *           description: Last name
 *           example: Doe
 *         phone:
 *           type: string
 *           description: Phone number
 *           example: "+1234567890"
 *           nullable: true
 *         address:
 *           type: string
 *           description: Address
 *           example: "123 Main St, City, State"
 *           nullable: true
 *         password:
 *           type: string
 *           format: password
 *           description: Password (minimum 6 characters)
 *           example: password123
 *         isActive:
 *           type: boolean
 *           description: Account status
 *           example: true
 *           default: true
 *         isAdmin:
 *           type: boolean
 *           description: Admin privileges
 *           example: false
 *           default: false
 *
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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
        
        // Generate JWT token
        const token = generateToken({
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          role_names: roleNames
        });

        // Create clean user object for response
        const userResponse = {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`.trim(),
          first_name: user.first_name,
          last_name: user.last_name,
          profilePicture: user.avatar_url,
          is_active: user.is_active,
          role_names: roleNames,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
        
        logger.info('Login successful', { source: 'authRoutes', method: 'login', email, userId: user.id.toString() });
        return res.json(createApiResponse(true, { user: userResponse, token }, 'Login successful'));
      }
    }
  } catch (dbError) {
    logger.error('Database error during login', { source: 'authRoutes', method: 'login', error: dbError instanceof Error ? dbError.message : String(dbError) });
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createApiResponse(false, null, 'Internal server error'));
  }

  // No fallback authentication - only use database users

  logger.warn('Login failed: invalid credentials', { source: 'authRoutes', method: 'login', email });
  res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(false, null, 'Invalid credentials'));
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/auth/me - Get current authenticated user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  logger.info('Auth me request', { source: 'authRoutes', method: 'me', userId: req.user?.id });
  
  try {
    const user = await prisma.users.findUnique({ 
      where: { id: parseInt(req.user!.id) },
      include: {
        user_roles_user_roles_user_idTousers: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user) {
      logger.warn('Auth me failed: user not found', { source: 'authRoutes', method: 'me', userId: req.user?.id });
      return res.status(HttpStatus.NOT_FOUND).json(createApiResponse(false, null, 'User not found'));
    }

    // Create clean user object for response with profile picture support
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      profilePicture: user.avatar_url,
      is_active: user.is_active,
      role_names: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug),
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    logger.info('Auth me successful', { source: 'authRoutes', method: 'me', userId: user.id.toString() });
    return res.json(createApiResponse(true, { user: userResponse }, 'User retrieved successfully'));
  } catch (error: any) {
    logger.error('Auth me database error', { source: 'authRoutes', method: 'me', error: error.message, userId: req.user?.id });
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createApiResponse(false, null, 'Internal server error'));
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new user account with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: User with this email or username already exists
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
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

    logger.info('User registration attempt', { 
      source: 'authRoutes', 
      method: 'register',
      email,
      username
    });

    // Validation
    if (!username || !email || !firstName || !lastName || !password) {
      logger.warn('Registration failed: missing required fields', { 
        source: 'authRoutes', 
        method: 'register',
        email: email || 'undefined',
        username: username || 'undefined'
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Username, email, first name, last name, and password are required')
      );
    }

    if (!validateEmail(email)) {
      logger.warn('Registration failed: invalid email format', { 
        source: 'authRoutes', 
        method: 'register', 
        email 
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Invalid email format')
      );
    }

    if (password.length < 6) {
      logger.warn('Registration failed: password too short', { 
        source: 'authRoutes', 
        method: 'register', 
        email 
      });
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'Password must be at least 6 characters long')
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ],
        deleted_at: null
      }
    });

    if (existingUser) {
      logger.warn('Registration failed: user already exists', { 
        source: 'authRoutes', 
        method: 'register',
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

    // Generate JWT token for the new user
    const token = generateToken({
      id: newUser.id.toString(),
      email: newUser.email,
      username: newUser.username,
      role_names: [] // New users have no roles initially
    });

    // Create clean user object for response (no password hash)
    const userResponse = {
      id: newUser.id.toString(),
      email: newUser.email,
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      is_active: newUser.is_active,
      role_names: [], // New users have no roles initially
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };

    logger.info('User registered successfully', { 
      source: 'authRoutes', 
      method: 'register',
      userId: newUser.id.toString(),
      email: newUser.email
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, { user: userResponse, token }, 'User registered successfully')
    );
  } catch (error) {
    logger.error('Error during user registration', {
      source: 'authRoutes',
      method: 'register',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to register user')
    );
  }
});

export default router;