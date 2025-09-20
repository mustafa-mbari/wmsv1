import { Router } from 'express';
import productRoutes from './productRoutes';
import inventoryRoutes from './inventoryRoutes';
import warehouseRoutes from './warehouseRoutes';
import userRoutes from './userRoutes';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products - Domain v2
 *     description: Product management API v2 with Domain-Driven Design
 *   - name: Inventory - Domain v2
 *     description: Inventory management API v2 with Domain-Driven Design
 *   - name: Warehouse - Domain v2
 *     description: Warehouse management API v2 with Domain-Driven Design
 *   - name: User - Domain v2
 *     description: User management API v2 with Domain-Driven Design
 */

// Mount domain routes
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/users', userRoutes);

/**
 * @swagger
 * /api/v2/health:
 *   get:
 *     summary: Health check for v2 API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "WMS API v2 is running with Domain-Driven Design"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 architecture:
 *                   type: string
 *                   example: "Adaptive Modular Architecture with DDD"
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'WMS API v2 is running with Domain-Driven Design',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        architecture: 'Adaptive Modular Architecture with DDD',
        features: [
            'Domain-Driven Design',
            'Clean Architecture',
            'Repository Pattern',
            'Use Cases',
            'Value Objects',
            'Domain Events',
            'Dependency Injection'
        ]
    });
});

export default router;