"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger/logger"));
const PORT = process.env.PORT || 8000;
app_1.default.listen(PORT, () => {
    logger_1.default.info(`Backend server started successfully`, {
        source: 'server',
        method: 'startup',
        port: PORT,
        url: `http://localhost:${PORT}`
    });
    logger_1.default.info(`API documentation available`, {
        source: 'server',
        method: 'startup',
        docsUrl: `http://localhost:${PORT}/api`
    });
});
//# sourceMappingURL=server.js.map