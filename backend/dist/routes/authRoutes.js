"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dist_1 = require("../../../shared/dist");
const logger_1 = __importDefault(require("../utils/logger/logger"));
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    logger_1.default.info('Login attempt', {
        source: 'authRoutes',
        method: 'login',
        email: email
    });
    // Validation
    if (!email || !password) {
        logger_1.default.warn('Login failed: missing credentials', {
            source: 'authRoutes',
            method: 'login',
            email: email || 'undefined'
        });
        return res.status(dist_1.HttpStatus.BAD_REQUEST).json((0, dist_1.createApiResponse)(false, null, 'Email and password are required'));
    }
    if (!(0, dist_1.validateEmail)(email)) {
        logger_1.default.warn('Login failed: invalid email format', {
            source: 'authRoutes',
            method: 'login',
            email: email
        });
        return res.status(dist_1.HttpStatus.BAD_REQUEST).json((0, dist_1.createApiResponse)(false, null, 'Invalid email format'));
    }
    // Mock authentication
    if (email === 'admin@example.com' && password === 'password123') {
        logger_1.default.info('Login successful', {
            source: 'authRoutes',
            method: 'login',
            email: email
        });
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
        logger_1.default.warn('Login failed: invalid credentials', {
            source: 'authRoutes',
            method: 'login',
            email: email
        });
        res.status(dist_1.HttpStatus.UNAUTHORIZED).json((0, dist_1.createApiResponse)(false, null, 'Invalid credentials'));
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map