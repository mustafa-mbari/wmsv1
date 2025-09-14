import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inventory-reservations - Get all inventory reservations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, location_id, status, limit = 50, offset = 0 } = req.query;

    const where: any = { deleted_at: null };
    if (product_id) where.product_id = product_id;
    if (location_id) where.location_id = location_id;
    if (status) where.status = status;

    const reservations = await prisma.inventory_reservations.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_reservations.count({ where });

    res.json(createApiResponse(true, { reservations, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory reservations', {
      source: 'inventoryReservationRoutes',
      method: 'getInventoryReservations',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory reservations')
    );
  }
});

// POST /api/inventory-reservations - Create new inventory reservation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const reservation = await prisma.inventory_reservations.create({
      data: {
        ...req.body,
        reserved_at: new Date(),
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, reservation));
  } catch (error: any) {
    logger.error('Error creating inventory reservation', {
      source: 'inventoryReservationRoutes',
      method: 'createInventoryReservation',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create inventory reservation')
    );
  }
});

// GET /api/inventory-reservations/:id - Get inventory reservation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.inventory_reservations.findFirst({
      where: { reservation_id: id, deleted_at: null }
    });

    if (!reservation) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory reservation not found')
      );
    }

    res.json(createApiResponse(true, reservation));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory reservation')
    );
  }
});

// PUT /api/inventory-reservations/:id/release - Release reservation
router.put('/:id/release', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const reservation = await prisma.inventory_reservations.update({
      where: { reservation_id: id },
      data: {
        status: 'released',
        released_at: new Date(),
        released_by: userId?.toString(),
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, reservation));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to release inventory reservation')
    );
  }
});

// DELETE /api/inventory-reservations/:id - Delete inventory reservation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.inventory_reservations.delete({
      where: { reservation_id: id }
    });

    res.json(createApiResponse(true, null, 'Inventory reservation deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete inventory reservation')
    );
  }
});

export default router;