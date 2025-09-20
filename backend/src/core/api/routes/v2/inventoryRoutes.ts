import { Router } from 'express';
import { DomainContainer } from '../../../core/infrastructure/container/DomainContainer';
import { InventoryController } from '../../../core/interface/controllers/InventoryController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryResponse:
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
 * /api/v2/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory - Domain v2]
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *   post:
 *     summary: Create new inventory item
 *     tags: [Inventory - Domain v2]
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *
 * /api/v2/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 */

// Get inventory controller from domain container
const getController = (): InventoryController => {
    return DomainContainer.get<InventoryController>('InventoryController');
};

// Routes
router.get('/', async (req, res) => {
    const controller = getController();
    await controller.getAllInventory(req, res);
});

router.post('/', async (req, res) => {
    const controller = getController();
    await controller.createInventory(req, res);
});

router.get('/:id', async (req, res) => {
    const controller = getController();
    await controller.getInventory(req, res);
});

router.put('/:id', async (req, res) => {
    const controller = getController();
    await controller.updateInventory(req, res);
});

router.delete('/:id', async (req, res) => {
    const controller = getController();
    await controller.deleteInventory(req, res);
});

export default router;