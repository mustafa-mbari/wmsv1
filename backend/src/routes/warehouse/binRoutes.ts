import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { location_id, bin_type_id, is_active, limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };
    if (location_id) where.location_id = location_id;
    if (bin_type_id) where.bin_type_id = bin_type_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const bins = await prisma.bins.findMany({
      where,
      orderBy: { bin_code: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.bins.count({ where });
    res.json(createApiResponse(true, { bins, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bins')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bin = await prisma.bins.findFirst({
      where: { bin_id: id, deleted_at: null }
    });

    if (!bin) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Bin not found')
      );
    }

    res.json(createApiResponse(true, bin));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const bin = await prisma.bins.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, bin));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create bin')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const bin = await prisma.bins.update({
      where: { bin_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, bin));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update bin')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bins.delete({ where: { bin_id: id } });
    res.json(createApiResponse(true, null, 'Bin deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete bin')
    );
  }
});

export default router;