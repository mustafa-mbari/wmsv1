import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { aisle_id, rack_type, is_active, limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };
    if (aisle_id) where.aisle_id = aisle_id;
    if (rack_type) where.rack_type = rack_type;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const racks = await prisma.racks.findMany({
      where,
      orderBy: { rack_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.racks.count({ where });
    res.json(createApiResponse(true, { racks, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve racks')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rack = await prisma.racks.findFirst({
      where: { rack_id: id, deleted_at: null }
    });

    if (!rack) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Rack not found')
      );
    }

    res.json(createApiResponse(true, rack));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve rack')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const rack = await prisma.racks.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, rack));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create rack')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const rack = await prisma.racks.update({
      where: { rack_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, rack));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update rack')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.racks.delete({ where: { rack_id: id } });
    res.json(createApiResponse(true, null, 'Rack deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete rack')
    );
  }
});

export default router;