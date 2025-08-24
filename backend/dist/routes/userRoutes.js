"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dist_1 = require("../../../shared/dist");
const router = (0, express_1.Router)();
// Mock users data
const users = [
    {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
// GET /api/users
router.get('/', (req, res) => {
    res.json((0, dist_1.createApiResponse)(true, users, 'Users retrieved successfully'));
});
// GET /api/users/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(dist_1.HttpStatus.NOT_FOUND).json((0, dist_1.createApiResponse)(false, null, 'User not found'));
    }
    res.json((0, dist_1.createApiResponse)(true, user, 'User retrieved successfully'));
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map