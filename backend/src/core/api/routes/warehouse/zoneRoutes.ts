import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, zone_type, is_active, limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (zone_type) where.zone_type = zone_type;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const zones = await prisma.zones.findMany({
      where,
      orderBy: { zone_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.zones.count({ where });
    res.json(createApiResponse(true, { zones, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve zones')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await prisma.zones.findFirst({
      where: { zone_id: id, deleted_at: null }
    });

    if (!zone) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Zone not found')
      );
    }

    res.json(createApiResponse(true, zone));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve zone')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const zone = await prisma.zones.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, zone));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create zone')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const zone = await prisma.zones.update({
      where: { zone_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, zone));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update zone')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.zones.delete({ where: { zone_id: id } });
    res.json(createApiResponse(true, null, 'Zone deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete zone')
    );
  }
});

export default router;