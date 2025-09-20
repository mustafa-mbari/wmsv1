import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/class-types - Get all class types
router.get('/', authenticateToken, async (req, res) => {
  try {
    const classTypes = await prisma.class_types.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' }
    });

    logger.info('Class types retrieved successfully', {
      source: 'classTypeRoutes',
      method: 'getClassTypes',
      count: classTypes.length
    });

    res.json(createApiResponse(true, classTypes));
  } catch (error: any) {
    logger.error('Error retrieving class types', {
      source: 'classTypeRoutes',
      method: 'getClassTypes',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve class types')
    );
  }
});

// GET /api/class-types/:id - Get class type by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const classType = await prisma.class_types.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null
      }
    });

    if (!classType) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Class type not found')
      );
    }

    logger.info('Class type retrieved successfully', {
      source: 'classTypeRoutes',
      method: 'getClassTypeById',
      classTypeId: id
    });

    res.json(createApiResponse(true, classType));
  } catch (error: any) {
    logger.error('Error retrieving class type', {
      source: 'classTypeRoutes',
      method: 'getClassTypeById',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve class type')
    );
  }
});

// POST /api/class-types - Create new class type
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const classType = await prisma.class_types.create({
      data: {
        name,
        description,
        is_active: is_active ?? true,
        created_by: userId,
        updated_by: userId
      }
    });

    logger.info('Class type created successfully', {
      source: 'classTypeRoutes',
      method: 'createClassType',
      classTypeId: classType.id,
      userId: userId?.toString()
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, classType));
  } catch (error: any) {
    logger.error('Error creating class type', {
      source: 'classTypeRoutes',
      method: 'createClassType',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create class type')
    );
  }
});

// PUT /api/class-types/:id - Update class type
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingClassType = await prisma.class_types.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null
      }
    });

    if (!existingClassType) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Class type not found')
      );
    }

    const classType = await prisma.class_types.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        is_active,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    logger.info('Class type updated successfully', {
      source: 'classTypeRoutes',
      method: 'updateClassType',
      classTypeId: id,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, classType));
  } catch (error: any) {
    logger.error('Error updating class type', {
      source: 'classTypeRoutes',
      method: 'updateClassType',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update class type')
    );
  }
});

// DELETE /api/class-types/:id - Delete class type
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingClassType = await prisma.class_types.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null
      }
    });

    if (!existingClassType) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Class type not found')
      );
    }

    await prisma.class_types.delete({
      where: { id: parseInt(id) }
    });

    logger.info('Class type deleted successfully', {
      source: 'classTypeRoutes',
      method: 'deleteClassType',
      classTypeId: id,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, null, 'Class type deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting class type', {
      source: 'classTypeRoutes',
      method: 'deleteClassType',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete class type')
    );
  }
});

export default router;