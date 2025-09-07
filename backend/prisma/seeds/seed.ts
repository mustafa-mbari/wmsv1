// prisma/seeds/seed.ts
// Main entry point for running all seeds

import { PrismaClient } from '@prisma/client';
import { SeedRunner } from './utils/SeedRunner';

// Import all seeders from separate files
import { UserSeeder } from './classes/UserSeeder';
import { RoleSeeder } from './classes/RoleSeeder';
import { PermissionSeeder } from './classes/PermissionSeeder';
import { ProductCategorySeeder } from './classes/ProductCategorySeeder';
import { ProductFamilySeeder } from './classes/ProductFamilySeeder';
import { ProductSeeder } from './classes/ProductSeeder';
import { UnitsOfMeasureSeeder } from './classes/UnitsOfMeasureSeeder';
import { WarehouseSeeder } from './classes/WarehouseSeeder';
import { ClassTypeSeeder } from './classes/ClassTypeSeeder';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🌱 Initializing WMS Database Seeding System...\n');

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
    console.log('📝 Registering seeders...');
    
    // Foundation seeders (no dependencies)
    runner.registerSeeder('permissions', () => new PermissionSeeder(prisma, { systemUserId }));
    runner.registerSeeder('class_types', () => new ClassTypeSeeder(prisma, { systemUserId }));
    runner.registerSeeder('units_of_measure', () => new UnitsOfMeasureSeeder(prisma, { systemUserId }));

    // User management (permissions → roles → users)
    runner.registerSeeder('roles', () => new RoleSeeder(prisma, { systemUserId }));
    runner.registerSeeder('users', () => new UserSeeder(prisma, { systemUserId }));

    // Product hierarchy (categories → families → products)
    runner.registerSeeder('product_categories', () => new ProductCategorySeeder(prisma, { systemUserId }));
    runner.registerSeeder('product_families', () => new ProductFamilySeeder(prisma, { systemUserId }));
    runner.registerSeeder('products', () => new ProductSeeder(prisma, { systemUserId }));

    // Warehouse management (requires users for managers)
    runner.registerSeeder('warehouses', () => new WarehouseSeeder(prisma, { systemUserId }));

    // Validate dependencies
    console.log('🔗 Validating dependencies...');
    const validation = runner.validateDependencies();
    if (!validation.valid) {
      console.error('❌ Dependency validation failed:');
      validation.errors.forEach(error => console.error(`   • ${error}`));
      process.exit(1);
    }

    // Show available seeders
    console.log('\n📋 Available Seeders:');
    runner.getAvailableSeeders().forEach(seeder => {
      console.log(`   • ${seeder}`);
    });
    console.log('');

    // Show command line options used
    console.log('⚙️ Configuration:');
    if (force) console.log('   🔄 Force mode: Will overwrite existing data');
    if (dryRun) console.log('   🔍 Dry run: No actual seeding will be performed');
    if (continueOnError) console.log('   🚀 Continue on error: Will not stop on individual seeder failures');
    if (skipValidation) console.log('   ⚠️ Validation skipped');
    if (runOnly) console.log(`   🎯 Running only: ${runOnly.join(', ')}`);
    if (skipSeeders) console.log(`   ⏭️ Skipping: ${skipSeeders.join(', ')}`);
    console.log(`   👤 System User ID: ${systemUserId}`);
    console.log('');

    // Run seeders
    console.log('🚀 Starting seeding process...\n');
    const startTime = Date.now();
    const result = await runner.run();
    const duration = Date.now() - startTime;

    // Show final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📦 Total Seeders: ${result.totalSeeders}`);
    console.log(`✅ Successful: ${result.successfulSeeders}`);
    console.log(`❌ Failed: ${result.failedSeeders}`);
    console.log(`⏭️  Skipped: ${result.skippedSeeders}`);
    
    if (result.success) {
      console.log('\n🎉 All seeders completed successfully!');
      console.log('🎯 Your WMS database is now ready for use!');
      console.log('💡 Next: Open Prisma Studio to view your data: npx prisma studio');
    } else {
      console.log('\n⚠️  Some seeders failed. Check the logs above for details.');
      console.log('💡 Try running with --continue-on-error to see all results.');
    }
    
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\n💥 Fatal error during seeding:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  } finally {
    try {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed.');
    } catch (disconnectError) {
      console.error('⚠️ Error disconnecting from database:', disconnectError);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
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
  • users              - System users (depends on roles)
  • class_types        - Classification types
  • units_of_measure   - Units of measurement
  • product_categories - Product categories (from products.json)
  • product_families   - Product families (from products.json, depends on categories)
  • products           - Products and inventory (from products.json, depends on categories, families, units)
  • warehouses         - Warehouse locations (depends on users for managers)

Execution Order:
  1. permissions → roles → users
  2. class_types, units_of_measure (parallel)
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
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});