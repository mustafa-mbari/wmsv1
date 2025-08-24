import { Router, Request, Response } from 'express';
import { User, createApiResponse, HttpStatus } from '../../../shared/dist'
import logger from '../utils/logger/logger';

const router = Router();

// Mock users data
const users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  logger.info('Fetching all users', { 
    source: 'userRoutes', 
    method: 'getUsers',
    count: users.length
  });
  res.json(createApiResponse(true, users, 'Users retrieved successfully'));
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info('Fetching user by ID', { 
    source: 'userRoutes', 
    method: 'getUserById',
    userId: id
  });
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    logger.warn('User not found', { 
      source: 'userRoutes', 
      method: 'getUserById',
      userId: id
    });
    return res.status(HttpStatus.NOT_FOUND).json(
      createApiResponse(false, null, 'User not found')
    );
  }
  
  logger.info('User retrieved successfully', { 
    source: 'userRoutes', 
    method: 'getUserById',
    userId: id,
    userEmail: user.email
  });
  res.json(createApiResponse(true, user, 'User retrieved successfully'));
});

export default router;