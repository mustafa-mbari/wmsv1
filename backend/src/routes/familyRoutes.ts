import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/families - Get all product families
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all product families from database', { 
      source: 'familyRoutes', 
      method: 'getFamilies'
    });

    const families = await prisma.product_families.findMany({
      where: {
        deleted_at: null
      },
      include: {
        product_categories: {
          select: {
            id: true,
            name: true
          }
        },
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

    const transformedFamilies = families.map(family => ({
      id: family.id.toString(),
      name: family.name,
      description: family.description,
      category_id: family.category_id?.toString() || null,
      category_name: family.product_categories?.name || null,
      product_count: family._count.products,
      is_active: family.is_active,
      created_at: family.created_at.toISOString(),
      updated_at: family.updated_at.toISOString()
    }));

    logger.info('Product families retrieved successfully', { 
      source: 'familyRoutes', 
      method: 'getFamilies',
      count: transformedFamilies.length
    });

    res.json(createApiResponse(true, transformedFamilies, 'Product families retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching product families', {
      source: 'familyRoutes',
      method: 'getFamilies',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch product families')
    );
  }
});

// POST /api/families - Create product family
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category_id,
      is_active = true
    } = req.body;

    logger.info('Creating new product family', { 
      source: 'familyRoutes', 
      method: 'createFamily',
      name
    });

    const newFamily = await prisma.product_families.create({
      data: {
        name,
        description: description || null,
        category_id: category_id ? parseInt(category_id) : null,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const familyResponse = {
      id: newFamily.id.toString(),
      name: newFamily.name,
      description: newFamily.description,
      is_active: newFamily.is_active,
      created_at: newFamily.created_at.toISOString()
    };

    logger.info('Product family created successfully', { 
      source: 'familyRoutes', 
      method: 'createFamily',
      familyId: newFamily.id.toString(),
      name: newFamily.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, familyResponse, 'Product family created successfully')
    );
  } catch (error) {
    logger.error('Error creating product family', {
      source: 'familyRoutes',
      method: 'createFamily',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create product family')
    );
  }
});

// PUT /api/families/:id - Update product family
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    if (updateData.category_id) updateData.category_id = parseInt(updateData.category_id);

    const updatedFamily = await prisma.product_families.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedFamily, 'Product family updated successfully'));
  } catch (error) {
    logger.error('Error updating product family', {
      source: 'familyRoutes',
      method: 'updateFamily',
      familyId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update product family')
    );
  }
});

// DELETE /api/families/:id - Delete product family
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product_families.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Product family deleted successfully'));
  } catch (error) {
    logger.error('Error deleting product family', {
      source: 'familyRoutes',
      method: 'deleteFamily',
      familyId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete product family')
    );
  }
});

export default router;