import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_active, limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const binTypes = await prisma.bin_types.findMany({
      where,
      orderBy: { type_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.bin_types.count({ where });
    res.json(createApiResponse(true, { binTypes, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin types')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const binType = await prisma.bin_types.findFirst({
      where: { bin_type_id: id, deleted_at: null }
    });

    if (!binType) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Bin type not found')
      );
    }

    res.json(createApiResponse(true, binType));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin type')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const binType = await prisma.bin_types.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, binType));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create bin type')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const binType = await prisma.bin_types.update({
      where: { bin_type_id: id },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, binType));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update bin type')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bin_types.delete({ where: { bin_type_id: id } });
    res.json(createApiResponse(true, null, 'Bin type deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete bin type')
    );
  }
});

export default router;