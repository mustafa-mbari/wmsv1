import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/attributes - Get all product attributes
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

// POST /api/attributes - Create product attribute
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

// PUT /api/attributes/:id - Update product attribute
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

// DELETE /api/attributes/:id - Delete product attribute
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

// GET /api/attributes/:id/options - Get attribute options
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