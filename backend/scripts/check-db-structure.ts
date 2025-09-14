import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDbStructure() {
  try {
    console.log('Checking database structure...\n');

    const query = `
      SELECT table_schema, table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema IN ('inventory', 'warehouse')
      ORDER BY table_schema, table_name, ordinal_position;
    `;

    const results = await prisma.$queryRawUnsafe(query);
    console.log('Inventory and Warehouse Schema Structure:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDbStructure();