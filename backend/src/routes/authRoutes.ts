import { Router, Request, Response } from 'express';
import { LoginDto, createApiResponse, HttpStatus, validateEmail } from '../../../shared/dist'

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password }: LoginDto = req.body;

  // Validation
  if (!email || !password) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      createApiResponse(false, null, 'Email and password are required')
    );
  }

  if (!validateEmail(email)) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      createApiResponse(false, null, 'Invalid email format')
    );
  }

  // Mock authentication
  if (email === 'admin@example.com' && password === 'password123') {
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
    res.status(HttpStatus.UNAUTHORIZED).json(
      createApiResponse(false, null, 'Invalid credentials')
    );
  }
});

export default router;