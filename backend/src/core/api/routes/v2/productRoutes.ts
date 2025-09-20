import { Router } from 'express';
import { container } from '../../../infrastructure/container/Container';
import { EnhancedProductController } from '../../controllers/EnhancedProductController';

const router = Router();

// Get controller instances from DI container
const getProductController = (): EnhancedProductController => {
    return container.get<EnhancedProductController>('EnhancedProductController');
};

// TODO: Add authentication middleware when it's properly configured

/**
 * @swagger
 * /api/v2/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *               - price
 *               - cost
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Widget"
 *               sku:
 *                 type: string
 *                 example: "PW-001"
 *               barcode:
 *                 type: string
 *                 example: "1234567890123"
 *               description:
 *                 type: string
 *                 example: "High-quality premium widget"
 *               categoryId:
 *                 type: string
 *                 example: "cat-123"
 *               price:
 *                 type: number
 *                 example: 29.99
 *               cost:
 *                 type: number
 *                 example: 15.50
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     example: 1.5
 *                   unit:
 *                     type: string
 *                     example: "kg"
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                     example: 10
 *                   width:
 *                     type: number
 *                     example: 5
 *                   height:
 *                     type: number
 *                     example: 3
 *                   unit:
 *                     type: string
 *                     example: "cm"
 *               stockQuantity:
 *                 type: number
 *                 example: 100
 *               reorderLevel:
 *                 type: number
 *                 example: 20
 *               maxStockLevel:
 *                 type: number
 *                 example: 1000
 *               status:
 *                 type: string
 *                 enum: [active, inactive, discontinued, draft, pending_approval, out_of_stock]
 *                 example: "active"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["electronics", "premium"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *               specifications:
 *                 type: object
 *                 example: {"color": "blue", "material": "plastic"}
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
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
    const controller = getProductController();
    await controller.createProduct(req, res);
});

/**
 * @swagger
 * /api/v2/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Include deleted products in search
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    const controller = getProductController();
    await controller.getProductById(req, res);
});

/**
 * @swagger
 * /api/v2/products/sku/{sku}:
 *   get:
 *     summary: Get product by SKU
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: Product SKU
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Include deleted products in search
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/sku/:sku', async (req, res) => {
    const controller = getProductController();
    await controller.getProductBySku(req, res);
});

/**
 * @swagger
 * /api/v2/products:
 *   get:
 *     summary: Search products
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Product name search
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Product SKU search
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Product status filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Currency for price filters
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, sku, price, stock, createdAt, updatedAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Products found
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
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
    const controller = getProductController();
    await controller.searchProducts(req, res);
});

/**
 * @swagger
 * /api/v2/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               price:
 *                 type: number
 *               cost:
 *                 type: number
 *               currency:
 *                 type: string
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *                   unit:
 *                     type: string
 *               reorderLevel:
 *                 type: number
 *               maxStockLevel:
 *                 type: number
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               specifications:
 *                 type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/:id', async (req, res) => {
    const controller = getProductController();
    await controller.updateProduct(req, res);
});

/**
 * @swagger
 * /api/v2/products/{id}/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - quantity
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [add, remove, set]
 *                 description: Stock operation type
 *                 example: "add"
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *                 description: Quantity to add, remove, or set
 *                 example: 50
 *               reason:
 *                 type: string
 *                 description: Reason for stock change
 *                 example: "Inventory adjustment"
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *                     previousStock:
 *                       type: number
 *                       example: 100
 *                     newStock:
 *                       type: number
 *                       example: 150
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/stock', async (req, res) => {
    const controller = getProductController();
    await controller.updateProductStock(req, res);
});

/**
 * @swagger
 * /api/v2/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: Force delete even if there are constraints
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
    const controller = getProductController();
    await controller.deleteProduct(req, res);
});

export default router;