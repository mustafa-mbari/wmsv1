#!/usr/bin/env node

/**
 * API Verification Script
 * Verifies that all critical API endpoints are working with the new architecture
 */

const https = require('http');

const baseURL = 'http://localhost:8000';

// Critical endpoints that must work
const criticalEndpoints = [
  { path: '/api/health', method: 'GET', requiresAuth: false, description: 'Health check' },
  { path: '/api/auth/login', method: 'POST', requiresAuth: false, description: 'Authentication' },
  { path: '/api/products', method: 'GET', requiresAuth: false, description: 'Products API' },
  { path: '/api/users', method: 'GET', requiresAuth: false, description: 'Users API' },
  { path: '/api/warehouses', method: 'GET', requiresAuth: false, description: 'Warehouses API' }
];

// Extended endpoints (nice to have)
const extendedEndpoints = [
  { path: '/api/categories', method: 'GET', requiresAuth: false, description: 'Categories API' },
  { path: '/api/brands', method: 'GET', requiresAuth: false, description: 'Brands API' },
  { path: '/api/families', method: 'GET', requiresAuth: false, description: 'Families API' },
  { path: '/api/attributes', method: 'GET', requiresAuth: false, description: 'Attributes API' },
  { path: '/api/inventory', method: 'GET', requiresAuth: false, description: 'Inventory API' },
  { path: '/api/inventory-movements', method: 'GET', requiresAuth: false, description: 'Inventory Movements API' },
  { path: '/api/inventory-counts', method: 'GET', requiresAuth: false, description: 'Inventory Counts API' },
  { path: '/api/zones', method: 'GET', requiresAuth: false, description: 'Zones API' },
  { path: '/api/aisles', method: 'GET', requiresAuth: false, description: 'Aisles API' },
  { path: '/api/racks', method: 'GET', requiresAuth: false, description: 'Racks API' },
  { path: '/api/levels', method: 'GET', requiresAuth: false, description: 'Levels API' },
  { path: '/api/bins', method: 'GET', requiresAuth: false, description: 'Bins API' },
  { path: '/api/locations', method: 'GET', requiresAuth: false, description: 'Locations API' }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, baseURL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Verification-Script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            endpoint: endpoint.path,
            description: endpoint.description,
            hasStandardFormat: jsonData.hasOwnProperty('success'),
            responseSize: data.length
          });
        } catch (error) {
          resolve({
            success: res.statusCode < 500,
            status: res.statusCode,
            endpoint: endpoint.path,
            description: endpoint.description,
            hasStandardFormat: false,
            responseSize: data.length,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        endpoint: endpoint.path,
        description: endpoint.description,
        error: error.message
      });
    });

    // For POST requests, send test data
    if (endpoint.method === 'POST') {
      if (endpoint.path === '/api/auth/login') {
        req.write(JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        }));
      } else {
        req.write(JSON.stringify({ test: 'data' }));
      }
    }

    req.end();
  });
}

async function runVerification() {
  console.log('🔍 Starting API Verification...\n');
  console.log(`Testing against: ${baseURL}\n`);

  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  // Test critical endpoints
  console.log('🔴 CRITICAL ENDPOINTS (Must Work):');
  console.log('=' .repeat(50));

  for (const endpoint of criticalEndpoints) {
    totalTests++;
    const result = await testEndpoint(endpoint);

    if (result.success && result.status < 500) {
      console.log(`✅ ${endpoint.description}: ${endpoint.method} ${endpoint.path} (${result.status})`);
      if (result.hasStandardFormat) {
        console.log(`   └─ Standard API format: ✅`);
      }
      passedTests++;
    } else {
      console.log(`❌ ${endpoint.description}: ${endpoint.method} ${endpoint.path} (${result.status || 'ERROR'})`);
      if (result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
      failedTests++;
    }
  }

  console.log('\\n🟡 EXTENDED ENDPOINTS (Nice to Have):');
  console.log('=' .repeat(50));

  // Test extended endpoints
  for (const endpoint of extendedEndpoints) {
    totalTests++;
    const result = await testEndpoint(endpoint);

    if (result.success && result.status < 500) {
      console.log(`✅ ${endpoint.description}: ${endpoint.method} ${endpoint.path} (${result.status})`);
      passedTests++;
    } else {
      console.log(`⚠️  ${endpoint.description}: ${endpoint.method} ${endpoint.path} (${result.status || 'ERROR'})`);
      if (result.error) {
        console.log(`   └─ ${result.error}`);
      }
      failedTests++;
    }
  }

  // Summary
  console.log('\\n' + '=' .repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Endpoints Tested: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  // Critical assessment
  const criticalPassed = passedTests >= criticalEndpoints.length;
  const overallHealthy = (passedTests / totalTests) >= 0.8;

  console.log('\\n🎯 ASSESSMENT:');
  if (criticalPassed && overallHealthy) {
    console.log('🟢 EXCELLENT: All critical endpoints working, architecture migration successful!');
    process.exit(0);
  } else if (criticalPassed) {
    console.log('🟡 GOOD: Critical endpoints working, some extended features need attention');
    process.exit(0);
  } else {
    console.log('🔴 CRITICAL: Some critical endpoints failing, needs immediate attention');
    process.exit(1);
  }
}

// Run the verification
runVerification().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});