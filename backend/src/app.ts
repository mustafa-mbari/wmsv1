import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from './utils/logger/logger';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import familyRoutes from './routes/familyRoutes';
import brandRoutes from './routes/brandRoutes';
import unitRoutes from './routes/unitRoutes';
import attributeRoutes from './routes/attributeRoutes';
import attributeOptionRoutes from './routes/attributeOptionRoutes';
import attributeValueRoutes from './routes/attributeValueRoutes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with proper headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Allow images to be loaded from frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set proper cache headers for images
    if (path.includes('profile-pictures') || path.includes('avatar')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
  }
}));

// Request logging middleware
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// Product-related routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/attribute-options', attributeOptionRoutes);
app.use('/api/attribute-values', attributeValueRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  logger.info('Health check endpoint accessed', { source: 'app', method: 'health' });
  res.json(createApiResponse(true, { 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  }));
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { source: 'app', method: '404Handler' });
  res.status(HttpStatus.NOT_FOUND).json(
    createApiResponse(false, null, 'Route not found')
  );
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Global error occurred', { 
    source: 'app', 
    method: 'errorHandler',
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    httpMethod: req.method
  });
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    createApiResponse(false, null, 'Internal server error', err.message)
  );
});

export default app;