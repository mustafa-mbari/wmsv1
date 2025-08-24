"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importStar(require("winston"));
const { combine, timestamp, printf } = winston_1.format;
// مسار المجلد للّوجات
//const logsDir = 'C:\\Dev\\Git\\TestVSCode\\shared\\logs';
const logsDir = path_1.default.resolve(process.cwd(), 'shared', 'logs');
// إنشاء المجلد إذا غير موجود
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
    console.log('Created logs directory:', logsDir);
}
// فورمات لدمج الـ meta (second argument في logger.info)
const attachMeta = (0, winston_1.format)((info) => {
    const splat = info[Symbol.for('splat')];
    const meta = splat?.[0];
    if (meta && typeof meta === 'object') {
        Object.assign(info, meta);
    }
    return info;
});
// فورمات مخصص للعرض
const logFormat = printf((info) => {
    const { timestamp, level, message, source, method } = info;
    const sourceInfo = source ? `[${source}${method ? `::${method}` : ''}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${sourceInfo}: ${message}`;
});
const logger = winston_1.default.createLogger({
    level: 'debug',
    format: combine(attachMeta(), // دمج الميتا
    timestamp()),
    transports: [
        // All logs
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'app.log'),
            format: combine(timestamp(), logFormat),
        }),
        // Error logs only
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            format: combine(timestamp(), logFormat),
        }),
        // Debug logs only
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'debug.log'),
            level: 'debug',
            format: combine(timestamp(), logFormat),
        }),
        // Console logs
        new winston_1.transports.Console({
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map