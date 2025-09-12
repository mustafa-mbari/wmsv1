import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/attribute-values - Get all attribute values
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

// POST /api/attribute-values - Create attribute value
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

// PUT /api/attribute-values/:id - Update attribute value
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

// DELETE /api/attribute-values/:id - Delete attribute value
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

// GET /api/attribute-values/product/:productId - Get attribute values for a product
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