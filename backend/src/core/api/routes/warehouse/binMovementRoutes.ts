import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      source_bin_id,
      destination_bin_id,
      product_id,
      movement_type,
      status,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (source_bin_id) where.source_bin_id = source_bin_id;
    if (destination_bin_id) where.destination_bin_id = destination_bin_id;
    if (product_id) where.product_id = product_id;
    if (movement_type) where.movement_type = movement_type;
    if (status) where.status = status;

    const movements = await prisma.bin_movements.findMany({
      where,
      orderBy: { movement_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.bin_movements.count({ where });
    res.json(createApiResponse(true, { movements, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin movements')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await prisma.bin_movements.findFirst({
      where: { movement_id: id, deleted_at: null }
    });

    if (!movement) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Bin movement not found')
      );
    }

    res.json(createApiResponse(true, movement));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin movement')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const movement = await prisma.bin_movements.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, movement));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create bin movement')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const movement = await prisma.bin_movements.update({
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
      createApiResponse(false, null, 'Failed to update bin movement')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bin_movements.delete({ where: { movement_id: id } });
    res.json(createApiResponse(true, null, 'Bin movement deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete bin movement')
    );
  }
});

export default router;