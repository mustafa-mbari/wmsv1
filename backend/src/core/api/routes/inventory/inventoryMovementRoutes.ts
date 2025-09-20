import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inventory-movements - Get all inventory movements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { inventory_id, movement_type, status, limit = 50, offset = 0 } = req.query;

    const where: any = { deleted_at: null };
    if (inventory_id) where.inventory_id = inventory_id;
    if (movement_type) where.movement_type = movement_type;
    if (status) where.approval_status = status;

    const movements = await prisma.inventory_movements.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_movements.count({ where });

    res.json(createApiResponse(true, { movements, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory movements', {
      source: 'inventoryMovementRoutes',
      method: 'getInventoryMovements',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory movements')
    );
  }
});

// POST /api/inventory-movements - Create new inventory movement
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const movement = await prisma.inventory_movements.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, movement));
  } catch (error: any) {
    logger.error('Error creating inventory movement', {
      source: 'inventoryMovementRoutes',
      method: 'createInventoryMovement',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create inventory movement')
    );
  }
});

// GET /api/inventory-movements/:id - Get inventory movement by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await prisma.inventory_movements.findFirst({
      where: { movement_id: id, deleted_at: null }
    });

    if (!movement) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory movement not found')
      );
    }

    res.json(createApiResponse(true, movement));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory movement')
    );
  }
});

// PUT /api/inventory-movements/:id - Update inventory movement
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const movement = await prisma.inventory_movements.update({
      where: { movement_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, movement));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update inventory movement')
    );
  }
});

// DELETE /api/inventory-movements/:id - Delete inventory movement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.inventory_movements.delete({
      where: { movement_id: id }
    });

    res.json(createApiResponse(true, null, 'Inventory movement deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete inventory movement')
    );
  }
});

export default router;