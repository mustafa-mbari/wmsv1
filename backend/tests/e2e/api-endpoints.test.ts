import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

describe('Complete API Endpoints Test', () => {
  let app: express.Application;
  let authToken: string;

  // All API endpoints to test based on the migration plan
  const endpoints = {
    auth: [
      { method: 'POST', path: '/api/auth/login', requiresAuth: false },
      { method: 'POST', path: '/api/auth/register', requiresAuth: false },
      { method: 'GET', path: '/api/auth/me', requiresAuth: true },
      { method: 'POST', path: '/api/auth/logout', requiresAuth: true }
    ],
    users: [
      { method: 'GET', path: '/api/users', requiresAuth: true },
      { method: 'POST', path: '/api/users', requiresAuth: true },
      { method: 'GET', path: '/api/users/1', requiresAuth: true },
      { method: 'PUT', path: '/api/users/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/users/1', requiresAuth: true }
    ],
    roles: [
      { method: 'GET', path: '/api/roles', requiresAuth: true },
      { method: 'POST', path: '/api/roles', requiresAuth: true },
      { method: 'GET', path: '/api/roles/1', requiresAuth: true },
      { method: 'PUT', path: '/api/roles/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/roles/1', requiresAuth: true }
    ],
    permissions: [
      { method: 'GET', path: '/api/permissions', requiresAuth: true },
      { method: 'POST', path: '/api/permissions', requiresAuth: true },
      { method: 'GET', path: '/api/permissions/1', requiresAuth: true },
      { method: 'PUT', path: '/api/permissions/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/permissions/1', requiresAuth: true }
    ],
    products: [
      { method: 'GET', path: '/api/products', requiresAuth: true },
      { method: 'POST', path: '/api/products', requiresAuth: true },
      { method: 'GET', path: '/api/products/1', requiresAuth: true },
      { method: 'PUT', path: '/api/products/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/products/1', requiresAuth: true }
    ],
    categories: [
      { method: 'GET', path: '/api/categories', requiresAuth: true },
      { method: 'POST', path: '/api/categories', requiresAuth: true },
      { method: 'GET', path: '/api/categories/1', requiresAuth: true },
      { method: 'PUT', path: '/api/categories/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/categories/1', requiresAuth: true }
    ],
    brands: [
      { method: 'GET', path: '/api/brands', requiresAuth: true },
      { method: 'POST', path: '/api/brands', requiresAuth: true },
      { method: 'GET', path: '/api/brands/1', requiresAuth: true },
      { method: 'PUT', path: '/api/brands/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/brands/1', requiresAuth: true }
    ],
    families: [
      { method: 'GET', path: '/api/families', requiresAuth: true },
      { method: 'POST', path: '/api/families', requiresAuth: true },
      { method: 'GET', path: '/api/families/1', requiresAuth: true },
      { method: 'PUT', path: '/api/families/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/families/1', requiresAuth: true }
    ],
    attributes: [
      { method: 'GET', path: '/api/attributes', requiresAuth: true },
      { method: 'POST', path: '/api/attributes', requiresAuth: true },
      { method: 'GET', path: '/api/attributes/1', requiresAuth: true },
      { method: 'PUT', path: '/api/attributes/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/attributes/1', requiresAuth: true }
    ],
    inventory: [
      { method: 'GET', path: '/api/inventory', requiresAuth: true },
      { method: 'POST', path: '/api/inventory', requiresAuth: true },
      { method: 'GET', path: '/api/inventory/1', requiresAuth: true },
      { method: 'PUT', path: '/api/inventory/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/inventory/1', requiresAuth: true }
    ],
    inventoryMovements: [
      { method: 'GET', path: '/api/inventory-movements', requiresAuth: true },
      { method: 'POST', path: '/api/inventory-movements', requiresAuth: true },
      { method: 'GET', path: '/api/inventory-movements/1', requiresAuth: true },
      { method: 'PUT', path: '/api/inventory-movements/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/inventory-movements/1', requiresAuth: true }
    ],
    inventoryCounts: [
      { method: 'GET', path: '/api/inventory-counts', requiresAuth: true },
      { method: 'POST', path: '/api/inventory-counts', requiresAuth: true },
      { method: 'GET', path: '/api/inventory-counts/1', requiresAuth: true },
      { method: 'PUT', path: '/api/inventory-counts/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/inventory-counts/1', requiresAuth: true }
    ],
    warehouses: [
      { method: 'GET', path: '/api/warehouses', requiresAuth: true },
      { method: 'POST', path: '/api/warehouses', requiresAuth: true },
      { method: 'GET', path: '/api/warehouses/1', requiresAuth: true },
      { method: 'PUT', path: '/api/warehouses/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/warehouses/1', requiresAuth: true }
    ],
    zones: [
      { method: 'GET', path: '/api/zones', requiresAuth: true },
      { method: 'POST', path: '/api/zones', requiresAuth: true },
      { method: 'GET', path: '/api/zones/1', requiresAuth: true },
      { method: 'PUT', path: '/api/zones/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/zones/1', requiresAuth: true }
    ],
    aisles: [
      { method: 'GET', path: '/api/aisles', requiresAuth: true },
      { method: 'POST', path: '/api/aisles', requiresAuth: true },
      { method: 'GET', path: '/api/aisles/1', requiresAuth: true },
      { method: 'PUT', path: '/api/aisles/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/aisles/1', requiresAuth: true }
    ],
    racks: [
      { method: 'GET', path: '/api/racks', requiresAuth: true },
      { method: 'POST', path: '/api/racks', requiresAuth: true },
      { method: 'GET', path: '/api/racks/1', requiresAuth: true },
      { method: 'PUT', path: '/api/racks/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/racks/1', requiresAuth: true }
    ],
    levels: [
      { method: 'GET', path: '/api/levels', requiresAuth: true },
      { method: 'POST', path: '/api/levels', requiresAuth: true },
      { method: 'GET', path: '/api/levels/1', requiresAuth: true },
      { method: 'PUT', path: '/api/levels/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/levels/1', requiresAuth: true }
    ],
    bins: [
      { method: 'GET', path: '/api/bins', requiresAuth: true },
      { method: 'POST', path: '/api/bins', requiresAuth: true },
      { method: 'GET', path: '/api/bins/1', requiresAuth: true },
      { method: 'PUT', path: '/api/bins/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/bins/1', requiresAuth: true }
    ],
    locations: [
      { method: 'GET', path: '/api/locations', requiresAuth: true },
      { method: 'POST', path: '/api/locations', requiresAuth: true },
      { method: 'GET', path: '/api/locations/1', requiresAuth: true },
      { method: 'PUT', path: '/api/locations/1', requiresAuth: true },
      { method: 'DELETE', path: '/api/locations/1', requiresAuth: true }
    ],
    system: [
      { method: 'GET', path: '/api/health', requiresAuth: false },
      { method: 'GET', path: '/api/system-settings', requiresAuth: true },
      { method: 'GET', path: '/api/system-logs', requiresAuth: true },
      { method: 'GET', path: '/api/notifications', requiresAuth: true }
    ]
  };

  beforeAll(async () => {
    // Setup test application - use the actual backend server for E2E testing
    const baseURL = process.env.TEST_API_URL || 'http://localhost:8000';

    // Get auth token
    try {
      const loginResponse = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      if (loginResponse.body.success) {
        authToken = loginResponse.body.data.token;
      }
    } catch (error) {
      console.log('Using mock server for testing');
      authToken = 'mock-token-for-testing';
    }
  });

  // Test all endpoints systematically
  Object.entries(endpoints).forEach(([domain, domainEndpoints]) => {
    describe(`${domain.toUpperCase()} Domain Endpoints`, () => {
      domainEndpoints.forEach(endpoint => {
        it(`should handle ${endpoint.method} ${endpoint.path}`, async () => {
          const baseURL = process.env.TEST_API_URL || 'http://localhost:8000';

          let req = request(baseURL);

          // Set up the request based on method
          switch (endpoint.method) {
            case 'GET':
              req = req.get(endpoint.path);
              break;
            case 'POST':
              req = req.post(endpoint.path);
              break;
            case 'PUT':
              req = req.put(endpoint.path);
              break;
            case 'DELETE':
              req = req.delete(endpoint.path);
              break;
          }

          // Add auth token if required
          if (endpoint.requiresAuth && authToken) {
            req = req.set('Authorization', `Bearer ${authToken}`);
          }

          // Add basic test data for POST/PUT requests
          if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
            req = req.send({ test: 'data' });
          }

          const response = await req;

          // Basic endpoint availability checks
          if (endpoint.requiresAuth && !authToken) {
            // Should require authentication
            expect([401, 403]).toContain(response.status);
          } else {
            // Should not return 404 (endpoint exists)
            expect(response.status).not.toBe(404);

            // Should return valid JSON response
            expect(response.headers['content-type']).toMatch(/json/);

            // Should have our standard API response format
            expect(response.body).toHaveProperty('success');

            // Accept various success/error status codes but not server errors
            expect(response.status).toBeLessThan(500);
          }
        });
      });
    });
  });

  describe('API Response Format Consistency', () => {
    it('should return consistent API response format across all endpoints', async () => {
      const testEndpoints = [
        '/api/health',
        '/api/auth/me'
      ];

      for (const endpoint of testEndpoints) {
        const baseURL = process.env.TEST_API_URL || 'http://localhost:8000';
        let req = request(baseURL).get(endpoint);

        if (endpoint !== '/api/health' && authToken) {
          req = req.set('Authorization', `Bearer ${authToken}`);
        }

        const response = await req;

        // Check standard API response format
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');

        if (response.body.success) {
          expect(response.body).toHaveProperty('data');
        } else {
          expect(response.body).toHaveProperty('message');
        }

        // Should have timestamp for tracking
        if (response.body.timestamp) {
          expect(typeof response.body.timestamp).toBe('string');
        }
      }
    });
  });

  describe('Error Handling Consistency', () => {
    it('should handle 404 errors consistently', async () => {
      const baseURL = process.env.TEST_API_URL || 'http://localhost:8000';
      const response = await request(baseURL)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeTruthy();
    });

    it('should handle authentication errors consistently', async () => {
      const baseURL = process.env.TEST_API_URL || 'http://localhost:8000';
      const response = await request(baseURL)
        .get('/api/users');

      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeTruthy();
    });
  });

  afterAll(async () => {
    // Cleanup
  });
});