#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SwaggerValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  async validateOpenApiSpec() {
    console.log('🔍 Validating OpenAPI Specification...');
    
    try {
      const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';
      
      // Test if server is running
      execSync(`curl -s --max-time 5 ${BACKEND_URL}/api/health > /dev/null`);
      console.log('✅ Backend server is running');
      this.results.passed++;

      // Fetch OpenAPI spec
      execSync(`curl -s ${BACKEND_URL}/api-docs.json -o temp-validation-spec.json`);
      
      const spec = JSON.parse(fs.readFileSync('temp-validation-spec.json', 'utf8'));
      
      // Basic structure validation
      this.validateBasicStructure(spec);
      
      // Path validation
      this.validatePaths(spec);
      
      // Schema validation
      this.validateSchemas(spec);
      
      // Security validation
      this.validateSecurity(spec);
      
      // Cleanup
      fs.unlinkSync('temp-validation-spec.json');
      
    } catch (error) {
      this.addError('OpenAPI Spec Fetch', `Failed to fetch spec: ${error.message}`);
    }
  }

  validateBasicStructure(spec) {
    console.log('📋 Validating basic OpenAPI structure...');
    
    const requiredFields = ['openapi', 'info', 'paths'];
    const missingFields = requiredFields.filter(field => !spec[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Basic structure is valid');
      this.results.passed++;
    } else {
      this.addError('Basic Structure', `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Info validation
    if (spec.info) {
      const infoRequired = ['title', 'version', 'description'];
      const infoMissing = infoRequired.filter(field => !spec.info[field]);
      
      if (infoMissing.length === 0) {
        console.log('✅ Info object is complete');
        this.results.passed++;
      } else {
        this.addWarning('Info Object', `Missing recommended fields: ${infoMissing.join(', ')}`);
      }
    }
  }

  validatePaths(spec) {
    console.log('🛣️  Validating API paths...');
    
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      this.addError('Paths', 'No paths defined in specification');
      return;
    }

    const paths = Object.keys(spec.paths);
    console.log(`📊 Found ${paths.length} documented paths`);

    let validPaths = 0;
    let pathIssues = [];

    for (const pathName of paths) {
      const pathObj = spec.paths[pathName];
      const methods = Object.keys(pathObj).filter(key => 
        ['get', 'post', 'put', 'delete', 'patch'].includes(key)
      );

      if (methods.length === 0) {
        pathIssues.push(`${pathName}: No HTTP methods defined`);
        continue;
      }

      let pathValid = true;

      for (const method of methods) {
        const operation = pathObj[method];
        
        // Check required operation fields
        if (!operation.summary) {
          pathIssues.push(`${method.toUpperCase()} ${pathName}: Missing summary`);
          pathValid = false;
        }
        
        if (!operation.responses) {
          pathIssues.push(`${method.toUpperCase()} ${pathName}: Missing responses`);
          pathValid = false;
        } else {
          // Check for success response
          const hasSuccessResponse = Object.keys(operation.responses).some(code => 
            code.startsWith('2')
          );
          if (!hasSuccessResponse) {
            pathIssues.push(`${method.toUpperCase()} ${pathName}: No success response defined`);
            pathValid = false;
          }
        }

        // Check for tags
        if (!operation.tags || operation.tags.length === 0) {
          pathIssues.push(`${method.toUpperCase()} ${pathName}: Missing tags for organization`);
        }
      }

      if (pathValid) {
        validPaths++;
      }
    }

    if (pathIssues.length === 0) {
      console.log('✅ All paths are properly documented');
      this.results.passed++;
    } else {
      console.log(`⚠️  Found ${pathIssues.length} path documentation issues`);
      pathIssues.forEach(issue => this.addWarning('Path Documentation', issue));
    }

    console.log(`📈 Path validation: ${validPaths}/${paths.length} paths are valid`);
  }

  validateSchemas(spec) {
    console.log('📐 Validating schemas...');
    
    if (!spec.components?.schemas) {
      this.addWarning('Schemas', 'No schemas defined - consider adding reusable schemas');
      return;
    }

    const schemas = Object.keys(spec.components.schemas);
    console.log(`📊 Found ${schemas.length} schemas`);

    let validSchemas = 0;
    let schemaIssues = [];

    for (const schemaName of schemas) {
      const schema = spec.components.schemas[schemaName];
      
      if (!schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
        schemaIssues.push(`${schemaName}: Missing type definition`);
        continue;
      }

      if (schema.type === 'object' && !schema.properties && !schema.additionalProperties) {
        schemaIssues.push(`${schemaName}: Object type without properties`);
        continue;
      }

      validSchemas++;
    }

    if (schemaIssues.length === 0) {
      console.log('✅ All schemas are properly defined');
      this.results.passed++;
    } else {
      console.log(`⚠️  Found ${schemaIssues.length} schema issues`);
      schemaIssues.forEach(issue => this.addWarning('Schema Definition', issue));
    }

    console.log(`📈 Schema validation: ${validSchemas}/${schemas.length} schemas are valid`);
  }

  validateSecurity(spec) {
    console.log('🔒 Validating security configuration...');
    
    if (!spec.components?.securitySchemes) {
      this.addWarning('Security', 'No security schemes defined');
      return;
    }

    const securitySchemes = spec.components.securitySchemes;
    const schemeNames = Object.keys(securitySchemes);
    
    console.log(`🔐 Found ${schemeNames.length} security schemes: ${schemeNames.join(', ')}`);

    // Check for bearer auth (JWT)
    const hasBearerAuth = schemeNames.some(name => 
      securitySchemes[name].type === 'http' && securitySchemes[name].scheme === 'bearer'
    );

    if (hasBearerAuth) {
      console.log('✅ Bearer token authentication is configured');
      this.results.passed++;
    } else {
      this.addWarning('Security', 'No bearer token authentication found');
    }

    // Check if security is applied globally or per operation
    let securedEndpoints = 0;
    let totalEndpoints = 0;

    if (spec.paths) {
      for (const pathName of Object.keys(spec.paths)) {
        const pathObj = spec.paths[pathName];
        const methods = Object.keys(pathObj).filter(key => 
          ['get', 'post', 'put', 'delete', 'patch'].includes(key)
        );

        for (const method of methods) {
          totalEndpoints++;
          const operation = pathObj[method];
          
          if (operation.security || spec.security) {
            securedEndpoints++;
          }
        }
      }
    }

    console.log(`🔒 Security coverage: ${securedEndpoints}/${totalEndpoints} endpoints secured`);
    
    if (securedEndpoints === totalEndpoints) {
      console.log('✅ All endpoints have security requirements');
      this.results.passed++;
    } else {
      this.addWarning('Security Coverage', 
        `${totalEndpoints - securedEndpoints} endpoints without security requirements`);
    }
  }

  async validateTypeGeneration() {
    console.log('🔧 Validating TypeScript type generation...');
    
    try {
      // Check if types directory exists
      const typesDir = path.join(__dirname, '..', 'src', 'types', 'api');
      if (!fs.existsSync(typesDir)) {
        this.addError('Type Generation', 'API types directory does not exist');
        return;
      }

      // Check for required files
      const requiredFiles = ['schema.d.ts', 'client.ts', 'index.ts'];
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(typesDir, file))
      );

      if (missingFiles.length > 0) {
        this.addError('Type Generation', 
          `Missing type files: ${missingFiles.join(', ')}`);
        return;
      }

      console.log('✅ All required type files exist');
      this.results.passed++;

      // Check if types compile
      try {
        const sharedDir = path.join(__dirname, '..');
        execSync('npm run build', { 
          cwd: sharedDir,
          stdio: 'pipe'
        });
        console.log('✅ TypeScript types compile successfully');
        this.results.passed++;
      } catch (error) {
        this.addError('TypeScript Compilation', 
          'Generated types do not compile correctly');
      }

    } catch (error) {
      this.addError('Type Validation', `Validation failed: ${error.message}`);
    }
  }

  async validateApiClient() {
    console.log('🚀 Validating API client functionality...');
    
    try {
      // Test if we can import the client
      const typesDir = path.join(__dirname, '..', 'src', 'types', 'api');
      const clientPath = path.join(typesDir, 'client.ts');
      
      if (!fs.existsSync(clientPath)) {
        this.addError('API Client', 'Client file does not exist');
        return;
      }

      const clientContent = fs.readFileSync(clientPath, 'utf8');
      
      // Check for required client methods
      const requiredMethods = ['login', 'getCurrentUser', 'healthCheck'];
      const missingMethods = requiredMethods.filter(method => 
        !clientContent.includes(`async ${method}`)
      );

      if (missingMethods.length > 0) {
        this.addWarning('API Client', 
          `Missing client methods: ${missingMethods.join(', ')}`);
      } else {
        console.log('✅ API client has all required methods');
        this.results.passed++;
      }

      // Check for proper TypeScript types
      if (clientContent.includes('Promise<') && clientContent.includes('async ')) {
        console.log('✅ API client uses proper TypeScript async/await patterns');
        this.results.passed++;
      } else {
        this.addWarning('API Client', 'Client may not be using proper TypeScript patterns');
      }

    } catch (error) {
      this.addError('API Client Validation', `Validation failed: ${error.message}`);
    }
  }

  addError(category, message) {
    this.results.errors.push({ type: 'error', category, message });
    this.results.failed++;
    console.log(`❌ ${category}: ${message}`);
  }

  addWarning(category, message) {
    this.results.errors.push({ type: 'warning', category, message });
    this.results.warnings++;
    console.log(`⚠️  ${category}: ${message}`);
  }

  printSummary() {
    console.log('\n📊 Validation Summary');
    console.log('=====================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    const total = this.results.passed + this.results.warnings + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log('\n📋 Issues Found:');
      this.results.errors.forEach((error, index) => {
        const icon = error.type === 'error' ? '❌' : '⚠️';
        console.log(`${index + 1}. ${icon} [${error.category}] ${error.message}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (this.results.warnings > 0) {
      console.log('   • Address warnings to improve documentation quality');
    }
    if (this.results.failed > 0) {
      console.log('   • Fix errors before deploying to production');
    }
    if (this.results.passed > 5) {
      console.log('   • Great job! Your API documentation is in good shape');
    }
    
    console.log('\n🛠️  Next Steps:');
    console.log('   1. Fix any errors found above');
    console.log('   2. Run: npm run generate:api');
    console.log('   3. Test endpoints in Swagger UI');
    console.log('   4. Re-run validation: npm run docs:validate');
  }

  async run() {
    console.log('🔍 Swagger Documentation Validator');
    console.log('===================================');
    
    await this.validateOpenApiSpec();
    await this.validateTypeGeneration();
    await this.validateApiClient();
    
    this.printSummary();
    
    // Exit with appropriate code
    const hasErrors = this.results.failed > 0;
    process.exit(hasErrors ? 1 : 0);
  }
}

// CLI execution
if (require.main === module) {
  const validator = new SwaggerValidator();
  validator.run().catch(console.error);
}

module.exports = SwaggerValidator;