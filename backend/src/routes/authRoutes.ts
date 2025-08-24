import { Router, Request, Response } from 'express';
import { LoginDto, createApiResponse, HttpStatus, validateEmail } from '../../../shared/dist'
import logger from '../utils/logger/logger';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password }: LoginDto = req.body;
  
  logger.info('Login attempt', { 
    source: 'authRoutes', 
    method: 'login',
    email: email 
  });

  // Validation
  if (!email || !password) {
    logger.warn('Login failed: missing credentials', { 
      source: 'authRoutes', 
      method: 'login',
      email: email || 'undefined'
    });
    return res.status(HttpStatus.BAD_REQUEST).json(
      createApiResponse(false, null, 'Email and password are required')
    );
  }

  if (!validateEmail(email)) {
    logger.warn('Login failed: invalid email format', { 
      source: 'authRoutes', 
      method: 'login',
      email: email
    });
    return res.status(HttpStatus.BAD_REQUEST).json(
      createApiResponse(false, null, 'Invalid email format')
    );
  }

  // Mock authentication
  if (email === 'admin@example.com' && password === 'password123') {
    logger.info('Login successful', { 
      source: 'authRoutes', 
      method: 'login',
      email: email
    });
    res.json(createApiResponse(true, {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email,
        name: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, 'Login successful'));
  } else {
    logger.warn('Login failed: invalid credentials', { 
      source: 'authRoutes', 
      method: 'login',
      email: email
    });
    res.status(HttpStatus.UNAUTHORIZED).json(
      createApiResponse(false, null, 'Invalid credentials')
    );
  }
});

export default router;