import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/brands - Get all brands
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all brands from database', { 
      source: 'brandRoutes', 
      method: 'getBrands'
    });

    const brands = await prisma.brands.findMany({
      include: {
        products: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    const transformedBrands = brands.map(brand => ({
      id: brand.id.toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      website: brand.website,
      logo_url: brand.logo_url,
      is_active: brand.is_active,
      product_count: brand.products.length,
      created_at: brand.created_at.toISOString(),
      updated_at: brand.updated_at.toISOString()
    }));

    logger.info('Brands retrieved successfully', { 
      source: 'brandRoutes', 
      method: 'getBrands',
      count: transformedBrands.length
    });

    res.json(createApiResponse(true, transformedBrands, 'Brands retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching brands', {
      source: 'brandRoutes',
      method: 'getBrands',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch brands')
    );
  }
});

// POST /api/brands - Create brand
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      website,
      logo_url,
      is_active = true
    } = req.body;

    logger.info('Creating new brand', { 
      source: 'brandRoutes', 
      method: 'createBrand',
      name,
      slug
    });

    // Generate slug if not provided
    const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    const newBrand = await prisma.brands.create({
      data: {
        name,
        slug: brandSlug,
        description: description || null,
        website: website || null,
        logo_url: logo_url || null,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const brandResponse = {
      id: newBrand.id.toString(),
      name: newBrand.name,
      slug: newBrand.slug,
      description: newBrand.description,
      website: newBrand.website,
      logo_url: newBrand.logo_url,
      is_active: newBrand.is_active,
      created_at: newBrand.created_at.toISOString(),
      updated_at: newBrand.updated_at.toISOString()
    };

    logger.info('Brand created successfully', { 
      source: 'brandRoutes', 
      method: 'createBrand',
      brandId: newBrand.id.toString(),
      name: newBrand.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, brandResponse, 'Brand created successfully')
    );
  } catch (error) {
    logger.error('Error creating brand', {
      source: 'brandRoutes',
      method: 'createBrand',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create brand')
    );
  }
});

// PUT /api/brands/:id - Update brand
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };

    logger.info('Updating brand', { 
      source: 'brandRoutes', 
      method: 'updateBrand',
      brandId: id
    });

    const updatedBrand = await prisma.brands.update({
      where: { 
        id: parseInt(id)
      },
      data: updateData
    });

    const brandResponse = {
      id: updatedBrand.id.toString(),
      name: updatedBrand.name,
      slug: updatedBrand.slug,
      description: updatedBrand.description,
      website: updatedBrand.website,
      logo_url: updatedBrand.logo_url,
      is_active: updatedBrand.is_active,
      created_at: updatedBrand.created_at.toISOString(),
      updated_at: updatedBrand.updated_at.toISOString()
    };

    res.json(createApiResponse(true, brandResponse, 'Brand updated successfully'));
  } catch (error) {
    logger.error('Error updating brand', {
      source: 'brandRoutes',
      method: 'updateBrand',
      brandId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error && (error as any).code === 'P2025') {
      res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Brand not found')
      );
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        createApiResponse(false, null, 'Failed to update brand')
      );
    }
  }
});

// DELETE /api/brands/:id - Delete brand (hard delete, no soft delete as requested)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Deleting brand', { 
      source: 'brandRoutes', 
      method: 'deleteBrand',
      brandId: id
    });

    await prisma.brands.delete({
      where: { id: parseInt(id) }
    });

    res.json(createApiResponse(true, null, 'Brand deleted successfully'));
  } catch (error) {
    logger.error('Error deleting brand', {
      source: 'brandRoutes',
      method: 'deleteBrand',
      brandId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error && (error as any).code === 'P2025') {
      res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Brand not found')
      );
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        createApiResponse(false, null, 'Failed to delete brand')
      );
    }
  }
});

export default router;