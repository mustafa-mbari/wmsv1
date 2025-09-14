import { PrismaClient } from '@prisma/client';
import logger from '../src/utils/logger/logger';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function validateSchema() {
  try {
    logger.info('Starting database schema validation...', { source: 'schema-validator' });

    // Test database connection
    logger.info('Testing database connection...', { source: 'schema-validator' });
    await prisma.$connect();
    logger.info('✅ Database connection successful', { source: 'schema-validator' });

    // Test each schema by counting records in representative tables
    const schemaTests = [
      {
        schema: 'public',
        tests: [
          { model: 'users', query: () => prisma.users.count() },
          { model: 'roles', query: () => prisma.roles.count() },
          { model: 'permissions', query: () => prisma.permissions.count() },
          { model: 'units_of_measure', query: () => prisma.units_of_measure.count() },
        ]
      },
      {
        schema: 'product',
        tests: [
          { model: 'products', query: () => prisma.products.count() },
          { model: 'product_brands', query: () => prisma.product_brands.count() },
          { model: 'product_categories', query: () => prisma.product_categories.count() },
          { model: 'product_families', query: () => prisma.product_families.count() },
        ]
      },
      {
        schema: 'inventory',
        tests: [
          { model: 'inventory', query: () => prisma.inventory.count() },
          { model: 'inventory_movements', query: () => prisma.inventory_movements.count() },
        ]
      },
      {
        schema: 'warehouse',
        tests: [
          { model: 'warehouses', query: () => prisma.warehouses.count() },
          { model: 'zones', query: () => prisma.zones.count() },
          { model: 'aisles', query: () => prisma.aisles.count() },
          { model: 'bins', query: () => prisma.bins.count() },
        ]
      }
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const schemaTest of schemaTests) {
      logger.info(`Testing ${schemaTest.schema} schema...`, { source: 'schema-validator' });

      for (const test of schemaTest.tests) {
        totalTests++;
        try {
          const count = await test.query();
          logger.info(`✅ ${schemaTest.schema}.${test.model}: ${count} records`, {
            source: 'schema-validator',
            schema: schemaTest.schema,
            model: test.model,
            count
          });
          passedTests++;
        } catch (error) {
          logger.error(`❌ ${schemaTest.schema}.${test.model}: Failed`, {
            source: 'schema-validator',
            schema: schemaTest.schema,
            model: test.model,
            error: error instanceof Error ? error.message : error
          });
          failedTests++;
        }
      }
    }

    // Test complex queries with relations
    logger.info('Testing relations and complex queries...', { source: 'schema-validator' });

    try {
      // Test user with roles relation (public schema)
      const userWithRoles = await prisma.users.findFirst({
        include: {
          user_roles_user_roles_user_idTousers: {
            include: {
              roles: true
            }
          }
        }
      });
      logger.info('✅ User-Role relations working', {
        source: 'schema-validator',
        hasUser: !!userWithRoles,
        hasRoles: !!userWithRoles?.user_roles_user_roles_user_idTousers?.length
      });
      passedTests++;
    } catch (error) {
      logger.error('❌ User-Role relations failed', {
        source: 'schema-validator',
        error: error instanceof Error ? error.message : error
      });
      failedTests++;
    }
    totalTests++;

    try {
      // Test product with brand relation (cross-schema: product -> public)
      const productWithBrand = await prisma.products.findFirst({
        include: {
          product_brands: true,
          units_of_measure: true
        }
      });
      logger.info('✅ Product cross-schema relations working', {
        source: 'schema-validator',
        hasProduct: !!productWithBrand,
        hasBrand: !!productWithBrand?.product_brands,
        hasUnit: !!productWithBrand?.units_of_measure
      });
      passedTests++;
    } catch (error) {
      logger.error('❌ Product cross-schema relations failed', {
        source: 'schema-validator',
        error: error instanceof Error ? error.message : error
      });
      failedTests++;
    }
    totalTests++;

    // Summary
    logger.info('Schema validation completed', {
      source: 'schema-validator',
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`
      }
    });

    if (failedTests === 0) {
      logger.info('🎉 All schema tests passed! Database schema is working correctly.', {
        source: 'schema-validator'
      });
      process.exit(0);
    } else {
      logger.error(`❌ ${failedTests} tests failed. Please check the schema configuration.`, {
        source: 'schema-validator'
      });
      process.exit(1);
    }

  } catch (error) {
    logger.error('Schema validation failed with error:', {
      source: 'schema-validator',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation if this script is called directly
if (require.main === module) {
  validateSchema().catch((error) => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export default validateSchema;