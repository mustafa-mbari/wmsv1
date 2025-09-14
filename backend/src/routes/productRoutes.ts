import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - sku
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Product unique identifier
 *           example: "1"
 *         name:
 *           type: string
 *           description: Product name
 *           minLength: 1
 *           maxLength: 255
 *           example: "Premium Coffee Beans"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Product description
 *           maxLength: 1000
 *           example: "High-quality arabica coffee beans from Colombia"
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit - unique product identifier
 *           minLength: 1
 *           maxLength: 100
 *           example: "COFFEE-001"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price in decimal format
 *           minimum: 0
 *           example: 24.99
 *         categoryId:
 *           type: string
 *           nullable: true
 *           description: Associated category ID
 *           example: "5"
 *         familyId:
 *           type: string
 *           nullable: true
 *           description: Associated family ID
 *           example: "3"
 *         brandId:
 *           type: string
 *           nullable: true
 *           description: Associated brand ID
 *           example: "2"
 *         unitId:
 *           type: string
 *           nullable: true
 *           description: Associated unit ID
 *           example: "1"
 *         isActive:
 *           type: boolean
 *           description: Product active status
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2023-01-01T12:00:00Z"
 *         category:
 *           $ref: '#/components/schemas/Category'
 *           description: Associated category details
 *         family:
 *           type: object
 *           nullable: true
 *           description: Associated family details
 *         brand:
 *           $ref: '#/components/schemas/Brand'
 *           description: Associated brand details
 *         unit:
 *           type: object
 *           nullable: true
 *           description: Associated unit details
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - sku
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *           minLength: 1
 *           maxLength: 255
 *           example: "Premium Coffee Beans"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Product description
 *           maxLength: 1000
 *           example: "High-quality arabica coffee beans from Colombia"
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit - unique product identifier
 *           minLength: 1
 *           maxLength: 100
 *           example: "COFFEE-001"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price in decimal format
 *           minimum: 0
 *           example: 24.99
 *         categoryId:
 *           type: string
 *           nullable: true
 *           description: Associated category ID
 *           example: "5"
 *         familyId:
 *           type: string
 *           nullable: true
 *           description: Associated family ID
 *           example: "3"
 *         brandId:
 *           type: string
 *           nullable: true
 *           description: Associated brand ID
 *           example: "2"
 *         unitId:
 *           type: string
 *           nullable: true
 *           description: Associated unit ID
 *           example: "1"
 *         isActive:
 *           type: boolean
 *           description: Product active status
 *           default: true
 *           example: true
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *           minLength: 1
 *           maxLength: 255
 *           example: "Premium Coffee Beans"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Product description
 *           maxLength: 1000
 *           example: "High-quality arabica coffee beans from Colombia"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price in decimal format
 *           minimum: 0
 *           example: 24.99
 *         categoryId:
 *           type: string
 *           nullable: true
 *           description: Associated category ID
 *           example: "5"
 *         familyId:
 *           type: string
 *           nullable: true
 *           description: Associated family ID
 *           example: "3"
 *         brandId:
 *           type: string
 *           nullable: true
 *           description: Associated brand ID
 *           example: "2"
 *         unitId:
 *           type: string
 *           nullable: true
 *           description: Associated unit ID
 *           example: "1"
 *         isActive:
 *           type: boolean
 *           description: Product active status
 *           example: true
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     description: Retrieve all products with optional filtering, pagination, and related data (categories, brands, families, units)
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
 *         description: Search in product name, SKU, or description
 *         example: "coffee"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *         example: "5"
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *         example: "2"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filter by product status
 *         example: "active"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, sku, price, createdAt, updatedAt]
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
 *         description: Products retrieved successfully
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
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
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Products retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/products - Get all products
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all products from database', { 
      source: 'productRoutes', 
      method: 'getProducts'
    });

    const products = await prisma.products.findMany({
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
        product_families: {
          select: {
            id: true,
            name: true
          }
        },
        product_brands: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        units_of_measure: {
          select: {
            id: true,
            name: true,
            symbol: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const transformedProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      description: product.description,
      short_description: product.short_description,
      category_id: product.category_id?.toString() || null,
      category_name: product.product_categories?.name || null,
      family_id: product.family_id?.toString() || null,
      family_name: product.product_families?.name || null,
      brand_id: product.brand_id?.toString() || null,
      brand_name: product.product_brands?.name || null,
      brand_slug: product.product_brands?.slug || null,
      unit_id: product.unit_id?.toString() || null,
      unit_name: product.units_of_measure?.name || null,
      unit_symbol: product.units_of_measure?.symbol || null,
      price: product.price?.toString() || '0',
      cost: product.cost?.toString() || '0',
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      weight: product.weight?.toString() || null,
      length: product.length?.toString() || null,
      width: product.width?.toString() || null,
      height: product.height?.toString() || null,
      status: product.status,
      is_digital: product.is_digital,
      track_stock: product.track_stock,
      image_url: product.image_url,
      images: product.images,
      tags: product.tags,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString()
    }));

    logger.info('Products retrieved successfully', { 
      source: 'productRoutes', 
      method: 'getProducts',
      count: transformedProducts.length
    });

    res.json(createApiResponse(true, transformedProducts, 'Products retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching products', {
      source: 'productRoutes',
      method: 'getProducts',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch products')
    );
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create new product
 *     description: Create a new product with the provided information. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Product name is required"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - Product with same SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Product with SKU 'COFFEE-001' already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/products - Create product
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      sku,
      barcode,
      description,
      short_description,
      category_id,
      family_id,
      brand_id,
      unit_id,
      price,
      cost,
      stock_quantity,
      min_stock_level,
      weight,
      length,
      width,
      height,
      status = 'active',
      is_digital = false,
      track_stock = true
    } = req.body;

    logger.info('Creating new product', { 
      source: 'productRoutes', 
      method: 'createProduct',
      name,
      sku
    });

    const newProduct = await prisma.products.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        description: description || null,
        short_description: short_description || null,
        category_id: category_id ? parseInt(category_id) : null,
        family_id: family_id ? parseInt(family_id) : null,
        brand_id: brand_id ? parseInt(brand_id) : null,
        unit_id: unit_id ? parseInt(unit_id) : null,
        price: price ? parseFloat(price) : 0,
        cost: cost ? parseFloat(cost) : 0,
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        min_stock_level: min_stock_level ? parseInt(min_stock_level) : 0,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        status,
        is_digital,
        track_stock,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const productResponse = {
      id: newProduct.id.toString(),
      name: newProduct.name,
      sku: newProduct.sku,
      status: newProduct.status,
      created_at: newProduct.created_at.toISOString()
    };

    logger.info('Product created successfully', { 
      source: 'productRoutes', 
      method: 'createProduct',
      productId: newProduct.id.toString(),
      name: newProduct.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, productResponse, 'Product created successfully')
    );
  } catch (error: any) {
    logger.error('Error creating product', {
      source: 'productRoutes',
      method: 'createProduct',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaCode: error?.code
    });

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('sku')) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          createApiResponse(false, null, 'A product with this SKU already exists. Please use a different SKU.')
        );
      }
      
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'A product with these details already exists.')
      );
    }

    // Handle other Prisma errors
    if (error.code?.startsWith('P')) {
      const prismaErrorMessages: Record<string, string> = {
        'P2003': 'Foreign key constraint failed. Please check related data.',
        'P2025': 'Record not found.',
        'P2014': 'Invalid ID provided.'
      };
      
      const message = prismaErrorMessages[error.code] || 'Database constraint violation.';
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, message)
      );
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create product')
    );
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     description: Update an existing product with new information. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *       400:
 *         description: Bad request - Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid product data"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Product with same SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Product with this SKU already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    
    // Convert numeric fields
    if (updateData.category_id) updateData.category_id = parseInt(updateData.category_id);
    if (updateData.family_id) updateData.family_id = parseInt(updateData.family_id);
    if (updateData.brand_id) updateData.brand_id = parseInt(updateData.brand_id);
    if (updateData.unit_id) updateData.unit_id = parseInt(updateData.unit_id);
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost);
    if (updateData.stock_quantity) updateData.stock_quantity = parseInt(updateData.stock_quantity);
    if (updateData.min_stock_level) updateData.min_stock_level = parseInt(updateData.min_stock_level);
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
    if (updateData.length) updateData.length = parseFloat(updateData.length);
    if (updateData.width) updateData.width = parseFloat(updateData.width);
    if (updateData.height) updateData.height = parseFloat(updateData.height);

    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedProduct, 'Product updated successfully'));
  } catch (error: any) {
    logger.error('Error updating product', {
      source: 'productRoutes',
      method: 'updateProduct',
      productId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      prismaCode: error?.code
    });

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('sku')) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          createApiResponse(false, null, 'A product with this SKU already exists. Please use a different SKU.')
        );
      }
      
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, 'A product with these details already exists.')
      );
    }

    // Handle other Prisma errors
    if (error.code?.startsWith('P')) {
      const prismaErrorMessages: Record<string, string> = {
        'P2003': 'Foreign key constraint failed. Please check related data.',
        'P2025': 'Record not found.',
        'P2014': 'Invalid ID provided.'
      };
      
      const message = prismaErrorMessages[error.code] || 'Database constraint violation.';
      return res.status(HttpStatus.BAD_REQUEST).json(
        createApiResponse(false, null, message)
      );
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update product')
    );
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     description: Soft delete a product by setting deleted_at timestamp. This action can be reversed. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: "Product deleted successfully"
 *       400:
 *         description: Bad request - Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Invalid product ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Product not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: "Product not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.products.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Product deleted successfully'));
  } catch (error) {
    logger.error('Error deleting product', {
      source: 'productRoutes',
      method: 'deleteProduct',
      productId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete product')
    );
  }
});

export default router;