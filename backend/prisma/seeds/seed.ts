// prisma/seeds/seed.ts
// Main entry point for running all seeds

import { PrismaClient } from '@prisma/client';
import { SeedRunner } from './utils/SeedRunner';
import logger from '../../src/utils/logger/logger';

// Import all seeders from separate files
import { UserSeeder } from './classes/UserSeeder';
import { RoleSeeder } from './classes/RoleSeeder';
import { PermissionSeeder } from './classes/PermissionSeeder';
import { RolePermissionSeeder } from './classes/RolePermissionSeeder';
import { UserRoleSeeder } from './classes/UserRoleSeeder';
import { ProductCategorySeeder } from './classes/ProductCategorySeeder';
import { ProductFamilySeeder } from './classes/ProductFamilySeeder';
import { ProductSeeder } from './classes/ProductSeeder';
import { UnitsOfMeasureSeeder } from './classes/UnitsOfMeasureSeeder';
import { WarehouseSeeder } from './classes/WarehouseSeeder';
import { ClassTypeSeeder } from './classes/ClassTypeSeeder';
import { ProductAttributeSeeder } from './classes/ProductAttributeSeeder';
import { ProductAttributeOptionSeeder } from './classes/ProductAttributeOptionSeeder';
import { ProductAttributeValueSeeder } from './classes/ProductAttributeValueSeeder';
import { BrandSeeder } from './classes/BrandSeeder';
import { WarehouseZoneSeeder } from './classes/WarehouseZoneSeeder';
import { WarehouseAisleSeeder } from './classes/WarehouseAisleSeeder';
import { WarehouseLocationSeeder } from './classes/WarehouseLocationSeeder';
import { BinTypeSeeder } from './classes/BinTypeSeeder';

