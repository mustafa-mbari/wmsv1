import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/units - Get all units of measure
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all units of measure from database', { 
      source: 'unitRoutes', 
      method: 'getUnits'
    });

    const units = await prisma.units_of_measure.findMany({
      where: {
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedUnits = units.map(unit => ({
      id: unit.id.toString(),
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
      product_count: unit._count.products,
      is_active: unit.is_active,
      created_at: unit.created_at.toISOString(),
      updated_at: unit.updated_at.toISOString()
    }));

    logger.info('Units of measure retrieved successfully', { 
      source: 'unitRoutes', 
      method: 'getUnits',
      count: transformedUnits.length
    });

    res.json(createApiResponse(true, transformedUnits, 'Units of measure retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching units of measure', {
      source: 'unitRoutes',
      method: 'getUnits',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch units of measure')
    );
  }
});

// POST /api/units - Create unit of measure
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      symbol,
      description,
      is_active = true
    } = req.body;

    logger.info('Creating new unit of measure', { 
      source: 'unitRoutes', 
      method: 'createUnit',
      name,
      symbol
    });

    const newUnit = await prisma.units_of_measure.create({
      data: {
        name,
        symbol,
        description: description || null,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const unitResponse = {
      id: newUnit.id.toString(),
      name: newUnit.name,
      symbol: newUnit.symbol,
      description: newUnit.description,
      is_active: newUnit.is_active,
      created_at: newUnit.created_at.toISOString()
    };

    logger.info('Unit of measure created successfully', { 
      source: 'unitRoutes', 
      method: 'createUnit',
      unitId: newUnit.id.toString(),
      name: newUnit.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, unitResponse, 'Unit of measure created successfully')
    );
  } catch (error) {
    logger.error('Error creating unit of measure', {
      source: 'unitRoutes',
      method: 'createUnit',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create unit of measure')
    );
  }
});

// PUT /api/units/:id - Update unit of measure
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };

    const updatedUnit = await prisma.units_of_measure.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedUnit, 'Unit of measure updated successfully'));
  } catch (error) {
    logger.error('Error updating unit of measure', {
      source: 'unitRoutes',
      method: 'updateUnit',
      unitId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update unit of measure')
    );
  }
});

// DELETE /api/units/:id - Delete unit of measure
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.units_of_measure.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Unit of measure deleted successfully'));
  } catch (error) {
    logger.error('Error deleting unit of measure', {
      source: 'unitRoutes',
      method: 'deleteUnit',
      unitId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete unit of measure')
    );
  }
});

export default router;