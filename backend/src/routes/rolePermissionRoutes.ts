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
 *     RolePermission:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Role Permission ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         permission:
 *           $ref: '#/components/schemas/Permission'
 */

/**
 * @swagger
 * /api/role-permissions:
 *   get:
 *     summary: Get all role-permission assignments
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of role-permission assignments
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
 *                     $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all role-permission assignments', { source: 'rolePermissionRoutes', method: 'GET /' });

    const rolePermissions = await prisma.role_permissions.findMany({
      where: {
        deleted_at: null
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        permissions: {
          select: {
            id: true,
            name: true,
            slug: true,
            module: true
          }
        }
      },
      orderBy: [
        { roles: { name: 'asc' } },
        { permissions: { name: 'asc' } }
      ]
    });

    logger.info(`Retrieved ${rolePermissions.length} role-permission assignments`, { source: 'rolePermissionRoutes', method: 'GET /' });
    res.json(createApiResponse(true, rolePermissions));
  } catch (error) {
    logger.error('Error fetching role-permission assignments', {
      source: 'rolePermissionRoutes',
      method: 'GET /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch role-permission assignments')
    );
  }
});

/**
 * @swagger
 * /api/role-permissions/{id}:
 *   get:
 *     summary: Get role-permission assignment by ID
 *     tags: [Role Permissions]
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
 *         description: Role-permission assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const rolePermissionId = parseInt(req.params.id);
    logger.info(`Fetching role-permission assignment with ID: ${rolePermissionId}`, { source: 'rolePermissionRoutes', method: 'GET /:id' });

    const rolePermission = await prisma.role_permissions.findUnique({
      where: {
        id: rolePermissionId,
        deleted_at: null
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        permissions: {
          select: {
            id: true,
            name: true,
            slug: true,
            module: true
          }
        }
      }
    });

    if (!rolePermission) {
      logger.warn(`Role-permission assignment not found: ${rolePermissionId}`, { source: 'rolePermissionRoutes', method: 'GET /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role-permission assignment not found')
      );
    }

    logger.info(`Retrieved role-permission assignment: ${rolePermission.roles.name} - ${rolePermission.permissions.name}`, { source: 'rolePermissionRoutes', method: 'GET /:id' });
    res.json(createApiResponse(true, rolePermission));
  } catch (error) {
    logger.error('Error fetching role-permission assignment', {
      source: 'rolePermissionRoutes',
      method: 'GET /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch role-permission assignment')
    );
  }
});

/**
 * @swagger
 * /api/role-permissions:
 *   post:
 *     summary: Create new role-permission assignment
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - permission_id
 *             properties:
 *               role_id:
 *                 type: integer
 *               permission_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Role-permission assignment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Role or Permission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Assignment already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { role_id, permission_id } = req.body;
    const userId = (req as any).user?.id;

    logger.info(`Creating new role-permission assignment: Role ${role_id} - Permission ${permission_id}`, {
      source: 'rolePermissionRoutes',
      method: 'POST /',
      userId
    });

    // Verify role exists
    const role = await prisma.roles.findUnique({
      where: { id: role_id, deleted_at: null }
    });

    if (!role) {
      logger.warn(`Role not found: ${role_id}`, { source: 'rolePermissionRoutes', method: 'POST /' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role not found')
      );
    }

    // Verify permission exists
    const permission = await prisma.permissions.findUnique({
      where: { id: permission_id, deleted_at: null }
    });

    if (!permission) {
      logger.warn(`Permission not found: ${permission_id}`, { source: 'rolePermissionRoutes', method: 'POST /' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Permission not found')
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.role_permissions.findUnique({
      where: {
        role_id_permission_id: {
          role_id,
          permission_id
        }
      }
    });

    if (existingAssignment) {
      logger.warn(`Role-permission assignment already exists: Role ${role_id} - Permission ${permission_id}`, { source: 'rolePermissionRoutes', method: 'POST /' });
      return res.status(HttpStatus.CONFLICT).json(
        createApiResponse(false, null, 'Role-permission assignment already exists')
      );
    }

    const rolePermission = await prisma.role_permissions.create({
      data: {
        role_id,
        permission_id,
        created_by: userId
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        permissions: {
          select: {
            id: true,
            name: true,
            slug: true,
            module: true
          }
        }
      }
    });

    logger.info(`Created role-permission assignment: ${rolePermission.roles.name} - ${rolePermission.permissions.name} (ID: ${rolePermission.id})`, {
      source: 'rolePermissionRoutes',
      method: 'POST /',
      userId
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, rolePermission));
  } catch (error) {
    logger.error('Error creating role-permission assignment', {
      source: 'rolePermissionRoutes',
      method: 'POST /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create role-permission assignment')
    );
  }
});

/**
 * @swagger
 * /api/role-permissions/{id}:
 *   delete:
 *     summary: Delete role-permission assignment
 *     tags: [Role Permissions]
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
 *         description: Role-permission assignment deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const rolePermissionId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    logger.info(`Deleting role-permission assignment ID: ${rolePermissionId}`, {
      source: 'rolePermissionRoutes',
      method: 'DELETE /:id',
      userId
    });

    // Check if role-permission assignment exists
    const existingRolePermission = await prisma.role_permissions.findUnique({
      where: {
        id: rolePermissionId,
        deleted_at: null
      },
      include: {
        roles: { select: { name: true } },
        permissions: { select: { name: true } }
      }
    });

    if (!existingRolePermission) {
      logger.warn(`Role-permission assignment not found: ${rolePermissionId}`, { source: 'rolePermissionRoutes', method: 'DELETE /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role-permission assignment not found')
      );
    }

    // Soft delete the role-permission assignment
    await prisma.role_permissions.update({
      where: { id: rolePermissionId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      }
    });

    logger.info(`Deleted role-permission assignment: ${existingRolePermission.roles.name} - ${existingRolePermission.permissions.name} (ID: ${rolePermissionId})`, {
      source: 'rolePermissionRoutes',
      method: 'DELETE /:id',
      userId
    });

    res.json(createApiResponse(true, null, 'Role-permission assignment deleted successfully'));
  } catch (error) {
    logger.error('Error deleting role-permission assignment', {
      source: 'rolePermissionRoutes',
      method: 'DELETE /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete role-permission assignment')
    );
  }
});

export default router;