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
 *     Role:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: integer
 *           description: Role ID
 *         name:
 *           type: string
 *           description: Role name
 *         slug:
 *           type: string
 *           description: Role slug
 *         description:
 *           type: string
 *           description: Role description
 *         is_active:
 *           type: boolean
 *           description: Whether role is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
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
 *                     $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all roles', { source: 'roleRoutes', method: 'GET /' });

    const roles = await prisma.roles.findMany({
      where: {
        deleted_at: null
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Retrieved ${roles.length} roles`, { source: 'roleRoutes', method: 'GET /' });
    res.json(createApiResponse(true, roles));
  } catch (error) {
    logger.error('Error fetching roles', {
      source: 'roleRoutes',
      method: 'GET /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch roles')
    );
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
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
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    logger.info(`Fetching role with ID: ${roleId}`, { source: 'roleRoutes', method: 'GET /:id' });

    const role = await prisma.roles.findUnique({
      where: {
        id: roleId,
        deleted_at: null
      }
    });

    if (!role) {
      logger.warn(`Role not found: ${roleId}`, { source: 'roleRoutes', method: 'GET /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role not found')
      );
    }

    logger.info(`Retrieved role: ${role.name}`, { source: 'roleRoutes', method: 'GET /:id' });
    res.json(createApiResponse(true, role));
  } catch (error) {
    logger.error('Error fetching role', {
      source: 'roleRoutes',
      method: 'GET /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch role')
    );
  }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create new role
 *     tags: [Roles]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - Role slug already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, is_active = true } = req.body;
    const userId = (req as any).user?.id;

    logger.info(`Creating new role: ${name}`, {
      source: 'roleRoutes',
      method: 'POST /',
      userId
    });

    // Check if slug already exists
    const existingRole = await prisma.roles.findUnique({
      where: { slug }
    });

    if (existingRole) {
      logger.warn(`Role slug already exists: ${slug}`, { source: 'roleRoutes', method: 'POST /' });
      return res.status(HttpStatus.CONFLICT).json(
        createApiResponse(false, null, 'Role slug already exists')
      );
    }

    const role = await prisma.roles.create({
      data: {
        name,
        slug,
        description,
        is_active,
        created_by: userId
      }
    });

    logger.info(`Created role: ${role.name} (ID: ${role.id})`, {
      source: 'roleRoutes',
      method: 'POST /',
      userId
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, role));
  } catch (error) {
    logger.error('Error creating role', {
      source: 'roleRoutes',
      method: 'POST /',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create role')
    );
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Role slug already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const { name, slug, description, is_active } = req.body;
    const userId = (req as any).user?.id;

    logger.info(`Updating role ID: ${roleId}`, {
      source: 'roleRoutes',
      method: 'PUT /:id',
      userId
    });

    // Check if role exists
    const existingRole = await prisma.roles.findUnique({
      where: {
        id: roleId,
        deleted_at: null
      }
    });

    if (!existingRole) {
      logger.warn(`Role not found: ${roleId}`, { source: 'roleRoutes', method: 'PUT /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role not found')
      );
    }

    // Check if slug is being changed and if it conflicts with another role
    if (slug && slug !== existingRole.slug) {
      const slugConflict = await prisma.roles.findUnique({
        where: { slug }
      });

      if (slugConflict) {
        logger.warn(`Role slug already exists: ${slug}`, { source: 'roleRoutes', method: 'PUT /:id' });
        return res.status(HttpStatus.CONFLICT).json(
          createApiResponse(false, null, 'Role slug already exists')
        );
      }
    }

    const role = await prisma.roles.update({
      where: { id: roleId },
      data: {
        name,
        slug,
        description,
        is_active,
        updated_by: userId
      }
    });

    logger.info(`Updated role: ${role.name} (ID: ${role.id})`, {
      source: 'roleRoutes',
      method: 'PUT /:id',
      userId
    });

    res.json(createApiResponse(true, role));
  } catch (error) {
    logger.error('Error updating role', {
      source: 'roleRoutes',
      method: 'PUT /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update role')
    );
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
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
 *         description: Role deleted
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
    const roleId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    logger.info(`Deleting role ID: ${roleId}`, {
      source: 'roleRoutes',
      method: 'DELETE /:id',
      userId
    });

    // Check if role exists
    const existingRole = await prisma.roles.findUnique({
      where: {
        id: roleId,
        deleted_at: null
      }
    });

    if (!existingRole) {
      logger.warn(`Role not found: ${roleId}`, { source: 'roleRoutes', method: 'DELETE /:id' });
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Role not found')
      );
    }

    // Soft delete the role
    await prisma.roles.update({
      where: { id: roleId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      }
    });

    logger.info(`Deleted role: ${existingRole.name} (ID: ${roleId})`, {
      source: 'roleRoutes',
      method: 'DELETE /:id',
      userId
    });

    res.json(createApiResponse(true, null, 'Role deleted successfully'));
  } catch (error) {
    logger.error('Error deleting role', {
      source: 'roleRoutes',
      method: 'DELETE /:id',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete role')
    );
  }
});

export default router;