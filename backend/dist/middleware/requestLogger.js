"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger/logger"));
// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    // Log incoming request
    logger_1.default.info('Incoming request', {
        source: 'middleware',
        method: 'requestLogger',
        httpMethod: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - startTime;
        logger_1.default.info('Request completed', {
            source: 'middleware',
            method: 'requestLogger',
            httpMethod: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        });
        return originalJson.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map