"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const dist_1 = require("../../shared/dist");
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json((0, dist_1.createApiResponse)(true, {
        status: 'OK',
        timestamp: new Date().toISOString()
    }));
});
// 404 handler
app.use('*', (req, res) => {
    res.status(dist_1.HttpStatus.NOT_FOUND).json((0, dist_1.createApiResponse)(false, null, 'Route not found'));
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(dist_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, dist_1.createApiResponse)(false, null, 'Internal server error', err.message));
});
exports.default = app;
//# sourceMappingURL=app.js.map