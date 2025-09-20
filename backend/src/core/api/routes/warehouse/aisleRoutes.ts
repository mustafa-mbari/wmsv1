import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/aisles - Get all aisles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { zone_id, is_active, limit = 50, offset = 0 } = req.query;

    const where: any = { deleted_at: null };
    if (zone_id) where.zone_id = zone_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const aisles = await prisma.aisles.findMany({
      where,
      orderBy: { aisle_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.aisles.count({ where });

    res.json(createApiResponse(true, { aisles, total }));
  } catch (error: any) {
    logger.error('Error retrieving aisles', {
      source: 'aisleRoutes',
      method: 'getAisles',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve aisles')
    );
  }
});

// GET /api/aisles/:id - Get aisle by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const aisle = await prisma.aisles.findFirst({
      where: { aisle_id: id, deleted_at: null }
    });

    if (!aisle) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Aisle not found')
      );
    }

    res.json(createApiResponse(true, aisle));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve aisle')
    );
  }
});

// POST /api/aisles - Create new aisle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const aisle = await prisma.aisles.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, aisle));
  } catch (error: any) {
    logger.error('Error creating aisle', {
      source: 'aisleRoutes',
      method: 'createAisle',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create aisle')
    );
  }
});

// PUT /api/aisles/:id - Update aisle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const aisle = await prisma.aisles.update({
      where: { aisle_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, aisle));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update aisle')
    );
  }
});

// DELETE /api/aisles/:id - Delete aisle
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.aisles.delete({
      where: { aisle_id: id }
    });

    res.json(createApiResponse(true, null, 'Aisle deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete aisle')
    );
  }
});

export default router;