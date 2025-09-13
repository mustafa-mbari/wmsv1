import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       required:
 *         - user_id
 *         - role_id
 *       properties:
 *         id:
 *           type: integer
 *           description: User Role ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 *         assigned_at:
 *           type: string
 *           format: date-time
 *         assigned_by:
 *           type: integer
 *           description: ID of user who assigned the role
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *         role:
 *           $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /api/user-roles:
 *   get:
 *     summary: Get all user-role assignments
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user-role assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all user-role assignments', { source: 'userRoleRoutes', method: 'GET /' });

    const userRoles = await prisma.user_roles.findMany({
      where: {
        deleted_at: null
      },
      include: {
        users_user_roles_user_idTousers: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { users_user_roles_user_idTousers: { username: 'asc' } },
        { roles: { name: 'asc' } }
      ]
    });

    // Transform the data to use cleaner property names
    const transformedUserRoles = userRoles.map(ur => ({
      id: ur.id,
      user_id: ur.user_id,
      role_id: ur.role_id,
      assigned_at: ur.assigned_at,
      assigned_by: ur.assigned_by,
      created_at: ur.created_at,
      updated_at: ur.updated_at,
      user: ur.users_user_roles_user_idTousers,
      role: ur.roles
    }));

    logger.info(`Retrieved ${userRoles.length} user-role assignments`, { source: 'userRoleRoutes', method: 'GET /' });
    res.json(createApiResponse(true, transformedUserRoles));
  } catch (error) {
    logger.error('Error fetching user-role assignments', {
      source: 'userRoleRoutes',
      method: 'GET /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch user-role assignments')
    );
  }
});

/**
 * @swagger
 * /api/user-roles/{id}:
 *   get:
 *     summary: Get user-role assignment by ID
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User-role assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRoleId = parseInt(req.params.id);
    logger.info(`Fetching user-role assignment with ID: ${userRoleId}`, { source: 'userRoleRoutes', method: 'GET /:id' });

    const userRole = await prisma.user_roles.findUnique({
      where: {
        id: userRoleId,
        deleted_at: null
      },
      include: {
        users_user_roles_user_idTousers: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!userRole) {
      logger.warn(`User-role assignment not found: ${userRoleId}`, { source: 'userRoleRoutes', method: 'GET /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User-role assignment not found')
      );
    }

    // Transform the data to use cleaner property names
    const transformedUserRole = {
      id: userRole.id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
      assigned_at: userRole.assigned_at,
      assigned_by: userRole.assigned_by,
      created_at: userRole.created_at,
      updated_at: userRole.updated_at,
      user: userRole.users_user_roles_user_idTousers,
      role: userRole.roles
    };

    logger.info(`Retrieved user-role assignment: ${userRole.users_user_roles_user_idTousers.username} - ${userRole.roles.name}`, { source: 'userRoleRoutes', method: 'GET /:id' });
    res.json(createApiResponse(true, transformedUserRole));
  } catch (error) {
    logger.error('Error fetching user-role assignment', {
      source: 'userRoleRoutes',
      method: 'GET /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch user-role assignment')
    );
  }
});

/**
 * @swagger
 * /api/user-roles:
 *   post:
 *     summary: Create new user-role assignment
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               role_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User-role assignment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 */
router.post('/', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { user_id, role_id } = req.body;
    const assignedBy = (req as any).user?.id;

    logger.info(`Creating new user-role assignment: User ${user_id} - Role ${role_id}`, {
      source: 'userRoleRoutes',
      method: 'POST /',
      assignedBy
    });

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: user_id, deleted_at: null }
    });

    if (!user) {
      logger.warn(`User not found: ${user_id}`, { source: 'userRoleRoutes', method: 'POST /' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User not found')
      );
    }

    // Verify role exists
    const role = await prisma.roles.findUnique({
      where: { id: role_id, deleted_at: null }
    });

    if (!role) {
      logger.warn(`Role not found: ${role_id}`, { source: 'userRoleRoutes', method: 'POST /' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role not found')
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.user_roles.findUnique({
      where: {
        user_id_role_id: {
          user_id,
          role_id
        }
      }
    });

    if (existingAssignment) {
      logger.warn(`User-role assignment already exists: User ${user_id} - Role ${role_id}`, { source: 'userRoleRoutes', method: 'POST /' });
      return res.status(HttpStatus.CONFLICT).json(
        createApiResponse(false, null, 'User-role assignment already exists')
      );
    }

    const userRole = await prisma.user_roles.create({
      data: {
        user_id,
        role_id,
        assigned_at: new Date(),
        assigned_by: assignedBy,
        created_by: assignedBy
      },
      include: {
        users_user_roles_user_idTousers: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Transform the data to use cleaner property names
    const transformedUserRole = {
      id: userRole.id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
      assigned_at: userRole.assigned_at,
      assigned_by: userRole.assigned_by,
      created_at: userRole.created_at,
      updated_at: userRole.updated_at,
      user: userRole.users_user_roles_user_idTousers,
      role: userRole.roles
    };

    logger.info(`Created user-role assignment: ${userRole.users_user_roles_user_idTousers.username} - ${userRole.roles.name} (ID: ${userRole.id})`, {
      source: 'userRoleRoutes',
      method: 'POST /',
      assignedBy
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, transformedUserRole));
  } catch (error) {
    logger.error('Error creating user-role assignment', {
      source: 'userRoleRoutes',
      method: 'POST /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create user-role assignment')
    );
  }
});

/**
 * @swagger
 * /api/user-roles/{id}:
 *   delete:
 *     summary: Delete user-role assignment
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User-role assignment deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const userRoleId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    logger.info(`Deleting user-role assignment ID: ${userRoleId}`, {
      source: 'userRoleRoutes',
      method: 'DELETE /:id',
      userId
    });

    // Check if user-role assignment exists
    const existingUserRole = await prisma.user_roles.findUnique({
      where: {
        id: userRoleId,
        deleted_at: null
      },
      include: {
        users_user_roles_user_idTousers: { select: { username: true } },
        roles: { select: { name: true } }
      }
    });

    if (!existingUserRole) {
      logger.warn(`User-role assignment not found: ${userRoleId}`, { source: 'userRoleRoutes', method: 'DELETE /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'User-role assignment not found')
      );
    }

    // Soft delete the user-role assignment
    await prisma.user_roles.update({
      where: { id: userRoleId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      }
    });

    logger.info(`Deleted user-role assignment: ${existingUserRole.users_user_roles_user_idTousers.username} - ${existingUserRole.roles.name} (ID: ${userRoleId})`, {
      source: 'userRoleRoutes',
      method: 'DELETE /:id',
      userId
    });

    res.json(createApiResponse(true, null, 'User-role assignment deleted successfully'));
  } catch (error) {
    logger.error('Error deleting user-role assignment', {
      source: 'userRoleRoutes',
      method: 'DELETE /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete user-role assignment')
    );
  }
});

export default router;