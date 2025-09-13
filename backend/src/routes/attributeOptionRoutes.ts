/**
 * @swagger
 * components:
 *   schemas:
 *     AttributeOption:
 *       type: object
 *       required:
 *         - id
 *         - attribute_id
 *         - value
 *         - label
 *         - sort_order
 *         - is_active
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attribute option
 *           example: "1"
 *         attribute_id:
 *           type: string
 *           description: ID of the associated attribute
 *           example: "2"
 *         attribute_name:
 *           type: string
 *           description: Name of the associated attribute
 *           example: "Color"
 *         attribute_type:
 *           type: string
 *           description: Type of the associated attribute
 *           example: "select"
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
 *         usage_count:
 *           type: integer
 *           description: Number of times this option is used
 *           example: 8
 *         is_active:
 *           type: boolean
 *           description: Whether the option is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Option creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Option last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateAttributeOptionRequest:
 *       type: object
 *       required:
 *         - attribute_id
 *         - value
 *         - label
 *       properties:
 *         attribute_id:
 *           type: string
 *           description: ID of the associated attribute
 *           example: "2"
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
 *           default: 0
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Whether the option should be active
 *           default: true
 *           example: true
 *     UpdateAttributeOptionRequest:
 *       type: object
 *       properties:
 *         attribute_id:
 *           type: string
 *           description: ID of the associated attribute
 *           example: "3"
 *         value:
 *           type: string
 *           description: Value of the attribute option
 *           example: "blue"
 *         label:
 *           type: string
 *           description: Display label for the option
 *           example: "Blue"
 *         sort_order:
 *           type: integer
 *           description: Display order of the option
 *           example: 2
 *         is_active:
 *           type: boolean
 *           description: Whether the option should be active
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
 * /api/attribute-options:
 *   get:
 *     tags: [Attribute Options]
 *     summary: Get all attribute options
 *     description: Retrieve all attribute options with associated attribute information and usage counts
 *     security:
 *       - bearerAuth: []
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
 *                       attribute_id: "2"
 *                       attribute_name: "Color"
 *                       attribute_type: "select"
 *                       value: "red"
 *                       label: "Red"
 *                       sort_order: 1
 *                       usage_count: 8
 *                       is_active: true
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                   message: "Attribute options retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all attribute options from database', { 
      source: 'attributeOptionRoutes', 
      method: 'getAttributeOptions'
    });

    const options = await prisma.product_attribute_options.findMany({
      include: {
        product_attributes: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            product_attribute_values: true
          }
        }
      },
      orderBy: [
        { attribute_id: 'asc' },
        { sort_order: 'asc' },
        { label: 'asc' }
      ]
    });

    const transformedOptions = options.map(option => ({
      id: option.id.toString(),
      attribute_id: option.attribute_id.toString(),
      attribute_name: option.product_attributes.name,
      attribute_type: option.product_attributes.type,
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
      usage_count: option._count.product_attribute_values,
      is_active: option.is_active,
      created_at: option.created_at.toISOString(),
      updated_at: option.updated_at.toISOString()
    }));

    logger.info('Attribute options retrieved successfully', { 
      source: 'attributeOptionRoutes', 
      method: 'getAttributeOptions',
      count: transformedOptions.length
    });

    res.json(createApiResponse(true, transformedOptions, 'Attribute options retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching attribute options', {
      source: 'attributeOptionRoutes',
      method: 'getAttributeOptions',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch attribute options')
    );
  }
});

/**
 * @swagger
 * /api/attribute-options:
 *   post:
 *     tags: [Attribute Options]
 *     summary: Create a new attribute option
 *     description: Create a new option for a specific product attribute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeOptionRequest'
 *           examples:
 *             create_option:
 *               value:
 *                 attribute_id: "2"
 *                 value: "red"
 *                 label: "Red"
 *                 sort_order: 1
 *                 is_active: true
 *     responses:
 *       201:
 *         description: Attribute option created successfully
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
 *                     attribute_id: "2"
 *                     value: "red"
 *                     label: "Red"
 *                     sort_order: 1
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                   message: "Attribute option created successfully"
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
      attribute_id,
      value,
      label,
      sort_order = 0,
      is_active = true
    } = req.body;

    logger.info('Creating new attribute option', { 
      source: 'attributeOptionRoutes', 
      method: 'createAttributeOption',
      attribute_id,
      value,
      label
    });

    const newOption = await prisma.product_attribute_options.create({
      data: {
        attribute_id: parseInt(attribute_id),
        value,
        label,
        sort_order: sort_order || 0,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const optionResponse = {
      id: newOption.id.toString(),
      attribute_id: newOption.attribute_id.toString(),
      value: newOption.value,
      label: newOption.label,
      sort_order: newOption.sort_order,
      is_active: newOption.is_active,
      created_at: newOption.created_at.toISOString()
    };

    logger.info('Attribute option created successfully', { 
      source: 'attributeOptionRoutes', 
      method: 'createAttributeOption',
      optionId: newOption.id.toString(),
      label: newOption.label
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, optionResponse, 'Attribute option created successfully')
    );
  } catch (error) {
    logger.error('Error creating attribute option', {
      source: 'attributeOptionRoutes',
      method: 'createAttributeOption',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create attribute option')
    );
  }
});

/**
 * @swagger
 * /api/attribute-options/{id}:
 *   put:
 *     tags: [Attribute Options]
 *     summary: Update an attribute option
 *     description: Update an existing attribute option by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute option unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeOptionRequest'
 *           examples:
 *             update_option:
 *               value:
 *                 attribute_id: "3"
 *                 value: "blue"
 *                 label: "Blue"
 *                 sort_order: 2
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Attribute option updated successfully
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
 *                     attribute_id: "3"
 *                     value: "blue"
 *                     label: "Blue"
 *                     sort_order: 2
 *                     is_active: false
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T11:45:00Z"
 *                   message: "Attribute option updated successfully"
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
    
    if (updateData.attribute_id) updateData.attribute_id = parseInt(updateData.attribute_id);
    if (updateData.sort_order !== undefined) updateData.sort_order = parseInt(updateData.sort_order);

    const updatedOption = await prisma.product_attribute_options.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedOption, 'Attribute option updated successfully'));
  } catch (error) {
    logger.error('Error updating attribute option', {
      source: 'attributeOptionRoutes',
      method: 'updateAttributeOption',
      optionId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update attribute option')
    );
  }
});

/**
 * @swagger
 * /api/attribute-options/{id}:
 *   delete:
 *     tags: [Attribute Options]
 *     summary: Delete an attribute option
 *     description: Permanently delete an attribute option by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute option unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Attribute option deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Attribute option deleted successfully"
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

    await prisma.product_attribute_options.delete({
      where: { id: parseInt(id) }
    });

    res.json(createApiResponse(true, null, 'Attribute option deleted successfully'));
  } catch (error) {
    logger.error('Error deleting attribute option', {
      source: 'attributeOptionRoutes',
      method: 'deleteAttributeOption',
      optionId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete attribute option')
    );
  }
});

export default router;