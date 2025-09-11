import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/categories - Get all categories
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all categories from database', { 
      source: 'categoryRoutes', 
      method: 'getCategories'
    });

    const categories = await prisma.product_categories.findMany({
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
        other_product_categories: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true,
            other_product_categories: true
          }
        }
      },
      orderBy: [
        { parent_id: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' }
      ]
    });

    const transformedCategories = categories.map(category => ({
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_id: category.parent_id?.toString() || null,
      parent_name: category.product_categories?.name || null,
      image_url: category.image_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
      product_count: category._count.products,
      subcategory_count: category._count.other_product_categories,
      level: category.parent_id ? 1 : 0,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString()
    }));

    logger.info('Categories retrieved successfully', { 
      source: 'categoryRoutes', 
      method: 'getCategories',
      count: transformedCategories.length
    });

    res.json(createApiResponse(true, transformedCategories, 'Categories retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching categories', {
      source: 'categoryRoutes',
      method: 'getCategories',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch categories')
    );
  }
});

// POST /api/categories - Create category
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      parent_id,
      image_url,
      sort_order = 0,
      is_active = true
    } = req.body;

    logger.info('Creating new category', { 
      source: 'categoryRoutes', 
      method: 'createCategory',
      name,
      slug
    });

    const newCategory = await prisma.product_categories.create({
      data: {
        name,
        slug,
        description: description || null,
        parent_id: parent_id ? parseInt(parent_id) : null,
        image_url: image_url || null,
        sort_order: sort_order || 0,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const categoryResponse = {
      id: newCategory.id.toString(),
      name: newCategory.name,
      slug: newCategory.slug,
      is_active: newCategory.is_active,
      created_at: newCategory.created_at.toISOString()
    };

    logger.info('Category created successfully', { 
      source: 'categoryRoutes', 
      method: 'createCategory',
      categoryId: newCategory.id.toString(),
      name: newCategory.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, categoryResponse, 'Category created successfully')
    );
  } catch (error) {
    logger.error('Error creating category', {
      source: 'categoryRoutes',
      method: 'createCategory',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create category')
    );
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    if (updateData.parent_id) updateData.parent_id = parseInt(updateData.parent_id);
    if (updateData.sort_order !== undefined) updateData.sort_order = parseInt(updateData.sort_order);

    const updatedCategory = await prisma.product_categories.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedCategory, 'Category updated successfully'));
  } catch (error) {
    logger.error('Error updating category', {
      source: 'categoryRoutes',
      method: 'updateCategory',
      categoryId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update category')
    );
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product_categories.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Category deleted successfully'));
  } catch (error) {
    logger.error('Error deleting category', {
      source: 'categoryRoutes',
      method: 'deleteCategory',
      categoryId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete category')
    );
  }
});

export default router;