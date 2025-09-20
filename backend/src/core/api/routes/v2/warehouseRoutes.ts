import { Router } from 'express';
import { DomainContainer } from '../../../core/infrastructure/container/DomainContainer';
import { WarehouseController } from '../../../core/interface/controllers/WarehouseController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WarehouseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 * /api/v2/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouse - Domain v2]
 *     responses:
 *       200:
 *         description: List of warehouses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *   post:
 *     summary: Create new warehouse
 *     tags: [Warehouse - Domain v2]
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *
 * /api/v2/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouse - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Warehouse details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *   put:
 *     summary: Update warehouse
 *     tags: [Warehouse - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *   delete:
 *     summary: Delete warehouse
 *     tags: [Warehouse - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 */

// Get warehouse controller from domain container
const getController = (): WarehouseController => {
    return DomainContainer.get<WarehouseController>('WarehouseController');
};

// Routes
router.get('/', async (req, res) => {
    const controller = getController();
    await controller.getAllWarehouses(req, res);
});

router.post('/', async (req, res) => {
    const controller = getController();
    await controller.createWarehouse(req, res);
});

router.get('/:id', async (req, res) => {
    const controller = getController();
    await controller.getWarehouse(req, res);
});

router.put('/:id', async (req, res) => {
    const controller = getController();
    await controller.updateWarehouse(req, res);
});

router.delete('/:id', async (req, res) => {
    const controller = getController();
    await controller.deleteWarehouse(req, res);
});

export default router;