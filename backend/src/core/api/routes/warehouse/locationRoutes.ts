import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, location_type, is_active, limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (location_type) where.location_type = location_type;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const locations = await prisma.locations.findMany({
      where,
      orderBy: { location_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.locations.count({ where });
    res.json(createApiResponse(true, { locations, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve locations')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.locations.findFirst({
      where: { location_id: id, deleted_at: null }
    });

    if (!location) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Location not found')
      );
    }

    res.json(createApiResponse(true, location));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve location')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const location = await prisma.locations.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, location));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create location')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const location = await prisma.locations.update({
      where: { location_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, location));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update location')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.locations.delete({ where: { location_id: id } });
    res.json(createApiResponse(true, null, 'Location deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete location')
    );
  }
});

export default router;