async function main() {
  const prisma = new PrismaClient();

  try {
    logger.info('Initializing WMS Database Seeding System', {
      source: 'seed',
      method: 'main'
    });

    // Parse command line arguments
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const dryRun = args.includes('--dry-run');
    const continueOnError = args.includes('--continue-on-error');
    const skipValidation = args.includes('--skip-validation');
    
    // Get specific seeders to run
    const runOnlyIndex = args.indexOf('--only');
    const runOnly = runOnlyIndex >= 0 && args[runOnlyIndex + 1] 
      ? args[runOnlyIndex + 1].split(',') 
      : undefined;

    const skipIndex = args.indexOf('--skip');
    const skipSeeders = skipIndex >= 0 && args[skipIndex + 1] 
      ? args[skipIndex + 1].split(',') 
      : undefined;

    // Get system user ID (default to 1)
    const userIdIndex = args.indexOf('--user-id');
    const systemUserId = userIdIndex >= 0 && args[userIdIndex + 1] 
      ? parseInt(args[userIdIndex + 1]) 
      : 1;

    // Create seed runner with options
    const runner = new SeedRunner(prisma, {
      force,
      dryRun,
      continueOnError,
      validate: !skipValidation,
      runOnly,
      skipSeeders,
      systemUserId,
      batchSize: 50
    });

    // Register all seeders in dependency order
    logger.info('Registering seeders', {
      source: 'seed',
      method: 'main'
    });
    
    // Foundation seeders (no dependencies)
    runner.registerSeeder('permissions', () => new PermissionSeeder(prisma, { systemUserId }));
    runner.registerSeeder('class_types', () => new ClassTypeSeeder(prisma, { systemUserId }));
    runner.registerSeeder('units_of_measure', () => new UnitsOfMeasureSeeder(prisma, { systemUserId }));
    runner.registerSeeder('brands', () => new BrandSeeder(prisma, { systemUserId }));

    // User management (permissions → roles → role_permissions → users → user_roles)
    runner.registerSeeder('roles', () => new RoleSeeder(prisma, { systemUserId }));
    runner.registerSeeder('role_permissions', () => new RolePermissionSeeder(prisma, { systemUserId }));
    runner.registerSeeder('users', () => new UserSeeder(prisma, { systemUserId }));
    runner.registerSeeder('user_roles', () => new UserRoleSeeder(prisma, { systemUserId }));

    // Product hierarchy (categories → families → products)
    runner.registerSeeder('product_categories', () => new ProductCategorySeeder(prisma, { systemUserId }));
    runner.registerSeeder('product_families', () => new ProductFamilySeeder(prisma, { systemUserId }));
    runner.registerSeeder('products', () => new ProductSeeder(prisma, { systemUserId }));

    // Product attributes system (attributes → options → values)
    runner.registerSeeder('product_attributes', () => new ProductAttributeSeeder(prisma, { systemUserId }));
    runner.registerSeeder('product_attribute_options', () => new ProductAttributeOptionSeeder(prisma, { systemUserId }));
    runner.registerSeeder('product_attribute_values', () => new ProductAttributeValueSeeder(prisma, { systemUserId }));

    // Warehouse management (requires users for managers)
    runner.registerSeeder('warehouses', () => new WarehouseSeeder(prisma, { systemUserId }));
    runner.registerSeeder('warehouse_zones', () => new WarehouseZoneSeeder(prisma, { systemUserId }));
    runner.registerSeeder('warehouse_aisles', () => new WarehouseAisleSeeder(prisma, { systemUserId }));
    runner.registerSeeder('warehouse_locations', () => new WarehouseLocationSeeder(prisma, { systemUserId }));
    runner.registerSeeder('bin_types', () => new BinTypeSeeder(prisma, { systemUserId }));

    // Validate dependencies
    logger.info('Validating dependencies', {
      source: 'seed',
      method: 'main'
    });
    const validation = runner.validateDependencies();
    if (!validation.valid) {
      logger.error('Dependency validation failed', {
        source: 'seed',
        method: 'main',
        errors: validation.errors
      });
      process.exit(1);
    }

    // Show available seeders
    logger.info('Available Seeders', {
      source: 'seed',
      method: 'main',
      seeders: runner.getAvailableSeeders()
    });

    // Show command line options used
    logger.info('Configuration', {
      source: 'seed',
      method: 'main',
      force,
      dryRun,
      continueOnError,
      skipValidation,
      runOnly,
      skipSeeders,
      systemUserId
    });

    // Run seeders
    logger.info('Starting seeding process', {
      source: 'seed',
      method: 'main'
    });
    const startTime = Date.now();
    const result = await runner.run();
    const duration = Date.now() - startTime;

    // Show final summary
    logger.info('FINAL SUMMARY', {
      source: 'seed',
      method: 'main',
      totalDuration: duration,
      totalSeeders: result.totalSeeders,
      successful: result.successfulSeeders,
      failed: result.failedSeeders,
      skipped: result.skippedSeeders
    });
    
    if (result.success) {
      logger.info('All seeders completed successfully! Your WMS database is now ready for use!', {
        source: 'seed',
        method: 'main',
        nextStep: 'Open Prisma Studio to view your data: npx prisma studio'
      });
    } else {
      logger.warn('Some seeders failed. Check the logs above for details.', {
        source: 'seed',
        method: 'main',
        suggestion: 'Try running with --continue-on-error to see all results'
      });
    }

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    logger.error('Fatal error during seeding', {
      source: 'seed',
      method: 'main',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    });
    process.exit(1);
  } finally {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed', {
        source: 'seed',
        method: 'main'
      });
    } catch (disconnectError) {
      logger.error('Error disconnecting from database', {
        source: 'seed',
        method: 'main',
        error: disconnectError instanceof Error ? disconnectError.message : String(disconnectError)
      });
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    source: 'seed',
    method: 'unhandledRejection',
    promise: String(promise),
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    source: 'seed',
    method: 'uncaughtException',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌱 WMS Database Seeding System

Usage: npm run seed [options]

Options:
  --force                Force re-seed even if data exists
  --dry-run             Show what would be run without executing
  --continue-on-error   Continue running other seeders if one fails
  --skip-validation     Skip data validation before seeding
  --only <seeders>      Run only specific seeders (comma-separated)
  --skip <seeders>      Skip specific seeders (comma-separated)
  --user-id <id>        System user ID for audit fields (default: 1)
  --help, -h            Show this help message

Examples:
  npm run seed                          # Run all seeders
  npm run seed -- --force               # Force re-seed all data
  npm run seed -- --only users,roles    # Run only users and roles seeders
  npm run seed -- --skip products       # Run all except products seeder
  npm run seed -- --dry-run             # Preview what would be seeded
  npm run seed -- --force --continue-on-error  # Force seed and continue on errors

Available Seeders:
  • permissions        - System permissions
  • roles              - User roles (depends on permissions)
  • role_permissions   - Role-permission assignments (depends on roles, permissions)
  • users              - System users (depends on roles)
  • user_roles         - User-role assignments (depends on users, roles)
  • class_types        - Classification types
  • units_of_measure   - Units of measurement
  • brands             - Product brands
  • product_categories - Product categories (from products.json)
  • product_families   - Product families (from products.json, depends on categories)
  • products           - Products and inventory (from products.json, depends on categories, families, units)
  • warehouses         - Warehouse locations (depends on users for managers)

Execution Order:
  1. permissions → roles → role_permissions → users → user_roles
  2. class_types, units_of_measure, brands (parallel)
  3. product_categories → product_families → products
  4. warehouses (after users)

Data Sources:
  • Most seeders use individual JSON files in prisma/seeds/data/
  • Product-related seeders all use products.json with sections:
    - categories[] for product categories
    - families[] for product families  
    - products[] for actual products
`);
  process.exit(0);
}

// Run main function
main().catch((error) => {
  logger.error('Seeding failed', {
    source: 'seed',
    method: 'main',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});