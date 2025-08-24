import { Router, Request, Response } from 'express';
import { User, createApiResponse, HttpStatus } from '../../../shared/dist'

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
  res.json(createApiResponse(true, users, 'Users retrieved successfully'));
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(HttpStatus.NOT_FOUND).json(
      createApiResponse(false, null, 'User not found')
    );
  }
  
  res.json(createApiResponse(true, user, 'User retrieved successfully'));
});

export default router;