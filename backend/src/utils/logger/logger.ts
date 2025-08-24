import fs from 'fs';
import path from 'path';
import winston, { format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform';

const { combine, timestamp, printf } = format;

// مسار المجلد للّوجات
//const logsDir = 'C:\\Dev\\Git\\TestVSCode\\shared\\logs';
const logsDir = 'C:\\Dev\\Git\\wmsV1\\shared\\logs';


// إنشاء المجلد إذا غير موجود
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('Created logs directory:', logsDir);
}

// واجهة للحقول الإضافية
interface LogInfo extends TransformableInfo {
  source?: string;
  method?: string;
}

// فورمات لدمج الـ meta (second argument في logger.info)
const attachMeta = format((info: LogInfo) => {
  const splat = info[Symbol.for('splat')] as unknown[];
  const meta = splat?.[0] as Record<string, unknown>;
  if (meta && typeof meta === 'object') {
    Object.assign(info, meta);
  }
  return info;
});

// فورمات مخصص للعرض
const logFormat = printf((info: LogInfo) => {
  const { timestamp, level, message, source, method } = info;
  const sourceInfo = source ? `[${source}${method ? `::${method}` : ''}]` : '';
  return `${timestamp} [${level.toUpperCase()}] ${sourceInfo}: ${message}`;
});


const appFileTransport = new transports.File({
  filename: path.join(logsDir, 'app.log'),
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});
appFileTransport.on('error', (err) => {
  console.error('Winston app.log file transport error:', err);
});

const errorFileTransport = new transports.File({
  filename: path.join(logsDir, 'error.log'),
  level: 'error',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});
errorFileTransport.on('error', (err) => {
  console.error('Winston error.log file transport error:', err);
});

const debugFileTransport = new transports.File({
  filename: path.join(logsDir, 'debug.log'),
  level: 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});
debugFileTransport.on('error', (err) => {
  console.error('Winston debug.log file transport error:', err);
});

const logger: Logger = winston.createLogger({
  level: 'debug',
  format: combine(
    attachMeta(),   // دمج الميتا
    timestamp()
  ),
  transports: [
    appFileTransport,
    errorFileTransport,
    debugFileTransport,
    new transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
  ],
});

export default logger;
