import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      bin_id,
      product_id,
      batch_number,
      quality_status,
      is_locked,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (bin_id) where.bin_id = bin_id;
    if (product_id) where.product_id = product_id;
    if (batch_number) where.batch_number = batch_number;
    if (quality_status) where.quality_status = quality_status;
    if (is_locked !== undefined) where.is_locked = is_locked === 'true';

    const contents = await prisma.bin_contents.findMany({
      where,
      orderBy: { putaway_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Convert BigInt to string for JSON serialization
    const serializedContents = contents.map(content => ({
      ...content,
      content_id: content.content_id.toString()
    }));

    const total = await prisma.bin_contents.count({ where });
    res.json(createApiResponse(true, { contents: serializedContents, total }));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin contents')
    );
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await prisma.bin_contents.findFirst({
      where: { content_id: BigInt(id), deleted_at: null }
    });

    if (!content) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Bin content not found')
      );
    }

    // Convert BigInt to string for JSON serialization
    const serializedContent = {
      ...content,
      content_id: content.content_id.toString()
    };

    res.json(createApiResponse(true, serializedContent));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve bin content')
    );
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const content = await prisma.bin_contents.create({
      data: {
        ...req.body,
        created_by: userId,
        updated_by: userId
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedContent = {
      ...content,
      content_id: content.content_id.toString()
    };

    res.status(HttpStatus.CREATED).json(createApiResponse(true, serializedContent));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create bin content')
    );
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const content = await prisma.bin_contents.update({
      where: { content_id: BigInt(id) },
      data: {
        ...req.body,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedContent = {
      ...content,
      content_id: content.content_id.toString()
    };

    res.json(createApiResponse(true, serializedContent));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update bin content')
    );
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bin_contents.delete({ where: { content_id: BigInt(id) } });
    res.json(createApiResponse(true, null, 'Bin content deleted successfully'));
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete bin content')
    );
  }
});

export default router;