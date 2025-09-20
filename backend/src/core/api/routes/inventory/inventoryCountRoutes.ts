import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inventory-counts - Get all inventory counts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, status, count_type, limit = 50, offset = 0 } = req.query;

    const where: any = { deleted_at: null };
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (status) where.status = status;
    if (count_type) where.count_type = count_type;

    const counts = await prisma.inventory_counts.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_counts.count({ where });

    res.json(createApiResponse(true, { counts, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory counts', {
      source: 'inventoryCountRoutes',
      method: 'getInventoryCounts',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory counts')
    );
  }
});

// GET /api/inventory-counts/:id - Get inventory count by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const count = await prisma.inventory_counts.findFirst({
      where: { count_id: id, deleted_at: null }
    });

    if (!count) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory count not found')
      );
    }

    res.json(createApiResponse(true, count));
  } catch (error: any) {
    logger.error('Error retrieving inventory count', {
      source: 'inventoryCountRoutes',
      method: 'getInventoryCountById',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory count')
    );
  }
});

// POST /api/inventory-counts - Create new inventory count
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      count_id,
      warehouse_id,
      count_name,
      count_type,
      status = 'planned',
      start_date,
      end_date,
      expected_completion,
      team_leader,
      count_team,
      count_method,
      count_frequency,
      count_zone,
      count_category,
      variance_threshold,
      priority,
      notes
    } = req.body;
    const userId = req.user?.id;

    const count = await prisma.inventory_counts.create({
      data: {
        count_id,
        warehouse_id,
        count_name,
        count_type,
        status,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        expected_completion: expected_completion ? new Date(expected_completion) : null,
        team_leader,
        count_team,
        count_method,
        count_frequency,
        count_zone,
        count_category,
        variance_threshold,
        priority,
        notes,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, count));
  } catch (error: any) {
    logger.error('Error creating inventory count', {
      source: 'inventoryCountRoutes',
      method: 'createInventoryCount',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create inventory count')
    );
  }
});

// PUT /api/inventory-counts/:id - Update inventory count
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.user?.id?.toString(), updated_at: new Date() };

    const count = await prisma.inventory_counts.update({
      where: { count_id: id },
      data: updateData
    });

    res.json(createApiResponse(true, count));
  } catch (error: any) {
    logger.error('Error updating inventory count', {
      source: 'inventoryCountRoutes',
      method: 'updateInventoryCount',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update inventory count')
    );
  }
});

// DELETE /api/inventory-counts/:id - Delete inventory count
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventory_counts.delete({
      where: { count_id: id }
    });

    res.json(createApiResponse(true, null, 'Inventory count deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting inventory count', {
      source: 'inventoryCountRoutes',
      method: 'deleteInventoryCount',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete inventory count')
    );
  }
});

export default router;