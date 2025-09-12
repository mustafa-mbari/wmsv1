/**
 * @swagger
 * components:
 *   schemas:
 *     Attribute:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - type
 *         - is_required
 *         - is_filterable
 *         - is_searchable
 *         - sort_order
 *         - is_active
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attribute
 *           example: "1"
 *         name:
 *           type: string
 *           description: Name of the product attribute
 *           example: "Color"
 *         slug:
 *           type: string
 *           description: URL-friendly identifier for the attribute
 *           example: "color"
 *         type:
 *           type: string
 *           description: Type of the attribute (text, select, multiselect, etc.)
 *           example: "select"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the attribute
 *           example: "Product color options"
 *         is_required:
 *           type: boolean
 *           description: Whether the attribute is required for products
 *           example: false
 *         is_filterable:
 *           type: boolean
 *           description: Whether the attribute can be used for filtering
 *           example: true
 *         is_searchable:
 *           type: boolean
 *           description: Whether the attribute is searchable
 *           example: false
 *         sort_order:
 *           type: integer
 *           description: Display order of the attribute
 *           example: 1
 *         option_count:
 *           type: integer
 *           description: Number of available options for this attribute
 *           example: 5
 *         value_count:
 *           type: integer
 *           description: Number of values assigned to products
 *           example: 12
 *         is_active:
 *           type: boolean
 *           description: Whether the attribute is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Attribute creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Attribute last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     AttributeOption:
 *       type: object
 *       required:
 *         - id
 *         - value
 *         - label
 *         - sort_order
 *         - is_active
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attribute option
 *           example: "1"
 *         value:
 *           type: string
 *           description: Value of the attribute option
 *           example: "red"
 *         label:
 *           type: string
 *           description: Display label for the option
 *           example: "Red"
 *         sort_order:
 *           type: integer
 *           description: Display order of the option
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Whether the option is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Option creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateAttributeRequest:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the product attribute
 *           example: "Color"
 *         slug:
 *           type: string
 *           description: URL-friendly identifier for the attribute
 *           example: "color"
 *         type:
 *           type: string
 *           description: Type of the attribute
 *           example: "select"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the attribute
 *           example: "Product color options"
 *         is_required:
 *           type: boolean
 *           description: Whether the attribute is required
 *           default: false
 *           example: false
 *         is_filterable:
 *           type: boolean
 *           description: Whether the attribute can be used for filtering
 *           default: false
 *           example: true
 *         is_searchable:
 *           type: boolean
 *           description: Whether the attribute is searchable
 *           default: false
 *           example: false
 *         sort_order:
 *           type: integer
 *           description: Display order of the attribute
 *           default: 0
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Whether the attribute should be active
 *           default: true
 *           example: true
 *     UpdateAttributeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the product attribute
 *           example: "Updated Color"
 *         slug:
 *           type: string
 *           description: URL-friendly identifier for the attribute
 *           example: "updated-color"
 *         type:
 *           type: string
 *           description: Type of the attribute
 *           example: "multiselect"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the attribute
 *           example: "Updated product color options"
 *         is_required:
 *           type: boolean
 *           description: Whether the attribute is required
 *           example: true
 *         is_filterable:
 *           type: boolean
 *           description: Whether the attribute can be used for filtering
 *           example: false
 *         is_searchable:
 *           type: boolean
 *           description: Whether the attribute is searchable
 *           example: true
 *         sort_order:
 *           type: integer
 *           description: Display order of the attribute
 *           example: 2
 *         is_active:
 *           type: boolean
 *           description: Whether the attribute should be active
 *           example: false
 */

import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/attributes:
 *   get:
 *     tags: [Attributes]
 *     summary: Get all product attributes
 *     description: Retrieve all active product attributes with option and value counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product attributes retrieved successfully
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
 *                       name: "Color"
 *                       slug: "color"
 *                       type: "select"
 *                       description: "Product color options"
 *                       is_required: false
 *                       is_filterable: true
 *                       is_searchable: false
 *                       sort_order: 1
 *                       option_count: 5
 *                       value_count: 12
 *                       is_active: true
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                   message: "Product attributes retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all product attributes from database', { 
      source: 'attributeRoutes', 
      method: 'getAttributes'
    });

    const attributes = await prisma.product_attributes.findMany({
      where: {
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            product_attribute_options: true,
            product_attribute_values: true
          }
        }
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' }
      ]
    });

    const transformedAttributes = attributes.map(attribute => ({
      id: attribute.id.toString(),
      name: attribute.name,
      slug: attribute.slug,
      type: attribute.type,
      description: attribute.description,
      is_required: attribute.is_required,
      is_filterable: attribute.is_filterable,
      is_searchable: attribute.is_searchable,
      sort_order: attribute.sort_order,
      option_count: attribute._count.product_attribute_options,
      value_count: attribute._count.product_attribute_values,
      is_active: attribute.is_active,
      created_at: attribute.created_at.toISOString(),
      updated_at: attribute.updated_at.toISOString()
    }));

    logger.info('Product attributes retrieved successfully', { 
      source: 'attributeRoutes', 
      method: 'getAttributes',
      count: transformedAttributes.length
    });

    res.json(createApiResponse(true, transformedAttributes, 'Product attributes retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching product attributes', {
      source: 'attributeRoutes',
      method: 'getAttributes',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch product attributes')
    );
  }
});

