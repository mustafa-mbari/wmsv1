"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dist_1 = require("../../../shared/dist");
const logger_1 = __importDefault(require("../utils/logger/logger"));
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
    logger_1.default.info('Fetching all users', {
        source: 'userRoutes',
        method: 'getUsers',
        count: users.length
    });
    res.json((0, dist_1.createApiResponse)(true, users, 'Users retrieved successfully'));
});
// GET /api/users/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    logger_1.default.info('Fetching user by ID', {
        source: 'userRoutes',
        method: 'getUserById',
        userId: id
    });
    const user = users.find(u => u.id === id);
    if (!user) {
        logger_1.default.warn('User not found', {
            source: 'userRoutes',
            method: 'getUserById',
            userId: id
        });
        return res.status(dist_1.HttpStatus.NOT_FOUND).json((0, dist_1.createApiResponse)(false, null, 'User not found'));
    }
    logger_1.default.info('User retrieved successfully', {
        source: 'userRoutes',
        method: 'getUserById',
        userId: id,
        userEmail: user.email
    });
    res.json((0, dist_1.createApiResponse)(true, user, 'User retrieved successfully'));
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map