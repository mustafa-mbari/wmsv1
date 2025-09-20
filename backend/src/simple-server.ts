import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Mock Products API
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Sample Product 1',
        sku: 'PROD-001',
        description: 'This is a sample product for testing',
        price: 29.99,
        cost: 15.00,
        stock_quantity: 100,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sample Product 2',
        sku: 'PROD-002',
        description: 'Another sample product for testing',
        price: 49.99,
        cost: 25.00,
        stock_quantity: 50,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    message: 'Products retrieved successfully'
  });
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  res.json({
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  });
});

// Mock Users API
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890',
        roles: ['admin'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        username: 'user1',
        email: 'user1@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+0987654321',
        roles: ['user'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    message: 'Users retrieved successfully'
  });
});

// Mock Warehouses API
app.get('/api/warehouses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Main Warehouse',
        code: 'WH-001',
        description: 'Primary warehouse facility',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'State',
          country: 'Country',
          postal_code: '12345'
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    message: 'Warehouses retrieved successfully'
  });
});

// Mock Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Mock authentication - accept any email/password for demo
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          username: 'demo_user',
          email: email,
          first_name: 'Demo',
          last_name: 'User',
          roles: ['admin'],
          is_active: true
        }
      },
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      username: 'demo_user',
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      roles: ['admin'],
      is_active: true
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - GET  http://localhost:${PORT}/api/products`);
  console.log(`   - POST http://localhost:${PORT}/api/products`);
  console.log(`   - GET  http://localhost:${PORT}/api/users`);
  console.log(`   - GET  http://localhost:${PORT}/api/warehouses`);
  console.log(`🔑 Demo Login: Use any email/password combination`);
});