import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from './utils/logger/logger';
import { requestLogger } from './core/api/middleware/requestLogger';
import { swaggerSpec } from './config/swagger';

// Import routes - Public Schema
import userRoutes from './core/api/routes/public/userRoutes';
import authRoutes from './core/api/routes/public/authRoutes';
import profileRoutes from './core/api/routes/public/profileRoutes';
import permissionRoutes from './core/api/routes/public/permissionRoutes';
import roleRoutes from './core/api/routes/public/roleRoutes';
import rolePermissionRoutes from './core/api/routes/public/rolePermissionRoutes';
import userRoleRoutes from './core/api/routes/public/userRoleRoutes';
import unitRoutes from './core/api/routes/public/unitRoutes';
import classTypeRoutes from './core/api/routes/public/classTypeRoutes';
import notificationRoutes from './core/api/routes/public/notificationRoutes';
import systemLogRoutes from './core/api/routes/public/systemLogRoutes';
import systemSettingRoutes from './core/api/routes/public/systemSettingRoutes';

// Import routes - Product Schema
import productRoutes from './core/api/routes/product/productRoutes';
import categoryRoutes from './core/api/routes/product/categoryRoutes';
import familyRoutes from './core/api/routes/product/familyRoutes';
import brandRoutes from './core/api/routes/product/brandRoutes';
import attributeRoutes from './core/api/routes/product/attributeRoutes';
import attributeOptionRoutes from './core/api/routes/product/attributeOptionRoutes';
import attributeValueRoutes from './core/api/routes/product/attributeValueRoutes';

// Import routes - Inventory Schema
import inventoryRoutes from './core/api/routes/inventory/inventoryRoutes';
import inventoryCountRoutes from './core/api/routes/inventory/inventoryCountRoutes';
import inventoryMovementRoutes from './core/api/routes/inventory/inventoryMovementRoutes';
import inventoryReservationRoutes from './core/api/routes/inventory/inventoryReservationRoutes';

// Import routes - Warehouse Schema
import warehouseRoutes from './core/api/routes/warehouse/warehouseRoutes';

// Import v2 API routes with Domain-Driven Design - temporarily disabled
// import v2Routes from './core/api/routes/v2';
import aisleRoutes from './core/api/routes/warehouse/aisleRoutes';
import zoneRoutes from './core/api/routes/warehouse/zoneRoutes';
import rackRoutes from './core/api/routes/warehouse/rackRoutes';
import levelRoutes from './core/api/routes/warehouse/levelRoutes';
import binRoutes from './core/api/routes/warehouse/binRoutes';
import binTypeRoutes from './core/api/routes/warehouse/binTypeRoutes';
import binMovementRoutes from './core/api/routes/warehouse/binMovementRoutes';
import binContentRoutes from './core/api/routes/warehouse/binContentRoutes';
import locationRoutes from './core/api/routes/warehouse/locationRoutes';

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

// Swagger documentation
app.use('/api-docs', (req: Request, res: Response, next: any) => {
  // Simple middleware to serve Swagger UI
  const swaggerHtml = swaggerUi.generateHTML(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'WM-Lab API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });
  res.send(swaggerHtml);
});

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes - Public Schema
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/class-types', classTypeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-logs', systemLogRoutes);
app.use('/api/system-settings', systemSettingRoutes);

// Routes - Product Schema
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/attribute-options', attributeOptionRoutes);
app.use('/api/attribute-values', attributeValueRoutes);

// Routes - Inventory Schema
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-counts', inventoryCountRoutes);
app.use('/api/inventory-movements', inventoryMovementRoutes);
app.use('/api/inventory-reservations', inventoryReservationRoutes);

// Routes - Warehouse Schema
app.use('/api/warehouses', warehouseRoutes);

// Routes - v2 API with Domain-Driven Design - temporarily disabled
// app.use('/api/v2', v2Routes);
app.use('/api/aisles', aisleRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/bin-types', binTypeRoutes);
app.use('/api/bin-movements', binMovementRoutes);
app.use('/api/bin-contents', binContentRoutes);
app.use('/api/locations', locationRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  logger.info('Health check endpoint accessed', { source: 'app', method: 'health' });
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json(createApiResponse(true, { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    documentation: `${baseUrl}/api-docs`,
    version: '1.0.0'
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