import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Category unique identifier
 *           example: "1"
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Category description
 *           maxLength: 500
 *           example: "Electronic devices and accessories"
 *         isActive:
 *           type: boolean
 *           description: Category active status
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2023-01-01T12:00:00Z"
 *         productCount:
 *           type: integer
 *           description: Number of products in this category
 *           example: 25
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Category description
 *           maxLength: 500
 *           example: "Electronic devices and accessories"
 *         isActive:
 *           type: boolean
 *           description: Category active status
 *           default: true
 *           example: true
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Category description
 *           maxLength: 500
 *           example: "Electronic devices and accessories"
 *         isActive:
 *           type: boolean
 *           description: Category active status
 *           example: true
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieve all product categories with optional filtering, pagination, and product counts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in category name and description
 *         example: "electronics"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filter by category status
 *         example: "active"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, productCount]
 *           default: name
 *         description: Field to sort by
 *         example: "name"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create new category
 *     description: Create a new product category. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Category name is required"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - Category with same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Category with name 'Electronics' already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     description: Update an existing category with new information. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid category data"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Category with same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Category with this name already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     description: Soft delete a category by setting deleted_at timestamp. This action can be reversed. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       400:
 *         description: Bad request - Invalid category ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid category ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Category not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Category not found"
 *       409:
 *         description: Conflict - Category has associated products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Cannot delete category with associated products"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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