/**
 * @swagger
 * /api/attributes:
 *   post:
 *     tags: [Attributes]
 *     summary: Create a new product attribute
 *     description: Create a new product attribute with filtering and search capabilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeRequest'
 *           examples:
 *             create_attribute:
 *               value:
 *                 name: "Color"
 *                 slug: "color"
 *                 type: "select"
 *                 description: "Product color options"
 *                 is_required: false
 *                 is_filterable: true
 *                 is_searchable: false
 *                 sort_order: 1
 *                 is_active: true
 *     responses:
 *       201:
 *         description: Product attribute created successfully
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
 *                     name: "Color"
 *                     slug: "color"
 *                     type: "select"
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                   message: "Product attribute created successfully"
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
      slug,
      type,
      description,
      is_required = false,
      is_filterable = false,
      is_searchable = false,
      sort_order = 0,
      is_active = true
    } = req.body;

    logger.info('Creating new product attribute', { 
      source: 'attributeRoutes', 
      method: 'createAttribute',
      name,
      type
    });

    const newAttribute = await prisma.product_attributes.create({
      data: {
        name,
        slug,
        type,
        description: description || null,
        is_required,
        is_filterable,
        is_searchable,
        sort_order: sort_order || 0,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const attributeResponse = {
      id: newAttribute.id.toString(),
      name: newAttribute.name,
      slug: newAttribute.slug,
      type: newAttribute.type,
      is_active: newAttribute.is_active,
      created_at: newAttribute.created_at.toISOString()
    };

    logger.info('Product attribute created successfully', { 
      source: 'attributeRoutes', 
      method: 'createAttribute',
      attributeId: newAttribute.id.toString(),
      name: newAttribute.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, attributeResponse, 'Product attribute created successfully')
    );
  } catch (error) {
    logger.error('Error creating product attribute', {
      source: 'attributeRoutes',
      method: 'createAttribute',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create product attribute')
    );
  }
});

/**
 * @swagger
 * /api/attributes/{id}:
 *   put:
 *     tags: [Attributes]
 *     summary: Update a product attribute
 *     description: Update an existing product attribute by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeRequest'
 *           examples:
 *             update_attribute:
 *               value:
 *                 name: "Updated Color"
 *                 slug: "updated-color"
 *                 type: "multiselect"
 *                 description: "Updated product color options"
 *                 is_required: true
 *                 is_filterable: false
 *                 is_searchable: true
 *                 sort_order: 2
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Product attribute updated successfully
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
 *                     name: "Updated Color"
 *                     slug: "updated-color"
 *                     type: "multiselect"
 *                     description: "Updated product color options"
 *                     is_required: true
 *                     is_filterable: false
 *                     is_searchable: true
 *                     sort_order: 2
 *                     is_active: false
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T11:45:00Z"
 *                   message: "Product attribute updated successfully"
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
    
    if (updateData.sort_order !== undefined) updateData.sort_order = parseInt(updateData.sort_order);

    const updatedAttribute = await prisma.product_attributes.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedAttribute, 'Product attribute updated successfully'));
  } catch (error) {
    logger.error('Error updating product attribute', {
      source: 'attributeRoutes',
      method: 'updateAttribute',
      attributeId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update product attribute')
    );
  }
});

/**
 * @swagger
 * /api/attributes/{id}:
 *   delete:
 *     tags: [Attributes]
 *     summary: Delete a product attribute
 *     description: Soft delete a product attribute by setting deleted_at timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Product attribute deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Product attribute deleted successfully"
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

    await prisma.product_attributes.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Product attribute deleted successfully'));
  } catch (error) {
    logger.error('Error deleting product attribute', {
      source: 'attributeRoutes',
      method: 'deleteAttribute',
      attributeId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete product attribute')
    );
  }
});

/**
 * @swagger
 * /api/attributes/{id}/options:
 *   get:
 *     tags: [Attributes]
 *     summary: Get attribute options
 *     description: Retrieve all available options for a specific product attribute
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Attribute options retrieved successfully
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
 *                       value: "red"
 *                       label: "Red"
 *                       sort_order: 1
 *                       is_active: true
 *                       created_at: "2024-01-15T10:30:00Z"
 *                     - id: "2"
 *                       value: "blue"
 *                       label: "Blue"
 *                       sort_order: 2
 *                       is_active: true
 *                       created_at: "2024-01-15T10:35:00Z"
 *                   message: "Attribute options retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/options', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const options = await prisma.product_attribute_options.findMany({
      where: {
        attribute_id: parseInt(id),
        deleted_at: null
      },
      orderBy: {
        sort_order: 'asc'
      }
    });

    const transformedOptions = options.map(option => ({
      id: option.id.toString(),
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
      is_active: option.is_active,
      created_at: option.created_at.toISOString()
    }));

    res.json(createApiResponse(true, transformedOptions, 'Attribute options retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching attribute options', {
      source: 'attributeRoutes',
      method: 'getAttributeOptions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch attribute options')
    );
  }
});

export default router;