/**
 * @swagger
 * components:
 *   schemas:
 *     Family:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - is_active
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the family
 *           example: "1"
 *         name:
 *           type: string
 *           description: Name of the product family
 *           example: "Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the product family
 *           example: "Consumer electronics and devices"
 *         category_id:
 *           type: string
 *           nullable: true
 *           description: ID of the associated category
 *           example: "1"
 *         category_name:
 *           type: string
 *           nullable: true
 *           description: Name of the associated category
 *           example: "Technology"
 *         product_count:
 *           type: integer
 *           description: Number of products in this family
 *           example: 25
 *         is_active:
 *           type: boolean
 *           description: Whether the family is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Family creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Family last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateFamilyRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the product family
 *           example: "Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the product family
 *           example: "Consumer electronics and devices"
 *         category_id:
 *           type: string
 *           nullable: true
 *           description: ID of the associated category
 *           example: "1"
 *         is_active:
 *           type: boolean
 *           description: Whether the family should be active
 *           default: true
 *           example: true
 *     UpdateFamilyRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the product family
 *           example: "Updated Electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the product family
 *           example: "Updated consumer electronics and devices"
 *         category_id:
 *           type: string
 *           nullable: true
 *           description: ID of the associated category
 *           example: "2"
 *         is_active:
 *           type: boolean
 *           description: Whether the family should be active
 *           example: false
 */

import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/families:
 *   get:
 *     tags: [Families]
 *     summary: Get all product families
 *     description: Retrieve all active product families with associated categories and product counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product families retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "1"
 *                       name: "Electronics"
 *                       description: "Consumer electronics and devices"
 *                       category_id: "1"
 *                       category_name: "Technology"
 *                       product_count: 25
 *                       is_active: true
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                   message: "Product families retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/families:
 *   post:
 *     tags: [Families]
 *     summary: Create a new product family
 *     description: Create a new product family with category association
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFamilyRequest'
 *           examples:
 *             create_family:
 *               value:
 *                 name: "Electronics"
 *                 description: "Consumer electronics and devices"
 *                 category_id: "1"
 *                 is_active: true
 *     responses:
 *       201:
 *         description: Product family created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "1"
 *                     name: "Electronics"
 *                     description: "Consumer electronics and devices"
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                   message: "Product family created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/families/{id}:
 *   put:
 *     tags: [Families]
 *     summary: Update a product family
 *     description: Update an existing product family by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFamilyRequest'
 *           examples:
 *             update_family:
 *               value:
 *                 name: "Updated Electronics"
 *                 description: "Updated consumer electronics and devices"
 *                 category_id: "2"
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Product family updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "1"
 *                     name: "Updated Electronics"
 *                     description: "Updated consumer electronics and devices"
 *                     category_id: "2"
 *                     is_active: false
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T11:45:00Z"
 *                   message: "Product family updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /api/families/{id}:
 *   delete:
 *     tags: [Families]
 *     summary: Delete a product family
 *     description: Soft delete a product family by setting deleted_at timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Product family deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Product family deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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