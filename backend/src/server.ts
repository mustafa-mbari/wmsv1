// import app from './app';
import logger from './utils/logger/logger';
import express from 'express';

const PORT = process.env.PORT || 8000;

// Add error handling for unhandled exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { source: 'server', error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { source: 'server', reason, promise });
  process.exit(1);
});

// Add error handling for SIGINT
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully', { source: 'server' });
  process.exit(0);
});

try {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3003');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { 
      source: 'server', 
      method: req.method, 
      path: req.path,
      body: req.body,
      headers: req.headers
    });
    next();
  });
  
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Basic auth routes for testing
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    logger.info('Login attempt', { 
      source: 'server', 
      email, 
      passwordProvided: !!password,
      body: req.body
    });
    
    // Simple test credentials
    if (email === 'mustafa@wmlab.com' && password === 'asd123') {
      const responseData = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 1,
            email: 'mustafa@wmlab.com',
            username: 'mustafa',
            first_name: 'System',
            last_name: 'Administrator',
            role_names: ['super-admin']
          }
        }
      };
      
      logger.info('Login successful', { source: 'server', email, userId: '1' });
      res.json(responseData);
    } else {
      logger.warn('Login failed - invalid credentials', { 
        source: 'server', 
        email, 
        providedPassword: password,
        expectedEmail: 'mustafa@wmlab.com',
        expectedPassword: 'asd123'
      });
      
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'mustafa@wmlab.com',
          username: 'mustafa',
          first_name: 'System',
          last_name: 'Administrator',
          role_names: ['super-admin']
        }
      }
    });
  });

  app.get('/api/users', (req, res) => {
    res.json({
      success: true,
      data: [
        {
          id: 1,
          username: 'mustafa',
          email: 'mustafa@wmlab.com',
          first_name: 'System',
          last_name: 'Administrator',
          phone: '+1234567890',
          is_active: true,
          email_verified: true,
          role_names: ['super-admin'],
          role_slugs: ['super-admin'],
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        }
      ]
    });
  });

  app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        username: 'mustafa',
        email: 'mustafa@wmlab.com',
        first_name: 'System',
        last_name: 'Administrator',
        phone: '+1234567890',
        address: '123 Admin Street, Tech City',
        birth_date: '1990-01-01',
        gender: 'other',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role_names: ['super-admin'],
        role_slugs: ['super-admin']
      }
    });
  });

  const server = app.listen(PORT, () => {
    logger.info(`Backend server started successfully`, { 
      source: 'server', 
      method: 'startup',
      port: PORT,
      url: `http://localhost:${PORT}`
    });
    logger.info(`API documentation available`, { 
      source: 'server', 
      method: 'startup',
      docsUrl: `http://localhost:${PORT}/api`
    });
  });

  server.on('error', (error: any) => {
    logger.error('Server error:', { source: 'server', error: error.message });
  });

} catch (error) {
  logger.error('Failed to start server:', { source: 'server', error: error instanceof Error ? error.message : error });
  process.exit(1);
}