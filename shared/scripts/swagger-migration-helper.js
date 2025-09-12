#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BACKEND_DIR = path.join(__dirname, '..', '..', 'backend');
const ROUTES_DIR = path.join(BACKEND_DIR, 'src', 'routes');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

class SwaggerMigrationHelper {
  constructor() {
    this.routes = [];
    this.stats = {
      totalRoutes: 0,
      documentedRoutes: 0,
      undocumentedRoutes: 0,
      moduleProgress: {}
    };
  }

  async analyzeRoutes() {
    console.log('🔍 Analyzing existing routes...');
    
    const routeFiles = fs.readdirSync(ROUTES_DIR).filter(file => file.endsWith('.ts'));
    
    for (const file of routeFiles) {
      const filePath = path.join(ROUTES_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const moduleName = file.replace('.ts', '');
      
      // Extract routes using regex
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(['"`]([^'"`]+)['"`]/g);
      
      if (routeMatches) {
        const moduleRoutes = routeMatches.map(match => {
          const [, method, path] = match.match(/router\.(\w+)\s*\(['"`]([^'"`]+)['"`]/);
          const isDocumented = this.checkIfDocumented(content, method, path);
          
          return {
            module: moduleName,
            method: method.toUpperCase(),
            path: path,
            fullPath: this.buildFullPath(moduleName, path),
            documented: isDocumented,
            file: file
          };
        });
        
        this.routes.push(...moduleRoutes);
        this.stats.moduleProgress[moduleName] = {
          total: moduleRoutes.length,
          documented: moduleRoutes.filter(r => r.documented).length,
          undocumented: moduleRoutes.filter(r => !r.documented).length
        };
      }
    }
    
    this.calculateStats();
    return this.routes;
  }

  checkIfDocumented(content, method, path) {
    // Look for Swagger comments before the route definition
    const routeRegex = new RegExp(`router\\.${method}\\s*\\(['"\`]${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`);
    const routeIndex = content.search(routeRegex);
    
    if (routeIndex === -1) return false;
    
    // Look for @swagger comment in the 1000 characters before the route
    const beforeRoute = content.substring(Math.max(0, routeIndex - 1000), routeIndex);
    return beforeRoute.includes('@swagger') || beforeRoute.includes('* @swagger');
  }

  buildFullPath(module, path) {
    const moduleToApiPath = {
      'authRoutes': '/api/auth',
      'userRoutes': '/api/users',
      'productRoutes': '/api/products',
      'categoryRoutes': '/api/categories',
      'brandRoutes': '/api/brands',
      'familyRoutes': '/api/families',
      'unitRoutes': '/api/units',
      'attributeRoutes': '/api/attributes',
      'attributeOptionRoutes': '/api/attribute-options',
      'attributeValueRoutes': '/api/attribute-values',
      'profileRoutes': '/api/profile'
    };
    
    const basePath = moduleToApiPath[module] || `/api/${module.replace('Routes', '')}`;
    return path === '/' ? basePath : `${basePath}${path}`;
  }

  calculateStats() {
    this.stats.totalRoutes = this.routes.length;
    this.stats.documentedRoutes = this.routes.filter(r => r.documented).length;
    this.stats.undocumentedRoutes = this.stats.totalRoutes - this.stats.documentedRoutes;
  }

  printAnalysis() {
    console.log('\n📊 Route Analysis Results');
    console.log('========================');
    console.log(`Total Routes: ${this.stats.totalRoutes}`);
    console.log(`Documented: ${this.stats.documentedRoutes} (${((this.stats.documentedRoutes/this.stats.totalRoutes)*100).toFixed(1)}%)`);
    console.log(`Undocumented: ${this.stats.undocumentedRoutes} (${((this.stats.undocumentedRoutes/this.stats.totalRoutes)*100).toFixed(1)}%)`);
    
    console.log('\n📋 By Module:');
    Object.entries(this.stats.moduleProgress).forEach(([module, stats]) => {
      const percentage = stats.total > 0 ? ((stats.documented/stats.total)*100).toFixed(1) : 0;
      const status = percentage === '100.0' ? '✅' : percentage > '50' ? '🟡' : '🔴';
      console.log(`${status} ${module.padEnd(20)} ${stats.documented}/${stats.total} (${percentage}%)`);
    });

    console.log('\n🚫 Undocumented Routes:');
    this.routes.filter(r => !r.documented).forEach(route => {
      console.log(`   ${route.method.padEnd(6)} ${route.fullPath.padEnd(40)} (${route.file})`);
    });
  }

  generateMigrationPlan() {
    console.log('\n📝 Generating migration priorities...');
    
    // Priority classification
    const priorities = {
      high: ['authRoutes', 'userRoutes', 'productRoutes', 'categoryRoutes', 'brandRoutes'],
      medium: ['familyRoutes', 'unitRoutes', 'attributeRoutes'],
      low: ['attributeOptionRoutes', 'attributeValueRoutes', 'profileRoutes']
    };

    const plan = {
      phase1: [],
      phase2: [],
      phase3: []
    };

    // Categorize undocumented routes by priority
    this.routes.filter(r => !r.documented).forEach(route => {
      if (priorities.high.includes(route.module)) {
        plan.phase1.push(route);
      } else if (priorities.medium.includes(route.module)) {
        plan.phase2.push(route);
      } else {
        plan.phase3.push(route);
      }
    });

    console.log('\n🎯 Migration Plan:');
    console.log(`Phase 1 (High Priority): ${plan.phase1.length} routes`);
    console.log(`Phase 2 (Medium Priority): ${plan.phase2.length} routes`);
    console.log(`Phase 3 (Low Priority): ${plan.phase3.length} routes`);

    return plan;
  }

  generateDocumentationStub(route) {
    const template = `
/**
 * @swagger
 * ${route.fullPath}:
 *   ${route.method.toLowerCase()}:
 *     tags: [${this.getTagName(route.module)}]
 *     summary: ${this.generateSummary(route)}
 *     description: ${this.generateDescription(route)}
 *     security:
 *       - bearerAuth: []${this.generateParameters(route)}
 *     responses:
 *       ${this.getSuccessCode(route.method)}:
 *         description: ${this.generateSuccessDescription(route)}
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */`;

    return template;
  }

  getTagName(module) {
    const tagMap = {
      'authRoutes': 'Authentication',
      'userRoutes': 'Users',
      'productRoutes': 'Products',
      'categoryRoutes': 'Categories',
      'brandRoutes': 'Brands',
      'familyRoutes': 'Families',
      'unitRoutes': 'Units',
      'attributeRoutes': 'Attributes',
      'attributeOptionRoutes': 'Attribute Options',
      'attributeValueRoutes': 'Attribute Values',
      'profileRoutes': 'Profile'
    };
    return tagMap[module] || module.replace('Routes', '');
  }

  generateSummary(route) {
    const action = this.getActionFromMethod(route.method);
    const resource = this.getResourceFromPath(route.path, route.module);
    return `${action} ${resource}`;
  }

  generateDescription(route) {
    const action = this.getActionFromMethod(route.method);
    const resource = this.getResourceFromPath(route.path, route.module);
    return `${action} ${resource} with proper validation and error handling`;
  }

  getActionFromMethod(method) {
    const actionMap = {
      'GET': 'Get',
      'POST': 'Create',
      'PUT': 'Update',
      'DELETE': 'Delete',
      'PATCH': 'Partially update'
    };
    return actionMap[method] || method.toLowerCase();
  }

  getResourceFromPath(path, module) {
    if (path === '/') {
      return module.replace('Routes', '').toLowerCase();
    }
    if (path.includes('/:id')) {
      return `${module.replace('Routes', '').toLowerCase()} by ID`;
    }
    // Handle special paths
    if (path.includes('/search')) return 'search results';
    if (path.includes('/stats')) return 'statistics';
    if (path.includes('/upload')) return 'file upload';
    
    return `${module.replace('Routes', '').toLowerCase()} ${path.replace('/', '')}`;
  }

  generateParameters(route) {
    let params = '';
    if (route.path.includes('/:id')) {
      params += `
     parameters:
       - in: path
         name: id
         required: true
         schema:
           type: string
         description: Resource unique identifier`;
    }
    if (route.method === 'POST' || route.method === 'PUT') {
      params += `
     requestBody:
       required: true
       content:
         application/json:
           schema:
             type: object
             # TODO: Define proper schema`;
    }
    return params;
  }

  getSuccessCode(method) {
    return method === 'POST' ? '201' : '200';
  }

  generateSuccessDescription(route) {
    const action = this.getActionFromMethod(route.method);
    const resource = this.getResourceFromPath(route.path, route.module);
    return `${action} ${resource} successfully`;
  }

  async validateDocumentation() {
    console.log('\n🔍 Validating existing documentation...');
    
    try {
      // Check if server is running for validation
      const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';
      
      execSync(`curl -s ${BACKEND_URL}/api/health > /dev/null`, { stdio: 'ignore' });
      
      // Generate and validate OpenAPI spec
      execSync(`curl -s ${BACKEND_URL}/api-docs.json -o temp-api-docs.json`);
      
      const apiSpec = JSON.parse(fs.readFileSync('temp-api-docs.json', 'utf8'));
      
      console.log('✅ OpenAPI specification is valid');
      console.log(`📄 API Version: ${apiSpec.info.version}`);
      console.log(`📝 Total documented paths: ${Object.keys(apiSpec.paths || {}).length}`);
      
      // Cleanup
      fs.unlinkSync('temp-api-docs.json');
      
      return true;
    } catch (error) {
      console.log('❌ Validation failed:', error.message);
      console.log('💡 Make sure the backend server is running on the expected port');
      return false;
    }
  }

  generateNextSteps() {
    const undocumentedRoutes = this.routes.filter(r => !r.documented);
    const plan = this.generateMigrationPlan();

    console.log('\n🎯 Next Steps:');
    console.log('==============');

    if (plan.phase1.length > 0) {
      console.log('\n1. 🚀 Start with Phase 1 (High Priority):');
      const nextModule = [...new Set(plan.phase1.map(r => r.module))][0];
      const nextRoutes = plan.phase1.filter(r => r.module === nextModule).slice(0, 3);
      
      console.log(`   Focus on: ${nextModule}`);
      console.log('   Next routes to document:');
      nextRoutes.forEach(route => {
        console.log(`   • ${route.method} ${route.fullPath}`);
      });
      
      console.log('\n   📝 Steps:');
      console.log(`   1. Open: backend/src/routes/${nextRoutes[0].file}`);
      console.log('   2. Add Swagger documentation using templates');
      console.log('   3. Run: npm run generate:api');
      console.log('   4. Test in Swagger UI at /api-docs');
    }

    if (undocumentedRoutes.length === 0) {
      console.log('🎉 All routes are documented! Time for final optimization:');
      console.log('   1. Review documentation quality');
      console.log('   2. Add more detailed examples');
      console.log('   3. Optimize schema relationships');
      console.log('   4. Set up CI/CD integration');
    }

    console.log('\n🛠️  Commands:');
    console.log('   npm run generate:api    - Generate TypeScript types');
    console.log('   npm run docs:validate   - Validate documentation');
    console.log('   node shared/scripts/swagger-migration-helper.js analyze - Re-run analysis');
  }

  async run(command = 'analyze') {
    console.log('🚀 Swagger Migration Helper');
    console.log('===========================');

    switch (command) {
      case 'analyze':
        await this.analyzeRoutes();
        this.printAnalysis();
        this.generateNextSteps();
        break;
      
      case 'validate':
        await this.validateDocumentation();
        break;
      
      case 'plan':
        await this.analyzeRoutes();
        this.generateMigrationPlan();
        break;
      
      case 'stub':
        await this.analyzeRoutes();
        const undocumented = this.routes.filter(r => !r.documented);
        if (undocumented.length > 0) {
          console.log('\n📝 Documentation stub for next route:');
          console.log(this.generateDocumentationStub(undocumented[0]));
        }
        break;
      
      default:
        console.log('Usage: node swagger-migration-helper.js [analyze|validate|plan|stub]');
    }
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2] || 'analyze';
  const helper = new SwaggerMigrationHelper();
  helper.run(command).catch(console.error);
}

module.exports = SwaggerMigrationHelper;