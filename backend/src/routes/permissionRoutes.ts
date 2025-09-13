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
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: integer
 *           description: Permission ID
 *         name:
 *           type: string
 *           description: Permission name
 *         slug:
 *           type: string
 *           description: Permission slug
 *         description:
 *           type: string
 *           description: Permission description
 *         module:
 *           type: string
 *           description: Module name
 *         is_active:
 *           type: boolean
 *           description: Whether permission is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
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
 *                     $ref: '#/components/schemas/Permission'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all permissions', { source: 'permissionRoutes', method: 'GET /' });

    const permissions = await prisma.permissions.findMany({
      where: {
        deleted_at: null
      },
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    });

    logger.info(`Retrieved ${permissions.length} permissions`, { source: 'permissionRoutes', method: 'GET /' });
    res.json(createApiResponse(true, permissions));
  } catch (error) {
    logger.error('Error fetching permissions', {
      source: 'permissionRoutes',
      method: 'GET /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch permissions')
    );
  }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
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
 *         description: Permission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const permissionId = parseInt(req.params.id);
    logger.info(`Fetching permission with ID: ${permissionId}`, { source: 'permissionRoutes', method: 'GET /:id' });

    const permission = await prisma.permissions.findUnique({
      where: {
        id: permissionId,
        deleted_at: null
      }
    });

    if (!permission) {
      logger.warn(`Permission not found: ${permissionId}`, { source: 'permissionRoutes', method: 'GET /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Permission not found')
      );
    }

    logger.info(`Retrieved permission: ${permission.name}`, { source: 'permissionRoutes', method: 'GET /:id' });
    res.json(createApiResponse(true, permission));
  } catch (error) {
    logger.error('Error fetching permission', {
      source: 'permissionRoutes',
      method: 'GET /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch permission')
    );
  }
});

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               module:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Permission created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 */
router.post('/', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, module, is_active = true } = req.body;
    const userId = (req as any).user?.id;

    logger.info(`Creating new permission: ${name}`, {
      source: 'permissionRoutes',
      method: 'POST /',
      userId
    });

    // Check if slug already exists
    const existingPermission = await prisma.permissions.findUnique({
      where: { slug }
    });

    if (existingPermission) {
      logger.warn(`Permission slug already exists: ${slug}`, { source: 'permissionRoutes', method: 'POST /' });
      return res.status(HttpStatus.CONFLICT).json(
        createApiResponse(false, null, 'Permission slug already exists')
      );
    }

    const permission = await prisma.permissions.create({
      data: {
        name,
        slug,
        description,
        module,
        is_active,
        created_by: userId
      }
    });

    logger.info(`Created permission: ${permission.name} (ID: ${permission.id})`, {
      source: 'permissionRoutes',
      method: 'POST /',
      userId
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, permission));
  } catch (error) {
    logger.error('Error creating permission', {
      source: 'permissionRoutes',
      method: 'POST /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create permission')
    );
  }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               module:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Permission updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 */
router.put('/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const permissionId = parseInt(req.params.id);
    const { name, slug, description, module, is_active } = req.body;
    const userId = (req as any).user?.id;

    logger.info(`Updating permission ID: ${permissionId}`, {
      source: 'permissionRoutes',
      method: 'PUT /:id',
      userId
    });

    // Check if permission exists
    const existingPermission = await prisma.permissions.findUnique({
      where: {
        id: permissionId,
        deleted_at: null
      }
    });

    if (!existingPermission) {
      logger.warn(`Permission not found: ${permissionId}`, { source: 'permissionRoutes', method: 'PUT /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Permission not found')
      );
    }

    // Check if slug is being changed and if it conflicts with another permission
    if (slug && slug !== existingPermission.slug) {
      const slugConflict = await prisma.permissions.findUnique({
        where: { slug }
      });

      if (slugConflict) {
        logger.warn(`Permission slug already exists: ${slug}`, { source: 'permissionRoutes', method: 'PUT /:id' });
        return res.status(HttpStatus.CONFLICT).json(
          createApiResponse(false, null, 'Permission slug already exists')
        );
      }
    }

    const permission = await prisma.permissions.update({
      where: { id: permissionId },
      data: {
        name,
        slug,
        description,
        module,
        is_active,
        updated_by: userId
      }
    });

    logger.info(`Updated permission: ${permission.name} (ID: ${permission.id})`, {
      source: 'permissionRoutes',
      method: 'PUT /:id',
      userId
    });

    res.json(createApiResponse(true, permission));
  } catch (error) {
    logger.error('Error updating permission', {
      source: 'permissionRoutes',
      method: 'PUT /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update permission')
    );
  }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
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
 *         description: Permission deleted
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
    const permissionId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    logger.info(`Deleting permission ID: ${permissionId}`, {
      source: 'permissionRoutes',
      method: 'DELETE /:id',
      userId
    });

    // Check if permission exists
    const existingPermission = await prisma.permissions.findUnique({
      where: {
        id: permissionId,
        deleted_at: null
      }
    });

    if (!existingPermission) {
      logger.warn(`Permission not found: ${permissionId}`, { source: 'permissionRoutes', method: 'DELETE /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Permission not found')
      );
    }

    // Soft delete the permission
    await prisma.permissions.update({
      where: { id: permissionId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      }
    });

    logger.info(`Deleted permission: ${existingPermission.name} (ID: ${permissionId})`, {
      source: 'permissionRoutes',
      method: 'DELETE /:id',
      userId
    });

    res.json(createApiResponse(true, null, 'Permission deleted successfully'));
  } catch (error) {
    logger.error('Error deleting permission', {
      source: 'permissionRoutes',
      method: 'DELETE /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete permission')
    );
  }
});

export default router;