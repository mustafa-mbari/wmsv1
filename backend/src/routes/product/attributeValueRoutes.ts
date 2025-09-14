/**
 * @swagger
 * components:
 *   schemas:
 *     AttributeValue:
 *       type: object
 *       required:
 *         - id
 *         - product_id
 *         - attribute_id
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attribute value
 *           example: "1"
 *         product_id:
 *           type: string
 *           description: ID of the associated product
 *           example: "5"
 *         product_name:
 *           type: string
 *           description: Name of the associated product
 *           example: "Premium Coffee Beans"
 *         product_sku:
 *           type: string
 *           description: SKU of the associated product
 *           example: "COFFEE-001"
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
 *           nullable: true
 *           description: Custom value for text-type attributes
 *           example: "Dark Red"
 *         option_id:
 *           type: string
 *           nullable: true
 *           description: ID of the selected option for select-type attributes
 *           example: "3"
 *         option_label:
 *           type: string
 *           nullable: true
 *           description: Label of the selected option
 *           example: "Red"
 *         option_value:
 *           type: string
 *           nullable: true
 *           description: Value of the selected option
 *           example: "red"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Value creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Value last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateAttributeValueRequest:
 *       type: object
 *       required:
 *         - product_id
 *         - attribute_id
 *       properties:
 *         product_id:
 *           type: string
 *           description: ID of the associated product
 *           example: "5"
 *         attribute_id:
 *           type: string
 *           description: ID of the associated attribute
 *           example: "2"
 *         value:
 *           type: string
 *           nullable: true
 *           description: Custom value for text-type attributes
 *           example: "Dark Red"
 *         option_id:
 *           type: string
 *           nullable: true
 *           description: ID of the selected option for select-type attributes
 *           example: "3"
 *     UpdateAttributeValueRequest:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *           description: ID of the associated product
 *           example: "6"
 *         attribute_id:
 *           type: string
 *           description: ID of the associated attribute
 *           example: "3"
 *         value:
 *           type: string
 *           nullable: true
 *           description: Custom value for text-type attributes
 *           example: "Light Blue"
 *         option_id:
 *           type: string
 *           nullable: true
 *           description: ID of the selected option for select-type attributes
 *           example: "4"
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
 * /api/attribute-values:
 *   get:
 *     tags: [Attribute Values]
 *     summary: Get all attribute values
 *     description: Retrieve all attribute values with associated product and attribute information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attribute values retrieved successfully
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
 *                       product_id: "5"
 *                       product_name: "Premium Coffee Beans"
 *                       product_sku: "COFFEE-001"
 *                       attribute_id: "2"
 *                       attribute_name: "Color"
 *                       attribute_type: "select"
 *                       value: null
 *                       option_id: "3"
 *                       option_label: "Red"
 *                       option_value: "red"
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                   message: "Attribute values retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all attribute values from database', { 
      source: 'attributeValueRoutes', 
      method: 'getAttributeValues'
    });

    const values = await prisma.product_attribute_values.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        product_attributes: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        product_attribute_options: {
          select: {
            id: true,
            label: true,
            value: true
          }
        }
      },
      orderBy: [
        { product_id: 'asc' },
        { attribute_id: 'asc' }
      ]
    });

    const transformedValues = values.map(value => ({
      id: value.id.toString(),
      product_id: value.product_id.toString(),
      product_name: value.products.name,
      product_sku: value.products.sku,
      attribute_id: value.attribute_id.toString(),
      attribute_name: value.product_attributes.name,
      attribute_type: value.product_attributes.type,
      value: value.value,
      option_id: value.option_id?.toString() || null,
      option_label: value.product_attribute_options?.label || null,
      option_value: value.product_attribute_options?.value || null,
      created_at: value.created_at.toISOString(),
      updated_at: value.updated_at.toISOString()
    }));

    logger.info('Attribute values retrieved successfully', { 
      source: 'attributeValueRoutes', 
      method: 'getAttributeValues',
      count: transformedValues.length
    });

    res.json(createApiResponse(true, transformedValues, 'Attribute values retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching attribute values', {
      source: 'attributeValueRoutes',
      method: 'getAttributeValues',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch attribute values')
    );
  }
});

/**
 * @swagger
 * /api/attribute-values:
 *   post:
 *     tags: [Attribute Values]
 *     summary: Create a new attribute value
 *     description: Assign an attribute value to a product (either custom value or selected option)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeValueRequest'
 *           examples:
 *             create_value_with_option:
 *               value:
 *                 product_id: "5"
 *                 attribute_id: "2"
 *                 option_id: "3"
 *             create_value_with_text:
 *               value:
 *                 product_id: "5"
 *                 attribute_id: "4"
 *                 value: "Custom text value"
 *     responses:
 *       201:
 *         description: Attribute value created successfully
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
 *                     product_id: "5"
 *                     attribute_id: "2"
 *                     value: null
 *                     option_id: "3"
 *                     created_at: "2024-01-15T10:30:00Z"
 *                   message: "Attribute value created successfully"
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
      product_id,
      attribute_id,
      value,
      option_id
    } = req.body;

    logger.info('Creating new attribute value', { 
      source: 'attributeValueRoutes', 
      method: 'createAttributeValue',
      product_id,
      attribute_id,
      value
    });

    const newValue = await prisma.product_attribute_values.create({
      data: {
        product_id: parseInt(product_id),
        attribute_id: parseInt(attribute_id),
        value: value || null,
        option_id: option_id ? parseInt(option_id) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const valueResponse = {
      id: newValue.id.toString(),
      product_id: newValue.product_id.toString(),
      attribute_id: newValue.attribute_id.toString(),
      value: newValue.value,
      option_id: newValue.option_id?.toString() || null,
      created_at: newValue.created_at.toISOString()
    };

    logger.info('Attribute value created successfully', { 
      source: 'attributeValueRoutes', 
      method: 'createAttributeValue',
      valueId: newValue.id.toString(),
      product_id,
      attribute_id
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, valueResponse, 'Attribute value created successfully')
    );
  } catch (error) {
    logger.error('Error creating attribute value', {
      source: 'attributeValueRoutes',
      method: 'createAttributeValue',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create attribute value')
    );
  }
});

/**
 * @swagger
 * /api/attribute-values/{id}:
 *   put:
 *     tags: [Attribute Values]
 *     summary: Update an attribute value
 *     description: Update an existing attribute value by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute value unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeValueRequest'
 *           examples:
 *             update_value:
 *               value:
 *                 product_id: "6"
 *                 attribute_id: "3"
 *                 value: "Light Blue"
 *                 option_id: "4"
 *     responses:
 *       200:
 *         description: Attribute value updated successfully
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
 *                     product_id: "6"
 *                     attribute_id: "3"
 *                     value: "Light Blue"
 *                     option_id: "4"
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T11:45:00Z"
 *                   message: "Attribute value updated successfully"
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
    
    if (updateData.product_id) updateData.product_id = parseInt(updateData.product_id);
    if (updateData.attribute_id) updateData.attribute_id = parseInt(updateData.attribute_id);
    if (updateData.option_id) updateData.option_id = parseInt(updateData.option_id);

    const updatedValue = await prisma.product_attribute_values.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedValue, 'Attribute value updated successfully'));
  } catch (error) {
    logger.error('Error updating attribute value', {
      source: 'attributeValueRoutes',
      method: 'updateAttributeValue',
      valueId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update attribute value')
    );
  }
});

/**
 * @swagger
 * /api/attribute-values/{id}:
 *   delete:
 *     tags: [Attribute Values]
 *     summary: Delete an attribute value
 *     description: Permanently delete an attribute value by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute value unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Attribute value deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Attribute value deleted successfully"
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

    await prisma.product_attribute_values.delete({
      where: { id: parseInt(id) }
    });

    res.json(createApiResponse(true, null, 'Attribute value deleted successfully'));
  } catch (error) {
    logger.error('Error deleting attribute value', {
      source: 'attributeValueRoutes',
      method: 'deleteAttributeValue',
      valueId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete attribute value')
    );
  }
});

/**
 * @swagger
 * /api/attribute-values/product/{productId}:
 *   get:
 *     tags: [Attribute Values]
 *     summary: Get attribute values for a product
 *     description: Retrieve all attribute values assigned to a specific product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *         example: "5"
 *     responses:
 *       200:
 *         description: Product attribute values retrieved successfully
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
 *                       value: null
 *                       option_id: "3"
 *                       option_label: "Red"
 *                       created_at: "2024-01-15T10:30:00Z"
 *                     - id: "2"
 *                       attribute_id: "4"
 *                       attribute_name: "Description"
 *                       attribute_type: "text"
 *                       value: "Custom description text"
 *                       option_id: null
 *                       option_label: null
 *                       created_at: "2024-01-15T10:35:00Z"
 *                   message: "Product attribute values retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/product/:productId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const values = await prisma.product_attribute_values.findMany({
      where: {
        product_id: parseInt(productId)
      },
      include: {
        product_attributes: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        product_attribute_options: {
          select: {
            id: true,
            label: true,
            value: true
          }
        }
      }
    });

    const transformedValues = values.map(value => ({
      id: value.id.toString(),
      attribute_id: value.attribute_id.toString(),
      attribute_name: value.product_attributes.name,
      attribute_type: value.product_attributes.type,
      value: value.value,
      option_id: value.option_id?.toString() || null,
      option_label: value.product_attribute_options?.label || null,
      created_at: value.created_at.toISOString()
    }));

    res.json(createApiResponse(true, transformedValues, 'Product attribute values retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching product attribute values', {
      source: 'attributeValueRoutes',
      method: 'getProductAttributeValues',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch product attribute values')
    );
  }
});

export default router;