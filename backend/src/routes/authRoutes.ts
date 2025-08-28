import { Router, Request, Response } from 'express';
import { LoginDto, createApiResponse, HttpStatus, validateEmail } from '../../../shared/dist'
import logger from '../utils/logger/logger';
import prisma from '../utils/prismaClient'; // Adjust the import based on your project structure
import bcrypt from 'bcryptjs'; // or 'bcrypt' depending on your bcrypt version

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password }: LoginDto = req.body;

  logger.info('Login attempt', { source: 'authRoutes', method: 'login', email });

  // Validation
  if (!email || !password) {
    logger.warn('Login failed: missing credentials', { source: 'authRoutes', method: 'login', email: email || 'undefined' });
    return res.status(HttpStatus.BAD_REQUEST).json(createApiResponse(false, null, 'Email and password are required'));
  }

  if (!validateEmail(email)) {
    logger.warn('Login failed: invalid email format', { source: 'authRoutes', method: 'login', email });
    return res.status(HttpStatus.BAD_REQUEST).json(createApiResponse(false, null, 'Invalid email format'));
  }

  // Find user in DB
  let user = await prisma.users.findUnique({ where: { email } });
  let validPassword = false;
  if (user) {
    validPassword = await bcrypt.compare(password, user.password_hash);
  } else {
    // Mock authentication fallback
    if (email === 'admin@example.com' && password === 'password123') {

      validPassword = true;
    }
  }

  if (!user || !validPassword) {
    logger.warn('Login failed: invalid credentials', { source: 'authRoutes', method: 'login', email });
    return res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(false, null, 'Invalid credentials'));
  }

  // Success: generate JWT, etc.
  logger.info('Login successful', { source: 'authRoutes', method: 'login', email });
  
  // Example response (replace with your JWT logic if needed)
res.json(createApiResponse(true, { user }, 'Login successful'));
});

export default router;