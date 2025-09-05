import { PrismaClient } from '@prisma/client';
import { seedClassTypes } from './classTypes';
import { seedPermissions } from './permissions';
import { seedRoles } from './roles';
import { seedUsers } from './users';
import { seedUnitsOfMeasure } from './unitsOfMeasure';
import { seedProductCategories } from './productCategories';
import { seedProductFamilies } from './productFamilies';
import { seedProductAttributes } from './productAttributes';
import { seedProductAttributeOptions } from './productAttributeOptions';
import { seedProducts } from './products';
import { seedProductAttributeValues } from './productAttributeValues';
import { seedWarehouses } from './warehouses';
import { seedUserRoles } from './userRoles';
import { seedRolePermissions } from './rolePermissions';
import { seedNotifications } from './notifications';
import { seedSystemSettings } from './systemSettings';
import { seedSystemLogs } from './systemLogs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed in order of dependencies
    console.log('📚 Seeding class types...');
    await seedClassTypes(prisma);

    console.log('🔐 Seeding permissions...');
    await seedPermissions(prisma);

    console.log('👥 Seeding roles...');
    await seedRoles(prisma);

    console.log('👤 Seeding users...');
    await seedUsers(prisma);

    console.log('📏 Seeding units of measure...');
    await seedUnitsOfMeasure(prisma);

    console.log('📁 Seeding product categories...');
    await seedProductCategories(prisma);

    console.log('👨‍👩‍👧‍👦 Seeding product families...');
    await seedProductFamilies(prisma);

    console.log('🏷️ Seeding product attributes...');
    await seedProductAttributes(prisma);

    console.log('⚙️ Seeding product attribute options...');
    await seedProductAttributeOptions(prisma);

    console.log('📦 Seeding products...');
    await seedProducts(prisma);

    console.log('🔗 Seeding product attribute values...');
    await seedProductAttributeValues(prisma);

    console.log('🏭 Seeding warehouses...');
    await seedWarehouses(prisma);

    console.log('👥🔐 Seeding user roles...');
    await seedUserRoles(prisma);

    console.log('🔐👥 Seeding role permissions...');
    await seedRolePermissions(prisma);

    console.log('🔔 Seeding notifications...');
    await seedNotifications(prisma);

    console.log('⚙️ Seeding system settings...');
    await seedSystemSettings(prisma);

    console.log('📊 Seeding system logs...');
    await seedSystemLogs(prisma);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
