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
 *     Brand:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Brand unique identifier
 *           example: "1"
 *         name:
 *           type: string
 *           description: Brand name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Apple"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Brand description
 *           maxLength: 500
 *           example: "Premium technology and electronics brand"
 *         isActive:
 *           type: boolean
 *           description: Brand active status
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Brand creation timestamp
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2023-01-01T12:00:00Z"
 *         productCount:
 *           type: integer
 *           description: Number of products from this brand
 *           example: 15
 *     CreateBrandRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Brand name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Apple"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Brand description
 *           maxLength: 500
 *           example: "Premium technology and electronics brand"
 *         isActive:
 *           type: boolean
 *           description: Brand active status
 *           default: true
 *           example: true
 *     UpdateBrandRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Brand name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Apple"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Brand description
 *           maxLength: 500
 *           example: "Premium technology and electronics brand"
 *         isActive:
 *           type: boolean
 *           description: Brand active status
 *           example: true
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get all brands
 *     description: Retrieve all brands with optional filtering, pagination, and product counts
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
 *         description: Search in brand name and description
 *         example: "apple"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filter by brand status
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
 *         description: Brands retrieved successfully
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
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
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
 *                           example: 15
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Brands retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/brands - Get all brands
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all brands from database', { 
      source: 'brandRoutes', 
      method: 'getBrands'
    });

    const brands = await prisma.product_brands.findMany({
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

/**
 * @swagger
 * /api/brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create new brand
 *     description: Create a new brand. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBrandRequest'
 *     responses:
 *       201:
 *         description: Brand created successfully
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                 message:
 *                   type: string
 *                   example: "Brand created successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Brand name is required"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - Brand with same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Brand with name 'Apple' already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

    const newBrand = await prisma.product_brands.create({
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

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     tags: [Brands]
 *     summary: Update brand
 *     description: Update an existing brand with new information. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandRequest'
 *     responses:
 *       200:
 *         description: Brand updated successfully
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                 message:
 *                   type: string
 *                   example: "Brand updated successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid brand data"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Brand with same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Brand with this name already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

    const updatedBrand = await prisma.product_brands.update({
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

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand
 *     description: Soft delete a brand by setting deleted_at timestamp. This action can be reversed. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Brand deleted successfully
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
 *                   example: "Brand deleted successfully"
 *       400:
 *         description: Bad request - Invalid brand ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid brand ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Brand not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Brand not found"
 *       409:
 *         description: Conflict - Brand has associated products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Cannot delete brand with associated products"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/brands/:id - Delete brand (hard delete, no soft delete as requested)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Deleting brand', { 
      source: 'brandRoutes', 
      method: 'deleteBrand',
      brandId: id
    });

    await prisma.product_brands.delete({
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