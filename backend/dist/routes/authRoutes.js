"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dist_1 = require("../../../shared/dist");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
        return res.status(dist_1.HttpStatus.BAD_REQUEST).json((0, dist_1.createApiResponse)(false, null, 'Email and password are required'));
    }
    if (!(0, dist_1.validateEmail)(email)) {
        return res.status(dist_1.HttpStatus.BAD_REQUEST).json((0, dist_1.createApiResponse)(false, null, 'Invalid email format'));
    }
    // Mock authentication
    if (email === 'admin@example.com' && password === 'password123') {
        res.json((0, dist_1.createApiResponse)(true, {
            token: 'mock-jwt-token',
            user: {
                id: '1',
                email,
                name: 'Admin User',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }, 'Login successful'));
    }
    else {
        res.status(dist_1.HttpStatus.UNAUTHORIZED).json((0, dist_1.createApiResponse)(false, null, 'Invalid credentials'));
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map