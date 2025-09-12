import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/attribute-options - Get all attribute options
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

// POST /api/attribute-options - Create attribute option
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

// PUT /api/attribute-options/:id - Update attribute option
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

// DELETE /api/attribute-options/:id - Delete attribute option
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