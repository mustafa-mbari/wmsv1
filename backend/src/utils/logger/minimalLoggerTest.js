const winston = require('winston');
const path = require('path');

const logsDir = 'C:\\Dev\\Git\\wmsV1\\shared\\logs';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'test.log') })
  ]
});

logger.info('Minimal logger test: This should appear in test.log');

console.log('Minimal logger test complete. Check shared/logs/test.log');
