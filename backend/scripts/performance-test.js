#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API response times and validates performance with new architecture
 */

const http = require('http');

const baseURL = 'http://localhost:8000';

// Performance test configuration
const testConfig = {
  concurrentRequests: 10,
  totalRequests: 100,
  endpoints: [
    { path: '/api/health', method: 'GET', weight: 1 },
    { path: '/api/products', method: 'GET', weight: 3 },
    { path: '/api/users', method: 'GET', weight: 2 },
    { path: '/api/warehouses', method: 'GET', weight: 2 },
    { path: '/api/auth/login', method: 'POST', weight: 1 }
  ]
};

// Performance thresholds (milliseconds)
const thresholds = {
  excellent: 100,
  good: 500,
  acceptable: 1000,
  poor: 2000
};

class PerformanceTester {
  constructor() {
    this.results = [];
    this.authToken = null;
  }

  async getAuthToken() {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      });

      const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            this.authToken = response.data?.token || null;
          } catch (error) {
            console.log('Could not get auth token');
          }
          resolve();
        });
      });

      req.on('error', () => resolve());
      req.write(postData);
      req.end();
    });
  }

  async testEndpoint(endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const options = {
        hostname: 'localhost',
        port: 8000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Performance-Test'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          resolve({
            endpoint: endpoint.path,
            method: endpoint.method,
            responseTime,
            status: res.statusCode,
            size: data.length,
            success: res.statusCode < 400
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        resolve({
          endpoint: endpoint.path,
          method: endpoint.method,
          responseTime: endTime - startTime,
          status: 0,
          size: 0,
          success: false,
          error: error.message
        });
      });

      // Add request body for POST requests
      if (endpoint.method === 'POST' && endpoint.path === '/api/auth/login') {
        req.write(JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        }));
      }

      req.end();
    });
  }

  async runConcurrentTests(endpoint, concurrency, totalRequests) {
    const results = [];
    const requestsPerWorker = Math.ceil(totalRequests / concurrency);

    const workers = Array.from({ length: concurrency }, async () => {
      for (let i = 0; i < requestsPerWorker && results.length < totalRequests; i++) {
        const result = await this.testEndpoint(endpoint);
        results.push(result);
      }
    });

    await Promise.all(workers);
    return results.slice(0, totalRequests);
  }

  calculateStats(results) {
    const responseTimes = results
      .filter(r => r.success)
      .map(r => r.responseTime);

    if (responseTimes.length === 0) {
      return { error: 'No successful requests' };
    }

    responseTimes.sort((a, b) => a - b);

    return {
      total: results.length,
      successful: responseTimes.length,
      failed: results.length - responseTimes.length,
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      mean: Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length),
      median: responseTimes[Math.floor(responseTimes.length / 2)],
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
      successRate: Math.round((responseTimes.length / results.length) * 100)
    };
  }

  getPerformanceRating(responseTime) {
    if (responseTime <= thresholds.excellent) return '🟢 Excellent';
    if (responseTime <= thresholds.good) return '🟡 Good';
    if (responseTime <= thresholds.acceptable) return '🟠 Acceptable';
    if (responseTime <= thresholds.poor) return '🔴 Poor';
    return '⚫ Critical';
  }

  async runFullTest() {
    console.log('🚀 Starting Performance Testing...\n');
    console.log(`Target: ${baseURL}`);
    console.log(`Configuration:`);
    console.log(`  - Concurrent Requests: ${testConfig.concurrentRequests}`);
    console.log(`  - Total Requests per Endpoint: ${testConfig.totalRequests}`);
    console.log('\\n');

    // Get auth token first
    await this.getAuthToken();

    const allResults = [];

    for (const endpoint of testConfig.endpoints) {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);

      const results = await this.runConcurrentTests(
        endpoint,
        testConfig.concurrentRequests,
        testConfig.totalRequests
      );

      const stats = this.calculateStats(results);

      if (stats.error) {
        console.log(`❌ ${endpoint.path}: ${stats.error}\\n`);
        continue;
      }

      console.log(`Results for ${endpoint.path}:`);
      console.log(`  Success Rate: ${stats.successRate}%`);
      console.log(`  Response Times (ms):`);
      console.log(`    Min: ${stats.min}ms`);
      console.log(`    Mean: ${stats.mean}ms ${this.getPerformanceRating(stats.mean)}`);
      console.log(`    Median: ${stats.median}ms`);
      console.log(`    Max: ${stats.max}ms`);
      console.log(`    95th percentile: ${stats.p95}ms`);
      console.log(`    99th percentile: ${stats.p99}ms`);
      console.log('');

      allResults.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        stats
      });
    }

    // Overall assessment
    console.log('=' .repeat(60));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('=' .repeat(60));

    let totalScore = 0;
    let totalWeight = 0;

    allResults.forEach((result, index) => {
      const endpoint = testConfig.endpoints[index];
      const weight = endpoint.weight;

      let score = 0;
      if (result.stats.mean <= thresholds.excellent) score = 100;
      else if (result.stats.mean <= thresholds.good) score = 80;
      else if (result.stats.mean <= thresholds.acceptable) score = 60;
      else if (result.stats.mean <= thresholds.poor) score = 40;
      else score = 20;

      totalScore += score * weight;
      totalWeight += weight;

      console.log(`${result.endpoint}: ${result.stats.mean}ms (${this.getPerformanceRating(result.stats.mean)})`);
    });

    const overallScore = Math.round(totalScore / totalWeight);

    console.log('\\n🎯 OVERALL PERFORMANCE ASSESSMENT:');
    console.log(`Score: ${overallScore}/100`);

    if (overallScore >= 90) {
      console.log('🟢 EXCELLENT: Outstanding performance! Architecture migration successful.');
    } else if (overallScore >= 75) {
      console.log('🟡 GOOD: Solid performance with room for optimization.');
    } else if (overallScore >= 60) {
      console.log('🟠 ACCEPTABLE: Performance adequate but needs attention.');
    } else {
      console.log('🔴 POOR: Performance issues detected, optimization required.');
    }

    console.log('\\n📈 RECOMMENDATIONS:');
    if (overallScore >= 90) {
      console.log('✅ Continue monitoring performance');
      console.log('✅ Consider adding more comprehensive caching');
      console.log('✅ Monitor for performance regressions');
    } else {
      console.log('⚠️  Consider implementing caching strategies');
      console.log('⚠️  Review database query optimization');
      console.log('⚠️  Consider adding response compression');
      console.log('⚠️  Monitor server resources and scaling');
    }

    return overallScore >= 60;
  }
}

// Run the performance test
const tester = new PerformanceTester();
tester.runFullTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  });