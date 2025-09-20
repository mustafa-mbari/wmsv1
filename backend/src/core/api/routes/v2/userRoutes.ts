import { Router } from 'express';
import { DomainContainer } from '../../../core/infrastructure/container/DomainContainer';
import { UserController } from '../../../core/interface/controllers/UserController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
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
 * /api/v2/users:
 *   get:
 *     summary: Get all users
 *     tags: [User - Domain v2]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *   post:
 *     summary: Create new user
 *     tags: [User - Domain v2]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *
 * /api/v2/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *   put:
 *     summary: Update user
 *     tags: [User - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete user
 *     tags: [User - Domain v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */

// Get user controller from domain container
const getController = (): UserController => {
    return DomainContainer.get<UserController>('UserController');
};

// Routes
router.get('/', async (req, res) => {
    const controller = getController();
    await controller.getAllUsers(req, res);
});

router.post('/', async (req, res) => {
    const controller = getController();
    await controller.createUser(req, res);
});

router.get('/:id', async (req, res) => {
    const controller = getController();
    await controller.getUser(req, res);
});

router.put('/:id', async (req, res) => {
    const controller = getController();
    await controller.updateUser(req, res);
});

router.delete('/:id', async (req, res) => {
    const controller = getController();
    await controller.deleteUser(req, res);
});

export default router;